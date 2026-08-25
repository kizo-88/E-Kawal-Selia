import { randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * QR tokens and public verification — X-R11, X-R12.
 *
 * "Setiap lesen atau permit yang dijana oleh sistem hendaklah mempunyai Kod QR
 *  bagi tujuan semakan dan pengesahan oleh pihak berkuasa atau pihak berkaitan.
 *  Kod QR tersebut hendaklah dipautkan kepada halaman semakan yang boleh
 *  diakses oleh orang awam tanpa memerlukan log masuk ke sistem."
 *
 * The verification page is reachable by anyone who scans a licence. That makes
 * `publicVerification` below the single most exposed function in the system,
 * and the reason it exists is to make the disclosure boundary a thing the code
 * enforces rather than a thing each caller remembers.
 *
 * G6: read line by line before merge.
 */

export const QR_TOKEN_LENGTH = 32

/**
 * A token, base32-ish over an unambiguous alphabet.
 *
 * Random, never sequential and never derived from the licence number. A
 * predictable token would let anyone enumerate every licence LPKmn has ever
 * issued, which is a disclosure of the whole register rather than of one
 * licence the holder chose to show someone.
 *
 * 32 characters over 32 symbols is 160 bits.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789abcdefghijkmnpqrstuvwxyz'

export function generateQrToken(): string {
  // Rejection sampling: taking `byte % alphabet.length` would bias the early
  // symbols, which quietly costs entropy.
  const token: string[] = []
  const limit = 256 - (256 % ALPHABET.length)

  while (token.length < QR_TOKEN_LENGTH) {
    for (const byte of randomBytes(QR_TOKEN_LENGTH)) {
      if (byte >= limit) continue
      token.push(ALPHABET[byte % ALPHABET.length])
      if (token.length === QR_TOKEN_LENGTH) break
    }
  }

  return token.join('')
}

const TOKEN_PATTERN = new RegExp(`^[${ALPHABET}]{${QR_TOKEN_LENGTH}}$`)

/**
 * Whether a token is even shaped like one.
 *
 * Checked before any database lookup, so a scanner sending junk is refused
 * without touching Postgres — the verification endpoint is public and
 * unauthenticated, which makes it the cheapest thing in the system to hammer.
 */
export function isWellFormedToken(candidate: string): boolean {
  return TOKEN_PATTERN.test(candidate)
}

/** Constant-time comparison, for anywhere a token is compared in application code. */
export function tokensMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export function verificationUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/$/, '')}/semak/${token}`
}

// ────────────────────────────────────────────── the disclosure boundary

/** Everything the system knows about an issued licence. Never returned as-is. */
export interface LicenceRecord {
  licenceNo: string
  typeNameMs: string
  typeNameEn: string
  holderNameSnapshot: string
  status: string
  issuedAt: Date
  validFrom: Date
  validUntil: Date
  revokedAt: Date | null
  // Present on the record and deliberately absent from the payload below.
  holderIcNo?: string | null
  holderAddress?: string | null
  holderPhone?: string | null
  applicationReferenceNo?: string | null
  formData?: unknown
}

/**
 * Exactly what the public verification page may show.
 *
 * X-R12 permits: licence number, type, holder name, validity dates, status.
 * Nothing else — not the holder's IC, address or phone, not the application
 * behind it, not a single uploaded document.
 *
 * Constructed field by field on purpose. Spreading the record and deleting the
 * sensitive keys would mean every column added to `licences` in future is
 * public by default, and the person adding it would have no reason to think
 * about this file.
 */
export interface PublicVerification {
  licenceNo: string
  typeMs: string
  typeEn: string
  holderName: string
  validFrom: string
  validUntil: string
  status: 'sah' | 'tamat_tempoh' | 'dibatalkan'
  statusLabelMs: string
  statusLabelEn: string
  verifiedAt: string
}

export function publicVerification(
  licence: LicenceRecord,
  now: Date,
): PublicVerification | null {
  // A revoked licence returns nothing at all. Reporting "revoked" would confirm
  // the licence number exists, which is more than a stranger scanning a QR is
  // entitled to learn.
  if (licence.revokedAt !== null || licence.status === 'revoked') return null

  const expired = licence.validUntil.getTime() < now.getTime()
  const notYetValid = licence.validFrom.getTime() > now.getTime()

  const status: PublicVerification['status'] = expired
    ? 'tamat_tempoh'
    : notYetValid
      ? 'dibatalkan'
      : 'sah'

  const labels: Record<PublicVerification['status'], { ms: string; en: string }> = {
    sah: { ms: 'SAH', en: 'VALID' },
    tamat_tempoh: { ms: 'TAMAT TEMPOH', en: 'EXPIRED' },
    dibatalkan: { ms: 'TIDAK SAH', en: 'NOT VALID' },
  }

  const asDate = (value: Date) => value.toISOString().slice(0, 10)

  return {
    licenceNo: licence.licenceNo,
    typeMs: licence.typeNameMs,
    typeEn: licence.typeNameEn,
    holderName: licence.holderNameSnapshot,
    validFrom: asDate(licence.validFrom),
    validUntil: asDate(licence.validUntil),
    status,
    statusLabelMs: labels[status].ms,
    statusLabelEn: labels[status].en,
    verifiedAt: now.toISOString(),
  }
}
