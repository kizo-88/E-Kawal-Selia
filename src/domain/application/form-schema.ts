/**
 * The form_schema contract — M1-R02, M1-R03, and the load-bearing part of
 * ADR 0002.
 *
 * "sistem hendaklah menyediakan proses permohonan secara Multi-Step Stepper...
 *  kemudahan Simpan, Seterusnya (Next) dan Simpan sebagai Draf"
 *
 * A licence type's entire form — its steps, fields, validation and conditional
 * logic — is a JSON document in `application_types.form_schema`. This module
 * defines that document's shape, validates it, and validates submitted data
 * against it.
 *
 * This is what makes "a new licence type is a seeder row" true. If any of the
 * five Phase 1 or Phase 2 types ever needs a code change to render its form,
 * this file is where the missing capability belongs — not in a branch on the
 * type code.
 *
 * Pure. No database, no framework.
 */

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'file'
  | 'coordinate'

export interface FieldDef {
  name: string
  labelMs: string
  labelEn: string
  kind: FieldKind
  required?: boolean
  /** For select/multiselect: the lookup_types.code to read options from (G1). */
  lookupType?: string
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  /** Regex source. Kept as a string so the schema stays plain JSON. */
  pattern?: string
  helpMs?: string
  helpEn?: string
  /** Show this field only when another field holds one of these values. */
  showWhen?: { field: string; equals: (string | number | boolean)[] }
}

export interface StepDef {
  /** 1-based. Matches applications.last_completed_step. */
  sequence: number
  code: string
  titleMs: string
  titleEn: string
  descriptionMs?: string
  descriptionEn?: string
  fields: FieldDef[]
}

export interface FormSchema {
  version: number
  steps: StepDef[]
}

export interface SchemaProblem {
  path: string
  messageMs: string
  messageEn: string
}

const problem = (path: string, messageMs: string, messageEn: string): SchemaProblem => ({
  path,
  messageMs,
  messageEn,
})

// ─────────────────────────────────────────────────── validating the schema

/**
 * Checks a form_schema before it is saved.
 *
 * Run this in the seeder and in the admin screen. A malformed schema does not
 * fail loudly — it renders a form with a missing field, and the applicant
 * submits an incomplete application that an officer rejects weeks later.
 */
export function validateFormSchema(input: unknown): SchemaProblem[] {
  const problems: SchemaProblem[] = []
  const schema = input as FormSchema

  if (!schema || typeof schema !== 'object') {
    return [problem('', 'Skema borang tidak sah.', 'The form schema is not valid.')]
  }

  if (!Array.isArray(schema.steps) || schema.steps.length === 0) {
    problems.push(
      problem('steps', 'Skema mesti mempunyai sekurang-kurangnya satu langkah.', 'The schema must have at least one step.'),
    )
    return problems
  }

  const seenSequences = new Set<number>()
  const seenFieldNames = new Set<string>()
  const allFieldNames = new Set<string>()

  for (const step of schema.steps) {
    for (const field of step.fields ?? []) allFieldNames.add(field.name)
  }

  for (const [i, step] of schema.steps.entries()) {
    const at = `steps[${i}]`

    if (!Number.isInteger(step.sequence) || step.sequence < 1) {
      problems.push(problem(`${at}.sequence`, 'Turutan langkah mesti nombor bulat bermula dari 1.', 'Step sequence must be a whole number starting at 1.'))
    } else if (seenSequences.has(step.sequence)) {
      problems.push(problem(`${at}.sequence`, `Turutan langkah ${step.sequence} berulang.`, `Step sequence ${step.sequence} is duplicated.`))
    } else {
      seenSequences.add(step.sequence)
    }

    if (!step.titleMs || !step.titleEn) {
      problems.push(problem(`${at}.title`, 'Setiap langkah memerlukan tajuk dalam BM dan BI.', 'Every step needs a title in both Malay and English.'))
    }

    if (!Array.isArray(step.fields) || step.fields.length === 0) {
      problems.push(problem(`${at}.fields`, 'Setiap langkah memerlukan sekurang-kurangnya satu medan.', 'Every step needs at least one field.'))
      continue
    }

    for (const [j, field] of step.fields.entries()) {
      const fieldAt = `${at}.fields[${j}]`

      if (!field.name) {
        problems.push(problem(fieldAt, 'Medan memerlukan nama.', 'A field needs a name.'))
      } else if (seenFieldNames.has(field.name)) {
        // Duplicate names silently overwrite each other in form_data, so the
        // applicant fills two fields and only one survives.
        problems.push(problem(`${fieldAt}.name`, `Nama medan '${field.name}' berulang dalam borang ini.`, `Field name '${field.name}' is duplicated in this form.`))
      } else {
        seenFieldNames.add(field.name)
      }

      if (!field.labelMs || !field.labelEn) {
        problems.push(problem(`${fieldAt}.label`, 'Setiap medan memerlukan label dalam BM dan BI.', 'Every field needs a label in both Malay and English.'))
      }

      // G1: a dropdown without a lookup type means its options came from
      // somewhere they should not have.
      if ((field.kind === 'select' || field.kind === 'multiselect') && !field.lookupType) {
        problems.push(problem(`${fieldAt}.lookupType`, 'Medan pilihan mesti merujuk kepada lookup_type, bukan senarai dalam kod.', 'A select field must reference a lookup_type, never a list held in code.'))
      }

      if (field.showWhen && !allFieldNames.has(field.showWhen.field)) {
        problems.push(problem(`${fieldAt}.showWhen`, `Medan syarat '${field.showWhen.field}' tidak wujud dalam borang ini.`, `Conditional field '${field.showWhen.field}' does not exist in this form.`))
      }

      if (field.pattern) {
        try {
          new RegExp(field.pattern)
        } catch {
          problems.push(problem(`${fieldAt}.pattern`, 'Corak regex tidak sah.', 'Invalid regex pattern.'))
        }
      }
    }
  }

  return problems
}

