import { describe, expect, it } from 'vitest'

import {
  canArchiveRole,
  computeRolePermissionCodes,
  hasPermission,
  validateRoleDraft,
} from '../src/lib/rbac/roles-pure'

/**
 * GP-01 / GP-02 — the roles and permissions rules. These are the pure
 * decisions from src/lib/rbac/roles-pure.ts; every case below is reachable
 * without a database, so the matrix is actually covered rather than asserted
 * by a single happy path.
 */

describe('validateRoleDraft', () => {
  it('accepts a well-formed draft', () => {
    expect(
      validateRoleDraft({
        code: 'PENYEMAK_KES',
        nameMs: 'Penyemak Kes',
        nameEn: 'Case Reviewer',
      }),
    ).toEqual([])
  })

  it('rejects an empty code', () => {
    const errors = validateRoleDraft({ code: '', nameMs: 'X', nameEn: 'X' })
    expect(errors.some((e) => e.field === 'code')).toBe(true)
  })

  it('rejects a code with lowercase or spaces', () => {
    const errors = validateRoleDraft({ code: 'pegawai baru', nameMs: 'X', nameEn: 'X' })
    expect(errors.some((e) => e.field === 'code')).toBe(true)
  })

  it('rejects a missing Malay name', () => {
    const errors = validateRoleDraft({ code: 'PENTADBIR', nameMs: '', nameEn: 'Admin' })
    expect(errors.some((e) => e.field === 'nameMs')).toBe(true)
  })

  it('rejects a missing English name', () => {
    const errors = validateRoleDraft({ code: 'PENTADBIR', nameMs: 'Pentadbir', nameEn: '' })
    expect(errors.some((e) => e.field === 'nameEn')).toBe(true)
  })

  it('returns every problem at once, not just the first', () => {
    const errors = validateRoleDraft({ code: '', nameMs: '', nameEn: '' })
    expect(errors.length).toBeGreaterThanOrEqual(3)
  })

  it('gives every error a bilingual message (G4)', () => {
    const errors = validateRoleDraft({ code: '', nameMs: '', nameEn: '' })
    for (const error of errors) {
      expect(error.messageMs.length).toBeGreaterThan(0)
      expect(error.messageEn.length).toBeGreaterThan(0)
      expect(error.messageMs).not.toBe(error.messageEn)
    }
  })
})

describe('canArchiveRole', () => {
  it('blocks archiving a system role', () => {
    const result = canArchiveRole({ isSystem: true })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toBe('IS_SYSTEM')
      expect(result.reasonMs.length).toBeGreaterThan(0)
      expect(result.reasonEn.length).toBeGreaterThan(0)
    }
  })

  it('allows archiving a non-system role', () => {
    expect(canArchiveRole({ isSystem: false }).ok).toBe(true)
  })
})

describe('computeRolePermissionCodes', () => {
  const grants = [
    { roleId: BigInt(1), permissionCode: 'permohonan.lesen.approve' },
    { roleId: BigInt(1), permissionCode: 'permohonan.lesen.reject' },
    { roleId: BigInt(2), permissionCode: 'rujukan.read' },
  ]

  it('collects only the codes of roles the subject holds', () => {
    const codes = computeRolePermissionCodes(grants, [BigInt(1)])
    expect(codes).toEqual(new Set(['permohonan.lesen.approve', 'permohonan.lesen.reject']))
  })

  it('unions across multiple held roles and de-duplicates', () => {
    const withDup = [...grants, { roleId: BigInt(2), permissionCode: 'rujukan.read' }]
    const codes = computeRolePermissionCodes(withDup, [BigInt(1), BigInt(2)])
    expect(codes.size).toBe(3)
  })

  it('returns an empty set when the subject holds no relevant role', () => {
    expect(computeRolePermissionCodes(grants, [BigInt(99)]).size).toBe(0)
  })
})

describe('hasPermission', () => {
  it('matches an exact permission code', () => {
    expect(hasPermission(['permohonan.lesen.approve'], 'permohonan.lesen.approve')).toBe(true)
  })

  it('grants everything for the superuser wildcard', () => {
    expect(hasPermission(['*'], 'audit.purge')).toBe(true)
  })

  it('grants a module prefix with module.*', () => {
    expect(hasPermission(['permohonan.*'], 'permohonan.lesen.approve')).toBe(true)
    expect(hasPermission(['permohonan.*'], 'permohonan.permit.reject')).toBe(true)
  })

  it('does not leak across modules', () => {
    expect(hasPermission(['permohonan.*'], 'rujukan.read')).toBe(false)
  })

  it('does not match a partial prefix that is not dotted', () => {
    expect(hasPermission(['permohonan'], 'permohonan.lesen.approve')).toBe(false)
  })

  it('denies when the code is absent', () => {
    expect(hasPermission(['permohonan.lesen.approve'], 'permohonan.lesen.reject')).toBe(false)
  })
})
