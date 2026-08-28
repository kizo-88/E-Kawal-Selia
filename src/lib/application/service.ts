/**
 * Application Lifecycle & Domain Orchestration Service (Round 7 / F5).
 *
 * Orchestrates application submission, workflow stage transitions, approval,
 * audit trail recording (G3), and automated licence issuance (F6) inside
 * a single transactional boundary (withUser).
 */

import type { Prisma } from '@prisma/client'
import {
  type Stage,
  type Actor,
  resolveTransition,
  slaDueAt,
  isSlaMet,
  firstStage,
} from '@/domain/application/workflow'
import {
  formatReferenceNo,
  nextSequence,
} from '@/domain/application/reference-number'
import { AUDIT_ACTIONS, renderAuditLabel } from '../audit/actions'
import { issueLicence } from '../documents/issuance'

export interface SubmitApplicationInput {
  userId: bigint
  organisationId?: bigint | null
  applicationTypeCode: string
  formData: Record<string, unknown>
  acceptedUndertaking: boolean
  undertakingVersionId?: bigint | null
  ipAddress?: string
  userAgent?: string
}

export interface SubmitApplicationResult {
  applicationId: bigint
  referenceNo: string
  status: string
  currentStageId: bigint | null
}

export interface ReviewStageInput {
  applicationId: bigint
  actor: Actor
  action: 'approve' | 'reject' | 'return' | 'refer'
  remarks?: string
  actingOfficerName?: string
  actingOfficerRole?: string
  actedAt?: Date
}

export interface ReviewStageResult {
  applicationId: bigint
  referenceNo: string
  newStatus: string
  newStageId: bigint | null
  issuedLicenceId?: bigint
  qrToken?: string
}

/**
 * Submits a new application inside a transaction.
 */
