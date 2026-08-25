import type {
  ColumnDef,
  DateRange,
  QueryResolution,
  SortDirection,
  TableError,
  TableErrorCode,
  TableFilters,
  TableQuery,
  TableSchema,
} from './types'

/**
 * Query resolution for the universal list — GP-12.
 *
 * Pure. No database, no request, no clock unless it is passed in. Everything
 * GP-12 asks for — default sort, ASC/DESC, keyword search, year / date range /
 * quarter filtering — is decided here, so the whole matrix is provable in the
 * test suite instead of being exercised by clicking around a UI.
 *
 * The Prisma-shaped objects this returns are handed to `list()` in list.ts,
 * which is the only part that touches a connection.
 */

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 200

const error = (code: TableErrorCode, messageMs: string, messageEn: string): TableError => ({
  code,
  messageMs,
  messageEn,
})

/** Loosely typed input, as it arrives from URL search params. */
export interface RawQueryParams {
  sort?: string
  direction?: string
  keyword?: string
  year?: string | number
  quarter?: string | number
  dateFrom?: string
  dateTo?: string
  cursor?: string | null
  pageSize?: string | number
}

// ───────────────────────────────────────────────────────────────── date range

const startOfDay = (iso: string): Date => new Date(`${iso}T00:00:00.000Z`)

const addDays = (date: Date, days: number): Date =>
  new Date(date.getTime() + days * 86_400_000)

const isValidDate = (date: Date): boolean => !Number.isNaN(date.getTime())

/**
 * Turns GP-12's three date filters into one half-open range: `gte <= x < lt`.
 *
 * Half-open is what makes the modes compose without off-by-one drift. A closed
 * range on a datetime column silently drops rows stamped later on the final
 * day, which is the classic "my report is missing today's applications" bug.
 *
 * `dateTo` is INCLUSIVE at the API boundary — the caller says "up to and
 * including 31 March" and this adds the day. Every filter UI means it that way,
 * and asking each caller to remember guarantees one of them forgets.
 */
export function resolveDateRange(
  filters: TableFilters,
): { ok: true; range: DateRange | null } | { ok: false; errors: TableError[] } {
  const { year, quarter, dateFrom, dateTo } = filters
  const hasExplicit = Boolean(dateFrom || dateTo)
  const hasPeriod = year !== undefined || quarter !== undefined

  // Combining them is ambiguous — is "2026 + 1 Mar to 5 Mar" an intersection or
  // an override? Rather than pick silently, refuse and say so.
  if (hasExplicit && hasPeriod) {
    return {
      ok: false,
      errors: [
        error(
          'INVALID_DATE_RANGE',
          'Gunakan sama ada julat tarikh, atau tahun/suku tahun — bukan kedua-duanya.',
          'Use either a date range or a year/quarter — not both.',
        ),
      ],
    }
  }

  if (hasExplicit) {
    const from = dateFrom ? startOfDay(dateFrom) : null
    const to = dateTo ? startOfDay(dateTo) : null

    if ((from && !isValidDate(from)) || (to && !isValidDate(to))) {
      return {
        ok: false,
        errors: [
          error('INVALID_DATE_RANGE', 'Format tarikh tidak sah.', 'Invalid date format.'),
        ],
      }
    }

    if (from && to && from.getTime() > to.getTime()) {
      return {
        ok: false,
        errors: [
          error(
            'INVALID_DATE_RANGE',
            'Tarikh mula mesti sebelum tarikh akhir.',
            'The start date must fall before the end date.',
          ),
        ],
      }
    }

    return {
      ok: true,
      range: {
        // An open lower bound reaches back to the epoch; an open upper bound
        // reaches far enough forward that no licence expiry escapes it.
        gte: from ?? new Date(0),
        lt: to ? addDays(to, 1) : new Date('9999-12-31T00:00:00.000Z'),
      },
    }
  }

  if (quarter !== undefined && year === undefined) {
    return {
      ok: false,
      errors: [
        error(
          'INVALID_QUARTER',
          'Suku tahun mesti disertakan bersama tahun.',
          'A quarter must be accompanied by a year.',
        ),
      ],
    }
  }

  if (year === undefined) return { ok: true, range: null }

  if (!Number.isInteger(year) || year < 1900 || year > 2999) {
    return {
      ok: false,
      errors: [error('INVALID_DATE_RANGE', 'Tahun tidak sah.', 'Invalid year.')],
    }
  }

  if (quarter === undefined) {
    return {
      ok: true,
      range: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    }
  }

  if (![1, 2, 3, 4].includes(quarter)) {
    return {
      ok: false,
      errors: [
        error('INVALID_QUARTER', 'Suku tahun mesti 1 hingga 4.', 'Quarter must be 1 to 4.'),
      ],
    }
  }

  // Malaysian government reporting runs on the calendar year, so Q1 is
  // January-March. If a unit ever asks for a fiscal quarter, that is a question
  // for the lead — it is not something to infer from a filter label.
  const startMonth = (quarter - 1) * 3

  return {
    ok: true,
    range: {
      gte: new Date(Date.UTC(year, startMonth, 1)),
      lt: new Date(Date.UTC(year, startMonth + 3, 1)),
    },
  }
}

