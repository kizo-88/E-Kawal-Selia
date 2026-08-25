import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/db', () => ({ prisma: {} }))
vi.mock('@/lib/db/scoped', () => ({
  withUser: vi.fn((_userId, callback) => callback({})),
  asAnonymous: vi.fn((callback) => callback({})),
}))
vi.mock('../src/lib/db/scoped', () => ({
  withUser: vi.fn((_userId, callback) => callback({})),
  asAnonymous: vi.fn((callback) => callback({})),
}))

import {
  buildCircularWhere,
  shapeCircularRecord,
  BASELINE_CIRCULARS,
} from '../src/app/(admin)/pekeliling/query'
import {
  BASELINE_ANNOUNCEMENTS,
  BASELINE_FAQS,
} from '../src/app/(public)/announcements.query'

describe('Lane D — Data Wiring Round 3 (Audit-adjacent & Reference Screens)', () => {
  describe('Pekeliling Query Builder & Data Shaping (GP-17, M4)', () => {
    it('builds where clause with active and non-deleted constraints', () => {
      const where = buildCircularWhere()
      expect(where.active).toBe(true)
      expect(where.deletedAt).toBeNull()
    })

    it('builds where clause with search term and category filters', () => {
      const where = buildCircularWhere({ search: 'Bunkering', category: 'pekeliling' })
      expect(where.type).toBe('pekeliling')
      expect(where.OR).toBeDefined()
      expect(where.OR?.length).toBe(3)
    })

    it('shapes raw database row into bilingual circular record', () => {
      const raw = {
        id: 101n,
        code: 'PKMN/TEST/2026',
        nameMs: 'Pekeliling Ujian',
        nameEn: 'Test Circular',
        type: 'pekeliling',
        createdAt: new Date('2026-03-01T00:00:00Z'),
      }
      const record = shapeCircularRecord(raw)
      expect(record.id).toBe('101')
      expect(record.refNo).toBe('PKMN/TEST/2026')
      expect(record.titleMs).toBe('Pekeliling Ujian')
      expect(record.titleEn).toBe('Test Circular')
      expect(record.categoryMs).toBe('Pekeliling Pelabuhan')
      expect(record.categoryEn).toBe('Port Circular')
    })

    it('contains baseline circulars complying with G4 bilingual requirements', () => {
      expect(BASELINE_CIRCULARS.length).toBeGreaterThanOrEqual(4)
      for (const c of BASELINE_CIRCULARS) {
        expect(c.id).toBeTruthy()
        expect(c.refNo).toBeTruthy()
        expect(c.titleMs).toBeTruthy()
        expect(c.titleEn).toBeTruthy()
        expect(c.categoryMs).toBeTruthy()
        expect(c.categoryEn).toBeTruthy()
        expect(c.fileSize).toMatch(/\(PDF\)$/)
      }
    })
  })

  describe('Public Announcements & FAQs Data (GP-21, GP-17)', () => {
    it('provides public announcements with paired bilingual strings', () => {
      expect(BASELINE_ANNOUNCEMENTS.length).toBeGreaterThanOrEqual(3)
      for (const a of BASELINE_ANNOUNCEMENTS) {
        expect(a.titleMs).toBeTruthy()
        expect(a.titleEn).toBeTruthy()
        expect(a.summaryMs).toBeTruthy()
        expect(a.summaryEn).toBeTruthy()
        expect(['announcement', 'circular', 'news']).toContain(a.type)
      }
    })

    it('provides public FAQs with paired bilingual Q&As', () => {
      expect(BASELINE_FAQS.length).toBeGreaterThanOrEqual(3)
      for (const f of BASELINE_FAQS) {
        expect(f.questionMs).toBeTruthy()
        expect(f.questionEn).toBeTruthy()
        expect(f.answerMs).toBeTruthy()
        expect(f.answerEn).toBeTruthy()
      }
    })
  })
})
