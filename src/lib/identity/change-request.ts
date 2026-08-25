/**
 * Change Request Form — Lane C, Round 5 (GP-20).
 *
 * A user may request a new value for a lookup type flagged allowUserRequest.
 * The full cycle:
 *
 *   user requests  →  a LookupValue row is written inactive (createdVia =
 *                     'change_request'), so it is hidden from every dropdown
 *                     until approved (getLookupOptions filters active = true)
 *   admin reviews  →  may amend the labels
 *   admin approves →  the row is flipped active = true and enters the live list
 *   admin rejects  →  the pending row is soft-deleted
 *
 * No new table is needed — the pending request IS a (hidden) LookupValue, which
 * keeps GP-20 inside the existing schema without a prisma migration (Lane A
 * territory). Every approval writes the SENARAI_PILIHAN_DITAMBAH audit row.
 *
 * G1: the value lives in the lookup registry, never as a hard-coded list.
 */

import type { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS, renderAuditLabel } from "../audit/actions";

export interface LookupRequestInput {
  userId: bigint;
  userName?: string | null;
  lookupTypeCode: string;
  code: string;
  labelMs: string;
  labelEn: string;
}

export async function requestLookupValue(
  tx: Prisma.TransactionClient,
  input: LookupRequestInput,
): Promise<bigint> {
  const type = await tx.lookupType.findFirst({
    where: { code: input.lookupTypeCode, deletedAt: null },
    select: { id: true, allowUserRequest: true },
  });
  if (!type) {
    throw new Error("Jenis senarai tidak dijumpai / lookup type not found");
  }
  if (!type.allowUserRequest) {
    throw new Error(
      "Jenis senarai tidak membenarkan permintaan pengguna / this lookup does not allow user requests",
    );
  }
  const row = await tx.lookupValue.create({
    data: {
      lookupTypeId: type.id,
      code: input.code,
      labelMs: input.labelMs,
      labelEn: input.labelEn,
      active: false,
      createdVia: "change_request",
    },
  });
  return row.id;
}

export async function listPendingLookupRequests(
  tx: Prisma.TransactionClient,
  lookupTypeCode?: string,
) {
  return tx.lookupValue.findMany({
    where: {
      createdVia: "change_request",
      active: false,
      deletedAt: null,
      ...(lookupTypeCode ? { lookupType: { code: lookupTypeCode } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
}

export interface ReviewInput {
  lookupValueId: bigint;
  actorUserId: bigint;
  actorName?: string | null;
  approve: boolean;
  amendedLabelMs?: string;
  amendedLabelEn?: string;
}

export async function reviewLookupRequest(
  tx: Prisma.TransactionClient,
  input: ReviewInput,
): Promise<void> {
  const row = await tx.lookupValue.findUnique({ where: { id: input.lookupValueId } });
  if (!row) {
    throw new Error("Permintaan tidak dijumpai / request not found");
  }

  if (!input.approve) {
    await tx.lookupValue.update({
      where: { id: row.id },
      data: { deletedAt: new Date() },
    });
    return;
  }

  await tx.lookupValue.update({
    where: { id: row.id },
    data: {
      labelMs: input.amendedLabelMs ?? row.labelMs,
      labelEn: input.amendedLabelEn ?? row.labelEn,
      active: true,
    },
  });

  const action = AUDIT_ACTIONS.SENARAI_PILIHAN_DITAMBAH;
  await tx.auditLog.create({
    data: {
      userId: input.actorUserId,
      userNameSnapshot: input.actorName ?? null,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, {
        subject: `${row.labelMs} (${row.code})`,
        actor: input.actorName ?? undefined,
      }),
      actionLabelEn: renderAuditLabel(action.templateEn, {
        subject: `${row.labelEn} (${row.code})`,
        actor: input.actorName ?? undefined,
      }),
      moduleCode: action.moduleCode,
      pageCode: "konfigurasi",
    },
  });
}
