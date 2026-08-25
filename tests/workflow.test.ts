import { describe, expect, it } from 'vitest'

import {
  type Actor,
  type Stage,
  availableStageActions,
  canActOnStage,
  firstStage,
  isOverdue,
  isSlaMet,
  resolveTransition,
  slaDueAt,
} from '../src/domain/application/workflow'
import {
  type LicenceRecord,
  QR_TOKEN_LENGTH,
  generateQrToken,
  isWellFormedToken,
  publicVerification,
  tokensMatch,
  verificationUrl,
} from '../src/domain/licence/qr-token'

/**
 * M1-R06, M1-R07, X-R11, X-R12. The engine reads workflow rows and knows
 * nothing about Unit M/T or a Jawatankuasa Pemaliman — these tests configure
 * stages as data and check the engine behaves, which is the whole design.
 */

const stage = (over: Partial<Stage> & Pick<Stage, 'id' | 'sequence' | 'code'>): Stage => ({
  nameMs: 'Peringkat',
  nameEn: 'Stage',
  actorRoleId: null,
  actorInternalUnitId: null,
  actionType: 'review',
  slaDays: 5,
  allowReturn: true,
  allowAmend: false,
  minApprovals: 1,
  isFinal: false,
  onApproveStatus: null,
  onRejectStatus: null,
  ...over,
})

const MT_UNIT = 10n
const SEC_UNIT = 11n
const APPROVER_ROLE = 20n

const stages: Stage[] = [
  stage({ id: 1n, sequence: 1, code: 'SEMAKAN_MT', actorInternalUnitId: MT_UNIT }),
  stage({ id: 2n, sequence: 2, code: 'SEMAKAN_SEC', actorInternalUnitId: SEC_UNIT }),
  stage({ id: 3n, sequence: 3, code: 'KELULUSAN', actorRoleId: APPROVER_ROLE, isFinal: true, actionType: 'approve' }),
]

const mtOfficer: Actor = { userId: 1n, roleIds: [], unitIds: [MT_UNIT] }
const secOfficer: Actor = { userId: 2n, roleIds: [], unitIds: [SEC_UNIT] }
const approver: Actor = { userId: 3n, roleIds: [APPROVER_ROLE], unitIds: [] }
const admin: Actor = { userId: 4n, roleIds: [], unitIds: [], canManageAll: true }

describe('actor matching', () => {
  it('matches by unit', () => {
    expect(canActOnStage(mtOfficer, stages[0])).toBe(true)
    expect(canActOnStage(secOfficer, stages[0])).toBe(false)
  })

  it('matches by role', () => {
    expect(canActOnStage(approver, stages[2])).toBe(true)
    expect(canActOnStage(mtOfficer, stages[2])).toBe(false)
  })

  it('lets an admin act anywhere', () => {
    expect(stages.every((s) => canActOnStage(admin, s))).toBe(true)
  })

  it('matches nobody when a stage names neither role nor unit', () => {
    // A misconfigured stage must deny, not admit everyone.
    const orphan = stage({ id: 9n, sequence: 9, code: 'ORPHAN' })
    expect(canActOnStage(mtOfficer, orphan)).toBe(false)
    expect(canActOnStage(approver, orphan)).toBe(false)
  })
})

