/**
 * The universal list contract — GP-12, GP-14.
 *
 * GP-12 requires EVERY list in the system to carry the same capabilities:
 * configurable default sort, ASC/DESC on click, keyword search, filtering by
 * year / date range / quarter, and export of the current view. So the shape is
 * defined once, here, and every list — applications, audit trail, licence
 * holders, reference documents — is described by a TableSchema rather than
 * hand-built.
 *
 * This file is published ahead of the implementation on purpose: the UI lane
 * builds presentation against these types, and the export lane consumes
 * TableResult. Neither should wait for the query builder to land.
 *
 * Types only. No runtime code, no imports — so any lane can read it without
 * taking on a dependency.
 */

export type SortDirection = 'asc' | 'desc'

/** How a column is rendered and filtered. Not a business list — presentation. */
export type ColumnKind = 'text' | 'number' | 'date' | 'datetime' | 'badge' | 'lookup'

export interface ColumnDef<Row> {
  /** Matches the Prisma field name. Used for sorting and search. */
  key: string
  /** G4 — both languages, always. */
  labelMs: string
  labelEn: string
  kind: ColumnKind
  sortable?: boolean
  /** Included in keyword search. Only text columns should set this. */
  searchable?: boolean
  /** For kind 'lookup': the lookup_types.code to resolve labels through. */
  lookupType?: string
  /** Pull a display value off the row when it is not a plain field. */
  accessor?: (row: Row) => unknown
  /** Hidden by default but available in exports — GP-13 confidentiality. */
  exportOnly?: boolean
}

export interface SortSpec {
  column: string
  direction: SortDirection
}

/**
 * GP-12's four filter modes.
 *
 * `year` and `quarter` are shorthands over the same underlying date column as
 * `dateFrom`/`dateTo`; the resolver turns all of them into a single half-open
 * range so they compose predictably instead of fighting each other.
 */
export interface TableFilters {
  keyword?: string
  year?: number
  /** Calendar quarter, 1-4. Malaysian government uses the calendar year. */
  quarter?: 1 | 2 | 3 | 4
  /** ISO date, inclusive. */
  dateFrom?: string
  /** ISO date, **inclusive** — the resolver adds the day, not the caller. */
  dateTo?: string
}

export interface TableQuery {
  filters: TableFilters
  sort: SortSpec
  /** Opaque keyset cursor. Never an offset — see the note in query.ts. */
  cursor?: string | null
  pageSize: number
}

export interface TableSchema<Row> {
  /** Stable code, so an admin's default sort can be stored per list (GP-12). */
  code: string
  columns: ColumnDef<Row>[]
  defaultSort: SortSpec
  /**
   * The column that year / quarter / date-range filters apply to.
   * Omit it and those three filters are unavailable for this list.
   */
  dateColumn?: string
  /** Guards keyset paging: must be unique and monotonic. Defaults to 'id'. */
  tiebreakColumn?: string
  defaultPageSize?: number
  maxPageSize?: number
}

export interface TableResult<Row> {
  rows: Row[]
  /** Pass back as `cursor` for the next page. Null when there are no more. */
  nextCursor: string | null
  hasMore: boolean
  /** Echoed so the UI and the exporter describe exactly the same view. */
  appliedQuery: TableQuery
}

/** A resolved half-open date range: `gte <= value < lt`. */
export interface DateRange {
  gte: Date
  lt: Date
}

export type TableErrorCode =
  | 'UNKNOWN_COLUMN'
  | 'COLUMN_NOT_SORTABLE'
  | 'INVALID_DATE_RANGE'
  | 'INVALID_QUARTER'
  | 'INVALID_PAGE_SIZE'
  | 'INVALID_CURSOR'

export interface TableError {
  code: TableErrorCode
  /** G4 — surfaced to the user when a filter is rejected. */
  messageMs: string
  messageEn: string
}

export type QueryResolution =
  | { ok: true; query: TableQuery }
  | { ok: false; errors: TableError[] }
