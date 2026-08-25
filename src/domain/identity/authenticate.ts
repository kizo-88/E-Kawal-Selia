import 'server-only'

import type { Prisma } from '@prisma/client'

import { record } from '@/lib/audit/record'
import { needsRehash, hashPassword, verifyPassword } from '@/lib/auth/hash'
import {
  afterFailedAttempt,
  afterSuccessfulAttempt,
  isLocked,
  secondsUntilUnlock,
} from '@/lib/auth/lockout'
import { getSecurityPolicy } from '@/lib/config/settings'
import { prisma } from '@/lib/db'

/**
 * The sign-in decision — GP-03, M5-R05.
 *
 * The policy engine in src/lib/auth is pure and fully tested. This is the part
 * that composes it against the database: read the thresholds from settings,
 * check the lock, verify the password, record the attempt, write the audit row.
 *
 * Every threshold comes from `getSecurityPolicy()`. GP-03 requires them to be
 * admin-editable, so a hard-coded 3 or 10 fails the requirement even though the
 * numbers are right.
 *
 * G6: read line by line before merge. Nothing here logs, audits, returns or
 * throws a password, hash, MFA secret or recovery code.
 */

export type SignInFailureReason =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_INACTIVE'
  | 'MFA_REQUIRED'

export interface SignInSuccess {
  ok: true
  userId: string
  name: string
  email: string
  /** GP-03: the user must change it before doing anything else. */
  mustChangePassword: boolean
  /** Set when MFA is enrolled — the caller must complete the challenge. */
  mfaPending: boolean
}

export interface SignInFailure {
  ok: false
  reason: SignInFailureReason
  /** Shown to the user (G4). Deliberately vague for credential failures. */
  messageMs: string
  messageEn: string
  /** Only for ACCOUNT_LOCKED, so the UI can say how long. */
  retryAfterSeconds?: number
}

export type SignInResult = SignInSuccess | SignInFailure

/**
 * One message for "no such user" and "wrong password", on purpose.
 *
 * Distinguishing them turns the login form into an account-existence oracle:
 * an attacker learns which company representatives hold LPKmn accounts by
 * trying addresses. The audit trail records which case it was; the response
 * does not.
 */
const invalidCredentials = (): SignInFailure => ({
  ok: false,
  reason: 'INVALID_CREDENTIALS',
  messageMs: 'Emel atau kata laluan tidak sah.',
  messageEn: 'Invalid email or password.',
})

export interface SignInInput {
  email: string
  password: string
  ipAddress?: string | null
  userAgent?: string | null
}

export async function authenticate(input: SignInInput): Promise<SignInResult> {
  const policy = await getSecurityPolicy()
  const now = new Date()
  const email = input.email.trim().toLowerCase()

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      mustChangePassword: true,
      mfaEnabledAt: true,
      failedAttempts: true,
      lockedUntil: true,
      status: true,
    },
  })

  const context = {
    ipAddress: input.ipAddress ?? null,
    userAgent: input.userAgent ?? null,
    pageCode: 'log_masuk',
  }

  // Unknown address. Audited so the pattern is visible to Unit Integriti, but
  // answered identically to a wrong password.
  if (!user) {
    await prisma.$transaction((tx) =>
      record(tx, {
        action: 'PENGGUNA_LOG_MASUK_GAGAL',
        subject: email,
        context: { ...context, userId: null },
      }),
    )
    return invalidCredentials()
  }

  const state = { failedAttempts: user.failedAttempts, lockedUntil: user.lockedUntil }

  // Checked before the password. Verifying first would let an attacker keep
  // testing candidates against a locked account and learn when one is right.
  if (isLocked(state, now)) {
    return {
      ok: false,
      reason: 'ACCOUNT_LOCKED',
      messageMs: 'Akaun anda dikunci sementara kerana terlalu banyak percubaan log masuk.',
      messageEn: 'Your account is temporarily locked after too many sign-in attempts.',
      retryAfterSeconds: secondsUntilUnlock(state, now),
    }
  }

  if (user.status !== 'active') {
    return {
      ok: false,
      reason: 'ACCOUNT_INACTIVE',
      messageMs: 'Akaun anda belum diaktifkan. Sila hubungi pentadbir sistem.',
      messageEn: 'Your account is not active. Please contact the system administrator.',
    }
  }

  const passwordOk = user.passwordHash
    ? await verifyPassword(input.password, user.passwordHash)
    : false

  if (!passwordOk) {
    const next = afterFailedAttempt(state, policy.lockout, now)

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { failedAttempts: next.failedAttempts, lockedUntil: next.lockedUntil },
      })

      await record(tx, {
        action: 'PENGGUNA_LOG_MASUK_GAGAL',
        subject: user.email,
        context: { ...context, userId: user.id, userName: user.name },
        auditableType: 'users',
        auditableId: user.id,
      })

      if (next.lockedUntil) {
        await record(tx, {
          action: 'PENGGUNA_DIKUNCI',
          subject: user.email,
          context: { ...context, userId: user.id, userName: user.name },
          auditableType: 'users',
          auditableId: user.id,
        })
      }
    })

    // Still the generic message, even though the lock just engaged. Saying
    // "now locked" confirms the account exists.
    return invalidCredentials()
  }

  const reset = afterSuccessfulAttempt()

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: reset.failedAttempts,
        lockedUntil: reset.lockedUntil,
        lastLoginAt: now,
        // GP-03 wants the hashing method upgradeable. Sign-in is the only
        // moment the plaintext exists to re-hash with, so the upgrade happens
        // here or never.
        ...(user.passwordHash && needsRehash(user.passwordHash)
          ? { passwordHash: await hashPassword(input.password) }
          : {}),
      },
    })

    await record(tx, {
      action: 'PENGGUNA_LOG_MASUK',
      context: { ...context, userId: user.id, userName: user.name },
      auditableType: 'users',
      auditableId: user.id,
    })
  })

  return {
    ok: true,
    userId: String(user.id),
    name: user.name,
    email: user.email,
    mustChangePassword: user.mustChangePassword,
    mfaPending: user.mfaEnabledAt !== null || policy.mfaRequired,
  }
}

/**
 * Records a completed MFA challenge.
 *
 * Verification itself is in src/lib/auth/totp.ts and is pure; this only writes
 * the audit row, in the same transaction as whatever the caller does next.
 */
export async function recordMfaVerified(
  tx: Prisma.TransactionClient,
  userId: bigint,
  userName: string,
  ipAddress?: string | null,
): Promise<void> {
  await record(tx, {
    action: 'MFA_DIAKTIFKAN',
    subject: userName,
    context: { userId, userName, ipAddress: ipAddress ?? null, pageCode: 'mfa' },
    auditableType: 'users',
    auditableId: userId,
  })
}
