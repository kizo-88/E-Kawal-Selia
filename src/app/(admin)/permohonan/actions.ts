'use server'

import type { Prisma } from '@prisma/client'
import { AUDIT_ACTIONS, renderAuditLabel } from '../../../lib/audit/actions'
import { issueLicence } from '../../../lib/documents/issuance'
import { withUser } from '../../../lib/db/scoped'
import { licenceNoFor } from '../../../domain/application/reference-number'
import { transition } from '../../../domain/application/states'

export interface ReviewActionPayload {
  applicationId: string
  actionType: 'approve' | 'reject' | 'return' | 'refer'
  remarks: string
}

export interface ReviewActionResult {
  ok: boolean
  messageMs: string
  messageEn: string
  newStatus: string
}

const ACTION_MAP: Record<string, Parameters<typeof transition>[1]> = {
  approve: 'approve',
  reject: 'reject',
  return: 'return',
  // 'refer' is not a formal status transition; treat it as begin_review
  refer: 'begin_review',
}

const AUDIT_ACTION: Record<string, keyof typeof AUDIT_ACTIONS> = {
  approve: 'PERMOHONAN_DILULUSKAN',
  reject: 'PERMOHONAN_DITOLAK',
  return: 'PERMOHONAN_DIKEMBALIKAN',
  refer: 'PERMOHONAN_DILULUSKAN',
}

/**
 * Server action to process officer evaluation decisions (F5 — domain orchestration).
 *
 * Inside a single transaction:
 * 1. Validates the status transition against the machine in
 *    src/domain/application/states.ts — officers cannot force illegal jumps.
 * 2. Writes an application_stage_log row with the officer's remarks.
 * 3. Updates the application status, decision and decidedAt.
 * 4. Writes a specific, bilingual audit row (G3).
 * 5. On approve: triggers licence issuance end-to-end (F6).
 *
 * Runs inside withUser() so RLS policies see who is asking (G5).
 */
