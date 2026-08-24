import { describe, expect, it } from 'vitest'
import { DEFAULT_YEAR_OPTIONS, QUARTER_OPTIONS } from '../src/components/table/table-filters'

describe('GP-12 Universal Table Presentation & Filter Options', () => {
  describe('Quarter Filter Options (GP-12)', () => {
    it('covers all 4 Malaysian calendar quarters', () => {
      const quarters = QUARTER_OPTIONS.filter((q) => q.value !== 'all').map((q) => q.value)
      expect(quarters).toEqual(['Q1', 'Q2', 'Q3', 'Q4'])
    })

    it('has paired bilingual quarter labels (G4)', () => {
      for (const q of QUARTER_OPTIONS) {
        expect(q.labelMs).toBeTruthy()
        expect(q.labelEn).toBeTruthy()
      }
    })
  })

  describe('Year Filter Options', () => {
    it('contains baseline operational years', () => {
      const years = DEFAULT_YEAR_OPTIONS.map((y) => y.value)
      expect(years).toContain('all')
      expect(years).toContain('2026')
    })
  })
})