// ─────────────────────────────────────────────────────────────────── cursor

interface CursorPayload {
  /** Value of the sort column on the last row of the previous page. */
  v: string | number | null
  /** Value of the tiebreak column, as a string — ids are BigInt. */
  t: string
  /** Column kind, so a date revives as a Date rather than a string. */
  k: string
}

export function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

export function decodeCursor(cursor: string): CursorPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8')) as CursorPayload

    if (typeof parsed?.t !== 'string' || typeof parsed?.k !== 'string') return null
    return parsed
  } catch {
    return null
  }
}

const reviveCursorValue = (payload: CursorPayload): unknown => {
  if (payload.v === null) return null
  if (payload.k === 'date' || payload.k === 'datetime') return new Date(String(payload.v))
  return payload.v
}

// ───────────────────────────────────────────────────────────── query building

const findColumn = <Row>(schema: TableSchema<Row>, key: string): ColumnDef<Row> | undefined =>
  schema.columns.find((column) => column.key === key)

/**
 * Validates raw input against the schema and produces a TableQuery.
 *
 * The sort column is checked against the schema rather than passed through.
 * Without that, a URL parameter reaches Prisma's `orderBy` as an arbitrary
 * field name — at best an error, at worst ordering by a column the caller was
 * never meant to know exists.
 */
export function resolveQuery<Row>(
  schema: TableSchema<Row>,
  raw: RawQueryParams = {},
): QueryResolution {
  const errors: TableError[] = []

  // ── sort
  let sortColumn = raw.sort ?? schema.defaultSort.column
  let direction: SortDirection =
    raw.direction === 'asc' || raw.direction === 'desc'
      ? raw.direction
      : schema.defaultSort.direction

  const column = findColumn(schema, sortColumn)

  if (!column) {
    errors.push(
      error(
        'UNKNOWN_COLUMN',
        `Lajur '${sortColumn}' tidak wujud dalam senarai ini.`,
        `Column '${sortColumn}' does not exist on this list.`,
      ),
    )
    sortColumn = schema.defaultSort.column
    direction = schema.defaultSort.direction
  } else if (column.sortable === false) {
    errors.push(
      error(
        'COLUMN_NOT_SORTABLE',
        `Lajur '${sortColumn}' tidak boleh diisih.`,
        `Column '${sortColumn}' cannot be sorted.`,
      ),
    )
    sortColumn = schema.defaultSort.column
    direction = schema.defaultSort.direction
  }

  // ── page size
  const maxPageSize = schema.maxPageSize ?? MAX_PAGE_SIZE
  const requested = raw.pageSize === undefined ? undefined : Number(raw.pageSize)
  let pageSize = schema.defaultPageSize ?? DEFAULT_PAGE_SIZE

  if (requested !== undefined) {
    if (!Number.isInteger(requested) || requested < 1 || requested > maxPageSize) {
      errors.push(
        error(
          'INVALID_PAGE_SIZE',
          `Saiz halaman mesti antara 1 dan ${maxPageSize}.`,
          `Page size must be between 1 and ${maxPageSize}.`,
        ),
      )
    } else {
      pageSize = requested
    }
  }

  // ── filters
  const filters: TableFilters = {}

  if (raw.keyword && raw.keyword.trim() !== '') filters.keyword = raw.keyword.trim()
  if (raw.year !== undefined && raw.year !== '') filters.year = Number(raw.year)
  if (raw.quarter !== undefined && raw.quarter !== '') {
    filters.quarter = Number(raw.quarter) as TableFilters['quarter']
  }
  if (raw.dateFrom) filters.dateFrom = raw.dateFrom
  if (raw.dateTo) filters.dateTo = raw.dateTo

  const wantsDateFilter =
    filters.year !== undefined ||
    filters.quarter !== undefined ||
    filters.dateFrom !== undefined ||
    filters.dateTo !== undefined

  if (wantsDateFilter && !schema.dateColumn) {
    errors.push(
      error(
        'INVALID_DATE_RANGE',
        'Senarai ini tidak menyokong penapisan mengikut tarikh.',
        'This list does not support date filtering.',
      ),
    )
  } else {
    const range = resolveDateRange(filters)
    if (!range.ok) errors.push(...range.errors)
  }

  // ── cursor
  if (raw.cursor && decodeCursor(raw.cursor) === null) {
    errors.push(
      error(
        'INVALID_CURSOR',
        'Penanda halaman tidak sah. Sila mula semula dari halaman pertama.',
        'Invalid page cursor. Please start again from the first page.',
      ),
    )
  }

  if (errors.length > 0) return { ok: false, errors }

  return {
    ok: true,
    query: {
      filters,
      sort: { column: sortColumn, direction },
      cursor: raw.cursor ?? null,
      pageSize,
    },
  }
}

