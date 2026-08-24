import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

/**
 * TOTP — RFC 6238. Multi-factor authentication, required by GP-03 and M5-R05.
 *
 * WHY THIS IS NOT A DEPENDENCY
 * ----------------------------
 * Hand-rolling crypto is normally the wrong call. TOTP is the exception: it is
 * an HMAC (from node:crypto, not from us) plus a documented truncation, and RFC
 * 6238 publishes official test vectors — so correctness is *provable* in the
 * test suite rather than assumed from a package's download count. Against that,
 * every dependency here is one we maintain through the 12-24 month warranty.
 *
 * The tests check the published SHA-1, SHA-256 and SHA-512 vectors. If those
 * pass, this implementation matches every authenticator app in the world. If
 * you change anything in this file and they fail, the change is wrong.
 *
 * G6: this file is read line by line before merge.
 */

export type TotpAlgorithm = 'sha1' | 'sha256' | 'sha512'

export interface TotpOptions {
  /** Seconds per step. RFC default, and what every authenticator app assumes. */
  stepSeconds: number
  digits: number
  algorithm: TotpAlgorithm
}

export const TOTP_DEFAULTS: TotpOptions = {
  stepSeconds: 30,
  digits: 6,
  algorithm: 'sha1',
}

// ─────────────────────────────────────────────────────────── base32 (RFC 4648)

// The RFC 4648 base32 alphabet. A fixed property of the encoding, not an
// LPKmn configuration choice, so G1 does not apply.
const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.split('')

export function base32Encode(buffer: Buffer): string {
  let bits = 0
  let value = 0
  let output = ''

  for (const byte of buffer) {
    value = (value << 8) | byte
    bits += 8

    while (bits >= 5) {
      output += B32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += B32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []

  for (const char of cleaned) {
    const index = B32_ALPHABET.indexOf(char)
    if (index === -1) throw new Error(`Invalid base32 character: ${char}`)

    value = (value << 5) | index
    bits += 5

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }

  return Buffer.from(bytes)
}

// ────────────────────────────────────────────────────────────────────── TOTP

/**
 * Generates a shared secret.
 *
 * 20 bytes is the RFC 4226 recommendation and what authenticator apps expect.
 * Store it encrypted — the `mfaSecret` column is encrypted at rest, and it is
 * in the audit redaction list so it can never reach the audit trail.
 */
export function generateSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes))
}

function counterBuffer(counter: number): Buffer {
  const buffer = Buffer.alloc(8)
  // Counters exceed 32 bits only past the year 6000-odd, but writing the high
  // word properly costs nothing and avoids a silent truncation bug later.
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0)
  buffer.writeUInt32BE(counter % 2 ** 32, 4)
  return buffer
}

/** HOTP — RFC 4226. TOTP is this, with the counter derived from the clock. */
export function hotp(secret: string, counter: number, options: TotpOptions): string {
  const key = base32Decode(secret)
  const digest = createHmac(options.algorithm, key).update(counterBuffer(counter)).digest()

  // Dynamic truncation, RFC 4226 §5.3. The low nibble of the last byte picks
  // the offset; masking the top bit avoids sign issues on the 31-bit value.
  const offset = digest[digest.length - 1] & 0x0f
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff)

  return (binary % 10 ** options.digits).toString().padStart(options.digits, '0')
}

export function counterFor(unixSeconds: number, options: TotpOptions): number {
  return Math.floor(unixSeconds / options.stepSeconds)
}

export function generate(
  secret: string,
  unixSeconds: number,
  options: TotpOptions = TOTP_DEFAULTS,
): string {
  return hotp(secret, counterFor(unixSeconds, options), options)
}

/**
 * Verifies a submitted code.
 *
 * `window` accepts codes from adjacent steps to tolerate clock drift between
 * the user's phone and the server. One step either way (±30s) is the usual
 * compromise: larger windows widen the guessing surface, and this is a
 * six-digit secret.
 *
 * Comparison is constant-time. A timing-variable compare on an OTP is a real,
 * demonstrated attack, not a theoretical one.
 */
export function verify(
  secret: string,
  submitted: string,
  unixSeconds: number,
  options: TotpOptions = TOTP_DEFAULTS,
  window = 1,
): boolean {
  const candidate = submitted.replace(/\s/g, '')
  if (candidate.length !== options.digits) return false

  const counter = counterFor(unixSeconds, options)
  let matched = false

  // Every step in the window is evaluated even after a match, so the time taken
  // does not reveal which step matched.
  for (let drift = -window; drift <= window; drift++) {
    const expected = hotp(secret, counter + drift, options)
    if (constantTimeEquals(expected, candidate)) matched = true
  }

  return matched
}

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/**
 * The `otpauth://` URI an authenticator app scans.
 *
 * `issuer` and `label` end up visible in the user's authenticator, so they name
 * the system and the account, not internal identifiers.
 */
export function enrolmentUri(
  secret: string,
  accountName: string,
  issuer: string,
  options: TotpOptions = TOTP_DEFAULTS,
): string {
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: options.algorithm.toUpperCase(),
    digits: String(options.digits),
    period: String(options.stepSeconds),
  })

  const label = encodeURIComponent(`${issuer}:${accountName}`)
  return `otpauth://totp/${label}?${params.toString()}`
}
