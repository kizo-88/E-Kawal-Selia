import { describe, expect, it } from 'vitest'

import { hashPassword, needsRehash, verifyPassword } from '../src/lib/auth/hash'
import {
  afterFailedAttempt,
  afterSuccessfulAttempt,
  isLocked,
  isSessionExpired,
  secondsUntilUnlock,
} from '../src/lib/auth/lockout'
import { type PasswordPolicy, validatePassword } from '../src/lib/auth/password'
import { findMatchingCode, generateRecoveryCodes, hashRecoveryCodes, normalise } from '../src/lib/auth/recovery'
import {
  base32Decode,
  base32Encode,
  enrolmentUri,
  generate,
  generateSecret,
  hotp,
  type TotpOptions,
  verify,
} from '../src/lib/auth/totp'

/**
 * GP-03 / M5-R05. Every threshold in these tests is passed in, never read from
 * a constant — that is the requirement, not a style choice. `now` is an
 * argument too, so the lockout and session boundaries are tested exactly rather
 * than approximately.
 */

const policy: PasswordPolicy = {
  minLength: 12,
  maxLength: 128,
  requireMixedCase: true,
  requireSymbol: true,
  requireDigit: true,
}

describe('password policy (GP-03)', () => {
  it('accepts a password meeting every rule', () => {
    expect(validatePassword(policy, 'Pelabuhan#2026x').ok).toBe(true)
  })

  it('enforces the 12-character DKICT minimum', () => {
    const result = validatePassword(policy, 'Kemaman#1')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.failures.map((f) => f.code)).toContain('TOO_SHORT')
  })

  it('reports every failure at once, not one at a time', () => {
    const result = validatePassword(policy, 'kemaman')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.failures.map((f) => f.code).sort()).toEqual([
        'NEEDS_DIGIT',
        'NEEDS_MIXED_CASE',
        'NEEDS_SYMBOL',
        'TOO_SHORT',
      ])
    }
  })

  it('respects a policy with the character classes switched off', () => {
    const relaxed: PasswordPolicy = {
      ...policy,
      requireMixedCase: false,
      requireSymbol: false,
      requireDigit: false,
    }
    expect(validatePassword(relaxed, 'kemamanpelabuhan').ok).toBe(true)
  })

  it('rejects a password containing the user’s own identity', () => {
    const result = validatePassword(policy, 'Ahmad.Zaki#2026', {
      identityHints: ['ahmad.zaki', 'Ahmad Zaki'],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.failures.map((f) => f.code)).toContain('CONTAINS_IDENTITY')
  })

  it('ignores identity hints too short to be meaningful', () => {
    expect(validatePassword(policy, 'Pelabuhan#2026x', { identityHints: ['ali', 'a'] }).ok).toBe(true)
  })

  it('refuses a change that reuses the current password', () => {
    const result = validatePassword(policy, 'Pelabuhan#2026x', { currentPasswordMatches: true })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.failures.map((f) => f.code)).toContain('REUSES_CURRENT')
  })

  it('gives every failure a message in both languages (G4)', () => {
    const result = validatePassword(policy, 'x')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      for (const failure of result.failures) {
        expect(failure.messageMs.length).toBeGreaterThan(0)
        expect(failure.messageEn.length).toBeGreaterThan(0)
        expect(failure.messageMs).not.toBe(failure.messageEn)
      }
    }
  })
})

describe('lockout (GP-03: 3 consecutive failures, configurable)', () => {
  const lockPolicy = { threshold: 3, durationMinutes: 15 }
  const now = new Date('2026-08-24T10:00:00Z')

  it('does not lock before the threshold', () => {
    let state = { failedAttempts: 0, lockedUntil: null as Date | null }
    state = afterFailedAttempt(state, lockPolicy, now)
    state = afterFailedAttempt(state, lockPolicy, now)

    expect(state.failedAttempts).toBe(2)
    expect(isLocked(state, now)).toBe(false)
  })

  it('locks on the third failure, not the fourth', () => {
    let state = { failedAttempts: 2, lockedUntil: null as Date | null }
    state = afterFailedAttempt(state, lockPolicy, now)

    expect(state.failedAttempts).toBe(3)
    expect(isLocked(state, now)).toBe(true)
  })

  it('honours a threshold the admin changed', () => {
    let state = { failedAttempts: 0, lockedUntil: null as Date | null }
    const strict = { threshold: 1, durationMinutes: 5 }
    state = afterFailedAttempt(state, strict, now)

    expect(isLocked(state, now)).toBe(true)
  })

  it('releases the lock once the duration passes', () => {
    const state = afterFailedAttempt({ failedAttempts: 2, lockedUntil: null }, lockPolicy, now)
    const later = new Date(now.getTime() + 16 * 60_000)

    expect(isLocked(state, now)).toBe(true)
    expect(isLocked(state, later)).toBe(false)
  })

  it('reports the wait remaining, for the message shown to the user', () => {
    const state = afterFailedAttempt({ failedAttempts: 2, lockedUntil: null }, lockPolicy, now)
    expect(secondsUntilUnlock(state, now)).toBe(15 * 60)
    expect(secondsUntilUnlock(state, new Date(now.getTime() + 20 * 60_000))).toBe(0)
  })

  it('fully resets on success, so failures months apart are not "consecutive"', () => {
    expect(afterSuccessfulAttempt()).toEqual({ failedAttempts: 0, lockedUntil: null })
  })
})