// ──────────────────────────────────────────── validating submitted data

export type FormData = Record<string, unknown>

/**
 * Whether a conditional field is currently showing.
 *
 * A hidden field is never required — otherwise an applicant is blocked by a
 * validation error on a field they cannot see, which is unresolvable from their
 * side.
 */
export function isFieldVisible(field: FieldDef, data: FormData): boolean {
  if (!field.showWhen) return true

  const actual = data[field.showWhen.field]
  return field.showWhen.equals.some((candidate) => candidate === actual)
}

export function stepsInOrder(schema: FormSchema): StepDef[] {
  return [...schema.steps].sort((a, b) => a.sequence - b.sequence)
}

export function fieldsForStep(schema: FormSchema, sequence: number): FieldDef[] {
  return schema.steps.find((step) => step.sequence === sequence)?.fields ?? []
}

const isBlank = (value: unknown): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)

/**
 * Validates one step's data.
 *
 * Per-step rather than whole-form, because M1-R03 lets an applicant save a
 * draft and come back. Validating everything on every save would refuse to
 * store a half-finished form, which is precisely what draft means.
 */
export function validateStep(
  schema: FormSchema,
  sequence: number,
  data: FormData,
): SchemaProblem[] {
  const problems: SchemaProblem[] = []

  for (const field of fieldsForStep(schema, sequence)) {
    if (!isFieldVisible(field, data)) continue

    const value = data[field.name]

    if (isBlank(value)) {
      if (field.required) {
        problems.push(problem(field.name, `${field.labelMs} wajib diisi.`, `${field.labelEn} is required.`))
      }
      continue
    }

    if (typeof value === 'string') {
      if (field.minLength !== undefined && value.length < field.minLength) {
        problems.push(problem(field.name, `${field.labelMs} mesti sekurang-kurangnya ${field.minLength} aksara.`, `${field.labelEn} must be at least ${field.minLength} characters.`))
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        problems.push(problem(field.name, `${field.labelMs} tidak boleh melebihi ${field.maxLength} aksara.`, `${field.labelEn} must not exceed ${field.maxLength} characters.`))
      }
      if (field.pattern && !new RegExp(field.pattern).test(value)) {
        problems.push(problem(field.name, `Format ${field.labelMs} tidak sah.`, `${field.labelEn} is not in the expected format.`))
      }
    }

    if (field.kind === 'number') {
      const numeric = Number(value)
      if (Number.isNaN(numeric)) {
        problems.push(problem(field.name, `${field.labelMs} mesti nombor.`, `${field.labelEn} must be a number.`))
      } else {
        if (field.min !== undefined && numeric < field.min) {
          problems.push(problem(field.name, `${field.labelMs} mesti sekurang-kurangnya ${field.min}.`, `${field.labelEn} must be at least ${field.min}.`))
        }
        if (field.max !== undefined && numeric > field.max) {
          problems.push(problem(field.name, `${field.labelMs} tidak boleh melebihi ${field.max}.`, `${field.labelEn} must not exceed ${field.max}.`))
        }
      }
    }
  }

  return problems
}

/**
 * Validates the whole form. Run this on submission, never on a draft save.
 */
export function validateSubmission(schema: FormSchema, data: FormData): SchemaProblem[] {
  return stepsInOrder(schema).flatMap((step) => validateStep(schema, step.sequence, data))
}

// ───────────────────────────────────────────────── stepper state (M1-R02)

export interface StepperState {
  currentStep: number
  totalSteps: number
  lastCompletedStep: number
  canGoNext: boolean
  canGoBack: boolean
  canSubmit: boolean
}

/**
 * Where the applicant is, and what they may do from here.
 *
 * `lastCompletedStep` is persisted, so a draft resumes where it was left — the
 * requirement M1-R03 actually asks for. Forward navigation is capped at one
 * step past the furthest completed, which stops someone jumping to the final
 * step and submitting past the validation in between.
 */
export function stepperState(
  schema: FormSchema,
  requestedStep: number,
  lastCompletedStep: number,
): StepperState {
  const totalSteps = schema.steps.length
  const furthestAllowed = Math.min(lastCompletedStep + 1, totalSteps)
  const currentStep = Math.max(1, Math.min(requestedStep, furthestAllowed))

  return {
    currentStep,
    totalSteps,
    lastCompletedStep,
    canGoNext: currentStep < totalSteps,
    canGoBack: currentStep > 1,
    canSubmit: lastCompletedStep >= totalSteps,
  }
}

/** Where a saved draft reopens. */
export function resumeStep(schema: FormSchema, lastCompletedStep: number): number {
  return Math.min(lastCompletedStep + 1, schema.steps.length)
}
