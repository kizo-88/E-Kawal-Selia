import 'server-only'

import type { Prisma } from '@prisma/client'

import {
  AUDIT_ACTIONS,
  type AuditActionCode,
  type AuditTemplateValues,
  renderAuditLabel,
} from './actions'

/**
 * Writes one audit row — GP-18, X-R01, X-R02.
 *
 * There is no free-text variant of this function on purpose. `action` must be a
 * registered code, which means the wording was reviewed when the action was
 * added, and it means the `kawalselia/no-generic-audit-label` lint rule has a
 * fixed surface to guard.
 *
 * Pass the same `tx` the business operation is using. An audit row that commits
 * while the operation it describes rolls back is worse than no audit row.
 */

export interface AuditContext {
  /** Who acted. Null only for anonymous events, e.g. a public QR scan. */
  userId?: bigint | null
  /** ADR 0003: copied onto the row so it survives the user being deleted. */
  userName?: string | null
  userRole?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  /** Which screen the action was taken on. GP-18 asks for this explicitly. */
  pageCode?: string | null
}

export interface AuditEntry extends AuditTemplateValues {
  action: AuditActionCode
  context: AuditContext
  /** The record this is about, for filtering the audit report. */
  auditableType?: string
  auditableId?: bigint
  /** e.g. LPK/LPS/2026/00123 */
  referenceNo?: string
  workflowStageCode?: string
  /** Only for genuine field changes. Never put a password or token in here. */
  oldValues?: Prisma.InputJsonValue
  newValues?: Prisma.InputJsonValue
}

export async function record(tx: Prisma.TransactionClient, entry: AuditEntry): Promise<void> {
  const action = AUDIT_ACTIONS[entry.action]

  const values: AuditTemplateValues = {
    actor: entry.actor ?? entry.context.userName ?? undefined,
    subject: entry.subject,
    reference: entry.reference ?? entry.referenceNo,
    stage: entry.stage,
  }

  await tx.auditLog.create({
    data: {
      userId: entry.context.userId ?? null,
      userNameSnapshot: entry.context.userName ?? null,
      userRoleSnapshot: entry.context.userRole ?? null,

      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, values),
      actionLabelEn: renderAuditLabel(action.templateEn, values),

      auditableType: entry.auditableType ?? null,
      auditableId: entry.auditableId ?? null,
      referenceNo: entry.referenceNo ?? null,
      workflowStageCode: entry.workflowStageCode ?? null,
      moduleCode: action.moduleCode,
      pageCode: entry.context.pageCode ?? null,

      ipAddress: entry.context.ipAddress ?? null,
      userAgent: entry.context.userAgent ?? null,
      oldValues: entry.oldValues,
      newValues: entry.newValues,
    },
  })
}

export { redact } from './redact'
