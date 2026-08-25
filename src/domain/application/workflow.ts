/**
 * The workflow engine — M1-R06, M1-2.
 *
 * "semakan, ulasan dan kelulusan oleh pegawai yang diberi kuasa"
 *
 * A workflow is data. This engine reads `workflow_stages` rows and moves an
 * application through them. It has no knowledge of Unit M/T, PDA2, or a
 * Jawatankuasa Pemaliman — adding the Lesen Malim committee stage in Phase 2 is
 * a seeder row, not a change to this file.
 *
 * Pure. `now` is an argument. The whole transition matrix is provable here
 * rather than discovered by clicking through a review queue.
 */

export type StageActionType = 'review' | 'evaluate' | 'approve' | 'committee' | 'notify'
export type StageAction = 'approve' | 'reject' | 'return' | 'refer'

export interface Stage {
  id: bigint
  sequence: number
  code: string
  nameMs: string
  nameEn: string
  /** Who may act. One or both; the engine never names a unit itself. */
  actorRoleId: bigint | null
  actorInternalUnitId: bigint | null
  actionType: StageActionType
  slaDays: number | null
  allowReturn: boolean
  allowAmend: boolean
  /** Sijil Pengecualian Malim needs two Malim KPK evaluations — M1-R21. */
  minApprovals: number
  isFinal: boolean
  onApproveStatus: string | null
  onRejectStatus: string | null
}

export interface Actor {
  userId: bigint
  roleIds: bigint[]
  unitIds: bigint[]
  /** Overrides stage matching. Held by admins, not by ordinary officers. */
  canManageAll?: boolean
}

/**
 * Whether this actor may act at this stage.
 *
 * Role OR unit, whichever the stage names. A stage naming neither is a
 * configuration error and matches nobody — deliberately, because the safe
 * failure for a permission check is to deny.
 */
export function canActOnStage(actor: Actor, stage: Stage): boolean {
  if (actor.canManageAll) return true

  const byRole = stage.actorRoleId !== null && actor.roleIds.includes(stage.actorRoleId)
  const byUnit =
    stage.actorInternalUnitId !== null && actor.unitIds.includes(stage.actorInternalUnitId)

  return byRole || byUnit
}

export type TransitionOutcome =
  /** More approvals needed before this stage clears — M1-R21. */
  | { kind: 'awaiting_approvals'; stage: Stage; received: number; required: number }
  /** Move to the next stage. */
  | { kind: 'advance'; stage: Stage }
  /** The workflow is finished; the application takes this status. */
  | { kind: 'complete'; status: string }
  /** Sent back to the applicant for amendment. */
  | { kind: 'returned'; status: string }

export interface TransitionRejection {
  code:
    | 'ACTOR_NOT_PERMITTED'
    | 'RETURN_NOT_ALLOWED'
    | 'NO_NEXT_STAGE'
    | 'UNKNOWN_STAGE'
    | 'REMARKS_REQUIRED'
  messageMs: string
  messageEn: string
}

export type TransitionResult =
  | { ok: true; outcome: TransitionOutcome }
  | { ok: false; error: TransitionRejection }

const reject = (
  code: TransitionRejection['code'],
  messageMs: string,
  messageEn: string,
): TransitionResult => ({ ok: false, error: { code, messageMs, messageEn } })

export interface TransitionInput {
  stages: Stage[]
  currentStageId: bigint
  action: StageAction
  actor: Actor
  /** Approvals already recorded at this stage, from application_stage_logs. */
  approvalsSoFar?: number
  remarks?: string
}

/**
 * Resolves what a stage action does.
 *
 * Nothing here writes. The caller persists the outcome and appends the
 * `application_stage_logs` row in the same transaction — a decision that
 * commits without its log entry is a decision nobody can account for.
 */
