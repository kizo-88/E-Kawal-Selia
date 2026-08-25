/**
 * Export engine — PDF writer (GP-12, GP-14).
 *
 * GP-12 requires lists to export to PDF and GP-14 requires charts to export to
 * PDF. A PDF is a *binary* format and producing it needs a renderer
 * (CLAUDE.md names Puppeteer). Puppeteer is NOT among the packages approved for
 * this lane — only `exceljs` and `docx` are — and adding a package is a lead
 * decision (ADR 0001 / "ask the lead before adding any package"). So this file
 * does not import a renderer.
 *
 * What it does provide is the print-ready HTML that a PDF renderer consumes.
 * That HTML is built by a PURE function (`buildReportHtml`), fully testable
 * without any library, and is exactly what a browser "Print -> PDF" or an
 * approved headless renderer would turn into the final PDF. The binary step is
 * flagged to the lead for an approval decision rather than guessed at.
 *
 * As with every writer here, the data is passed in already filtered by the
 * caller (RLS scope already established). No database query happens here.
 */

import type { AggregateTable, CellValue, ExportLocale } from './types'

export interface ReportHtmlInput {
  titleMs: string
  titleEn: string
  locale: ExportLocale
  /** A localized matrix from toMatrix (full-detail list form). */
  matrix?: CellValue[][]
  /** An aggregate table (table form). */
  aggregate?: AggregateTable
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

/**
 * Renders a print-ready HTML document for the report.
 *
 * Pure: given the same input it returns the same string, so the markup — and
 * therefore what a PDF renderer would emit — is testable. Bilingual title is
 * supplied; the chosen `locale` picks which is shown.
 */
export function buildReportHtml(input: ReportHtmlInput): string {
  const title = input.locale === 'en' ? input.titleEn : input.titleMs

  const bodyRows: string[] = []

  if (input.matrix) {
    for (const row of input.matrix) {
      const cells = row
        .map((cell) => `<td>${escapeHtml(cell === null || cell === undefined ? '' : String(cell))}</td>`)
        .join('')
      bodyRows.push(`<tr>${cells}</tr>`)
    }
  }

  if (input.aggregate) {
    const category = input.locale === 'en' ? 'Category' : 'Kategori'
    const count = input.locale === 'en' ? 'Count' : 'Bilangan'
    bodyRows.push(
      `<tr><td>${escapeHtml(category)}</td><td>${escapeHtml(count)}</td></tr>`,
    )
    bodyRows.push(
      `<tr><td>${escapeHtml(input.locale === 'en' ? 'Transactions' : 'Transaksi')}</td>` +
        `<td>${String(input.aggregate.transactions)}</td></tr>`,
    )
    for (const bucket of input.aggregate.buckets) {
      const label = input.locale === 'en' ? bucket.labelEn : bucket.labelMs
      bodyRows.push(`<tr><td>${escapeHtml(label)}</td><td>${String(bucket.count)}</td></tr>`)
    }
  }

  return `<!DOCTYPE html>
<html lang="${input.locale}">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body>
<h1>${escapeHtml(title)}</h1>
<table border="1" cellspacing="0" cellpadding="4">
${bodyRows.join('\n')}
</table>
</body>
</html>`
}
