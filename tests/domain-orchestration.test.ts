import { describe, expect, it } from 'vitest'
import {
  type Stage,
  type Actor,
  resolveTransition,
  slaDueAt,
  isSlaMet,
  firstStage,
} from '../src/domain/application/workflow'
import {
  formatReferenceNo,
  nextSequence,
} from '../src/domain/application/reference-number'
import {
  transition,
  availableActions,
  isEditableByApplicant,
} from '../src/domain/application/states'

describe('Domain Orchestration & Workflow Lifecycle (Round 7 / F5)', () => {
  const mockStages: Stage[] = [
    {
      id: BigInt(101),
      sequence: 1,
      code: 'STAGE_INITIAL_SCREENING',
      nameMs: 'Semakan Dokumen & Kelayakan',
      nameEn: 'Initial Screening & Verification',
      actorRoleId: BigInt(2), // Data Admin
      actorInternalUnitId: null,
      actionType: 'review',
      slaDays: 3,
      allowReturn: true,
      allowAmend: true,
      minApprovals: 1,
      isFinal: false,
      onApproveStatus: null,
      onRejectStatus: 'rejected',
    },
    {
      id: BigInt(102),
      sequence: 2,
      code: 'STAGE_TECHNICAL_EVALUATION',
      nameMs: 'Penilaian Teknikal Zon Pelabuhan',
      nameEn: 'Technical Assessment',
      actorRoleId: BigInt(4), // Approver / Unit M/T
      actorInternalUnitId: null,
      actionType: 'evaluate',
      slaDays: 7,
      allowReturn: true,
      allowAmend: true,
      minApprovals: 1,
      isFinal: false,
      onApproveStatus: null,
      onRejectStatus: 'rejected',
    },
    {
      id: BigInt(103),
      sequence: 3,
      code: 'STAGE_FINAL_APPROVAL',
      nameMs: 'Kelulusan Pengurus Besar LPKmn',
      nameEn: 'Final Approval',
      actorRoleId: BigInt(1), // Super Admin / GM
      actorInternalUnitId: null,
      actionType: 'approve',
      slaDays: 5,
      allowReturn: false,
      allowAmend: false,
      minApprovals: 1,
      isFinal: true,
      onApproveStatus: 'approved',
      onRejectStatus: 'rejected',
    },
  ]

  const officerActor: Actor = {
    userId: BigInt(401),
    roleIds: [BigInt(4)],
    unitIds: [],
  }

  const adminActor: Actor = {
    userId: BigInt(101),
    roleIds: [BigInt(1)],
    unitIds: [],
    canManageAll: true,
  }

  it('determines the initial workflow stage correctly', () => {
    const initial = firstStage(mockStages)
    expect(initial).not.toBeNull()
    expect(initial?.id).toBe(BigInt(101))
    expect(initial?.code).toBe('STAGE_INITIAL_SCREENING')
  })

  it('advances stage 1 to stage 2 on approval by authorized officer', () => {
    const adminS1: Actor = {
      userId: BigInt(201),
      roleIds: [BigInt(2)],
      unitIds: [],
    }

    const result = resolveTransition({
      stages: mockStages,
      currentStageId: BigInt(101),
      action: 'approve',
      actor: adminS1,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.outcome.kind).toBe('advance')
      if (result.outcome.kind === 'advance') {
        expect(result.outcome.stage.id).toBe(BigInt(102))
      }
    }
  })

  it('completes the workflow with approved status at final stage', () => {
    const result = resolveTransition({
      stages: mockStages,
      currentStageId: BigInt(103),
      action: 'approve',
      actor: adminActor,
    })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.outcome.kind).toBe('complete')
      if (result.outcome.kind === 'complete') {
        expect(result.outcome.status).toBe('approved')
      }
    }
  })

  it('requires remarks when rejecting or returning an application', () => {
    const result = resolveTransition({
      stages: mockStages,
      currentStageId: BigInt(102),
      action: 'reject',
      actor: officerActor,
      remarks: '',
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('REMARKS_REQUIRED')
      expect(result.error.messageMs).toContain('Ulasan diperlukan')
    }
  })

  it('calculates SLA due date and tracks compliance status accurately', () => {
    const started = new Date('2026-08-01T09:00:00Z')
    const due = slaDueAt(mockStages[1]!, started)

    expect(due).not.toBeNull()
    // 7 days later
    expect(due?.toISOString().slice(0, 10)).toBe('2026-08-08')

    const actionOnTime = new Date('2026-08-05T10:00:00Z')
    const actionLate = new Date('2026-08-10T10:00:00Z')

    expect(isSlaMet(due, actionOnTime)).toBe(true)
    expect(isSlaMet(due, actionLate)).toBe(false)
  })

  it('generates uniform reference numbers (GP-12)', () => {
    const ref = formatReferenceNo({
      typePrefix: 'LPS',
      year: 2026,
      sequence: nextSequence(141),
    })
    expect(ref).toBe('LPK/LPS/2026/00142')
  })

  it('manages applicant form editability across state machine transitions', () => {
    expect(isEditableByApplicant('draft')).toBe(true)
    expect(isEditableByApplicant('returned')).toBe(true)
    expect(isEditableByApplicant('submitted')).toBe(false)
    expect(isEditableByApplicant('in_review')).toBe(false)
    expect(isEditableByApplicant('approved')).toBe(false)
    expect(isEditableByApplicant('rejected')).toBe(false)

    expect(transition('draft', 'submit', 'applicant')).toEqual({
      ok: true,
      status: 'submitted',
    })
    expect(transition('in_review', 'approve', 'officer')).toEqual({
      ok: true,
      status: 'approved',
    })
    expect(availableActions('in_review', 'officer')).toContain('approve')
    expect(availableActions('in_review', 'officer')).toContain('reject')
    expect(availableActions('in_review', 'officer')).toContain('return')
  })
})
