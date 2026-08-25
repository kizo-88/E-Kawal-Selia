import { describe, expect, it } from 'vitest'

import {
  type FormSchema,
  fieldsForStep,
  isFieldVisible,
  resumeStep,
  stepperState,
  validateFormSchema,
  validateStep,
  validateSubmission,
} from '../src/domain/application/form-schema'
import {
  formatReferenceNo,
  licenceNoFor,
  nextSequence,
  parseReferenceNo,
  referenceLikePattern,
} from '../src/domain/application/reference-number'
import {
  type ApplicationStatus,
  availableActions,
  displayStatus,
  isEditableByApplicant,
  transition,
} from '../src/domain/application/states'

/**
 * M1 — Modul Permohonan. The core of the tender.
 *
 * These three modules are deliberately pure so the whole behaviour matrix is
 * provable here rather than discovered by clicking through a UI at UAT.
 */

describe('status machine (M1-R09, M1-R10)', () => {
  it('walks the ordinary applicant-to-approval path', () => {
    const steps: Array<[ApplicationStatus, Parameters<typeof transition>[1], Parameters<typeof transition>[2], ApplicationStatus]> = [
      ['draft', 'submit', 'applicant', 'submitted'],
      ['submitted', 'begin_review', 'officer', 'in_review'],
      ['in_review', 'approve', 'officer', 'approved'],
    ]

    for (const [from, action, actor, expected] of steps) {
      const result = transition(from, action, actor)
      expect(result.ok, `${from} --${action}--> ${expected}`).toBe(true)
      if (result.ok) expect(result.status).toBe(expected)
    }
  })

  it('supports return for amendment and resubmission', () => {
    const returned = transition('in_review', 'return', 'officer')
    expect(returned.ok && returned.status).toBe('returned')

    const resubmitted = transition('returned', 'resubmit', 'applicant')
    expect(resubmitted.ok && resubmitted.status).toBe('submitted')
  })

  it('refuses an applicant approving their own application', () => {
    const result = transition('in_review', 'approve', 'applicant')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('ACTOR_NOT_PERMITTED')
  })

  it('refuses a jump straight from draft to approved', () => {
    const result = transition('draft', 'approve', 'officer')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('ILLEGAL_TRANSITION')
  })

  it('closes terminal statuses — a cancelled application cannot be approved', () => {
    for (const terminal of ['rejected', 'cancelled', 'expired'] as ApplicationStatus[]) {
      const result = transition(terminal, 'approve', 'officer')
      expect(result.ok, terminal).toBe(false)
      if (!result.ok) expect(result.error.code).toBe('TERMINAL_STATUS')
    }
  })

  it('lets an applicant cancel before a decision, but not once in review', () => {
    expect(transition('draft', 'cancel', 'applicant').ok).toBe(true)
    expect(transition('submitted', 'cancel', 'applicant').ok).toBe(true)
    expect(transition('in_review', 'cancel', 'applicant').ok).toBe(false)
    // An admin still can — M1-R10.
    expect(transition('in_review', 'cancel', 'admin').ok).toBe(true)
  })

  it('freezes and unfreezes, admin only (M1-R10)', () => {
    expect(transition('in_review', 'freeze', 'admin').ok).toBe(true)
    expect(transition('in_review', 'freeze', 'officer').ok).toBe(false)

    const thawed = transition('frozen', 'unfreeze', 'admin')
    expect(thawed.ok && thawed.status).toBe('in_review')
  })

  it('expires only from approved, and only by the system', () => {
    expect(transition('approved', 'expire', 'system').ok).toBe(true)
    expect(transition('approved', 'expire', 'admin').ok).toBe(false)
    expect(transition('draft', 'expire', 'system').ok).toBe(false)
  })

  it('offers the actions an actor can actually take', () => {
    expect(availableActions('draft', 'applicant').sort()).toEqual(['cancel', 'submit'])
    expect(availableActions('in_review', 'officer').sort()).toEqual(['approve', 'reject', 'return'])
    expect(availableActions('cancelled', 'admin')).toEqual([])
  })

  it('lets the applicant edit only a draft or a returned application', () => {
    expect(isEditableByApplicant('draft')).toBe(true)
    expect(isEditableByApplicant('returned')).toBe(true)
    expect(isEditableByApplicant('in_review')).toBe(false)
    expect(isEditableByApplicant('approved')).toBe(false)
  })

  it('gives every rejection both languages (G4)', () => {
    const result = transition('draft', 'approve', 'officer')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.messageMs.length).toBeGreaterThan(0)
      expect(result.error.messageEn.length).toBeGreaterThan(0)
      expect(result.error.messageMs).not.toBe(result.error.messageEn)
    }
  })
})

