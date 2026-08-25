import { describe, expect, it } from 'vitest'
import { FIXTURE_REVIEW_QUEUE } from '../src/app/(admin)/semakan/fixtures'

describe('Officer Review Queue (Round 3 UI)', () => {
  it('contains queue items with SLA countdowns and status indicators', () => {
    expect(FIXTURE_REVIEW_QUEUE.length).toBeGreaterThanOrEqual(3)
    for (const item of FIXTURE_REVIEW_QUEUE) {
      expect(item.referenceNo).toMatch(/^LPK\/(LPS|PAP|PDA2)\/\d{4}\/\d{5}$/)
      expect(item.companyName).toBeTruthy()
      expect(item.serviceTypeMs).toBeTruthy()
      expect(item.serviceTypeEn).toBeTruthy()
      expect(item.slaDaysRemaining).toBeGreaterThanOrEqual(0)
      expect(['on_track', 'warning', 'critical']).toContain(item.slaStatus)
      expect(item.slaStatusLabelMs).toBeTruthy()
      expect(item.slaStatusLabelEn).toBeTruthy()
    }
  })
})
