import { withUser } from "@/lib/db/scoped";
import { queryAuditLogs, type AuditFilter } from "./query";
import { flushAudit } from "./actions";
import { auditColumnHeaders } from "@/lib/exports/audit";

export const dynamic = "force-dynamic";

/**
 * Audit trail screen (GP-18). OpenCode owns the admin route + the flush/export
 * wiring; the data comes through withUser and the visible table presentation is
 * Gemini's DataTable component (lane/gemini). Until that lane is merged this
 * renders a minimal local table so the screen is usable end-to-end. The year /
 * quarter / search controls feed the same AuditFilter the export route uses, so
 * "export" always reflects the current view.
 */
export default async function AuditTrailPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; quarter?: string; search?: string }>;
}) {
  const sp = await searchParams;
  const filter: AuditFilter = {};
  if (sp.year) filter.year = Number(sp.year);
  if (sp.quarter) filter.quarter = Number(sp.quarter) as 1 | 2 | 3 | 4;
  if (sp.search) filter.search = sp.search;

  const userId = BigInt(1);
  const rows = await queryAuditLogs(userId, filter);

  const years = await withUser(userId, (tx) =>
    tx.auditLog.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 1000,
    }),
  );
  const distinctYears = Array.from(
    new Set(years.map((r) => r.createdAt.getFullYear())),
  ).sort((a, b) => b - a);
  const currentYear = filter.year ?? new Date().getFullYear();

  return (
    <main>
      <h1>Jejak Audit / Audit Trail</h1>

      <form method="get">
        <label>
          Tahun / Year
          <select name="year" defaultValue={String(currentYear)}>
            {distinctYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          Suku / Quarter
          <select name="quarter" defaultValue={filter.quarter ?? ""}>
            <option value="">Semua / All</option>
            <option value="1">Q1</option>
            <option value="2">Q2</option>
            <option value="3">Q3</option>
            <option value="4">Q4</option>
          </select>
        </label>
        <label>
          Cari / Search
          <input name="search" defaultValue={filter.search ?? ""} />
        </label>
        <button type="submit">Tapis / Filter</button>
      </form>

      <form
        action={async () => {
          await flushAudit(String(userId));
        }}
      >
        <button type="submit">Padam Rekod Tamat Tempoh / Purge Expired</button>
      </form>

      <form method="post" action="/audit/export">
        <input type="hidden" name="year" value={currentYear} />
        <input type="hidden" name="quarter" value={filter.quarter ?? ""} />
        <input type="hidden" name="search" value={filter.search ?? ""} />
        <button type="submit" name="format" value="xlsx">
          Eksport Excel / Export Excel
        </button>
        <button type="submit" name="format" value="docx">
          Eksport Word / Export Word
        </button>
        <button type="submit" name="format" value="html">
          Eksport PDF / Export PDF
        </button>
      </form>

      <table>
        <thead>
          <tr>
            {auditColumnHeaders.map((h) => (
              <th key={h.key}>{h.labelMs}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {auditColumnHeaders.map((h) => (
                <td key={h.key}>{String(r[h.key] ?? "")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