/**
 * The Prisma `where` for a query.
 *
 * Soft-deleted rows are excluded unconditionally (G2). A list is a view of what
 * currently exists; historical records reach deleted rows through their own
 * snapshot fields, never through a list query.
 */
export function buildWhere<Row>(
  schema: TableSchema<Row>,
  query: TableQuery,
): Record<string, unknown> {
  const conditions: Record<string, unknown>[] = [{ deletedAt: null }]

  if (schema.dateColumn) {
    const resolved = resolveDateRange(query.filters)
    if (resolved.ok && resolved.range) {
      conditions.push({ [schema.dateColumn]: { gte: resolved.range.gte, lt: resolved.range.lt } })
    }
  }

  if (query.filters.keyword) {
    const searchable = schema.columns.filter((column) => column.searchable)

    if (searchable.length > 0) {
      conditions.push({
        OR: searchable.map((column) => ({
          [column.key]: { contains: query.filters.keyword, mode: 'insensitive' },
        })),
      })
    }
  }

  const keyset = buildCursorCondition(schema, query)
  if (keyset) conditions.push(keyset)

  return { AND: conditions }
}

/**
 * The keyset condition that resumes after the previous page.
 *
 * Not OFFSET. The audit trail and the application list will run to hundreds of
 * thousands of rows, and OFFSET makes the database walk and discard every
 * skipped row — page 400 costs four hundred times page one. Keyset stays flat.
 *
 * The tiebreak is what makes the ordering total. Sorting by a non-unique column
 * alone, rows sharing a value can land on either side of a page boundary
 * between queries, so some are shown twice and others never at all.
 */
export function buildCursorCondition<Row>(
  schema: TableSchema<Row>,
  query: TableQuery,
): Record<string, unknown> | null {
  if (!query.cursor) return null

  const payload = decodeCursor(query.cursor)
  if (!payload) return null

  const tiebreak = schema.tiebreakColumn ?? 'id'
  const operator = query.sort.direction === 'asc' ? 'gt' : 'lt'
  const value = reviveCursorValue(payload)

  return {
    OR: [
      { [query.sort.column]: { [operator]: value } },
      {
        AND: [
          { [query.sort.column]: value },
          { [tiebreak]: { [operator]: BigInt(payload.t) } },
        ],
      },
    ],
  }
}

export function buildOrderBy<Row>(
  schema: TableSchema<Row>,
  query: TableQuery,
): Record<string, SortDirection>[] {
  const tiebreak = schema.tiebreakColumn ?? 'id'

  return [
    { [query.sort.column]: query.sort.direction },
    { [tiebreak]: query.sort.direction },
  ]
}

/**
 * Builds the cursor pointing at the last row of a page.
 *
 * Returns null when there is no further page, which is what tells the UI to
 * stop offering "next".
 */
export function cursorFor<Row extends Record<string, unknown>>(
  schema: TableSchema<Row>,
  query: TableQuery,
  lastRow: Row | undefined,
): string | null {
  if (!lastRow) return null

  const tiebreak = schema.tiebreakColumn ?? 'id'
  const column = findColumn(schema, query.sort.column)
  const raw = lastRow[query.sort.column]

  const value =
    raw instanceof Date
      ? raw.toISOString()
      : typeof raw === 'string' || typeof raw === 'number'
        ? raw
        : raw === null || raw === undefined
          ? null
          : String(raw)

  return encodeCursor({
    v: value,
    t: String(lastRow[tiebreak]),
    k: column?.kind ?? 'text',
  })
}