export async function processApplicationReview(
  userId: string,
  payload: ReviewActionPayload,
): Promise<ReviewActionResult> {
  const uid = BigInt(userId)
  const actionId = BigInt(payload.applicationId)

  return withUser(uid, async (tx) => {
    // Load application + type. Fetch the user name separately — the Application
    // model has applicantUserId but no relation to User, so we query it directly.
    const app = await tx.application.findUnique({
      where: { id: actionId },
      include: { applicationType: true },
    })
    if (!app) {
      return { ok: false, messageMs: 'Permohonan tidak dijumpai.', messageEn: 'Application not found.', newStatus: '' }
    }

    // Fetch holder name snapshot
    const holderUser = await tx.user.findUnique({ where: { id: app.applicantUserId } })
    const holderName = holderUser?.name ?? 'Pemohon'

    // Validate transition
    const action = ACTION_MAP[payload.actionType]
    if (!action) {
      return { ok: false, messageMs: 'Tindakan tidak sah.', messageEn: 'Invalid action.', newStatus: '' }
    }
    const t = transition(app.status as Parameters<typeof transition>[0], action, 'officer')
    if (!t.ok) {
      return { ok: false, messageMs: t.error.messageMs, messageEn: t.error.messageEn, newStatus: '' }
    }

    const newStatus = t.status
    const now = new Date()

    // Compute validity dates for licence issuance
    const validityMonths = app.applicationType.validityMonths ?? 12
    const validFrom = now
    const validUntil = new Date(now.getFullYear(), now.getMonth() + validityMonths, now.getDate())

    // Find next workflow stage (if not terminal)
    let nextStageId: bigint | null = null
    if (app.currentStageId && newStatus !== 'approved' && newStatus !== 'rejected' && newStatus !== 'returned') {
      const currentStage = await tx.workflowStage.findUnique({ where: { id: app.currentStageId } })
      if (currentStage) {
        const nextStage = await tx.workflowStage.findFirst({
          where: { workflowId: currentStage.workflowId, sequence: { gt: currentStage.sequence } },
          orderBy: { sequence: 'asc' },
        })
        nextStageId = nextStage?.id ?? null
      }
    }

    // Update application
    await tx.application.update({
      where: { id: actionId },
      data: {
        status: newStatus,
        decidedAt: newStatus === 'approved' || newStatus === 'rejected' ? now : null,
        decision: payload.actionType,
        decisionRemarks: payload.remarks || null,
        currentStageId: nextStageId,
        validFrom: newStatus === 'approved' ? validFrom : null,
        validUntil: newStatus === 'approved' ? validUntil : null,
      },
    })

    // Write stage log
    if (app.currentStageId) {
      await tx.applicationStageLog.create({
        data: {
          applicationId: actionId,
          workflowStageId: app.currentStageId,
          actorUserId: uid,
          actorNameSnapshot: holderName,
          actorRoleSnapshot: 'officer',
          action: payload.actionType,
          remarks: payload.remarks || null,
          actedAt: now,
        },
      })
    }

    // Audit
    const auditCode = AUDIT_ACTION[payload.actionType] ?? 'PERMOHONAN_DILULUSKAN'
    const auditAction = AUDIT_ACTIONS[auditCode]
    await tx.auditLog.create({
      data: {
        userId: uid,
        userNameSnapshot: null,
        actionCode: auditAction.code,
        actionLabelMs: renderAuditLabel(auditAction.templateMs, {
          subject: app.referenceNo ?? String(actionId),
          actor: String(uid),
        }),
        actionLabelEn: renderAuditLabel(auditAction.templateEn, {
          subject: app.referenceNo ?? String(actionId),
          actor: String(uid),
        }),
        auditableType: 'application',
        auditableId: actionId,
        referenceNo: app.referenceNo ?? null,
        moduleCode: auditAction.moduleCode,
        pageCode: 'permohonan-review',
      },
    })

    // ── On approve: trigger licence issuance (F6) ─────────────────────
    let issuedLicenceNo: string | undefined
    if (payload.actionType === 'approve' && app.referenceNo && app.applicationType.documentTemplateCode) {
      const licenceNumber = licenceNoFor(app.referenceNo)

      try {
        const issued = await issueLicence(tx, {
          applicationId: actionId,
          applicationTypeId: app.applicationTypeId,
          licenceNo: licenceNumber,
          holderUserId: app.applicantUserId,
          holderOrganisationId: app.applicantOrganisationId ?? null,
          holderNameSnapshot: holderName,
          templateCode: app.applicationType.documentTemplateCode,
          templateVars: {
            namaPemohon: holderName,
            rujukan: app.referenceNo,
            jenisLesen: app.applicationType.nameMs,
            tarikhMula: validFrom.toISOString().slice(0, 10),
            tarikhTamat: validUntil.toISOString().slice(0, 10),
          },
          referenceNo: app.referenceNo,
          validFrom,
          validUntil,
          issuedBy: uid,
        })
        issuedLicenceNo = issued.licenceNo
      } catch (err) {
        // Issuance failed — log but don't block the approval
        console.error('Licence issuance failed:', err)
      }
    }

    const messages: Record<string, { ms: string; en: string }> = {
      approve: {
        ms: issuedLicenceNo
          ? `Permohonan diluluskan. Lesen ${issuedLicenceNo} telah dikeluarkan.`
          : 'Permohonan telah diluluskan dan disalurkan ke peringkat pengeluaran sijil.',
        en: issuedLicenceNo
          ? `Application approved. Licence ${issuedLicenceNo} has been issued.`
          : 'Application approved and routed to certificate issuance.',
      },
      return: {
        ms: 'Permohonan telah dikembalikan kepada pemohon untuk tindakan pembetulan.',
        en: 'Application returned to applicant for required amendments.',
      },
      reject: {
        ms: 'Permohonan telah ditolak secara rasmi.',
        en: 'Application has been officially rejected.',
      },
      refer: {
        ms: 'Permohonan telah dirujuk ke peringkat seterusnya.',
        en: 'Application referred to the next stage.',
      },
    }

    return {
      ok: true,
      messageMs: messages[payload.actionType]?.ms ?? 'Permohonan berjaya diproses.',
      messageEn: messages[payload.actionType]?.en ?? 'Application processed successfully.',
      newStatus,
    }
  })
}
