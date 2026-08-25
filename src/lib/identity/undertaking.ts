/**
 * Aku-Janji acceptance — Lane C, Round 4 (GP-06).
 *
 * An acceptance is evidence, and evidence that can be edited is not evidence.
 * So a fresh acceptance is ALWAYS a new row (UserUndertaking), never an update
 * of an old one (the model has no update path either — ADR 0003). The version
 * is snapshotted onto the row at acceptance time so a reprint or audit shows
 * exactly which wording the user agreed to, not the template as since revised.
 *
 * Passwords, hashing and verification tokens live in src/lib/auth — out of
 * scope here. This module only records the acceptance event and its audit row.
 */

import type { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS, renderAuditLabel } from "../audit/actions";

export interface AcceptUndertakingInput {
  userId: bigint;
  undertakingVersionId: bigint;
  /** The version string snapshotted onto the row (ADR 0003). */
  version: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function acceptUndertaking(
  tx: Prisma.TransactionClient,
  input: AcceptUndertakingInput,
): Promise<bigint> {
  const row = await tx.userUndertaking.create({
    data: {
      userId: input.userId,
      undertakingVersionId: input.undertakingVersionId,
      undertakingVersionSnapshot: input.version,
      acceptedAt: new Date(),
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  });

  const action = AUDIT_ACTIONS.AKU_JANJI_DITERIMA;
  await tx.auditLog.create({
    data: {
      userId: input.userId,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, {
        actor: String(input.userId),
        subject: input.version,
      }),
      actionLabelEn: renderAuditLabel(action.templateEn, {
        actor: String(input.userId),
        subject: input.version,
      }),
      moduleCode: action.moduleCode,
      pageCode: "profil",
    },
  });

  return row.id;
}