describe('transitions (M1-R06)', () => {
  it('advances to the next stage on approval', () => {
    const result = resolveTransition({ stages, currentStageId: 1n, action: 'approve', actor: mtOfficer })
    expect(result.ok).toBe(true)
    if (result.ok && result.outcome.kind === 'advance') {
      expect(result.outcome.stage.code).toBe('SEMAKAN_SEC')
    } else {
      throw new Error('expected advance')
    }
  })

  it('completes the application at the final stage', () => {
    const result = resolveTransition({ stages, currentStageId: 3n, action: 'approve', actor: approver })
    expect(result.ok && result.outcome.kind === 'complete' && result.outcome.status).toBe('approved')
  })

  it('honours a stage-configured approval status rather than assuming', () => {
    const custom = [stage({ id: 1n, sequence: 1, code: 'X', actorRoleId: APPROVER_ROLE, isFinal: true, onApproveStatus: 'approved_with_conditions' })]
    const result = resolveTransition({ stages: custom, currentStageId: 1n, action: 'approve', actor: approver })
    expect(result.ok && result.outcome.kind === 'complete' && result.outcome.status).toBe('approved_with_conditions')
  })

  it('refuses an officer acting on another unit’s stage', () => {
    const result = resolveTransition({ stages, currentStageId: 1n, action: 'approve', actor: secOfficer })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('ACTOR_NOT_PERMITTED')
  })

  it('rejects, ending the workflow', () => {
    const result = resolveTransition({ stages, currentStageId: 1n, action: 'reject', actor: mtOfficer, remarks: 'Dokumen tidak lengkap' })
    expect(result.ok && result.outcome.kind === 'complete' && result.outcome.status).toBe('rejected')
  })

  it('requires remarks on reject and return, but not on approve', () => {
    // A decision the applicant cannot act on is a decision that wastes a cycle.
    expect(resolveTransition({ stages, currentStageId: 1n, action: 'reject', actor: mtOfficer }).ok).toBe(false)
    expect(resolveTransition({ stages, currentStageId: 1n, action: 'return', actor: mtOfficer }).ok).toBe(false)
    expect(resolveTransition({ stages, currentStageId: 1n, action: 'return', actor: mtOfficer, remarks: '   ' }).ok).toBe(false)
    expect(resolveTransition({ stages, currentStageId: 1n, action: 'approve', actor: mtOfficer }).ok).toBe(true)
  })

  it('returns to the applicant for amendment', () => {
    const result = resolveTransition({ stages, currentStageId: 1n, action: 'return', actor: mtOfficer, remarks: 'Sila lampirkan SSM terkini' })
    expect(result.ok && result.outcome.kind === 'returned' && result.outcome.status).toBe('returned')
  })

  it('refuses a return on a stage configured not to allow one', () => {
    const strict = [stage({ id: 1n, sequence: 1, code: 'X', actorInternalUnitId: MT_UNIT, allowReturn: false })]
    const result = resolveTransition({ stages: strict, currentStageId: 1n, action: 'return', actor: mtOfficer, remarks: 'x' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('RETURN_NOT_ALLOWED')
  })

  it('holds a committee stage until it has enough approvals (M1-R21)', () => {
    // Sijil Pengecualian Malim needs two Malim KPK evaluations.
    const committee = [
      stage({ id: 1n, sequence: 1, code: 'MALIM_KPK', actorInternalUnitId: MT_UNIT, actionType: 'committee', minApprovals: 2 }),
      stage({ id: 2n, sequence: 2, code: 'PENGESAHAN', actorRoleId: APPROVER_ROLE, isFinal: true }),
    ]

    const first = resolveTransition({ stages: committee, currentStageId: 1n, action: 'approve', actor: mtOfficer, approvalsSoFar: 0 })
    expect(first.ok && first.outcome.kind).toBe('awaiting_approvals')
    if (first.ok && first.outcome.kind === 'awaiting_approvals') {
      expect(first.outcome.received).toBe(1)
      expect(first.outcome.required).toBe(2)
    }

    const second = resolveTransition({ stages: committee, currentStageId: 1n, action: 'approve', actor: mtOfficer, approvalsSoFar: 1 })
    expect(second.ok && second.outcome.kind === 'advance' && second.outcome.stage.code).toBe('PENGESAHAN')
  })

  it('fails loudly on a non-final stage with nothing after it', () => {
    // Silently approving would clear an application nobody approved.
    const broken = [stage({ id: 1n, sequence: 1, code: 'X', actorInternalUnitId: MT_UNIT, isFinal: false })]
    const result = resolveTransition({ stages: broken, currentStageId: 1n, action: 'approve', actor: mtOfficer })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('NO_NEXT_STAGE')
  })

  it('rejects a stage id from a different workflow', () => {
    const result = resolveTransition({ stages, currentStageId: 999n, action: 'approve', actor: admin })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNKNOWN_STAGE')
  })

  it('gives every rejection both languages (G4)', () => {
    const result = resolveTransition({ stages, currentStageId: 1n, action: 'approve', actor: secOfficer })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.messageMs.length).toBeGreaterThan(0)
      expect(result.error.messageEn.length).toBeGreaterThan(0)
      expect(result.error.messageMs).not.toBe(result.error.messageEn)
    }
  })

  it('offers actions only to a permitted actor', () => {
    expect(availableStageActions(mtOfficer, stages[0]).sort()).toEqual(['approve', 'reject', 'return'])
    expect(availableStageActions(secOfficer, stages[0])).toEqual([])
    expect(availableStageActions(mtOfficer, stage({ id: 5n, sequence: 5, code: 'Y', actorInternalUnitId: MT_UNIT, allowReturn: false })).sort()).toEqual(['approve', 'reject'])
  })

  it('finds the entry stage by sequence, not array order', () => {
    expect(firstStage([stages[2], stages[0], stages[1]])?.code).toBe('SEMAKAN_MT')
    expect(firstStage([])).toBeNull()
  })
})

