import 'server-only'

import { asAnonymous } from '../../../../lib/db/scoped'
import { resolveLicenceVerification } from '../../../../lib/documents/issuance'

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
const ISSUING_AUTHORITY_MS = 'Lembaga Pelabuhan Kemaman (LPKmn)'
const ISSUING_AUTHORITY_EN = 'Kemaman Port Authority'

export async function queryLicenceVerification(
  token: string,
): Promise<PublicVerificationResult> {
  return asAnonymous(async (tx) => {
    const res = await resolveLicenceVerification(tx, token)
    if (!res.found || !res.verification) {
      return {
        found: false,
        qrToken: token,
        issuingAuthorityMs: ISSUING_AUTHORITY_MS,
        issuingAuthorityEn: ISSUING_AUTHORITY_EN,
      }
    }

    const v = res.verification
    return {
      found: true,
      licenceNo: v.licenceNo,
      categoryMs: v.typeMs,
      categoryEn: v.typeEn,
      holderName: v.holderName,
      validFrom: v.validFrom,
      validUntil: v.validUntil,
      status: v.status,
      statusLabelMs: v.statusLabelMs,
      statusLabelEn: v.statusLabelEn,
      qrToken: token,
      issuingAuthorityMs: ISSUING_AUTHORITY_MS,
      issuingAuthorityEn: ISSUING_AUTHORITY_EN,
    }
  })
}
