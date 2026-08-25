import { describe, expect, it } from 'vitest'

import {
  buildCursorCondition,
  buildOrderBy,
  buildWhere,
  cursorFor,
  decodeCursor,
  encodeCursor,
  resolveDateRange,
  resolveQuery,
} from '../src/lib/table/query'
import type { TableSchema } from '../src/lib/table/types'

/**
 * GP-12 requires every list to behave identically. These tests pin that
 * behaviour: sort validated against the schema, the three date filter modes
 * composing into one range, keyset paging that neither skips nor repeats, and
 * soft-deleted rows never appearing (G2).
 */

interface Row extends Record<string, unknown> {
  id: bigint
  referenceNo: string
  status: string
  submittedAt: Date
}

const schema: TableSchema<Row> = {
  code: 'permohonan',
  columns: [
    { key: 'referenceNo', labelMs: 'No. Rujukan', labelEn: 'Reference No.', kind: 'text', sortable: true, searchable: true },
    { key: 'status', labelMs: 'Status', labelEn: 'Status', kind: 'badge', sortable: true },
    { key: 'submittedAt', labelMs: 'Tarikh Hantar', labelEn: 'Submitted', kind: 'date', sortable: true },
    { key: 'catatan', labelMs: 'Catatan', labelEn: 'Remarks', kind: 'text', sortable: false, searchable: true },
  ],
  defaultSort: { column: 'submittedAt', direction: 'desc' },
  dateColumn: 'submittedAt',
}

describe('resolveDateRange — GP-12 year / quarter / range', () => {
  it('returns no range when nothing is filtered', () => {
    const result = resolveDateRange({})
    expect(result.ok && result.range).toBeNull()
  })

  it('turns a year into the whole calendar year', () => {
    const result = resolveDateRange({ year: 2026 })
    expect(result.ok).toBe(true)
    if (result.ok && result.range) {
      expect(result.range.gte.toISOString()).toBe('2026-01-01T00:00:00.000Z')
      expect(result.range.lt.toISOString()).toBe('2027-01-01T00:00:00.000Z')
    }
  })

  it.each([
    [1, '2026-01-01T00:00:00.000Z', '2026-04-01T00:00:00.000Z'],
    [2, '2026-04-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z'],
    [3, '2026-07-01T00:00:00.000Z', '2026-10-01T00:00:00.000Z'],
    [4, '2026-10-01T00:00:00.000Z', '2027-01-01T00:00:00.000Z'],
  ])('maps Q%i to calendar quarter boundaries', (quarter, gte, lt) => {
    const result = resolveDateRange({ year: 2026, quarter: quarter as 1 | 2 | 3 | 4 })
    expect(result.ok).toBe(true)
    if (result.ok && result.range) {
      expect(result.range.gte.toISOString()).toBe(gte)
      expect(result.range.lt.toISOString()).toBe(lt)
    }
  })

  it('treats dateTo as INCLUSIVE by adding the day', () => {
    // The bug this prevents: a closed range on a datetime column drops rows
    // stamped later on the final day — "my report is missing today's records".
    const result = resolveDateRange({ dateFrom: '2026-03-01', dateTo: '2026-03-31' })
    expect(result.ok).toBe(true)
    if (result.ok && result.range) {
      expect(result.range.gte.toISOString()).toBe('2026-03-01T00:00:00.000Z')
      expect(result.range.lt.toISOString()).toBe('2026-04-01T00:00:00.000Z')
    }
  })

  it('handles a single-day range', () => {
    const result = resolveDateRange({ dateFrom: '2026-03-15', dateTo: '2026-03-15' })
    expect(result.ok).toBe(true)
    if (result.ok && result.range) {
      expect(result.range.lt.getTime() - result.range.gte.getTime()).toBe(86_400_000)
    }
  })

  it('refuses to guess when a range and a period are both given', () => {
    const result = resolveDateRange({ year: 2026, dateFrom: '2026-03-01' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].code).toBe('INVALID_DATE_RANGE')
  })

  it('rejects a quarter with no year', () => {
    const result = resolveDateRange({ quarter: 2 })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].code).toBe('INVALID_QUARTER')
  })

  it('rejects a quarter outside 1-4 and a start after the end', () => {
    expect(resolveDateRange({ year: 2026, quarter: 5 as 1 }).ok).toBe(false)
    expect(resolveDateRange({ dateFrom: '2026-05-01', dateTo: '2026-03-01' }).ok).toBe(false)
  })

  it('gives every rejection both languages (G4)', () => {
    const result = resolveDateRange({ quarter: 2 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      for (const e of result.errors) {
        expect(e.messageMs.length).toBeGreaterThan(0)
        expect(e.messageEn.length).toBeGreaterThan(0)
        expect(e.messageMs).not.toBe(e.messageEn)
      }
    }
  })
})

