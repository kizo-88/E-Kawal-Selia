import { describe, expect, it } from 'vitest'
import { HISTOGRAM_DATA_2026 } from '../src/components/dashboard/histogram-chart'
import { FIXTURE_APPLICATIONS, STATUS_OPTIONS } from '../src/components/dashboard/recent-applications-table'
import { BASELINE_MENU_SOURCE_ITEMS } from '../src/lib/menu/menu-items'
import { buildMenuTree } from '../src/lib/menu/menu-pure'



describe('GP-15 Dashboard & Visual Analytics', () => {
  describe('Histogram Monthly Data (GP-15)', () => {
    it('contains 12 calendar months with paired bilingual labels (G4)', () => {
      expect(HISTOGRAM_DATA_2026).toHaveLength(12)
      for (const m of HISTOGRAM_DATA_2026) {
        expect(m.monthMs).toBeTruthy()
        expect(m.monthEn).toBeTruthy()
        expect(m.approved).toBeGreaterThanOrEqual(0)
        expect(m.inReview).toBeGreaterThanOrEqual(0)
        expect(m.rejected).toBeGreaterThanOrEqual(0)
        expect(m.total).toBe(m.approved + m.inReview + m.rejected)
      }
    })

    it('has non-zero activity in active operational months', () => {
      const activeMonths = HISTOGRAM_DATA_2026.filter((d) => d.total > 0)
      expect(activeMonths.length).toBeGreaterThanOrEqual(6)
    })
  })

  describe('Recent Applications Fixtures (GP-15 & GP-12)', () => {
    it('contains valid applications with reference numbers and status labels', () => {
      expect(FIXTURE_APPLICATIONS.length).toBeGreaterThanOrEqual(5)
      for (const app of FIXTURE_APPLICATIONS) {
        expect(app.referenceNo).toMatch(/^LPK\/(LPS|PAP|PDA2)\/\d{4}\/\d{5}$/)
        expect(app.applicantName).toBeTruthy()
        expect(app.serviceTypeMs).toBeTruthy()
        expect(app.serviceTypeEn).toBeTruthy()
        expect(app.statusLabelMs).toBeTruthy()
        expect(app.statusLabelEn).toBeTruthy()
        expect(['Q1', 'Q2', 'Q3', 'Q4']).toContain(app.quarter)
      }
    })

    it('provides paired bilingual status options for filters (G4)', () => {
      for (const opt of STATUS_OPTIONS) {
        expect(opt.labelMs).toBeTruthy()
        expect(opt.labelEn).toBeTruthy()
      }
    })
  })

  describe('Menu Tree Resolution for Admin Shell (GP-01)', () => {
    it('resolves visible menu nodes for Super Admin (Role 1)', () => {
      const tree = buildMenuTree(BASELINE_MENU_SOURCE_ITEMS, [BigInt(1)], 'ms')
      const codes = tree.map((n) => n.code)
      expect(codes).toContain('dashboard')
      expect(codes).toContain('permohonan')
      expect(codes).toContain('audit')
      expect(codes).toContain('tetapan')
    })

    it('restricts audit and settings from End-User / Applicant (Role 5)', () => {
      const tree = buildMenuTree(BASELINE_MENU_SOURCE_ITEMS, [BigInt(5)], 'ms')
      const codes = tree.map((n) => n.code)
      expect(codes).toContain('dashboard')
      expect(codes).toContain('permohonan')
      expect(codes).not.toContain('audit')
      expect(codes).not.toContain('tetapan')
    })
  })

})
