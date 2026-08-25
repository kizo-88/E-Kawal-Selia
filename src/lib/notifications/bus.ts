/**
 * Notification bus — Lane C, Round 3 (GP-10, GP-16, X-R03, X-R04).
 *
 * This is the orchestrator. Every send does exactly four things, mandated by
 * the brief:
 *
 *   1. resolve the user's channel preferences (per-user AND per-role)
 *   2. render the BM or EN template
 *   3. queue the send (a NotificationMessage row)
 *   4. write the audit row with PEMBERITAHUAN_DIHANTAR
 *
 * A caller that skips any one has silently broken GP-16. The bus is also the
 * only place that touches `sendEmail` (see mailer.ts) — there is no other path
 * to the mailer.
 *
 * All database work happens inside the `tx` the caller already opened inside
 * `withUser(...)` (src/lib/db/scoped.ts), so the RLS scope the caller
 * established applies and the audit row commits with the operation it
 * describes. Do NOT open your own prisma client here.
 */

import type { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS, renderAuditLabel } from "../audit/actions";

import { sendEmail } from "./mailer";
import { channelEnabled } from "./preferences";
import { renderNotification } from "./render";
import type { NotificationChannel } from "./types";

export interface SendNotificationInput {
  userId: bigint;
  userName?: string | null;
  templateCode: string;
  category: string;
  vars: Record<string, string | undefined>;
  referenceNo?: string | null;
  pageCode?: string | null;
}

export interface SendResult {
  channels: NotificationChannel[];
  messageIds: bigint[];
}

const channelsForUser = async (
  tx: Prisma.TransactionClient,
  userId: bigint,
  category: string,
): Promise<NotificationChannel[]> => {
  const channels: NotificationChannel[] = [];
  channels.push("inapp");

  const userPref = await tx.notificationPreference.findFirst({
    where: { userId, category, channel: "email" },
  });
  const roleRows = await tx.userRole.findMany({
    where: { userId },
    select: { roleId: true },
  });
  const rolePrefs = await tx.notificationPreference.findMany({
    where: {
      roleId: { in: roleRows.map((r) => r.roleId) },
      category,
      channel: "email",
    },
  });

  if (
    channelEnabled({
      channel: "email",
      userEnabled: userPref?.enabled ?? null,
      roleEnabled: rolePrefs.map((p) => p.enabled),
    })
  ) {
    channels.push("email");
  }

  return channels;
};

export async function sendNotification(
  tx: Prisma.TransactionClient,
  input: SendNotificationInput,
): Promise<SendResult> {
  const tpl = await tx.notificationTemplate.findUnique({
    where: { code: input.templateCode, deletedAt: null },
  });
  if (!tpl) {
    throw new Error(`Templat ${input.templateCode} tidak dijumpai / template not found`);
  }

  const user = await tx.user.findUnique({
    where: { id: input.userId, deletedAt: null },
    select: { preferredLocale: true, name: true, email: true },
  });
  const locale = user?.preferredLocale === "en" ? "en" : "ms";

  const channels = await channelsForUser(tx, input.userId, input.category);
  const messageIds: bigint[] = [];

  for (const channel of channels) {
    const rendered = renderNotification({
      subjectMs: tpl.subjectMs,
      subjectEn: tpl.subjectEn,
      bodyMs: tpl.bodyMs,
      bodyEn: tpl.bodyEn,
      locale,
      vars: input.vars,
    });

    const msg = await tx.notificationMessage.create({
      data: {
        userId: input.userId,
        templateCode: tpl.code,
        channel,
        title: rendered.title,
        body: rendered.body,
        referenceNo: input.referenceNo ?? null,
        status: "queued",
      },
    });
    messageIds.push(msg.id);

    if (channel === "email") {
      try {
        if (user?.email) {
          await sendEmail({ to: user.email, subject: rendered.title, html: rendered.body });
          await tx.notificationMessage.update({
            where: { id: msg.id },
            data: { status: "sent", sentAt: new Date() },
          });
        } else {
          await tx.notificationMessage.update({
            where: { id: msg.id },
            data: { status: "failed", error: "Tiada alamat e-mel / no email address" },
          });
        }
      } catch (err) {
        await tx.notificationMessage.update({
          where: { id: msg.id },
          data: { status: "failed", error: String(err) },
        });
      }
    } else {
      await tx.notificationMessage.update({
        where: { id: msg.id },
        data: { status: "sent", sentAt: new Date() },
      });
    }
  }

  const action = AUDIT_ACTIONS.PEMBERITAHUAN_DIHANTAR;
  const actor = input.userName ?? user?.name ?? undefined;
  await tx.auditLog.create({
    data: {
      userId: input.userId,
      userNameSnapshot: input.userName ?? user?.name ?? null,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, {
        subject: input.category,
        actor,
        stage: channels.join(", "),
      }),
      actionLabelEn: renderAuditLabel(action.templateEn, {
        subject: input.category,
        actor,
        stage: channels.join(", "),
      }),
      auditableType: "notification",
      referenceNo: input.referenceNo ?? null,
      moduleCode: action.moduleCode,
      pageCode: input.pageCode ?? null,
    },
  });

  return { channels, messageIds };
}

export interface SendBroadcastInput {
  titleMs: string;
  titleEn: string;
  bodyMs: string;
  bodyEn: string;
  channels: NotificationChannel[];
  targetRoles?: bigint[];
  targetUnits?: bigint[];
  createdBy?: bigint | null;
  pageCode?: string | null;
}

export interface BroadcastResult {
  recipients: number;
}

export async function sendBroadcast(
  tx: Prisma.TransactionClient,
  input: SendBroadcastInput,
): Promise<BroadcastResult> {
  const userIds = new Set<bigint>();

  if (input.targetRoles?.length) {
    const rows = await tx.userRole.findMany({
      where: { roleId: { in: input.targetRoles }, user: { deletedAt: null } },
      select: { userId: true },
    });
    rows.forEach((r) => userIds.add(r.userId));
  }
  if (input.targetUnits?.length) {
    const rows = await tx.userInternalUnit.findMany({
      where: { internalUnitId: { in: input.targetUnits }, user: { deletedAt: null } },
      select: { userId: true },
    });
    rows.forEach((r) => userIds.add(r.userId));
  }

  for (const uid of userIds) {
    const user = await tx.user.findUnique({
      where: { id: uid, deletedAt: null },
      select: { preferredLocale: true, name: true, email: true },
    });
    const locale = user?.preferredLocale === "en" ? "en" : "ms";
    const title = locale === "en" ? input.titleEn : input.titleMs;
    const body = locale === "en" ? input.bodyEn : input.bodyMs;

    const msg = await tx.notificationMessage.create({
      data: {
        userId: uid,
        channel: "inapp",
        title,
        body,
        status: "queued",
      },
    });
    await tx.notificationMessage.update({
      where: { id: msg.id },
      data: { status: "sent", sentAt: new Date() },
    });
  }

  const action = AUDIT_ACTIONS.SIARAN_DIHANTAR;
  await tx.auditLog.create({
    data: {
      userId: input.createdBy ?? null,
      userNameSnapshot: null,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, {
        subject: String(userIds.size),
        actor: input.createdBy ? String(input.createdBy) : undefined,
      }),
      actionLabelEn: renderAuditLabel(action.templateEn, {
        subject: String(userIds.size),
        actor: input.createdBy ? String(input.createdBy) : undefined,
      }),
      auditableType: "notification_broadcast",
      moduleCode: action.moduleCode,
      pageCode: input.pageCode ?? null,
    },
  });

  return { recipients: userIds.size };
}
