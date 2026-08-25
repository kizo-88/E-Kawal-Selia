import 'server-only'

import type { Prisma } from '@prisma/client'

import { withUser } from '@/lib/db/scoped'

import { buildOrderBy, buildWhere, cursorFor, resolveQuery, type RawQueryParams } from './query'
import type { TableError, TableResult, TableSchema } from './types'

/**
 * Runs a universal list query — GP-12.
 *
 * Everything that decides *what* to fetch lives in query.ts and is pure. This
 * module is the thin part that opens a connection, and it exists mainly to make
 * one thing impossible to forget:
 *
 *   every query runs inside withUser(), so Row Level Security can see who is
 *   asking (G5).
 *
 * There is no `where: { unitId }` anywhere in this file, and there should not
 * be one in any caller. An officer sees their own unit's applications because
 * the database policy says so. A list that filters in application code is one
 * refactor away from leaking.
 */

/** The Prisma delegate methods a list needs. Any model satisfies this. */
export interface ListDelegate<Row> {
  findMany(args: {
    where?: unknown
    orderBy?: unknown
    take?: number
    select?: unknown
  }): Promise<Row[]>
}

export interface ListOptions<Row> {
  schema: TableSchema<Row>
  params?: RawQueryParams
  /** Resolves the model delegate from the scoped transaction client. */
  delegate: (tx: Prisma.TransactionClient) => ListDelegate<Row>
  /** Narrow the columns fetched. Omit to take the model's default shape. */
  select?: unknown
}

export type ListOutcome<Row> =
  | { ok: true; result: TableResult<Row> }
  | { ok: false; errors: TableError[] }

export async function list<Row extends Record<string, unknown>>(
  userId: bigint | string,
  options: ListOptions<Row>,
): Promise<ListOutcome<Row>> {
  const resolution = resolveQuery(options.schema, options.params)
  if (!resolution.ok) return { ok: false, errors: resolution.errors }

  const query = resolution.query

  const rows = await withUser(userId, async (tx) =>
    options.delegate(tx).findMany({
      where: buildWhere(options.schema, query),
      orderBy: buildOrderBy(options.schema, query),
      // One extra row is the cheapest possible "is there a next page?" — far
      // cheaper than a COUNT over a filtered set on a large table.
      take: query.pageSize + 1,
      select: options.select,
    }),
  )

  const hasMore = rows.length > query.pageSize
  const page = hasMore ? rows.slice(0, query.pageSize) : rows

  return {
    ok: true,
    result: {
      rows: page,
      hasMore,
      nextCursor: hasMore ? cursorFor(options.schema, query, page[page.length - 1]) : null,
      // Echoed so the exporter reproduces exactly the view on screen. GP-12
      // requires the download to reflect the current filtered result, and the
      // only safe way to guarantee that is to hand it the same query.
      appliedQuery: query,
    },
  }
}
