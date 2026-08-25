/**
 * The application status machine — M1-R09, M1-R10, M1-R12.
 *
 * "paparan status permohonan kepada pengguna menggunakan penunjuk status yang
 *  bersesuaian, seperti Approved, In Review, Expiring Soon dan Expired"
 *
 * Every status change in the system goes through `transition()`. Nothing
 * assigns `application.status` directly — if it did, the illegal transitions
 * below would be reachable, and "cancelled application becomes approved" is the
 * kind of defect that surfaces at UAT in front of LPKmn.
 *
 * Pure. `now` is an argument, so every boundary is testable without waiting.
 */

/*
 * A behavioural enum, not a business list — ADR 0002 names ApplicationStatus
 * as exactly this case. Each value has code attached to it in the transition
 * table below, so an admin cannot add a tenth status through the UI: the engine
 * would not know what may follow it or who may act on it.
 *
 * What IS admin-editable is what a user sees. The display label for each status
 * lives in the STATUS_PERMOHONAN lookup type, so LPKmn can change "Dalam
 * Semakan" to "Dalam Semakan Unit M/T" without touching this file. Never render
 * these codes directly.
 */
// eslint-disable-next-line kawalselia/no-hardcoded-lists -- behavioural enum per ADR 0002; the user-facing labels live in the STATUS_PERMOHONAN lookup, not here.
export const APPLICATION_STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'returned',
  'approved',
  'rejected',
  'cancelled',
  'frozen',
  'expired',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export type ApplicationAction =
  | 'submit'
  | 'begin_review'
  | 'return'
  | 'resubmit'
  | 'approve'
  | 'reject'
  | 'cancel'
  | 'freeze'
  | 'unfreeze'
  | 'expire'

/**
 * Who is permitted to take an action.
 *
 * `applicant` covers the person who filed it and their colleagues at the same
 * organisation; `officer` is anyone the workflow stage names; `system` is a
 * scheduled job. Encoded here rather than checked at each call site, because a
 * check that lives at the call site is a check somebody forgets.
 */
export type Actor = 'applicant' | 'officer' | 'admin' | 'system'

interface Transition {
  from: ApplicationStatus
  action: ApplicationAction
  to: ApplicationStatus
  actors: Actor[]
}

const TRANSITIONS: Transition[] = [
  // The applicant's path.
  { from: 'draft', action: 'submit', to: 'submitted', actors: ['applicant'] },
  { from: 'returned', action: 'resubmit', to: 'submitted', actors: ['applicant'] },

  // M1-R09 — cancellation, by the applicant or an administrator. Only while a
  // decision has not yet been made; after that the record stands.
  { from: 'draft', action: 'cancel', to: 'cancelled', actors: ['applicant', 'admin'] },
  { from: 'submitted', action: 'cancel', to: 'cancelled', actors: ['applicant', 'admin'] },
  { from: 'returned', action: 'cancel', to: 'cancelled', actors: ['applicant', 'admin'] },
  { from: 'in_review', action: 'cancel', to: 'cancelled', actors: ['admin'] },

  // The officer's path.
  { from: 'submitted', action: 'begin_review', to: 'in_review', actors: ['officer'] },
  { from: 'in_review', action: 'return', to: 'returned', actors: ['officer'] },
  { from: 'in_review', action: 'approve', to: 'approved', actors: ['officer'] },
  { from: 'in_review', action: 'reject', to: 'rejected', actors: ['officer'] },

  // M1-R10 — freezing, "tertakluk kepada keperluan pematuhan". An administrator
  // parks an application mid-flight pending something outside the system.
  { from: 'submitted', action: 'freeze', to: 'frozen', actors: ['admin'] },
  { from: 'in_review', action: 'freeze', to: 'frozen', actors: ['admin'] },
  { from: 'returned', action: 'freeze', to: 'frozen', actors: ['admin'] },
  { from: 'frozen', action: 'unfreeze', to: 'in_review', actors: ['admin'] },
  { from: 'frozen', action: 'cancel', to: 'cancelled', actors: ['admin'] },

  // Only the scheduled job expires a licence, and only from approved.
  { from: 'approved', action: 'expire', to: 'expired', actors: ['system'] },
]