describe('SLA capture (foundation for GP-19)', () => {
  const started = new Date('2026-08-25T00:00:00Z')

  it('computes a due date from the stage configuration', () => {
    expect(slaDueAt(stages[0], started)?.toISOString()).toBe('2026-08-30T00:00:00.000Z')
  })

  it('returns null when the stage carries no SLA', () => {
    expect(slaDueAt(stage({ id: 1n, sequence: 1, code: 'X', slaDays: null }), started)).toBeNull()
    expect(slaDueAt(stage({ id: 1n, sequence: 1, code: 'X', slaDays: 0 }), started)).toBeNull()
  })

  it('distinguishes "no target" from "missed"', () => {
    // Recording false for a stage that never had a target would make the
    // Phase 2 KPI report wrong in the direction that embarrasses LPKmn.
    const due = slaDueAt(stages[0], started)
    expect(isSlaMet(due, new Date('2026-08-29T00:00:00Z'))).toBe(true)
    expect(isSlaMet(due, new Date('2026-09-01T00:00:00Z'))).toBe(false)
    expect(isSlaMet(null, new Date('2026-09-01T00:00:00Z'))).toBeNull()
  })

  it('flags an overdue stage', () => {
    const due = slaDueAt(stages[0], started)
    expect(isOverdue(due, new Date('2026-09-01T00:00:00Z'))).toBe(true)
    expect(isOverdue(due, new Date('2026-08-26T00:00:00Z'))).toBe(false)
    expect(isOverdue(null, new Date('2099-01-01T00:00:00Z'))).toBe(false)
  })
})

describe('QR tokens (X-R11)', () => {
  it('produces 32 characters from the expected alphabet', () => {
    for (let i = 0; i < 50; i++) {
      const token = generateQrToken()
      expect(token).toHaveLength(QR_TOKEN_LENGTH)
      expect(isWellFormedToken(token)).toBe(true)
    }
  })

  it('never repeats', () => {
    const tokens = new Set(Array.from({ length: 500 }, generateQrToken))
    expect(tokens.size).toBe(500)
  })

  it('rejects malformed tokens before any database lookup', () => {
    expect(isWellFormedToken('too-short')).toBe(false)
    expect(isWellFormedToken('l'.repeat(32))).toBe(false) // lowercase L excluded
    expect(isWellFormedToken('0'.repeat(32))).toBe(false) // zero excluded
    expect(isWellFormedToken('')).toBe(false)
  })

  it('compares tokens without leaking timing', () => {
    const token = generateQrToken()
    expect(tokensMatch(token, token)).toBe(true)
    expect(tokensMatch(token, generateQrToken())).toBe(false)
    expect(tokensMatch(token, 'short')).toBe(false)
  })

  it('builds the scan URL', () => {
    expect(verificationUrl('https://ekawalselia.gov.my/', 'abc')).toBe('https://ekawalselia.gov.my/semak/abc')
  })
})

