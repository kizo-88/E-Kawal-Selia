import type { Prisma } from '@prisma/client'
import { describe, expect, it } from 'vitest'

import { deleteOldAuditLogs, retentionCutoff, type PurgeOptions } from '../src/lib/audit/purge'

/**
 * GP-18 — the audit retention purge. The purge is the only physical delete in
 * the system, and it must leave a trace: an audit_purge_runs row plus a
 * JEJAK_AUDIT_DIBUANG audit entry, both written *before* the rows vanish.
 *
 * These tests drive the pure `retentionCutoff` and `deleteOldAuditLogs` with an
 * in-memory fake transaction, so no database or settings table is touched — the
 * real `record()` runs against the fake client and we inspect what it wrote.
 */

const NOW = new Date('2026-08-24T00:00:00.000Z')

function fakeTx() {
  const calls: {
    auditLogCreate: unknown[]
    auditPurgeRunCreate: unknown[]
    deleteMany: unknown[]
    count: number
  } = { auditLogCreate: [], auditPurgeRunCreate: [], deleteMany: [], count: 0 }

  const tx = {
    auditLog: {
      count: async () => calls.count,
      deleteMany: async (q: Prisma.AuditLogDeleteManyArgs) => {
        calls.deleteMany.push(q)
        return { count: calls.count }
      },
      create: async (q: Prisma.AuditLogCreateArgs) => {
        calls.auditLogCreate.push(q)
        return {} as never
      },
    },
    auditPurgeRun: {
      create: async (q: Prisma.AuditPurgeRunCreateArgs) => {
        calls.auditPurgeRunCreate.push(q)
        return {} as never
      },
    },
  } as unknown as Prisma.TransactionClient

  return { tx, calls }
}

const options: PurgeOptions = {
  triggeredBy: 'manual',
  actor: { id: BigInt(7), name: 'Ketua Unit M/T' },
  now: NOW,
}

describe('retentionCutoff', () => {
  it('subtracts the retention period from now', () => {
    const cutoff = retentionCutoff(1095, NOW)
    expect(cutoff.getTime()).toBe(NOW.getTime() - 1095 * 86_400_000)
  })

  it('does not mutate the input date', () => {
    const before = NOW.getTime()
    retentionCutoff(30, NOW)
    expect(NOW.getTime()).toBe(before)
  })
})

describe('deleteOldAuditLogs', () => {
  it('writes the purge run row before deleting', async () => {
    const { tx, calls } = fakeTx()
    calls.count = 42

    const result = await deleteOldAuditLogs(tx, retentionCutoff(365, NOW), options)

    expect(result.rowsDeleted).toBe(BigInt(42))
    expect(calls.auditPurgeRunCreate).toHaveLength(1)

    const run = calls.auditPurgeRunCreate[0] as { data: Record<string, unknown> }
    expect(run.data.rowsDeleted).toBe(BigInt(42))
    expect(run.data.triggeredBy).toBe('manual')
    expect(run.data.userNameSnapshot).toBe('Ketua Unit M/T')
    expect((run.data.purgedBefore as Date).getTime()).toBe(retentionCutoff(365, NOW).getTime())
  })

  it('writes a bilingual JEJAK_AUDIT_DIBUANG audit entry', async () => {
    const { tx, calls } = fakeTx()
    calls.count = 5

    await deleteOldAuditLogs(tx, retentionCutoff(365, NOW), options)

    expect(calls.auditLogCreate).toHaveLength(1)
    const entry = calls.auditLogCreate[0] as { data: Record<string, unknown> }
    expect(entry.data.actionCode).toBe('JEJAK_AUDIT_DIBUANG')

    const labelMs = entry.data.actionLabelMs as string
    const labelEn = entry.data.actionLabelEn as string
    expect(labelMs.length).toBeGreaterThan(0)
    expect(labelEn.length).toBeGreaterThan(0)
    expect(labelMs).not.toBe(labelEn)
    // The entry must name what was removed — the cut-off date, not a vague "update".
    expect(labelMs).toContain(retentionCutoff(365, NOW).toISOString())
  })

  it('deletes only rows older than the cut-off', async () => {
    const { tx, calls } = fakeTx()
    calls.count = 12

    const cutoff = retentionCutoff(180, NOW)
    await deleteOldAuditLogs(tx, cutoff, options)

    expect(calls.deleteMany).toHaveLength(1)
    const q = calls.deleteMany[0] as { where: { createdAt: { lt: Date } } }
    expect(q.where.createdAt.lt.getTime()).toBe(cutoff.getTime())
  })

  it('records an unattended scheduled run with a null actor', async () => {
    const { tx, calls } = fakeTx()
    calls.count = 0

    await deleteOldAuditLogs(tx, retentionCutoff(365, NOW), {
      triggeredBy: 'schedule',
      actor: null,
      now: NOW,
    })

    const run = calls.auditPurgeRunCreate[0] as { data: Record<string, unknown> }
    expect(run.data.triggeredBy).toBe('schedule')
    expect(run.data.userNameSnapshot).toBeNull()
  })
})
