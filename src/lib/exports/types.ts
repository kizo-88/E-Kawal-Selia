/**
 * Export engine — shared types for GP-12 and GP-14.
 *
 * Every export takes its rows ALREADY FILTERED by the caller. The caller
 * established the RLS scope (via withUser from src/lib/db/scoped.ts) when it
 * queried; re-querying inside the exporter would bypass that scope and the
 * resulting file could contain rows the user cannot see on screen. So these
 * types describe inputs the caller hands in, never a query.
 *
 * G4: every column header is user-facing, so it carries both languages. The
 * exporter picks the right one by locale — headers are never derived from
 * database column names.
 */

export type ExportLocale = 'ms' | 'en'

/** A column definition, bilingual. `key` addresses the row object. */
export interface ExportHeader {
  key: string
  labelMs: string
  labelEn: string
}

/** A single cell value as it lands in a spreadsheet / document. */
export type CellValue = string | number | boolean | null

/**
 * A statistical bucket definition. The `statuses` list is data the caller
 * supplies from configuration (the application status codes are admin-editable,
 * per G1, so they must never be hard-coded here). The bucket labels are
 * bilingual (G4).
 */
export interface AggregateBucketDef {
  labelMs: string
  labelEn: string
  statuses: string[]
}

export interface AggregateBucket {
  labelMs: string
  labelEn: string
  count: number
}

/** The "table" form of a statistical report: aggregates only. */
export interface AggregateTable {
  /** Total records in the current view. */
  transactions: number
  buckets: AggregateBucket[]
}

/** The "graph" form: a single series a chart renderer can draw (PNG/JPG = Gemini's job). */
export interface GraphSeries {
  labelMs: string
  labelEn: string
  points: { categoryMs: string; categoryEn: string; value: number }[]
}

/**
 * The payload the public, login-free iFrame endpoint returns (GP-14). It is
 * PII-safe BY CONSTRUCTION: only aggregate labels and counts are allowed in.
 * Raw records are never accepted, so an applicant name, IC, company or
 * reference number can never reach the public site — the same disclosure rule
 * as the QR verification page (X-R12).
 */
export interface PublicStatisticsPayload {
  transactions: number
  series: { labelMs: string; labelEn: string; count: number }[]
  generatedAt: string
}