describe('session timeout (GP-03: 10 minutes, configurable)', () => {
  const sessionPolicy = { timeoutMinutes: 10 }
  const lastActivity = new Date('2026-08-24T10:00:00Z')

  it('stays alive inside the window', () => {
    const at = new Date(lastActivity.getTime() + 9 * 60_000)
    expect(isSessionExpired(lastActivity, sessionPolicy, at)).toBe(false)
  })

  it('expires exactly at the boundary', () => {
    const at = new Date(lastActivity.getTime() + 10 * 60_000)
    expect(isSessionExpired(lastActivity, sessionPolicy, at)).toBe(true)
  })

  it('measures idle time from last activity, not from sign-in', () => {
    const active = new Date(lastActivity.getTime() + 9 * 60_000)
    const at = new Date(lastActivity.getTime() + 15 * 60_000)
    expect(isSessionExpired(active, sessionPolicy, at)).toBe(false)
  })
})

describe('password hashing (GP-03)', () => {
  it('never stores plaintext and verifies correctly', async () => {
    const hash = await hashPassword('Pelabuhan#2026x')

    expect(hash).not.toContain('Pelabuhan')
    expect(await verifyPassword('Pelabuhan#2026x', hash)).toBe(true)
    expect(await verifyPassword('Pelabuhan#2026y', hash)).toBe(false)
  })

  it('treats a malformed stored hash as a wrong password, never an exception', async () => {
    expect(await verifyPassword('anything', 'not-a-bcrypt-hash')).toBe(false)
    expect(await verifyPassword('anything', '')).toBe(false)
  })

  it('flags weaker hashes for upgrade — GP-03 wants the method upgradeable', async () => {
    const current = await hashPassword('Pelabuhan#2026x')
    expect(needsRehash(current)).toBe(false)
    // cost 10, as an older deployment would have written it
    expect(needsRehash('$2a$10$abcdefghijklmnopqrstuvwxyz012345678901234567890123')).toBe(true)
  })
})

describe('TOTP — RFC 6238 published test vectors', () => {
  /*
   * These are the vectors from RFC 6238 Appendix B. They are the reason this
   * is implemented rather than imported: correctness is demonstrated, not
   * assumed. If these fail, the change that broke them is wrong.
   *
   * Seed is the ASCII string "12345678901234567890", repeated to key length.
   */
  const seedFor = (algorithm: 'sha1' | 'sha256' | 'sha512') => {
    const lengths = { sha1: 20, sha256: 32, sha512: 64 }
    const base = '12345678901234567890'
    return base32Encode(Buffer.from(base.repeat(4).slice(0, lengths[algorithm]), 'ascii'))
  }

  const options = (algorithm: 'sha1' | 'sha256' | 'sha512'): TotpOptions => ({
    stepSeconds: 30,
    digits: 8,
    algorithm,
  })

  it.each([
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
    [20000000000, '65353130'],
  ])('SHA-1 at t=%i produces %s', (time, expected) => {
    expect(generate(seedFor('sha1'), time, options('sha1'))).toBe(expected)
  })

  it.each([
    [59, '46119246'],
    [1111111109, '68084774'],
    [1234567890, '91819424'],
  ])('SHA-256 at t=%i produces %s', (time, expected) => {
    expect(generate(seedFor('sha256'), time, options('sha256'))).toBe(expected)
  })

  it.each([
    [59, '90693936'],
    [1111111109, '25091201'],
    [1234567890, '93441116'],
  ])('SHA-512 at t=%i produces %s', (time, expected) => {
    expect(generate(seedFor('sha512'), time, options('sha512'))).toBe(expected)
  })
})