export function resolveTransition(input: TransitionInput): TransitionResult {
  const ordered = [...input.stages].sort((a, b) => a.sequence - b.sequence)
  const current = ordered.find((stage) => stage.id === input.currentStageId)

  if (!current) {
    return reject(
      'UNKNOWN_STAGE',
      'Peringkat kerja ini tidak wujud dalam aliran kerja permohonan.',
      'This stage does not belong to the application workflow.',
    )
  }

  if (!canActOnStage(input.actor, current)) {
    return reject(
      'ACTOR_NOT_PERMITTED',
      'Anda tiada kebenaran untuk bertindak pada peringkat ini.',
      'You are not permitted to act at this stage.',
    )
  }

  // A rejection or a return sends work back to someone. Without a reason they
  // cannot act on it, and the audit trail records a decision nobody explained.
  if ((input.action === 'reject' || input.action === 'return') && !input.remarks?.trim()) {
    return reject(
      'REMARKS_REQUIRED',
      'Ulasan diperlukan apabila menolak atau mengembalikan permohonan.',
      'Remarks are required when rejecting or returning an application.',
    )
  }

  if (input.action === 'return' || input.action === 'refer') {
    if (!current.allowReturn) {
      return reject(
        'RETURN_NOT_ALLOWED',
        'Peringkat ini tidak membenarkan permohonan dikembalikan.',
        'This stage does not allow an application to be returned.',
      )
    }

    return { ok: true, outcome: { kind: 'returned', status: 'returned' } }
  }

  if (input.action === 'reject') {
    return { ok: true, outcome: { kind: 'complete', status: current.onRejectStatus ?? 'rejected' } }
  }

  // ── approve
  const received = (input.approvalsSoFar ?? 0) + 1

  if (received < current.minApprovals) {
    return {
      ok: true,
      outcome: {
        kind: 'awaiting_approvals',
        stage: current,
        received,
        required: current.minApprovals,
      },
    }
  }

  if (current.isFinal) {
    return { ok: true, outcome: { kind: 'complete', status: current.onApproveStatus ?? 'approved' } }
  }

  const next = ordered.find((stage) => stage.sequence > current.sequence)

  if (!next) {
    // A non-final stage with nothing after it is a misconfigured workflow. Fail
    // loudly rather than silently approving — the alternative is an application
    // that clears review without anyone having approved it.
    return reject(
      'NO_NEXT_STAGE',
      'Aliran kerja tidak lengkap: tiada peringkat seterusnya selepas peringkat ini.',
      'The workflow is incomplete: no stage follows this one.',
    )
  }

  return { ok: true, outcome: { kind: 'advance', stage: next } }
}

/** The actions this actor can take at this stage. Drives which buttons render. */
export function availableStageActions(actor: Actor, stage: Stage): StageAction[] {
  if (!canActOnStage(actor, stage)) return []

  const actions: StageAction[] = ['approve', 'reject']
  if (stage.allowReturn) actions.push('return')

  return actions
}

export function firstStage(stages: Stage[]): Stage | null {
  return [...stages].sort((a, b) => a.sequence - b.sequence)[0] ?? null
}

// ─────────────────────────────────────────────────────────────────── SLA
// GP-19 is Phase 2, but the capture happens now — without it Phase 2 opens with
// no history to report on.

/**
 * When this stage is due.
 *
 * Calendar days, not working days.
 *
 * ⚠️ OPEN QUESTION for LPKmn (docs/02-requirements.md §E). Malaysian government
 * SLAs are usually quoted in working days, and Terengganu's weekend is Friday
 * and Saturday rather than Saturday and Sunday. Getting this wrong understates
 * every SLA by roughly 40%. Do not "fix" it by assuming — it needs an answer
 * from Unit M/T, and the KPI module in Phase 2 is where it starts to matter.
 */
export function slaDueAt(stage: Stage, startedAt: Date): Date | null {
  if (stage.slaDays === null || stage.slaDays <= 0) return null
  return new Date(startedAt.getTime() + stage.slaDays * 86_400_000)
}

/**
 * Whether a stage was cleared within its SLA.
 *
 * Null when the stage carries no SLA — distinct from false. Recording "missed"
 * for a stage that never had a target would make the Phase 2 KPI report wrong
 * in the direction that embarrasses LPKmn.
 */
export function isSlaMet(dueAt: Date | null, actedAt: Date): boolean | null {
  if (!dueAt) return null
  return actedAt.getTime() <= dueAt.getTime()
}

export function isOverdue(dueAt: Date | null, now: Date): boolean {
  return dueAt !== null && now.getTime() > dueAt.getTime()
}