export async function submitApplication(
  tx: Prisma.TransactionClient,
  input: SubmitApplicationInput,
): Promise<SubmitApplicationResult> {
  const appType = await tx.applicationType.findUnique({
    where: { code: input.applicationTypeCode },
    include: {
      workflow: {
        include: {
          stages: {
            where: { deletedAt: null },
            orderBy: { sequence: 'asc' },
          },
        },
      },
    },
  })

  if (!appType) {
    throw new Error(`Application type '${input.applicationTypeCode}' not found.`)
  }

  // Generate official reference number
  const currentYear = new Date().getFullYear()
  const existingCount = await tx.application.count({
    where: { applicationTypeId: appType.id },
  })
  const seq = nextSequence(existingCount)
  const referenceNo = formatReferenceNo({
    typePrefix: appType.referencePrefix,
    year: currentYear,
    sequence: seq,
  })

  // Determine initial workflow stage
  const rawStages = appType.workflow?.stages ?? []
  const stages: Stage[] = rawStages.map((s) => ({
    id: s.id,
    sequence: s.sequence,
    code: s.code,
    nameMs: s.nameMs,
    nameEn: s.nameEn,
    actorRoleId: s.actorRoleId,
    actorInternalUnitId: s.actorInternalUnitId,
    actionType: s.actionType as Stage['actionType'],
    slaDays: s.slaDays,
    allowReturn: s.allowReturn,
    allowAmend: s.allowAmend,
    minApprovals: s.minApprovals,
    isFinal: s.isFinal,
    onApproveStatus: s.onApproveStatus,
    onRejectStatus: s.onRejectStatus,
  }))

  const initialStage = firstStage(stages)
  const now = new Date()

  // Create Application Row
  const application = await tx.application.create({
    data: {
      referenceNo,
      applicationTypeId: appType.id,
      applicantUserId: input.userId,
      applicantOrganisationId: input.organisationId ?? null,
      status: 'submitted',
      currentStageId: initialStage ? initialStage.id : null,
      submittedAt: now,
      formData: input.formData as Prisma.InputJsonValue,
      lastCompletedStep: 4,
    },
  })

  // Log Initial Stage in Stage Logs
  if (initialStage) {
    const dueAt = slaDueAt(initialStage, now)
    await tx.applicationStageLog.create({
      data: {
        applicationId: application.id,
        workflowStageId: initialStage.id,
        actorUserId: input.userId,
        action: 'submit',
        remarks: 'Permohonan dihantar oleh pemohon.',
        actedAt: now,
        slaDueAt: dueAt,
        slaMet: null,
      },
    })
  }

  // Record Audit Trail (G3)
  const auditAction = AUDIT_ACTIONS.DOKUMEN_DIJANA
  await tx.auditLog.create({
    data: {
      userId: input.userId,
      actionCode: auditAction.code,
      actionLabelMs: renderAuditLabel(auditAction.templateMs, {
        subject: appType.nameMs,
        reference: referenceNo,
        actor: String(input.userId),
      }),
      actionLabelEn: renderAuditLabel(auditAction.templateEn, {
        subject: appType.nameEn,
        reference: referenceNo,
        actor: String(input.userId),
      }),
      auditableType: 'application',
      auditableId: application.id,
      referenceNo,
      moduleCode: auditAction.moduleCode,
      pageCode: 'permohonan-baru',
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
  })

  return {
    applicationId: application.id,
    referenceNo,
    status: application.status,
    currentStageId: application.currentStageId,
  }
}

/**
 * Reviews and transitions an application stage inside a transaction.
 */
export async function reviewApplicationStage(
  tx: Prisma.TransactionClient,
  input: ReviewStageInput,
): Promise<ReviewStageResult> {
  const application = await tx.application.findUnique({
    where: { id: input.applicationId },
    include: {
      applicationType: {
        include: {
          workflow: {
            include: {
              stages: {
                where: { deletedAt: null },
                orderBy: { sequence: 'asc' },
              },
            },
          },
        },
      },
      stageLogs: {
        orderBy: { actedAt: 'desc' },
      },
    },
  })

  if (!application) {
    throw new Error(`Application with ID ${input.applicationId} not found.`)
  }

  if (!application.currentStageId) {
    throw new Error('Application does not have an active workflow stage.')
  }

  const rawStages = application.applicationType.workflow?.stages ?? []
  const stages: Stage[] = rawStages.map((s) => ({
    id: s.id,
    sequence: s.sequence,
    code: s.code,
    nameMs: s.nameMs,
    nameEn: s.nameEn,
    actorRoleId: s.actorRoleId,
    actorInternalUnitId: s.actorInternalUnitId,
    actionType: s.actionType as Stage['actionType'],
    slaDays: s.slaDays,
    allowReturn: s.allowReturn,
    allowAmend: s.allowAmend,
    minApprovals: s.minApprovals,
    isFinal: s.isFinal,
    onApproveStatus: s.onApproveStatus,
    onRejectStatus: s.onRejectStatus,
  }))

  const transitionRes = resolveTransition({
    stages,
    currentStageId: application.currentStageId,
    action: input.action,
    actor: input.actor,
    remarks: input.remarks,
  })

  if (!transitionRes.ok) {
    throw new Error(transitionRes.error.messageMs)
  }

  const outcome = transitionRes.outcome
  const actedAt = input.actedAt ?? new Date()
  let newStatus = application.status
  let newStageId: bigint | null = application.currentStageId
  let issuedLicenceId: bigint | undefined
  let qrToken: string | undefined

  const activeLog = application.stageLogs.find((l) => l.workflowStageId === application.currentStageId)
  const slaMetStatus = activeLog ? isSlaMet(activeLog.slaDueAt, actedAt) : null

  if (outcome.kind === 'advance') {
    newStageId = outcome.stage.id
    newStatus = 'in_review'

    const dueAt = slaDueAt(outcome.stage, actedAt)
    await tx.applicationStageLog.create({
      data: {
        applicationId: application.id,
        workflowStageId: outcome.stage.id,
        actorUserId: input.actor.userId,
        actorNameSnapshot: input.actingOfficerName ?? null,
        actorRoleSnapshot: input.actingOfficerRole ?? null,
        action: input.action,
        remarks: input.remarks ?? null,
        actedAt,
        slaDueAt: dueAt,
        slaMet: null,
      },
    })
  } else if (outcome.kind === 'complete') {
    newStatus = outcome.status
    newStageId = null

    // If approved, trigger licence issuance (F6)
    if (newStatus === 'approved') {
      const validFrom = actedAt
      const validUntil = new Date(actedAt.getTime() + 365 * 86_400_000)
      const licenceNo = `LPK/LIC/${new Date().getFullYear()}/${String(application.id).padStart(5, '0')}`

      const applicant = await tx.user.findUnique({
        where: { id: application.applicantUserId },
      })

      const issueRes = await issueLicence(tx, {
        applicationId: application.id,
        applicationTypeId: application.applicationTypeId,
        licenceNo,
        holderUserId: application.applicantUserId,
        holderOrganisationId: application.applicantOrganisationId,
        holderNameSnapshot: applicant?.name ?? 'Pemohon Berdaftar',
        templateCode: 'CERT_LICENCE_OFFICIAL',
        templateVars: {
          LICENCE_NO: licenceNo,
          HOLDER_NAME: applicant?.name ?? 'Pemohon Berdaftar',
          VALID_FROM: validFrom.toISOString().slice(0, 10),
          VALID_UNTIL: validUntil.toISOString().slice(0, 10),
        },
        referenceNo: application.referenceNo,
        validFrom,
        validUntil,
        issuedAt: actedAt,
        issuedBy: input.actor.userId,
      })

      issuedLicenceId = issueRes.licenceId
      qrToken = issueRes.qrToken
    }
  } else if (outcome.kind === 'returned') {
    newStatus = 'returned'
  }

  // Update application row
  await tx.application.update({
    where: { id: application.id },
    data: {
      status: newStatus,
      currentStageId: newStageId,
    },
  })

  // Append Stage Log Record
  await tx.applicationStageLog.create({
    data: {
      applicationId: application.id,
      workflowStageId: application.currentStageId,
      actorUserId: input.actor.userId,
      actorNameSnapshot: input.actingOfficerName ?? null,
      actorRoleSnapshot: input.actingOfficerRole ?? null,
      action: input.action,
      remarks: input.remarks ?? null,
      actedAt,
      slaMet: slaMetStatus,
    },
  })

  // Record Audit Trail (G3)
  const auditAction = AUDIT_ACTIONS.DOKUMEN_DIJANA
  await tx.auditLog.create({
    data: {
      userId: input.actor.userId,
      actionCode: auditAction.code,
      actionLabelMs: renderAuditLabel(auditAction.templateMs, {
        subject: application.referenceNo ?? `APP-${application.id}`,
        reference: application.referenceNo ?? '',
        actor: input.actingOfficerName ?? String(input.actor.userId),
      }),
      actionLabelEn: renderAuditLabel(auditAction.templateEn, {
        subject: application.referenceNo ?? `APP-${application.id}`,
        reference: application.referenceNo ?? '',
        actor: input.actingOfficerName ?? String(input.actor.userId),
      }),
      auditableType: 'application',
      auditableId: application.id,
      referenceNo: application.referenceNo ?? '',
      moduleCode: auditAction.moduleCode,
      pageCode: 'semakan',
    },
  })

  return {
    applicationId: application.id,
    referenceNo: application.referenceNo ?? '',
    newStatus,
    newStageId,
    issuedLicenceId,
    qrToken,
  }
}