describe('display status (M1-R12)', () => {
  const now = new Date('2026-08-25T00:00:00Z')
  const inDays = (days: number) => new Date(now.getTime() + days * 86_400_000)

  it('shows Approved while comfortably valid', () => {
    expect(displayStatus('approved', inDays(120), now)).toBe('approved')
  })

  it('shows Expiring Soon inside the window', () => {
    expect(displayStatus('approved', inDays(15), now)).toBe('expiring_soon')
  })

  it('shows Expired once past the date', () => {
    expect(displayStatus('approved', inDays(-1), now)).toBe('expired')
  })

  it('honours an admin-changed threshold rather than a constant', () => {
    expect(displayStatus('approved', inDays(45), now, 30)).toBe('approved')
    expect(displayStatus('approved', inDays(45), now, 60)).toBe('expiring_soon')
  })

  it('leaves non-approved statuses alone', () => {
    expect(displayStatus('in_review', inDays(1), now)).toBe('in_review')
    expect(displayStatus('rejected', null, now)).toBe('rejected')
  })
})

describe('reference numbers (M1-R05)', () => {
  it('formats to LPK/{TYPE}/{YEAR}/{SEQ} with padding', () => {
    expect(formatReferenceNo({ typePrefix: 'LPS', year: 2026, sequence: 123 })).toBe(
      'LPK/LPS/2026/00123',
    )
    expect(formatReferenceNo({ typePrefix: 'PAP', year: 2026, sequence: 1 })).toBe(
      'LPK/PAP/2026/00001',
    )
  })

  it('round-trips through parsing', () => {
    expect(parseReferenceNo('LPK/LPS/2026/00123')).toEqual({
      typePrefix: 'LPS',
      year: 2026,
      sequence: 123,
    })
  })

  it('tolerates the whitespace and case of a pasted reference', () => {
    expect(parseReferenceNo('  lpk/lps/2026/00123  ')?.sequence).toBe(123)
  })

  it('returns null for anything that is not a reference, rather than throwing', () => {
    expect(parseReferenceNo('not a reference')).toBeNull()
    expect(parseReferenceNo('LPK/LPS/26/00123')).toBeNull()
    expect(parseReferenceNo('')).toBeNull()
  })

  it('advances from the highest issued, never from a row count', () => {
    // Counting rows would reuse a number the moment an application is
    // soft-deleted — and under G2 they are only ever soft-deleted.
    expect(nextSequence(122)).toBe(123)
    expect(nextSequence(null)).toBe(1)
    expect(nextSequence(0)).toBe(1)
  })

  it('scopes the sequence to one type and one year', () => {
    expect(referenceLikePattern('LPS', 2026)).toBe('LPK/LPS/2026/%')
    expect(referenceLikePattern('PAP', 2027)).toBe('LPK/PAP/2027/%')
  })

  it('keeps the licence number visibly linked to its application', () => {
    expect(licenceNoFor('LPK/LPS/2026/00123')).toBe('L/LPK/LPS/2026/00123')
  })
})

