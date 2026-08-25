import 'server-only'

import { withUser } from "@/lib/db/scoped";
import { Prisma } from "@prisma/client";
import { malaysianQuarterRange } from "@/lib/exports/audit";

export interface AuditFilter {
  year?: number;
  quarter?: 1 | 2 | 3 | 4;
  from?: Date;
  to?: Date;
  search?: string;
}

/**
 * RLS-scoped audit-log query. This is a scaffold; once lane/claude merges the
 * universal list contract (src/lib/table) this should be replaced by that
 * query resolver so the audit screen shares paging/sort/filter semantics with
 * every other admin list. We only read through withUser so the scope is bound.
 */
export async function queryAuditLogs(
  userId: bigint,
  filter: AuditFilter,
): Promise<Array<Record<string, unknown>>> {
  const where = buildAuditWhere(filter);
  return withUser(userId, (tx) =>
    tx.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  ) as Promise<Array<Record<string, unknown>>>;
}

export function buildAuditWhere(
  filter: AuditFilter,
): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  if (filter.year && filter.quarter) {
    const { from, to } = malaysianQuarterRange(filter.year, filter.quarter);
    where.createdAt = { gte: from, lt: to };
  } else if (filter.from || filter.to) {
    where.createdAt = {
      gte: filter.from ?? undefined,
      lt: filter.to ?? undefined,
    };
  }
  if (filter.search) {
    where.OR = [
      { referenceNo: { contains: filter.search } },
      { userNameSnapshot: { contains: filter.search } },
    ];
  }
  return where;
}