/** Statuses from which nothing further can happen. */
// eslint-disable-next-line kawalselia/no-hardcoded-lists -- derived from the behavioural enum above, not a list an admin edits. Making terminality configurable would let someone reopen a rejected application by changing a setting.
export const TERMINAL_STATUSES: ApplicationStatus[] = ['rejected', 'cancelled', 'expired']

export interface TransitionRejection {
  code: 'ILLEGAL_TRANSITION' | 'ACTOR_NOT_PERMITTED' | 'TERMINAL_STATUS'
  /** Shown to the user, so both languages (G4). */
  messageMs: string
  messageEn: string
}

export type TransitionResult =
  | { ok: true; status: ApplicationStatus }
  | { ok: false; error: TransitionRejection }

export function transition(
  from: ApplicationStatus,
  action: ApplicationAction,
  actor: Actor,
): TransitionResult {
  if (TERMINAL_STATUSES.includes(from)) {
    return {
      ok: false,
      error: {
        code: 'TERMINAL_STATUS',
        messageMs: 'Permohonan ini telah selesai dan tidak boleh diubah lagi.',
        messageEn: 'This application is closed and can no longer be changed.',
      },
    }
  }

  const candidates = TRANSITIONS.filter((t) => t.from === from && t.action === action)

  if (candidates.length === 0) {
    return {
      ok: false,
      error: {
        code: 'ILLEGAL_TRANSITION',
        messageMs: `Tindakan '${action}' tidak dibenarkan bagi status '${from}'.`,
        messageEn: `Action '${action}' is not allowed from status '${from}'.`,
      },
    }
  }

  const permitted = candidates.find((t) => t.actors.includes(actor))

  if (!permitted) {
    return {
      ok: false,
      error: {
        code: 'ACTOR_NOT_PERMITTED',
        messageMs: 'Anda tidak mempunyai kebenaran untuk melaksanakan tindakan ini.',
        messageEn: 'You do not have permission to take this action.',
      },
    }
  }

  return { ok: true, status: permitted.to }
}

/** Every action this actor could take right now. Drives which buttons render. */
export function availableActions(
  from: ApplicationStatus,
  actor: Actor,
): ApplicationAction[] {
  if (TERMINAL_STATUSES.includes(from)) return []

  return TRANSITIONS.filter((t) => t.from === from && t.actors.includes(actor)).map(
    (t) => t.action,
  )
}

/** Whether the applicant may still edit the form. */
export function isEditableByApplicant(status: ApplicationStatus): boolean {
  return status === 'draft' || status === 'returned'
}

// ────────────────────────────────────────────────── display status (M1-R12)

export type DisplayStatus = ApplicationStatus | 'expiring_soon'

/**
 * How many days before expiry a licence starts showing as Expiring Soon.
 *
 * A default, not a constant: this is exactly the sort of value LPKmn will want
 * to change, so callers pass it in from `settings` once the badge is wired.
 */
export const DEFAULT_EXPIRING_SOON_DAYS = 30

/**
 * The status a user actually sees.
 *
 * Expiring Soon is presentational — it is never stored. Persisting it would
 * mean a row silently becomes wrong the moment the threshold changes or a day
 * passes without the job running.
 */
export function displayStatus(
  status: ApplicationStatus,
  validUntil: Date | null,
  now: Date,
  expiringSoonDays: number = DEFAULT_EXPIRING_SOON_DAYS,
): DisplayStatus {
  if (status !== 'approved' || !validUntil) return status

  const msRemaining = validUntil.getTime() - now.getTime()

  if (msRemaining < 0) return 'expired'
  if (msRemaining <= expiringSoonDays * 86_400_000) return 'expiring_soon'

  return status
}
