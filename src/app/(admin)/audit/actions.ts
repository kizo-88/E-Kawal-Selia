"use server";

import { withUser } from "@/lib/db/scoped";
import { purgeExpiredAuditLogs } from "@/lib/audit/purge";
import { userHasPermission } from "@/lib/rbac/roles.service";

export interface FlushResult {
  purged: number;
  cutOff: Date;
}

/**
 * RBAC-gated, RLS-scoped audit-log flush. Calls the approved retention purge
 * (GP-18) which self-audits via JEJAK_AUDIT_DIBUANG. The permission code lives
 * in the lookup registry; it is passed here rather than hardcoded as a list.
 */
export async function flushAudit(userId: string): Promise<FlushResult> {
  const uid = BigInt(userId);
  if (!(await userHasPermission(uid, "AUDIT_PURGE"))) {
    throw new Error("Tiada kebenaran / Not authorized");
  }
  const result = await withUser(uid, (tx) =>
    purgeExpiredAuditLogs(tx, {
      triggeredBy: "manual",
      actor: { id: uid, name: String(uid) },
    }),
  );
  return { purged: Number(result.rowsDeleted), cutOff: result.purgedBefore };
}
