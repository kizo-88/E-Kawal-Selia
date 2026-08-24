/**
 * RBAC — pure logic for the roles and permissions service (GP-01, GP-02).
 *
 * Decision functions only. None of these touch the database, so the whole
 * matrix of valid/invalid/forbidden cases is testable without a live
 * connection — following the pattern in src/lib/uploads/file-policy.ts.
 *
 * The things that *do* touch the database live in roles.service.ts and import
 * these. Keeping them apart means the rules below are provable, and means a
 * reviewer can read the policy without wading through Prisma calls.
 */

import type { FieldError, RoleDraft } from './types'

/**
 * Role codes are SCREAMING_SNAKE. The pattern is a code-style rule, not a
 * business list — it is checked here, not stored in lookup_values. An admin
 * invents new codes through the UI; the shape of a valid code is the only
 * constant.
 */
const CODE_PATTERN = /^[A-Z0-9_]+$/

/**
 * Validates a role draft before it is written.
 *
 * Returns every problem found, not just the first, so the admin form can show
 * all of them at once. Empty on success.
 */
export function validateRoleDraft(draft: RoleDraft): FieldError[] {
  const errors: FieldError[] = []

  if (!draft.code || draft.code.trim() === '') {
    errors.push({
      field: 'code',
      messageMs: 'Kod peranan tidak boleh dibiarkan kosong.',
      messageEn: 'The role code must not be empty.',
    })
  } else if (!CODE_PATTERN.test(draft.code)) {
    errors.push({
      field: 'code',
      messageMs: 'Kod peranan mesti menggunakan huruf besar, angka dan garis bawah sahaja (cth. PENTADBIR_SISTEM).',
      messageEn: 'The role code may contain only uppercase letters, digits and underscores (e.g. PENTADBIR_SISTEM).',
    })
  }

  if (!draft.nameMs || draft.nameMs.trim() === '') {
    errors.push({
      field: 'nameMs',
      messageMs: 'Nama peranan (Bahasa Melayu) tidak boleh dibiarkan kosong.',
      messageEn: 'The role name (Malay) must not be empty.',
    })
  }

  if (!draft.nameEn || draft.nameEn.trim() === '') {
    errors.push({
      field: 'nameEn',
      messageMs: 'Nama peranan (Inggeris) tidak boleh dibiarkan kosong.',
      messageEn: 'The role name (English) must not be empty.',
    })
  }

  return errors
}

/**
 * Whether a role may be archived (soft-deleted).
 *
 * System roles carry `is_system = true`; they are the five baseline levels the
 * platform depends on and must never disappear, or historical records that
 * reference them would point at nothing. This is a data flag, read off the
 * record — nothing here names the system roles, because GP-02 requires the set
 * to be open-ended.
 */
export function canArchiveRole(role: { isSystem: boolean }):
  | { ok: true }
  | { ok: false; reason: 'IS_SYSTEM'; reasonMs: string; reasonEn: string } {
  if (role.isSystem) {
    return {
      ok: false,
      reason: 'IS_SYSTEM',
      messageMs: 'Peranan sistem tidak boleh diarkibkan atau dipadam.',
      messageEn: 'A system role cannot be archived or deleted.',
    }
  }
  return { ok: true }
}

/**
 * The permission codes a set of roles grants.
 *
 * `grants` is the flattened role_permission relation; `roleIds` is the set of
 * roles the subject actually holds. The result is the de-duplicated union of
 * permission codes across those roles. Historical (archived/inactive) roles are
 * the caller's responsibility to exclude before calling this — see
 * roles.service.ts, which filters on `active` and `deletedAt`.
 */
export function computeRolePermissionCodes(
  grants: { roleId: bigint; permissionCode: string }[],
  roleIds: bigint[],
): Set<string> {
  const held = new Set(roleIds)
  const codes = new Set<string>()

  for (const grant of grants) {
    if (held.has(grant.roleId)) codes.add(grant.permissionCode)
  }

  return codes
}

/**
 * Whether a granted set satisfies a required permission.
 *
 * Permission codes are `module.resource.action`. A granted `*` grants
 * everything (the superuser escape hatch). A granted `module.*` (or
 * `module.resource.*`) grants everything beneath that prefix. This lets LPKmn
 * say "this role may do anything in permohonan" without listing every action.
 */
export function hasPermission(granted: Iterable<string>, required: string): boolean {
  for (const code of granted) {
    if (code === required) return true
    if (code === '*') return true
    if (code.endsWith('.*') && required.startsWith(code.slice(0, -1))) return true
  }
  return false
}