describe('public verification disclosure (X-R12)', () => {
  const now = new Date('2026-08-25T00:00:00Z')

  const licence: LicenceRecord = {
    licenceNo: 'L/LPK/LPS/2026/00001',
    typeNameMs: 'Lesen Perkhidmatan Sokongan Pelabuhan',
    typeNameEn: 'Port Support Services Licence',
    holderNameSnapshot: 'Syarikat Perkapalan Contoh Sdn Bhd',
    status: 'active',
    issuedAt: new Date('2026-01-01T00:00:00Z'),
    validFrom: new Date('2026-01-01T00:00:00Z'),
    validUntil: new Date('2026-12-31T00:00:00Z'),
    revokedAt: null,
    // Present on the record, and must never reach the payload.
    holderIcNo: '900101015555',
    holderAddress: 'Lot 5, Telok Kalong, 24000 Kemaman',
    holderPhone: '09-8631000',
    applicationReferenceNo: 'LPK/LPS/2026/00001',
    formData: { rahsia: 'jangan dedah' },
  }

  it('discloses exactly the five permitted facts and nothing else', () => {
    const payload = publicVerification(licence, now)
    expect(payload).not.toBeNull()

    expect(Object.keys(payload as object).sort()).toEqual([
      'holderName', 'licenceNo', 'status', 'statusLabelEn', 'statusLabelMs',
      'typeEn', 'typeMs', 'validFrom', 'validUntil', 'verifiedAt',
    ])
  })

  it('leaks no IC, address, phone or form data', () => {
    const serialised = JSON.stringify(publicVerification(licence, now))

    expect(serialised).not.toContain('900101015555')
    expect(serialised).not.toContain('Telok Kalong')
    expect(serialised).not.toContain('09-8631000')
    expect(serialised).not.toContain('rahsia')
  })

  it('carries the application reference only inside the licence number, by design', () => {
    // licenceNoFor() derives L/LPK/LPS/2026/00001 from the application's own
    // reference, so the reference IS visible to anyone scanning the QR — as a
    // substring of a number X-R12 explicitly permits disclosing. That is
    // deliberate: it keeps a licence traceable to its file, which is how
    // LPKmn's paper records already work. What it discloses is type, year and
    // sequence — nothing about the application's contents, which RLS protects.
    const payload = publicVerification(licence, now)

    expect(payload?.licenceNo).toContain(licence.applicationReferenceNo as string)
    // But never as a field of its own.
    expect(Object.keys(payload as object)).not.toContain('applicationReferenceNo')
  })

  it('marks a valid licence SAH', () => {
    expect(publicVerification(licence, now)?.status).toBe('sah')
    expect(publicVerification(licence, now)?.statusLabelMs).toBe('SAH')
  })

  it('marks an expired licence TAMAT TEMPOH', () => {
    const payload = publicVerification(licence, new Date('2027-06-01T00:00:00Z'))
    expect(payload?.status).toBe('tamat_tempoh')
  })

  it('returns nothing at all for a revoked licence', () => {
    // Reporting "revoked" would confirm the licence number exists, which is
    // more than a stranger scanning a QR is entitled to learn.
    expect(publicVerification({ ...licence, revokedAt: new Date('2026-06-01T00:00:00Z') }, now)).toBeNull()
    expect(publicVerification({ ...licence, status: 'revoked' }, now)).toBeNull()
  })

  it('shows dates as plain dates, never timestamps', () => {
    const payload = publicVerification(licence, now)
    expect(payload?.validFrom).toBe('2026-01-01')
    expect(payload?.validUntil).toBe('2026-12-31')
  })
})
