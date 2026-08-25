import { describe, expect, it } from 'vitest'
import { FIXTURE_APPLICATION_DETAIL } from '../src/app/(admin)/permohonan/[id]/fixtures'
import { FIXTURE_LICENCE_DETAIL } from '../src/app/(admin)/pelesenan/[id]/fixtures'

describe('Modul Permohonan — Detail & Stage History (Round 3 UI)', () => {
  describe('Application Detail Data (M1)', () => {
    it('contains valid reference number, applicant info, and port location', () => {
      expect(FIXTURE_APPLICATION_DETAIL.referenceNo).toMatch(/^LPK\/(LPS|PAP|PDA2)\/\d{4}\/\d{5}$/)
      expect(FIXTURE_APPLICATION_DETAIL.companyName).toBeTruthy()
      expect(FIXTURE_APPLICATION_DETAIL.ssmNo).toBeTruthy()
      expect(FIXTURE_APPLICATION_DETAIL.portLocation).toBeTruthy()
      expect(FIXTURE_APPLICATION_DETAIL.scopeDescription).toBeTruthy()
    })

    it('has bilingual status and stage labels (G4)', () => {
      expect(FIXTURE_APPLICATION_DETAIL.currentStatusLabelMs).toBeTruthy()
      expect(FIXTURE_APPLICATION_DETAIL.currentStatusLabelEn).toBeTruthy()
      expect(FIXTURE_APPLICATION_DETAIL.currentStageNameMs).toBeTruthy()
      expect(FIXTURE_APPLICATION_DETAIL.currentStageNameEn).toBeTruthy()
    })

    it('includes uploaded supporting documents with verification status (GP-11)', () => {
      expect(FIXTURE_APPLICATION_DETAIL.documents.length).toBeGreaterThanOrEqual(2)
      for (const doc of FIXTURE_APPLICATION_DETAIL.documents) {
        expect(doc.nameMs).toBeTruthy()
        expect(doc.nameEn).toBeTruthy()
        expect(doc.fileName).toMatch(/\.(pdf|jpg|png)$/)
        expect(['verified', 'pending', 'rejected']).toContain(doc.verificationStatus)
      }
    })

    it('tracks stage progression history with SLA due dates', () => {
      expect(FIXTURE_APPLICATION_DETAIL.stageLogs.length).toBeGreaterThanOrEqual(3)
      for (const log of FIXTURE_APPLICATION_DETAIL.stageLogs) {
        expect(log.stageCode).toBeTruthy()
        expect(log.stageNameMs).toBeTruthy()
        expect(log.stageNameEn).toBeTruthy()
        expect(log.officerName).toBeTruthy()
        expect(log.slaDueAt).toBeTruthy()
        expect(typeof log.slaMet).toBe('boolean')
      }
    })
  })

  describe('Licence Certificate Detail (M1-R11)', () => {
    it('contains random 32-char QR token (X-R11)', () => {
      expect(FIXTURE_LICENCE_DETAIL.qrToken).toHaveLength(32)
      expect(FIXTURE_LICENCE_DETAIL.qrToken).toMatch(/^[a-f0-9]{32}$/)
    })

    it('contains approved activities and digital signature metadata', () => {
      expect(FIXTURE_LICENCE_DETAIL.approvedActivities.length).toBeGreaterThanOrEqual(1)
      expect(FIXTURE_LICENCE_DETAIL.digitalSignatureRef).toContain('LPKMN')
      expect(FIXTURE_LICENCE_DETAIL.approvingAuthorityName).toBeTruthy()
    })
  })
})