describe('TOTP behaviour', () => {
  const secret = generateSecret()
  const now = 1_700_000_000

  it('accepts the current code', () => {
    expect(verify(secret, generate(secret, now), now)).toBe(true)
  })

  it('tolerates one step of clock drift in each direction', () => {
    expect(verify(secret, generate(secret, now - 30), now)).toBe(true)
    expect(verify(secret, generate(secret, now + 30), now)).toBe(true)
  })

  it('rejects codes beyond the window', () => {
    expect(verify(secret, generate(secret, now - 120), now)).toBe(false)
  })

  it('rejects a wrong code, and anything the wrong length', () => {
    expect(verify(secret, '000000', now + 3_600)).toBe(false)
    expect(verify(secret, '12345', now)).toBe(false)
    expect(verify(secret, '', now)).toBe(false)
  })

  it('ignores whitespace, since people paste codes with spaces', () => {
    const code = generate(secret, now)
    expect(verify(secret, `${code.slice(0, 3)} ${code.slice(3)}`, now)).toBe(true)
  })

  it('pads short codes rather than emitting five digits', () => {
    // Exercised across many counters: any unpadded result would be 5 chars.
    for (let counter = 0; counter < 200; counter++) {
      expect(hotp(secret, counter, { stepSeconds: 30, digits: 6, algorithm: 'sha1' })).toHaveLength(6)
    }
  })

  it('builds an otpauth URI an authenticator app can scan', () => {
    const uri = enrolmentUri(secret, 'ahmad@lpkmn.gov.my', 'e-Kawalselia')
    expect(uri).toContain('otpauth://totp/')
    expect(uri).toContain(`secret=${secret}`)
    expect(uri).toContain('issuer=e-Kawalselia')
    expect(uri).toContain('period=30')
  })
})

describe('base32', () => {
  it('round-trips arbitrary bytes', () => {
    const original = Buffer.from('Lembaga Pelabuhan Kemaman', 'utf8')
    expect(base32Decode(base32Encode(original)).equals(original)).toBe(true)
  })

  it('rejects characters outside the alphabet', () => {
    expect(() => base32Decode('ABC1')).toThrow()
  })
})

describe('MFA recovery codes', () => {
  it('issues distinct, readable codes', () => {
    const codes = generateRecoveryCodes(10)
    expect(codes).toHaveLength(10)
    expect(new Set(codes).size).toBe(10)

    for (const code of codes) {
      expect(code).toMatch(/^[A-Z2-9]{5}-[A-Z2-9]{5}$/)
      // Characters users misread off a printout must not appear.
      expect(code).not.toMatch(/[01OIL]/)
    }
  })

  it('stores codes hashed, never in plaintext', () => {
    const codes = generateRecoveryCodes(3)
    const hashes = hashRecoveryCodes(codes)

    for (const [i, hash] of hashes.entries()) {
      expect(hash).not.toContain(normalise(codes[i]))
    }
  })

  it('matches a submitted code however the user typed it', () => {
    const codes = generateRecoveryCodes(5)
    const hashes = hashRecoveryCodes(codes)

    expect(findMatchingCode(codes[2], hashes)).toBe(2)
    expect(findMatchingCode(codes[2].toLowerCase(), hashes)).toBe(2)
    expect(findMatchingCode(codes[2].replace('-', ''), hashes)).toBe(2)
    expect(findMatchingCode(` ${codes[2]} `, hashes)).toBe(2)
  })

  it('returns null for a code that was never issued', () => {
    const hashes = hashRecoveryCodes(generateRecoveryCodes(5))
    expect(findMatchingCode('AAAAA-BBBBB', hashes)).toBeNull()
    expect(findMatchingCode('short', hashes)).toBeNull()
  })

  it('verifies ten codes fast enough to be usable at sign-in', () => {
    // The bcrypt version of this took ~2.5s per attempt, which is both a poor
    // experience and a cheap DoS. See the note at the top of recovery.ts.
    const hashes = hashRecoveryCodes(generateRecoveryCodes(10))
    const started = performance.now()
    findMatchingCode('AAAAA-BBBBB', hashes)
    expect(performance.now() - started).toBeLessThan(50)
  })
})
