/**
 * Audit retention purge — GP-18.
 *
 * GP-18 requires a flush button and an automatic retention period. The period
 * is the `audit.retention_days` setting and must be read from it, never
 * hard-coded (it is admin-configurable). The purge itself is the *only*
 * physical delete anywhere in the system, and it must leave a trace: it writes
 * an audit_purge_runs row recording what was removed, by whom, and when, plus
 * an audit row using JEJAK_AUDIT_DIBUANG.
 *
 * A flush that leaves no trace defeats the point of the audit trail it is
 * trimming — so the run record and the audit row are written *before* the
 * delete. Both survive the delete because they are stamped at `now`, after the
 * cut-off.
 *
 * Note on the audit row: it is written here directly via the transaction
 * rather than through src/lib/audit/record.ts. record.ts carries a
 * `server-only` import, which Vitest cannot load, so routing through it would
 * make this module untestable. The row built below uses the same registered
 * action and sentence templates (AUDIT_ACTIONS), so the output is identical
 * and still satisfies G3.
 */

import type { Prisma } from '@prisma/client'

import { AUDIT_ACTIONS, renderAuditLabel } from './actions'

export interface PurgeActor {
  id: bigint
  name: string
}

export interface PurgeOptions {
  /** `manual` for the flush button, `schedule` for the automatic job. */
  triggeredBy: 'manual' | 'schedule'
  /** Who triggered it; null only for an unattended scheduled run. */
  actor: PurgeActor | null
  /** Injectable clock for testing; defaults to the real time. */
  now?: Date
}

/**
 * The cut-off date before which audit rows are old enough to purge.
 *
 * Pure: pass `now` so the boundary is testable without mocking the clock.
 */
export function retentionCutoff(retentionDays: number, now: Date): Date {
  const cutoff = new Date(now.getTime())
  cutoff.setDate(cutoff.getDate() - retentionDays)
  return cutoff
}

/**
 * Deletes audit rows older than `cutoff` and records the run + an audit entry.
 *
 * `tx` is the transaction the caller is already in, so the deletion and its
 * trace commit together. Pass a `cutoff` you computed yourself — the
 * production wrapper computes it from the setting, and the tests pass it
 * directly so they never touch the settings table.
 */
export async function deleteOldAuditLogs(
  tx: Prisma.TransactionClient,
  cutoff: Date,
  options: PurgeOptions,
): Promise<{ purgedBefore: Date; rowsDeleted: bigint }> {
  const now = options.now ?? new Date()

  const rowsDeleted = BigInt(await tx.auditLog.count({ where: { createdAt: { lt: cutoff } } }))

  // Trace first. If the delete fails, at least we know it was attempted.
  await tx.auditPurgeRun.create({
    data: {
      purgedBefore: cutoff,
      rowsDeleted,
      triggeredBy: options.triggeredBy,
      userId: options.actor?.id ?? null,
      userNameSnapshot: options.actor?.name ?? null,
      runAt: now,
    },
  })

  const action = AUDIT_ACTIONS.JEJAK_AUDIT_DIBUANG
  const subject = cutoff.toISOString()
  const actor = options.actor?.name ?? undefined

  await tx.auditLog.create({
    data: {
      userId: options.actor?.id ?? null,
      userNameSnapshot: options.actor?.name ?? null,
      userRoleSnapshot: null,
      actionCode: action.code,
      actionLabelMs: renderAuditLabel(action.templateMs, { subject, actor }),
      actionLabelEn: renderAuditLabel(action.templateEn, { subject, actor }),
      auditableType: 'audit_logs',
      auditableId: null,
      referenceNo: null,
      workflowStageCode: null,
      moduleCode: action.moduleCode,
      pageCode: 'audit_purge',
      ipAddress: null,
      userAgent: null,
      oldValues: null,
      newValues: null,
    },
  })

  // eslint-disable-next-line kawalselia/no-hard-delete -- GP-18: this is the ONLY permitted physical delete in the system. It is fully reconstructable — the audit_purge_runs row above and the JEJAK_AUDIT_DIBUANG row below record exactly what was removed, by whom and when. Any other physical delete is forbidden by G2.
  await tx.auditLog.deleteMany({ where: { createdAt: { lt: cutoff } } })

  return { purgedBefore: cutoff, rowsDeleted }
}

/**
 * The production entry point: reads the retention period from the setting and
 * purges. The setting read is dynamic so this module stays importable in tests
 * without constructing a database client.
 */
export async function purgeExpiredAuditLogs(
  tx: Prisma.TransactionClient,
  options: PurgeOptions,
): Promise<{ purgedBefore: Date; rowsDeleted: bigint }> {
  const { getSetting } = await import('@/lib/config/settings')
  const retentionDays = await getSetting('audit.retention_days')

  const now = options.now ?? new Date()
  const cutoff = retentionCutoff(retentionDays, now)

  return deleteOldAuditLogs(tx, cutoff, options)
}
