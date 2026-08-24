/**
 * Sign-in lockout and session expiry — GP-03.
 *
 * "Sekat log-in jika kekerapan berturutan (gagal key-in kata laluan).
 *  – Standard 3 kali / boleh disetkan."
 * "Time-out Session – 10 minit / boleh disetkan."
 *
 * Both thresholds are settings, passed in by the caller. Pure functions: `now`
 * is an argument rather than a call to `Date.now()`, so every boundary case is
 * testable without waiting or mocking the clock.
 */

export interface LockoutPolicy {
  /** Consecutive failures before the account locks. GP-03 default: 3. */
  threshold: number
  /** How long the lock holds. */
  durationMinutes: number
}

export interface LockoutState {
  failedAttempts: number
  lockedUntil: Date | null
}

export interface SessionPolicy {
  /** GP-03 default: 10. */
  timeoutMinutes: number
}

const minutesFrom = (from: Date, minutes: number) => new Date(from.getTime() + minutes * 60_000)

/**
 * Whether the account is currently locked.
 *
 * A lock in the past is not a lock — the state is cleared on the next
 * successful sign-in, but this must read as unlocked before that happens or the
 * user can never get back in.
 */
export function isLocked(state: LockoutState, now: Date): boolean {
  return state.lockedUntil !== null && state.lockedUntil.getTime() > now.getTime()
}

/**
 * The new state after a failed sign-in attempt.
 *
 * Locking happens at `>= threshold`, not `> threshold`: GP-03 says three
 * consecutive failures, so the third failure is the one that locks.
 */
export function afterFailedAttempt(
  state: LockoutState,
  policy: LockoutPolicy,
  now: Date,
): LockoutState {
  const failedAttempts = state.failedAttempts + 1

  if (failedAttempts >= policy.threshold) {
    return { failedAttempts, lockedUntil: minutesFrom(now, policy.durationMinutes) }
  }

  return { failedAttempts, lockedUntil: null }
}

/**
 * The new state after a successful sign-in. Always a full reset.
 *
 * Leaving a stale count behind means a user who fails twice today and once next
 * month gets locked out by an attempt that is not, in any meaningful sense,
 * consecutive.
 */
export function afterSuccessfulAttempt(): LockoutState {
  return { failedAttempts: 0, lockedUntil: null }
}

/** Seconds until the lock lifts, for the message shown to the user. */
export function secondsUntilUnlock(state: LockoutState, now: Date): number {
  if (!state.lockedUntil) return 0
  return Math.max(0, Math.ceil((state.lockedUntil.getTime() - now.getTime()) / 1000))
}

/**
 * Whether a session has gone idle past the configured timeout.
 *
 * Measured from last *activity*, not from sign-in. GP-03 asks for a session
 * timeout, which conventionally means idle timeout — a ten-minute absolute cap
 * would sign out an officer in the middle of reviewing an application.
 */
export function isSessionExpired(
  lastActivityAt: Date,
  policy: SessionPolicy,
  now: Date,
): boolean {
  return now.getTime() - lastActivityAt.getTime() >= policy.timeoutMinutes * 60_000
}

export function sessionExpiresAt(lastActivityAt: Date, policy: SessionPolicy): Date {
  return minutesFrom(lastActivityAt, policy.timeoutMinutes)
}
