import { describe, expect, it } from 'vitest'

import {
  buildAggregateTable,
  buildGraphData,
  buildPublicStatisticsPayload,
  localizeHeader,
  toCell,
  toMatrix,
} from '../src/lib/exports/shapes'
import type { AggregateBucketDef, ExportHeader } from '../src/lib/exports/types'

/**
 * GP-12 / GP-14 — the export engine's pure shaping. These tests drive
 * shapes.ts directly with already-filtered rows (the RLS scope the caller
 * established); no Excel/Word/PDF library is touched, so the matrix is
 * actually covered. The library writers import these functions and are not
 * imported here because their dependencies are added by the lead.
 */

const headers: ExportHeader[] = [
  { key: 'referenceNo', labelMs: 'No. Rujukan', labelEn: 'Reference No.' },
  { key: 'applicant', labelMs: 'Pemohon', labelEn: 'Applicant' },
  { key: 'submittedAt', labelMs: 'Tarikh', labelEn: 'Date' },
]

const rows = [
  {
    referenceNo: 'LPK/LPS/2026/001',
    applicant: 'Syarikat ABC',
    submittedAt: new Date('2026-01-15T00:00:00.000Z'),
    status: 'approved',
  },
  {
    referenceNo: 'LPK/LPS/2026/002',
    applicant: 'Syarikat XYZ',
    submittedAt: new Date('2026-02-20T00:00:00.000Z'),
    status: 'rejected',
  },
  {
    referenceNo: 'LPK/LPS/2026/003',
    applicant: 'Individu 123',
    submittedAt: null,
    status: 'approved',
  },
]

describe('localizeHeader', () => {
  it('picks the Malay label by default', () => {
    expect(localizeHeader(headers[0], 'ms')).toBe('No. Rujukan')
  })
  it('picks the English label when asked', () => {
    expect(localizeHeader(headers[0], 'en')).toBe('Reference No.')
  })
})

describe('toCell', () => {
  it('maps null and undefined to null', () => {
    expect(toCell(null)).toBeNull()
    expect(toCell(undefined)).toBeNull()
  })
  it('converts Dates to ISO strings (deterministic)', () => {
    expect(toCell(new Date('2026-01-15T00:00:00.000Z'))).toBe('2026-01-15T00:00:00.000Z')
  })
  it('serialises objects instead of dropping them', () => {
    expect(toCell({ a: 1 })).toBe('{"a":1}')
  })
  it('passes through primitives', () => {
    expect(toCell('x')).toBe('x')
    expect(toCell(42)).toBe(42)
    expect(toCell(true)).toBe(true)
  })
})

describe('toMatrix', () => {
  it('emits a localized header row then the data rows in order', () => {
    const matrix = toMatrix(headers, rows, 'ms')
    expect(matrix[0]).toEqual(['No. Rujukan', 'Pemohon', 'Tarikh'])
    expect(matrix).toHaveLength(4)
    expect(matrix[1][0]).toBe('LPK/LPS/2026/001')
    expect(matrix[3][2]).toBeNull()
  })

  it('honours the requested locale for headers', () => {
    const matrix = toMatrix(headers, rows, 'en')
    expect(matrix[0]).toEqual(['Reference No.', 'Applicant', 'Date'])
  })

  it('puts each row value under its header key', () => {
    const matrix = toMatrix(headers, rows, 'ms')
    expect(matrix[1][0]).toBe('LPK/LPS/2026/001')
    expect(matrix[3][0]).toBe('LPK/LPS/2026/003')
  })
})

describe('buildAggregateTable', () => {
  // Status codes are supplied by the caller from configuration — never
  // hard-coded here (G1). They stand in for what the admin UI would provide.
  const bucketDefs: AggregateBucketDef[] = [
    { labelMs: 'Diluluskan', labelEn: 'Approved', statuses: ['approved'] },
    { labelMs: 'Ditolak', labelEn: 'Rejected', statuses: ['rejected'] },
  ]

  it('counts transactions as the total rows', () => {
    const agg = buildAggregateTable(rows, bucketDefs)
    expect(agg.transactions).toBe(3)
  })

  it('counts each bucket from the supplied status sets', () => {
    const agg = buildAggregateTable(rows, bucketDefs)
    expect(agg.buckets[0]).toMatchObject({ labelMs: 'Diluluskan', labelEn: 'Approved', count: 2 })
    expect(agg.buckets[1]).toMatchObject({ labelMs: 'Ditolak', labelEn: 'Rejected', count: 1 })
  })

  it('carries both languages on every bucket (G4)', () => {
    const agg = buildAggregateTable(rows, bucketDefs)
    for (const bucket of agg.buckets) {
      expect(bucket.labelMs.length).toBeGreaterThan(0)
      expect(bucket.labelEn.length).toBeGreaterThan(0)
      expect(bucket.labelMs).not.toBe(bucket.labelEn)
    }
  })
})

describe('buildGraphData', () => {
  it('derives a series from the aggregate buckets', () => {
    const agg = buildAggregateTable(rows, [
      { labelMs: 'Diluluskan', labelEn: 'Approved', statuses: ['approved'] },
      { labelMs: 'Ditolak', labelEn: 'Rejected', statuses: ['rejected'] },
    ])
    const series = buildGraphData(agg)
    expect(series.points).toHaveLength(2)
    expect(series.points[0].categoryMs).toBe('Diluluskan')
    expect(series.points[0].value).toBe(2)
    expect(series.points[1].categoryEn).toBe('Rejected')
    expect(series.points[1].value).toBe(1)
  })
})

describe('buildPublicStatisticsPayload (X-R12 — public, login-free)', () => {
  const agg = buildAggregateTable(rows, [
    { labelMs: 'Diluluskan', labelEn: 'Approved', statuses: ['approved'] },
    { labelMs: 'Ditolak', labelEn: 'Rejected', statuses: ['rejected'] },
  ])
  const now = new Date('2026-08-24T00:00:00.000Z')

  it('exposes only aggregates and labels, never raw records', () => {
    const payload = buildPublicStatisticsPayload(agg, now)
    expect(payload.transactions).toBe(3)
    expect(payload.series).toHaveLength(2)
    expect(payload.generatedAt).toBe(now.toISOString())
  })

  it('cannot leak PII: raw records are never accepted, so names/ICs never appear', () => {
    // A record carrying obvious PII — it is fed only to the aggregate, which
    // counts statuses and ignores everything else. The public payload is built
    // from the aggregate alone.
    const piiRows = [
      { status: 'approved', applicantName: 'Ahmad bin Ali', icNo: '900101015555' },
      { status: 'rejected', applicantName: 'Tan Mei Ling', icNo: '880202026666' },
    ]
    const piiAgg = buildAggregateTable(piiRows, [
      { labelMs: 'Diluluskan', labelEn: 'Approved', statuses: ['approved'] },
      { labelMs: 'Ditolak', labelEn: 'Rejected', statuses: ['rejected'] },
    ])
    const payload = JSON.stringify(buildPublicStatisticsPayload(piiAgg, now))

    expect(payload).not.toContain('Ahmad')
    expect(payload).not.toContain('Tan Mei Ling')
    expect(payload).not.toContain('900101015555')
    expect(payload).not.toContain('880202026666')
  })
})
