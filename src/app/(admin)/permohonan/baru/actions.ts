'use server'

import { Prisma } from '@prisma/client'
import { AUDIT_ACTIONS, renderAuditLabel } from '../../../../lib/audit/actions'
import { withUser } from '../../../../lib/db/scoped'
import { validateSubmission } from '../../../../domain/application/form-schema'


import {
  ALLOCATE_REFERENCE_SQL,
  referenceLikePattern,
} from '../../../../domain/application/reference-number'
import { transition } from '../../../../domain/application/states'

export interface ApplicationDraftPayload {
  licenceType: string
  vesselName?: string
  portLocation: string
  scopeDescription: string
  completedStep: number
}

export interface ApplicationSubmitPayload extends ApplicationDraftPayload {
  acceptedUndertaking: boolean
}

export interface ApplicationActionResult {
  ok: boolean
  referenceNo?: string
  messageMs: string
  messageEn: string
}

/**
 * Server action to save application draft (M1-R03).
 * Creates or updates an Application row in 'draft' status — no reference number
 * is allocated until submission, so abandoned drafts do not burn sequence entries.
 */
export async function saveDraftApplication(
  userId: string,
  payload: ApplicationDraftPayload,
): Promise<ApplicationActionResult> {
  const uid = BigInt(userId)

  return withUser(uid, async (tx) => {
    const appType = await tx.applicationType.findUnique({
      where: { code: payload.licenceType, deletedAt: null, active: true },
    })
    if (!appType) {
      return { ok: false, messageMs: 'Jenis lesen tidak dijumpai.', messageEn: 'Licence type not found.' }
    }

    // For draft saves we don't validate — the applicant can save half-finished work
    const formData = JSON.stringify({
      vesselName: payload.vesselName ?? null,
      portLocation: payload.portLocation,
      scopeDescription: payload.scopeDescription,
    })

    // Upsert: create new draft or update existing one
    const existing = await tx.application.findFirst({
      where: { applicantUserId: uid, status: 'draft', applicationTypeId: appType.id },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      await tx.application.update({
        where: { id: existing.id },
        data: { formData: formData as unknown as Prisma.InputJsonValue, lastCompletedStep: payload.completedStep },
      })
    } else {
      await tx.application.create({
        data: {
          applicantUserId: uid,
          applicationTypeId: appType.id,
          status: 'draft' as const,
          formData: formData as unknown as Prisma.InputJsonValue,
          lastCompletedStep: payload.completedStep,
        },
      })
    }

    return {
      ok: true,
      messageMs: 'Draf permohonan berjaya disimpan.',
      messageEn: 'Application draft successfully saved.',
    }
  })
}

/**
 * Server action to officially submit an application (M1-R05).
 *
 * Allocates a reference number atomically inside the same transaction as the
 * INSERT, so two simultaneous submissions of the same type never collide. The
 * number is NULL while still a draft so abandoned drafts do not burn entries
 * out of the sequence.
 */
export async function submitApplication(
  userId: string,
  payload: ApplicationSubmitPayload,
): Promise<ApplicationActionResult> {
  const uid = BigInt(userId)

  if (!payload.acceptedUndertaking) {
    return {
      ok: false,
      messageMs: 'Persetujuan Surat Aku-Janji (GP-06) adalah mandatori sebelum menghantar.',
      messageEn: 'Undertaking acceptance (GP-06) is mandatory before submitting.',
    }
  }

  return withUser(uid, async (tx) => {
    const appType = await tx.applicationType.findUnique({
      where: { code: payload.licenceType, deletedAt: null, active: true },
    })
    if (!appType) {
      return { ok: false, messageMs: 'Jenis lesen tidak dijumpai.', messageEn: 'Licence type not found.' }
    }

    // Validate transition: draft → submitted
    const appCheck = await tx.application.findFirst({
      where: { applicantUserId: uid, status: 'draft', applicationTypeId: appType.id },
      orderBy: { createdAt: 'desc' },
    })
    const currentStatus = (appCheck?.status ?? 'draft') as Parameters<typeof transition>[0]
    const t = transition(currentStatus, 'submit', 'applicant')
    if (!t.ok) return { ok: false, messageMs: t.error.messageMs, messageEn: t.error.messageEn }

    // Validate full form data against the schema
    const formDataObj = {
      vesselName: payload.vesselName ?? null,
      portLocation: payload.portLocation,
      scopeDescription: payload.scopeDescription,
    }
    const formSchema = appType.formSchema as Record<string, unknown>
    const problems = validateSubmission(formSchema as never, formDataObj)
    if (problems.length > 0) {
      return { ok: false, messageMs: problems[0].messageMs, messageEn: problems[0].messageEn }
    }

    const formData = JSON.stringify(formDataObj)

    // Allocate reference number atomically
    const year = new Date().getFullYear()
    const pattern = referenceLikePattern(appType.referencePrefix, year)
    const [row] = await tx.$queryRawUnsafe(ALLOCATE_REFERENCE_SQL, pattern, 'LPK', appType.referencePrefix, String(year)) as Array<{ reference_no: string }>
    const referenceNo = row.reference_no

    // Determine first workflow stage
    let firstStageId: bigint | null = null
    if (appType.workflowId) {
      const firstStage = await tx.workflowStage.findFirst({
        where: { workflowId: appType.workflowId },
        orderBy: { sequence: 'asc' },
      })
      firstStageId = firstStage?.id ?? null
    }

    const created = await tx.application.create({
      data: {
        applicantUserId: uid,
        applicationTypeId: appType.id,
        referenceNo,
        status: 'submitted' as const,
        formData: formData as unknown as Prisma.InputJsonValue,
        lastCompletedStep: payload.completedStep,
        submittedAt: new Date(),
        currentStageId: firstStageId,
      },
    })

    // Audit
    const action = AUDIT_ACTIONS.PERMOHONAN_DIAJUKAN
    await tx.auditLog.create({
      data: {
        userId: uid,
        userNameSnapshot: null,
        actionCode: action.code,
        actionLabelMs: renderAuditLabel(action.templateMs, {
          subject: referenceNo,
          actor: String(uid),
        }),
        actionLabelEn: renderAuditLabel(action.templateEn, {
          subject: referenceNo,
          actor: String(uid),
        }),
        auditableType: 'application',
        auditableId: created.id,
        referenceNo,
        moduleCode: action.moduleCode,
        pageCode: 'permohonan-baru',
      },
    })

    return {
      ok: true,
      referenceNo,
      messageMs: `Permohonan anda berjaya didaftarkan dengan No. Rujukan: ${referenceNo}`,
      messageEn: `Your application has been registered with Reference No: ${referenceNo}`,
    }
  })
}
