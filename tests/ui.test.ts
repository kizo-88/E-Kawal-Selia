import { describe, expect, it } from 'vitest'
import { LPKMN_ORG_INFO } from '../src/components/layout/public-footer'
import { FIXTURE_ANNOUNCEMENTS, FIXTURE_FAQS } from '../src/components/layout/announcements-panel'
import { SERVICES_LIST, HELP_TIPS } from '../src/components/public/home-constants'


describe('Design System & UI Components (GP-21, GP-22, GP-08, GP-23)', () => {
  describe('Organisation & Footer Config (GP-08, GP-23)', () => {
    it('contains separate address fields per GP-08', () => {
      expect(LPKMN_ORG_INFO.nameMs).toBe('Lembaga Pelabuhan Kemaman')
      expect(LPKMN_ORG_INFO.nameEn).toBe('Kemaman Port Authority')
      expect(LPKMN_ORG_INFO.addressLine1).toBeDefined()
      expect(LPKMN_ORG_INFO.addressLine2).toBeDefined()
      expect(LPKMN_ORG_INFO.postcode).toBe('24007')
      expect(LPKMN_ORG_INFO.city).toBe('Kemaman')
      expect(LPKMN_ORG_INFO.stateCode).toContain('Terengganu')
      expect(LPKMN_ORG_INFO.coordinates).toBeDefined()
    })

    it('contains Go-Live year 2026 per GP-23', () => {
      expect(LPKMN_ORG_INFO.goLiveYear).toBe(2026)
    })

    it('contains official secretariat and contact info', () => {
      expect(LPKMN_ORG_INFO.email).toBe('kawalselia@lpktg.gov.my')
      expect(LPKMN_ORG_INFO.phone).toContain('863 1590')
      expect(LPKMN_ORG_INFO.website).toContain('lpktg.gov.my')
    })
  })

  describe('Announcements & Content Panel (GP-21, GP-17)', () => {
    it('contains at least 3 content types per GP-17', () => {
      const types = new Set(FIXTURE_ANNOUNCEMENTS.map((a) => a.type))
      expect(types.size).toBeGreaterThanOrEqual(3)
    })

    it('contains paired bilingual fields for every announcement (G4)', () => {
      for (const ann of FIXTURE_ANNOUNCEMENTS) {
        expect(ann.titleMs).toBeTruthy()
        expect(ann.titleEn).toBeTruthy()
        expect(ann.summaryMs).toBeTruthy()
        expect(ann.summaryEn).toBeTruthy()
        expect(ann.categoryMs).toBeTruthy()
        expect(ann.categoryEn).toBeTruthy()
      }
    })

    it('contains FAQs with paired bilingual questions and answers (G4)', () => {
      expect(FIXTURE_FAQS.length).toBeGreaterThanOrEqual(3)
      for (const faq of FIXTURE_FAQS) {
        expect(faq.questionMs).toBeTruthy()
        expect(faq.questionEn).toBeTruthy()
        expect(faq.answerMs).toBeTruthy()
        expect(faq.answerEn).toBeTruthy()
      }
    })
  })

  describe('Services & Help Notes (GP-21, GP-22)', () => {
    it('lists all P1 core services: support licence, activity permit, PDA2, and QR verification', () => {
      const serviceIds = SERVICES_LIST.map((s) => s.id)
      expect(serviceIds).toContain('lesen-sokongan')
      expect(serviceIds).toContain('permit-aktiviti')
      expect(serviceIds).toContain('surat-pda2')
      expect(serviceIds).toContain('semak-qr')
    })

    it('has bilingual service descriptions and badge labels (G4)', () => {
      for (const service of SERVICES_LIST) {
        expect(service.titleMs).toBeTruthy()
        expect(service.titleEn).toBeTruthy()
        expect(service.descMs).toBeTruthy()
        expect(service.descEn).toBeTruthy()
        expect(service.badgeMs).toBeTruthy()
        expect(service.badgeEn).toBeTruthy()
      }
    })

    it('provides help tips for critical data-entry pages (GP-22)', () => {
      expect(HELP_TIPS.length).toBeGreaterThanOrEqual(3)
      for (const tip of HELP_TIPS) {
        expect(tip.textMs).toBeTruthy()
        expect(tip.textEn).toBeTruthy()
      }
    })
  })

  describe('QR Code 2D Matrix Rendering Component (X-R11, X-R12)', () => {
    it('exports QRCodeView from UI component library', async () => {
      const { QRCodeView } = await import('../src/components/ui')
      expect(QRCodeView).toBeDefined()
      expect(typeof QRCodeView).toBe('function')
    })
  })
})

