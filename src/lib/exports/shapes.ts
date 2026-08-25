/**
 * Export engine — pure data shaping (GP-12, GP-14).
 *
 * Three report forms, all derivable from already-filtered rows:
 *   - list   (full detail)  -> toMatrix
 *   - table  (aggregates)   -> buildAggregateTable
 *   - graph  (derived)      -> buildGraphData
 *
 * None of this touches a database or a file library, so the whole matrix of
 * shaping cases is testable directly (see tests/exports.test.ts) — following
 * the pattern in src/lib/uploads/file-policy.ts. The Excel / Word / PDF writers
 * in excel.ts, word.ts and pdf.ts import the library each needs and call these
 * pure functions; those writers are not imported by the tests because the
 * libraries are added by the lead, not present here.
 */

import type {
  AggregateBucketDef,
  AggregateTable,
  CellValue,
  ExportHeader,
  ExportLocale,
  GraphSeries,
  PublicStatisticsPayload,
} from './types'

/** Picks the bilingual label for the requested locale (G4). */
export function localizeHeader(header: ExportHeader, locale: ExportLocale): string {
  return locale === 'en' ? header.labelEn : header.labelMs
}

/**
 * Normalises one cell value for a spreadsheet / document cell.
 *
 * `null`/`undefined` become null (the empty cell); Dates become ISO strings so
 * the output is deterministic and testable; objects are serialised rather than
 * silently dropped.
 */
export function toCell(value: unknown): CellValue {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') return JSON.stringify(value)
  return value as string | number | boolean
}

/**
 * Renders headers + rows into a 2-D matrix, localised to `locale`.
 *
 * Row one is the header row; the rest are the data rows in input order. The
 * caller passed the rows already filtered, so this never re-queries.
 */
export function toMatrix(
  headers: ExportHeader[],
  rows: Record<string, unknown>[],
  locale: ExportLocale,
): CellValue[][] {
  const headerRow = headers.map((header) => localizeHeader(header, locale))
  const dataRows = rows.map((row) => headers.map((header) => toCell(row[header.key])))
  return [headerRow, ...dataRows]
}

/**
 * Builds the "table" form: counts per configured bucket plus the total.
 *
 * The bucket definitions are passed in — the application status codes they map
 * to are admin-editable (G1) and must not be hard-coded here.
 */
export function buildAggregateTable(
  rows: { status: string }[],
  bucketDefs: AggregateBucketDef[],
): AggregateTable {
  const buckets = bucketDefs.map((def) => ({
    labelMs: def.labelMs,
    labelEn: def.labelEn,
    count: rows.filter((row) => def.statuses.includes(row.status)).length,
  }))

  return { transactions: rows.length, buckets }
}

/**
 * Builds the "graph" form from an aggregate table: one series whose categories
 * are the buckets and whose values are the counts. Gemini's chart renderer
 * consumes this to produce PNG/JPG (rendering is their job, not ours).
 */
export function buildGraphData(aggregate: AggregateTable): GraphSeries {
  return {
    labelMs: 'Statistik',
    labelEn: 'Statistics',
    points: aggregate.buckets.map((bucket) => ({
      categoryMs: bucket.labelMs,
      categoryEn: bucket.labelEn,
      value: bucket.count,
    })),
  }
}

/**
 * Builds the public, login-free statistics payload (GP-14 iFrame endpoint).
 *
 * Safe by construction: only `AggregateTable` — labels and counts, never raw
 * records — is accepted, so no applicant name, IC, company detail or reference
 * number can ever be included (X-R12). `now` is injectable so the timestamp is
 * testable without mocking the clock.
 */
export function buildPublicStatisticsPayload(
  aggregate: AggregateTable,
  now: Date = new Date(),
): PublicStatisticsPayload {
  return {
    transactions: aggregate.transactions,
    series: aggregate.buckets.map((bucket) => ({
      labelMs: bucket.labelMs,
      labelEn: bucket.labelEn,
      count: bucket.count,
    })),
    generatedAt: now.toISOString(),
  }
}
