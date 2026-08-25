import type { ExportHeader } from "./types";

/**
 * Malaysian calendar quarters (1 Jan = Q1 start). Fiscal-year variants are NOT
 * assumed here — calendar quarters only, so we never guess the LPKmn FY start.
 */
export function malaysianQuarterRange(
  year: number,
  quarter: 1 | 2 | 3 | 4,
): { from: Date; to: Date } {
  const startMonth = (quarter - 1) * 3;
  const from = new Date(year, startMonth, 1);
  const to = new Date(year, startMonth + 3, 1);
  return { from, to };
}

/**
 * Bilingual column contract for the audit-trail export. Mirrors the AuditLog
 * shape (action label, actor snapshot, reference, module, page, timestamp).
 * Swap for the shared universal-list contract in @/lib/table/types once
 * lane/claude is merged.
 */
export const auditColumnHeaders: ExportHeader[] = [
  { key: "actionLabelMs", labelMs: "Tindakan", labelEn: "Action" },
  { key: "userNameSnapshot", labelMs: "Pengguna", labelEn: "User" },
  { key: "referenceNo", labelMs: "No. Rujukan", labelEn: "Reference No." },
  { key: "moduleCode", labelMs: "Modul", labelEn: "Module" },
  { key: "pageCode", labelMs: "Halaman", labelEn: "Page" },
  { key: "createdAt", labelMs: "Tarikh", labelEn: "Date" },
];

export interface AuditRow {
  actionLabelMs: string;
  actionLabelEn: string;
  userNameSnapshot: string;
  referenceNo: string;
  moduleCode: string;
  pageCode: string;
  createdAt: Date;
}

export function summarizeAuditForExport(rows: AuditRow[]): string {
  return `${rows.length} rekod jejak audit / ${rows.length} audit trail records`;
}
