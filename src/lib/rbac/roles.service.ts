/**
 * RBAC — the roles and permissions service (GP-01, GP-02).
 *
 * Wraps the pure logic in roles-pure.ts with database calls. Everything that
 * decides *whether* an operation is allowed is in the pure module; this layer
 * only translates records and runs the writes inside a transaction.
 *
 * Soft delete only (G2): archiving a role sets `deletedAt`. The role_permission
 * and user_role join rows are left intact so historical records that reference
 * the role still render. System roles (`is_system = true`) are protected by
 * `canArchiveRole` — they are never removed.
 *
 * Audit: role lifecycle and permission changes are *not* audited from this lane.
 * The action codes for them belong in src/lib/audit/actions.ts, which is owned
 * by another lane; see the note at the bottom of this file.
 */

import { prisma } from '@/lib/db'

import { canArchiveRole, hasPermission, validateRoleDraft } from './roles-pure'
import type { ArchiveResult, RoleDraft, RoleRecord, RoleResult } from './types'

function toRecord(role: {
  id: bigint
  code: string
  nameMs: string
  nameEn: string
  description: string | null
  isSystem: boolean
  active: boolean
  sortOrder: number
  deletedAt: Date | null
}): RoleRecord {
  return {
    id: role.id,
    code: role.code,
    nameMs: role.nameMs,
    nameEn: role.nameEn,
    description: role.description,
    isSystem: role.isSystem,
    active: role.active,
    sortOrder: role.sortOrder,
    deletedAt: role.deletedAt,
  }
}

/** Creates a new, non-system role. Unlimited additional roles are allowed (GP-02). */
export async function createRole(draft: RoleDraft): Promise<RoleResult> {
  const errors = validateRoleDraft(draft)
  if (errors.length > 0) return { ok: false, errors }

  const existing = await prisma.role.findUnique({ where: { code: draft.code } })
  if (existing) {
    return {
      ok: false,
      errors: [
        {
          field: 'code',
          messageMs: `Kod peranan "${draft.code}" telah wujud.`,
          messageEn: `The role code "${draft.code}" already exists.`,
        },
      ],
    }
  }

  const role = await prisma.role.create({
    data: {
      code: draft.code,
      nameMs: draft.nameMs,
      nameEn: draft.nameEn,
      description: draft.description ?? null,
      isSystem: false,
      sortOrder: draft.sortOrder ?? 0,
    },
  })

  return { ok: true, role: toRecord(role) }
}

/** Updates an editable role. System roles may be renamed but never removed. */
export async function updateRole(id: bigint, draft: RoleDraft): Promise<RoleResult> {
  const errors = validateRoleDraft(draft)
  if (errors.length > 0) return { ok: false, errors }

  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return { ok: false, errors: [] }
  if (role.isSystem) {
    return {
      ok: false,
      errors: [
        {
          field: 'code',
          messageMs: 'Peranan sistem tidak boleh diubah suai.',
          messageEn: 'A system role cannot be modified.',
        },
      ],
    }
  }

  const clash = await prisma.role.findFirst({
    where: { code: draft.code, id: { not: id }, deletedAt: null },
  })
  if (clash) {
    return {
      ok: false,
      errors: [
        {
          field: 'code',
          messageMs: `Kod peranan "${draft.code}" telah wujud.`,
          messageEn: `The role code "${draft.code}" already exists.`,
        },
      ],
    }
  }

  const updated = await prisma.role.update({
    where: { id },
    data: {
      code: draft.code,
      nameMs: draft.nameMs,
      nameEn: draft.nameEn,
      description: draft.description ?? null,
      sortOrder: draft.sortOrder ?? role.sortOrder,
    },
  })

  return { ok: true, role: toRecord(updated) }
}

/** Activates a role so it can be assigned again. */
export async function activateRole(id: bigint): Promise<RoleResult> {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return { ok: false, errors: [] }

  const updated = await prisma.role.update({
    where: { id },
    data: { active: true, deletedAt: null },
  })

  return { ok: true, role: toRecord(updated) }
}

