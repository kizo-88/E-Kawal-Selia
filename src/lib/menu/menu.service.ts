/**
 * Menu registry — the database-backed resolver (GP-01).
 *
 * Fetches the flattened menu and the calling user's roles, then hands both to
 * the pure `buildMenuTree` in menu-pure.ts. Keeping the database access here
 * means the visibility rules stay testable without a connection.
 *
 * Visibility is deliberately separate from permission (see GP-01 and the note
 * in menu-pure.ts): this resolver only decides what the user *sees*, not what
 * they are *allowed* to do once they click through.
 */

import type { Locale } from '@/lib/config/lookups'
import { prisma } from '@/lib/db'

import { buildMenuTree, type MenuNode, type MenuSourceItem } from './menu-pure'

/**
 * The menu the given user can see, as a tree.
 *
 * `@userId` is the signed-in user; their roles (active, non-archived only) are
 * read to decide visibility. `locale` chooses the label language (G4).
 */
export async function resolveMenuForUser(
  userId: bigint,
  locale: Locale = 'ms',
): Promise<MenuNode[]> {
  const memberships = await prisma.userRole.findMany({
    where: { userId, role: { active: true, deletedAt: null } },
    select: { roleId: true },
  })
  const userRoleIds = memberships.map((m) => m.roleId)

  const rows = await prisma.menuItem.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { code: 'asc' }],
    include: { roles: { select: { roleId: true } } },
  })

  const items: MenuSourceItem[] = rows.map((row) => ({
    id: row.id,
    parentId: row.parentId,
    code: row.code,
    labelMs: row.labelMs,
    labelEn: row.labelEn,
    route: row.route,
    icon: row.icon,
    sortOrder: row.sortOrder,
    active: row.active,
    roleIds: row.roles.map((r) => r.roleId),
  }))

  return buildMenuTree(items, userRoleIds, locale)
}
