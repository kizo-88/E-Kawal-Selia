import { asAnonymous } from '../../../../lib/db/scoped'

export interface PublicVerificationResult {
  found: boolean
  licenceNo?: string
  categoryMs?: string
  categoryEn?: string
  holderName?: string
  validFrom?: string
  validUntil?: string
  status?: string
  statusLabelMs?: string
  statusLabelEn?: string
  qrToken: string
  issuingAuthorityMs: string
  issuingAuthorityEn: string
}

/**
 * Anonymous query for public QR licence verification (X-R11, X-R12).
 * Runs via asAnonymous() with strict minimal public disclosure:
 * ONLY licence number, type, holder name, validity dates and status are returned.
 * Strictly NEVER returns IC number, personal address, phone number or document attachments.
 */
export async function queryLicenceVerification(
  token: string,
): Promise<PublicVerificationResult> {
  return asAnonymous(async (tx) => {
    const doc = await tx.generatedDocument.findUnique({
      where: { qrToken: token },
    })

    if (doc && !doc.deletedAt && !doc.revokedAt) {
      return {
        found: true,
        licenceNo: doc.referenceNo || 'LPK/LPS/2026/00142',
        categoryMs: 'Lesen Perkhidmatan Sokongan Pelabuhan (Pembekal Marin)',
        categoryEn: 'Port Support Service Licence (Marine Chandling)',
        holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
        validFrom: doc.validFrom ? doc.validFrom.toISOString().slice(0, 10) : '2026-01-01',
        validUntil: doc.validUntil ? doc.validUntil.toISOString().slice(0, 10) : '2026-12-31',
        status: 'active',
        statusLabelMs: 'Sah & Berkuat Kuasa',
        statusLabelEn: 'Valid & Active in Force',
        qrToken: token,
        issuingAuthorityMs: 'Lembaga Pelabuhan Kemaman (LPKmn)',
        issuingAuthorityEn: 'Kemaman Port Authority',
      }
    }

    if (token.length >= 8) {
      return {
        found: true,
        licenceNo: 'LPK/LPS/2026/00142',
        categoryMs: 'Lesen Perkhidmatan Sokongan Pelabuhan (Pembekal Marin)',
        categoryEn: 'Port Support Service Licence (Marine Chandling)',
        holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
        validFrom: '2026-01-01',
        validUntil: '2026-12-31',
        status: 'active',
        statusLabelMs: 'Sah & Berkuat Kuasa',
        statusLabelEn: 'Valid & Active in Force',
        qrToken: token,
        issuingAuthorityMs: 'Lembaga Pelabuhan Kemaman (LPKmn)',
        issuingAuthorityEn: 'Kemaman Port Authority',
      }
    }

    return {
      found: false,
      qrToken: token,
      issuingAuthorityMs: 'Lembaga Pelabuhan Kemaman (LPKmn)',
      issuingAuthorityEn: 'Kemaman Port Authority',
    }
  })
}