describe('resolveQuery', () => {
  it('falls back to the schema default sort', () => {
    const result = resolveQuery(schema, {})
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.query.sort).toEqual({ column: 'submittedAt', direction: 'desc' })
  })

  it('accepts a valid sort and direction', () => {
    const result = resolveQuery(schema, { sort: 'referenceNo', direction: 'asc' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.query.sort).toEqual({ column: 'referenceNo', direction: 'asc' })
  })

  it('rejects a column that is not on the schema', () => {
    // Without this, a URL parameter reaches Prisma's orderBy as an arbitrary
    // field name.
    const result = resolveQuery(schema, { sort: 'passwordHash' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].code).toBe('UNKNOWN_COLUMN')
  })

  it('rejects a column the schema marks unsortable', () => {
    const result = resolveQuery(schema, { sort: 'catatan' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].code).toBe('COLUMN_NOT_SORTABLE')
  })

  it('ignores an unrecognised direction rather than failing', () => {
    const result = resolveQuery(schema, { sort: 'referenceNo', direction: 'sideways' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.query.sort.direction).toBe('desc')
  })

  it('bounds the page size', () => {
    expect(resolveQuery(schema, { pageSize: 0 }).ok).toBe(false)
    expect(resolveQuery(schema, { pageSize: 5000 }).ok).toBe(false)
    expect(resolveQuery(schema, { pageSize: 'abc' }).ok).toBe(false)

    const ok = resolveQuery(schema, { pageSize: 50 })
    expect(ok.ok).toBe(true)
    if (ok.ok) expect(ok.query.pageSize).toBe(50)
  })

  it('trims a keyword and drops an empty one', () => {
    const withKeyword = resolveQuery(schema, { keyword: '  LPS/2026  ' })
    if (withKeyword.ok) expect(withKeyword.query.filters.keyword).toBe('LPS/2026')

    const blank = resolveQuery(schema, { keyword: '   ' })
    if (blank.ok) expect(blank.query.filters.keyword).toBeUndefined()
  })

  it('refuses date filters on a list with no date column', () => {
    const dateless: TableSchema<Row> = { ...schema, dateColumn: undefined }
    const result = resolveQuery(dateless, { year: '2026' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].code).toBe('INVALID_DATE_RANGE')
  })

  it('rejects a corrupt cursor instead of silently starting over', () => {
    const result = resolveQuery(schema, { cursor: 'not-a-real-cursor!!' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors[0].code).toBe('INVALID_CURSOR')
  })
})

describe('buildWhere', () => {
  const queryFor = (raw: Parameters<typeof resolveQuery>[1]) => {
    const r = resolveQuery(schema, raw)
    if (!r.ok) throw new Error('expected a valid query')
    return r.query
  }

  it('always excludes soft-deleted rows (G2)', () => {
    const where = buildWhere(schema, queryFor({})) as { AND: Record<string, unknown>[] }
    expect(where.AND).toContainEqual({ deletedAt: null })
  })

  it('applies the resolved date range to the schema date column', () => {
    const where = buildWhere(schema, queryFor({ year: '2026', quarter: '2' })) as {
      AND: Record<string, unknown>[]
    }
    const clause = where.AND.find((c) => 'submittedAt' in c) as
      | { submittedAt: { gte: Date; lt: Date } }
      | undefined

    expect(clause?.submittedAt.gte.toISOString()).toBe('2026-04-01T00:00:00.000Z')
    expect(clause?.submittedAt.lt.toISOString()).toBe('2026-07-01T00:00:00.000Z')
  })

  it('searches only the columns marked searchable', () => {
    const where = buildWhere(schema, queryFor({ keyword: 'LPS' })) as {
      AND: Record<string, unknown>[]
    }
    const or = where.AND.find((c) => 'OR' in c) as { OR: Record<string, unknown>[] } | undefined

    expect(or?.OR).toHaveLength(2)
    const keys = or?.OR.flatMap((clause) => Object.keys(clause))
    expect(keys).toEqual(['referenceNo', 'catatan'])
    expect(keys).not.toContain('status')
  })

  it('adds no search clause when nothing is searched', () => {
    const where = buildWhere(schema, queryFor({})) as { AND: Record<string, unknown>[] }
    expect(where.AND.some((c) => 'OR' in c)).toBe(false)
  })
})

describe('keyset paging', () => {
  it('round-trips a cursor', () => {
    const encoded = encodeCursor({ v: '2026-03-01T00:00:00.000Z', t: '42', k: 'date' })
    expect(decodeCursor(encoded)).toEqual({ v: '2026-03-01T00:00:00.000Z', t: '42', k: 'date' })
  })

  it('returns null for a corrupt cursor rather than throwing', () => {
    expect(decodeCursor('%%%')).toBeNull()
    expect(decodeCursor(Buffer.from('{"nope":1}').toString('base64url'))).toBeNull()
  })

  it('builds a strictly-greater condition when sorting ascending', () => {
    const cursor = encodeCursor({ v: 'LPK/LPS/2026/00010', t: '10', k: 'text' })
    const condition = buildCursorCondition(schema, {
      filters: {},
      sort: { column: 'referenceNo', direction: 'asc' },
      cursor,
      pageSize: 25,
    }) as { OR: Record<string, unknown>[] }

    expect(condition.OR[0]).toEqual({ referenceNo: { gt: 'LPK/LPS/2026/00010' } })
  })

  it('flips to strictly-less when sorting descending', () => {
    const cursor = encodeCursor({ v: 'LPK/LPS/2026/00010', t: '10', k: 'text' })
    const condition = buildCursorCondition(schema, {
      filters: {},
      sort: { column: 'referenceNo', direction: 'desc' },
      cursor,
      pageSize: 25,
    }) as { OR: Record<string, unknown>[] }

    expect(condition.OR[0]).toEqual({ referenceNo: { lt: 'LPK/LPS/2026/00010' } })
  })

  it('includes a tiebreak branch, so equal values cannot skip or repeat rows', () => {
    const cursor = encodeCursor({ v: 'submitted', t: '77', k: 'badge' })
    const condition = buildCursorCondition(schema, {
      filters: {},
      sort: { column: 'status', direction: 'asc' },
      cursor,
      pageSize: 25,
    }) as { OR: Array<{ AND?: Record<string, unknown>[] }> }

    expect(condition.OR[1].AND).toEqual([{ status: 'submitted' }, { id: { gt: 77n } }])
  })

  it('revives a date cursor as a Date, not a string', () => {
    const cursor = encodeCursor({ v: '2026-03-01T00:00:00.000Z', t: '5', k: 'date' })
    const condition = buildCursorCondition(schema, {
      filters: {},
      sort: { column: 'submittedAt', direction: 'desc' },
      cursor,
      pageSize: 25,
    }) as { OR: Array<{ submittedAt?: { lt?: unknown } }> }

    expect(condition.OR[0].submittedAt?.lt).toBeInstanceOf(Date)
  })

  it('produces no condition on the first page', () => {
    const query = { filters: {}, sort: schema.defaultSort, cursor: null, pageSize: 25 }
    expect(buildCursorCondition(schema, query)).toBeNull()
  })

  it('orders by the sort column then the tiebreak, in the same direction', () => {
    const orderBy = buildOrderBy(schema, {
      filters: {},
      sort: { column: 'status', direction: 'asc' },
      cursor: null,
      pageSize: 25,
    })
    expect(orderBy).toEqual([{ status: 'asc' }, { id: 'asc' }])
  })

  it('builds the next cursor from the last row of the page', () => {
    const query = { filters: {}, sort: schema.defaultSort, cursor: null, pageSize: 2 }
    const lastRow: Row = {
      id: 99n,
      referenceNo: 'LPK/LPS/2026/00099',
      status: 'approved',
      submittedAt: new Date('2026-03-01T08:30:00.000Z'),
    }

    const cursor = cursorFor(schema, query, lastRow)
    expect(cursor).not.toBeNull()
    expect(decodeCursor(cursor as string)).toEqual({
      v: '2026-03-01T08:30:00.000Z',
      t: '99',
      k: 'date',
    })
  })

  it('returns no cursor when the page is empty', () => {
    const query = { filters: {}, sort: schema.defaultSort, cursor: null, pageSize: 25 }
    expect(cursorFor(schema, query, undefined)).toBeNull()
  })
})
