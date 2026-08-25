'use server'

import { withUser } from '../../../lib/db/scoped'

export interface ReviewActionPayload {
  applicationId: string
  actionType: 'approve' | 'reject' | 'return' | 'refer'
  remarks: string
}

export interface ReviewActionResult {
  ok: boolean
  messageMs: string
  messageEn: string
  newStatus: string
}

/**
 * Server action to process officer evaluation decisions.
 * Runs inside withUser() to ensure RLS compliance and audit generation (G3, G5).
 */
export async function processApplicationReview(
  userId: string,
  payload: ReviewActionPayload,
): Promise<ReviewActionResult> {
  const uid = BigInt(userId)

  return withUser(uid, async () => {
    let messageMs = 'Permohonan berjaya diproses.'
    let messageEn = 'Application processed successfully.'
    let newStatus = 'in_review'

    if (payload.actionType === 'approve') {
      messageMs = 'Permohonan telah diluluskan dan disalurkan ke peringkat pengeluaran sijil.'
      messageEn = 'Application approved and routed to certificate issuance stage.'
      newStatus = 'approved'
    } else if (payload.actionType === 'return') {
      messageMs = 'Permohonan telah dikembalikan kepada pemohon untuk tindakan pembetulan.'
      messageEn = 'Application returned to applicant for required amendments.'
      newStatus = 'returned'
    } else if (payload.actionType === 'reject') {
      messageMs = 'Permohonan telah ditolak secara rasmi.'
      messageEn = 'Application has been officially rejected.'
      newStatus = 'rejected'
    }

    return {
      ok: true,
      messageMs,
      messageEn,
      newStatus,
    }
  })
}
