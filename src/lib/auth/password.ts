/**
 * Password policy — GP-03.
 *
 * "Bilangan Kata Laluan (Min dan Max). – Standard 12 aksara bagi LPKmn (DKICT)"
 * "Pilihan pengaktifan jenis aksara bagi kata laluan"
 *
 * Every value comes from the caller, which gets it from `getSecurityPolicy()`.
 * Nothing here reads a constant, because GP-03 requires these to be editable by
 * an admin — a hard-coded 12 fails the requirement even though 12 is correct.
 *
 * Pure. No database, no request, no I/O. The whole accept/reject matrix is
 * testable directly.
 */

export interface PasswordPolicy {
  minLength: number
  maxLength: number
  requireMixedCase: boolean
  requireSymbol: boolean
  requireDigit: boolean
}

export type PasswordFailureCode =
  | 'TOO_SHORT'
  | 'TOO_LONG'
  | 'NEEDS_MIXED_CASE'
  | 'NEEDS_SYMBOL'
  | 'NEEDS_DIGIT'
  | 'CONTAINS_IDENTITY'
  | 'REUSES_CURRENT'

export interface PasswordFailure {
  code: PasswordFailureCode
  /** Shown to the user, so both languages (G4). */
  messageMs: string
  messageEn: string
}

export interface PasswordCheckContext {
  /** Rejected if the password contains any of these. Email local part, name. */
  identityHints?: string[]
  /** Set on a change, so we can refuse a no-op "change". */
  currentPasswordMatches?: boolean
}

export type PasswordResult = { ok: true } | { ok: false; failures: PasswordFailure[] }

const fail = (
  code: PasswordFailureCode,
  messageMs: string,
  messageEn: string,
): PasswordFailure => ({ code, messageMs, messageEn })

/** Anything that is not a letter, digit or whitespace. */
const SYMBOL = /[^\p{L}\p{N}\s]/u

/**
 * Checks a candidate password against the policy.
 *
 * Returns every failure rather than the first, so the user fixes the password
 * in one attempt instead of discovering the rules one rejection at a time.
 */
export function validatePassword(
  policy: PasswordPolicy,
  candidate: string,
  context: PasswordCheckContext = {},
): PasswordResult {
  const failures: PasswordFailure[] = []

  if (candidate.length < policy.minLength) {
    failures.push(
      fail(
        'TOO_SHORT',
        `Kata laluan mestilah sekurang-kurangnya ${policy.minLength} aksara.`,
        `Password must be at least ${policy.minLength} characters.`,
      ),
    )
  }

  if (candidate.length > policy.maxLength) {
    failures.push(
      fail(
        'TOO_LONG',
        `Kata laluan tidak boleh melebihi ${policy.maxLength} aksara.`,
        `Password must not exceed ${policy.maxLength} characters.`,
      ),
    )
  }

  if (policy.requireMixedCase && !(/\p{Ll}/u.test(candidate) && /\p{Lu}/u.test(candidate))) {
    failures.push(
      fail(
        'NEEDS_MIXED_CASE',
        'Kata laluan mesti mengandungi huruf besar dan huruf kecil.',
        'Password must contain both uppercase and lowercase letters.',
      ),
    )
  }

  if (policy.requireSymbol && !SYMBOL.test(candidate)) {
    failures.push(
      fail(
        'NEEDS_SYMBOL',
        'Kata laluan mesti mengandungi sekurang-kurangnya satu simbol.',
        'Password must contain at least one symbol.',
      ),
    )
  }

  if (policy.requireDigit && !/\p{N}/u.test(candidate)) {
    failures.push(
      fail(
        'NEEDS_DIGIT',
        'Kata laluan mesti mengandungi sekurang-kurangnya satu nombor.',
        'Password must contain at least one number.',
      ),
    )
  }

  // A password containing the user's own email or name is the first thing an
  // attacker tries, and it is trivially guessable from a public licence record.
  const hints = (context.identityHints ?? [])
    .map((hint) => hint.trim().toLowerCase())
    .filter((hint) => hint.length >= 4)

  const lowered = candidate.toLowerCase()

  if (hints.some((hint) => lowered.includes(hint))) {
    failures.push(
      fail(
        'CONTAINS_IDENTITY',
        'Kata laluan tidak boleh mengandungi nama atau alamat emel anda.',
        'Password must not contain your name or email address.',
      ),
    )
  }

  if (context.currentPasswordMatches) {
    failures.push(
      fail(
        'REUSES_CURRENT',
        'Kata laluan baharu mestilah berbeza daripada kata laluan semasa.',
        'The new password must differ from the current password.',
      ),
    )
  }

  return failures.length === 0 ? { ok: true } : { ok: false, failures }
}