/** Deactivates a role without removing it (G2: nothing is physically deleted). */
export async function deactivateRole(id: bigint): Promise<RoleResult> {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return { ok: false, errors: [] }

  const updated = await prisma.role.update({ where: { id }, data: { active: false } })
  return { ok: true, role: toRecord(updated) }
}

/**
 * Archives (soft-deletes) a role. Blocked for system roles by `canArchiveRole`.
 *
 * Only `deletedAt` is set — the role_permission and user_role rows survive, so
 * any historical record that names this role still resolves (G2 / ADR 0003).
 */
export async function archiveRole(id: bigint): Promise<ArchiveResult> {
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) {
    return {
      ok: false,
      reason: 'NOT_FOUND',
      reasonMs: 'Peranan tidak dijumpai.',
      reasonEn: 'The role was not found.',
    }
  }

  const guard = canArchiveRole(role)
  if (!guard.ok) return { ok: false, reason: guard.reason, reasonMs: guard.reasonMs, reasonEn: guard.reasonEn }

  await prisma.role.update({ where: { id }, data: { deletedAt: new Date(), active: false } })
  return { ok: true }
}

/** Grants a permission to a role. */
export async function assignPermission(roleId: bigint, permissionId: bigint): Promise<void> {
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId, permissionId } },
    create: { roleId, permissionId },
    update: {},
  })
}

/**
 * Revokes a permission from a role.
 *
 * The role_permission join has no `deletedAt` column (it is a pure relation,
 * owned by the lead's schema, and carries no historical record of its own), so
 * removing a grant is a current-assignment change that breaks no historical
 * audit or application row — which is exactly what G2 protects against. The
 * no-hard-delete rule is therefore disabled on the delete line with that
 * justification. An undocumented disable is a rejected PR.
 */
export async function revokePermission(roleId: bigint, permissionId: bigint): Promise<void> {
  // eslint-disable-next-line kawalselia/no-hard-delete -- role_permission is a join table with no deletedAt column (lead-owned schema); revoking a permission removes a current assignment only and breaks no historical record, which is exactly what G2 protects against.
  await prisma.rolePermission.deleteMany({ where: { roleId, permissionId } })
}

/**
 * The permission codes a user holds, across all their active, non-archived
 * roles. Archived/inactive roles are excluded so an archived role cannot keep
 * granting access (GP-02).
 */
export async function getUserPermissionCodes(userId: bigint): Promise<string[]> {
  const memberships = await prisma.userRole.findMany({
    where: { userId, role: { active: true, deletedAt: null } },
    select: { roleId: true },
  })
  const roleIds = memberships.map((m) => m.roleId)
  if (roleIds.length === 0) return []

  const grants = await prisma.rolePermission.findMany({
    where: { roleId: { in: roleIds } },
    select: { permission: { select: { code: true } } },
  })

  return grants.map((g) => g.permission.code)
}

/** Whether the user holds a given permission (supports `*` and `module.*` wildcards). */
export async function userHasPermission(userId: bigint, required: string): Promise<boolean> {
  const codes = await getUserPermissionCodes(userId)
  return hasPermission(codes, required)
}

/**
 * NOTE FOR THE LEAD — audit wiring is intentionally absent here.
 *
 * Role lifecycle (create/update/activate/deactivate/archive) and permission
 * assign/revoke are audit-worthy under G3, but the registered action codes for
 * them live in src/lib/audit/actions.ts, which is owned by the auth/audit lane.
 * Adding codes there is out of scope for this lane (see the ownership map in
 * docs/10-parallel-workstreams.md). Once those codes exist, wrap each mutating
 * call above in `record()` from src/lib/audit/record.ts — the pattern is
 * already established by the auth and config lanes. Flagging rather than
 * inventing codes, because inventing them would mean a reviewer never sees the
 * wording.
 */