describe('form_schema (M1-R02, ADR 0002)', () => {
  const schema: FormSchema = {
    version: 1,
    steps: [
      {
        sequence: 1,
        code: 'pemohon',
        titleMs: 'Maklumat Pemohon',
        titleEn: 'Applicant Details',
        fields: [
          { name: 'namaSyarikat', labelMs: 'Nama Syarikat', labelEn: 'Company Name', kind: 'text', required: true, minLength: 3 },
          { name: 'negeri', labelMs: 'Negeri', labelEn: 'State', kind: 'select', required: true, lookupType: 'NEGERI' },
        ],
      },
      {
        sequence: 2,
        code: 'aktiviti',
        titleMs: 'Butiran Aktiviti',
        titleEn: 'Activity Details',
        fields: [
          { name: 'jenisAktiviti', labelMs: 'Jenis Aktiviti', labelEn: 'Activity Type', kind: 'select', required: true, lookupType: 'JENIS_AKTIVITI_PELABUHAN' },
          { name: 'bilanganKapal', labelMs: 'Bilangan Kapal', labelEn: 'Number of Vessels', kind: 'number', min: 1, max: 50 },
          { name: 'butiranLain', labelMs: 'Butiran Lain', labelEn: 'Other Details', kind: 'textarea', required: true, showWhen: { field: 'jenisAktiviti', equals: ['LAIN_LAIN'] } },
        ],
      },
    ],
  }

  it('accepts a well-formed schema', () => {
    expect(validateFormSchema(schema)).toEqual([])
  })

  it('rejects a select field with no lookup type — that is G1', () => {
    const bad: FormSchema = {
      version: 1,
      steps: [{ sequence: 1, code: 's', titleMs: 'A', titleEn: 'A', fields: [{ name: 'x', labelMs: 'X', labelEn: 'X', kind: 'select' }] }],
    }
    expect(validateFormSchema(bad).some((p) => p.path.endsWith('.lookupType'))).toBe(true)
  })

  it('rejects duplicate field names, which would overwrite each other in form_data', () => {
    const bad: FormSchema = {
      version: 1,
      steps: [{
        sequence: 1, code: 's', titleMs: 'A', titleEn: 'A',
        fields: [
          { name: 'dup', labelMs: 'A', labelEn: 'A', kind: 'text' },
          { name: 'dup', labelMs: 'B', labelEn: 'B', kind: 'text' },
        ],
      }],
    }
    expect(validateFormSchema(bad).some((p) => p.messageEn.includes('duplicated'))).toBe(true)
  })

  it('rejects a conditional pointing at a field that does not exist', () => {
    const bad: FormSchema = {
      version: 1,
      steps: [{
        sequence: 1, code: 's', titleMs: 'A', titleEn: 'A',
        fields: [{ name: 'x', labelMs: 'X', labelEn: 'X', kind: 'text', showWhen: { field: 'ghost', equals: ['y'] } }],
      }],
    }
    expect(validateFormSchema(bad).some((p) => p.path.endsWith('.showWhen'))).toBe(true)
  })

  it('rejects a missing English label (G4) and a duplicated step sequence', () => {
    const bad = {
      version: 1,
      steps: [
        { sequence: 1, code: 'a', titleMs: 'A', titleEn: '', fields: [{ name: 'x', labelMs: 'X', labelEn: 'X', kind: 'text' }] },
        { sequence: 1, code: 'b', titleMs: 'B', titleEn: 'B', fields: [{ name: 'y', labelMs: 'Y', labelEn: 'Y', kind: 'text' }] },
      ],
    } as unknown as FormSchema

    const problems = validateFormSchema(bad)
    expect(problems.some((p) => p.path.endsWith('.title'))).toBe(true)
    expect(problems.some((p) => p.path.endsWith('.sequence'))).toBe(true)
  })

  it('rejects a schema with no steps at all', () => {
    expect(validateFormSchema({ version: 1, steps: [] }).length).toBeGreaterThan(0)
    expect(validateFormSchema(null).length).toBeGreaterThan(0)
  })
})

