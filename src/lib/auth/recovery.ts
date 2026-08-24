import { createHash, randomInt, timingSafeEqual } from 'node:crypto'

/**
 * MFA recovery codes.
 *
 * GP-03 mandates MFA, which creates a failure mode the Garis Panduan does not
 * discuss: a marine pilot who loses their phone cannot sign in to renew their
 * Lesen Malim. Without recovery codes the only path is a manual reset by Unit
 * IT, which is a support burden across the whole warranty period.
 *
 * Codes are single-use and stored hashed. Storing them in plaintext would mean
 * a database read defeats MFA entirely.
 *
 * WHY SHA-256 HERE AND BCRYPT FOR PASSWORDS
 * -----------------------------------------
 * These are different problems. bcrypt is deliberately slow to make brute force
 * expensive against LOW-ENTROPY, human-chosen secrets. A recovery code is
 * high-entropy (~49 bits), machine-generated, single-use and rate-limited by
 * the lockout policy — brute force is already infeasible, so slowness buys
 * nothing.
 *
 * It does cost something. Verification checks every stored hash to keep the
 * response time independent of which code matched; at bcrypt cost 12 and ten
 * codes that is ~2.5 seconds of CPU per attempt, which is both a poor
 * experience and a cheap denial-of-service. The test suite caught exactly this
 * by timing out.
 *
 * SHA-256 with a constant-time compare is the right tool for a high-entropy
 * token, and is what API tokens conventionally use. Do not "improve" this to
 * bcrypt without reading the above.
 *
 * G6: read line by line before merge.
 */

/** Excludes 0/O and 1/I/L, which users transcribe wrongly off a printout. */
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const GROUP_SIZE = 5
const GROUPS = 2
const CODE_LENGTH = GROUP_SIZE * GROUPS

export const RECOVERY_CODE_COUNT = 10

/**
 * One code, formatted as two five-character groups: `A4K9M-2PQR7`.
 *
 * 31 symbols over 10 positions is ~49.5 bits of entropy.
 */
export function generateRecoveryCode(): string {
  const groups: string[] = []

  for (let g = 0; g < GROUPS; g++) {
    let group = ''
    for (let i = 0; i < GROUP_SIZE; i++) {
      // randomInt is the CSPRNG. Math.random() here would be a genuine
      // vulnerability, not a style preference.
      group += ALPHABET[randomInt(0, ALPHABET.length)]
    }
    groups.push(group)
  }

  return groups.join('-')
}

export function generateRecoveryCodes(count = RECOVERY_CODE_COUNT): string[] {
  return Array.from({ length: count }, generateRecoveryCode)
}

/**
 * Normalises user input before hashing or comparison.
 *
 * People type these off paper: lowercase, missing dashes, stray spaces. None of
 * that should count as a failed attempt against the lockout threshold.
 */
export function normalise(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function hashRecoveryCode(code: string): string {
  return createHash('sha256').update(normalise(code), 'utf8').digest('hex')
}

/** Hash before storing. The plaintext is shown to the user exactly once. */
export function hashRecoveryCodes(codes: string[]): string[] {
  return codes.map(hashRecoveryCode)
}

function constantTimeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, 'utf8')
  const right = Buffer.from(b, 'utf8')
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

/**
 * Finds which stored hash a submitted code matches, or null.
 *
 * The caller must then CONSUME that code — delete it or mark it used — before
 * completing sign-in. A recovery code that survives its own use is a permanent
 * MFA bypass.
 *
 * Every stored hash is compared even after a match, so the time taken does not
 * reveal the position of the matching code.
 */
export function findMatchingCode(submitted: string, storedHashes: string[]): number | null {
  const candidate = normalise(submitted)
  if (candidate.length !== CODE_LENGTH) return null

  const candidateHash = hashRecoveryCode(candidate)
  let matchedIndex: number | null = null

  for (let i = 0; i < storedHashes.length; i++) {
    if (constantTimeEquals(candidateHash, storedHashes[i])) {
      matchedIndex ??= i
    }
  }

  return matchedIndex
}