describe('submitted data validation', () => {
  const schema: FormSchema = {
    version: 1,
    steps: [{
      sequence: 1, code: 's', titleMs: 'A', titleEn: 'A',
      fields: [
        { name: 'nama', labelMs: 'Nama', labelEn: 'Name', kind: 'text', required: true, minLength: 3, maxLength: 10 },
        { name: 'bil', labelMs: 'Bilangan', labelEn: 'Count', kind: 'number', min: 1, max: 5 },
        { name: 'sebab', labelMs: 'Sebab', labelEn: 'Reason', kind: 'text', required: true, showWhen: { field: 'nama', equals: ['LAIN'] } },
      ],
    }],
  }

  it('accepts complete, valid data', () => {
    expect(validateStep(schema, 1, { nama: 'Kemaman', bil: 3 })).toEqual([])
  })

  it('flags a missing required field', () => {
    expect(validateStep(schema, 1, {}).some((p) => p.path === 'nama')).toBe(true)
  })

  it('enforces length and numeric bounds', () => {
    expect(validateStep(schema, 1, { nama: 'ab' }).some((p) => p.path === 'nama')).toBe(true)
    expect(validateStep(schema, 1, { nama: 'a'.repeat(11) }).some((p) => p.path === 'nama')).toBe(true)
    expect(validateStep(schema, 1, { nama: 'Kemaman', bil: 99 }).some((p) => p.path === 'bil')).toBe(true)
  })

  it('never requires a hidden conditional field', () => {
    // Otherwise the applicant is blocked by an error on a field they cannot
    // see, which they have no way to resolve.
    expect(validateStep(schema, 1, { nama: 'Kemaman' }).some((p) => p.path === 'sebab')).toBe(false)
    expect(validateStep(schema, 1, { nama: 'LAIN' }).some((p) => p.path === 'sebab')).toBe(true)
  })

  it('resolves visibility directly too', () => {
    const conditional = schema.steps[0].fields[2]
    expect(isFieldVisible(conditional, { nama: 'LAIN' })).toBe(true)
    expect(isFieldVisible(conditional, { nama: 'Kemaman' })).toBe(false)
    expect(isFieldVisible(schema.steps[0].fields[0], {})).toBe(true)
  })

  it('validates every step on submission', () => {
    expect(validateSubmission(schema, {}).length).toBeGreaterThan(0)
    expect(validateSubmission(schema, { nama: 'Kemaman' })).toEqual([])
  })

  it('gives every problem both languages (G4)', () => {
    for (const p of validateStep(schema, 1, {})) {
      expect(p.messageMs.length).toBeGreaterThan(0)
      expect(p.messageEn.length).toBeGreaterThan(0)
      expect(p.messageMs).not.toBe(p.messageEn)
    }
  })

  it('reads a step by sequence', () => {
    expect(fieldsForStep(schema, 1)).toHaveLength(3)
    expect(fieldsForStep(schema, 99)).toEqual([])
  })
})

describe('stepper (M1-R02, M1-R03)', () => {
  const schema: FormSchema = {
    version: 1,
    steps: [1, 2, 3].map((sequence) => ({
      sequence,
      code: `s${sequence}`,
      titleMs: `Langkah ${sequence}`,
      titleEn: `Step ${sequence}`,
      fields: [{ name: `f${sequence}`, labelMs: 'F', labelEn: 'F', kind: 'text' as const }],
    })),
  }

  it('starts at step one with nothing completed', () => {
    const state = stepperState(schema, 1, 0)
    expect(state).toMatchObject({ currentStep: 1, totalSteps: 3, canGoBack: false, canGoNext: true, canSubmit: false })
  })

  it('refuses a jump past the furthest completed step', () => {
    // Otherwise an applicant lands on the final step and submits, skipping the
    // validation on everything between.
    expect(stepperState(schema, 3, 0).currentStep).toBe(1)
    expect(stepperState(schema, 3, 1).currentStep).toBe(2)
    expect(stepperState(schema, 3, 2).currentStep).toBe(3)
  })

  it('allows free movement backwards', () => {
    const state = stepperState(schema, 2, 3)
    expect(state.currentStep).toBe(2)
    expect(state.canGoBack).toBe(true)
  })

  it('offers submit only once every step is complete', () => {
    expect(stepperState(schema, 3, 2).canSubmit).toBe(false)
    expect(stepperState(schema, 3, 3).canSubmit).toBe(true)
  })

  it('clamps a nonsensical requested step', () => {
    expect(stepperState(schema, 0, 3).currentStep).toBe(1)
    expect(stepperState(schema, 99, 3).currentStep).toBe(3)
  })

  it('resumes a draft where it was left (M1-R03)', () => {
    expect(resumeStep(schema, 0)).toBe(1)
    expect(resumeStep(schema, 1)).toBe(2)
    expect(resumeStep(schema, 3)).toBe(3)
  })
})
