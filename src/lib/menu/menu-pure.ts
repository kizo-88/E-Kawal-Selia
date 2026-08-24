/**
 * Menu registry — the pure tree resolver (GP-01).
 *
 * GP-01 requires the menu to be role-aware, but deliberately *separate* from
 * the underlying permission: LPKmn can hide a menu item without revoking
 * anyone's access. So visibility is decided here purely from the item's own
 * `active` flag and the set of roles it was granted in `menu_item_role` — never
 * from whether the user could perform the action behind the link.
 *
 * This is the pure half: given the flattened menu items and the roles the user
 * holds, it returns the visible tree. No database, so every nesting and
 * visibility case is testable directly (see tests/menu.test.ts). The database
 * half that feeds it lives in menu.service.ts.
 */

import type { Locale } from '@/lib/config/lookups'

export interface MenuSourceItem {
  id: bigint
  parentId: bigint | null
  code: string
  labelMs: string
  labelEn: string
  route: string | null
  icon: string | null
  sortOrder: number
  /** GP-01: an item is visible to a role only if it was granted to that role. */
  active: boolean
  /** The role ids granted visibility to this item (from menu_item_role). */
  roleIds: bigint[]
}

export interface MenuNode {
  id: bigint
  code: string
  /** Resolved for the requested locale (G4). */
  label: string
  labelMs: string
  labelEn: string
  route: string | null
  icon: string | null
  children: MenuNode[]
}

const byLocale = (item: MenuSourceItem, locale: Locale): string =>
  locale === 'en' ? item.labelEn : item.labelMs

/**
 * Whether a user may see an item, given the roles they hold.
 *
 * An item with no `roleIds` at all is treated as unrestricted — visible to
 * every role. This is the safe default for GP-01: to *hide* an item LPKmn grants
 * it to specific roles, and the absence of any grant means "show to all"
 * rather than "show to none", which would silently vanish the whole menu the
 * moment a seed forgets a join row.
 */
export function isItemGranted(item: MenuSourceItem, userRoleIds: bigint[]): boolean {
  if (item.roleIds.length === 0) return true
  const held = new Set(userRoleIds)
  return item.roleIds.some((roleId) => held.has(roleId))
}

/**
 * Resolves the menu tree a given user can see.
 *
 * Rules:
 *  - only `active` items are candidates;
 *  - only items granted to one of `userRoleIds` are candidates;
 *  - an item whose parent is not visible is itself hidden (no orphan links);
 *  - siblings are ordered by `sortOrder`, then code.
 *
 * `locale` chooses the label language (G4). Phase 1 displays Malay.
 */
export function buildMenuTree(
  items: MenuSourceItem[],
  userRoleIds: bigint[],
  locale: Locale = 'ms',
): MenuNode[] {
  const byId = new Map<bigint, MenuSourceItem>(items.map((item) => [item.id, item]))

  // First pass: is this item a candidate on its own merits?
  const candidate = new Map<bigint, boolean>()
  for (const item of items) {
    candidate.set(item.id, item.active && isItemGranted(item, userRoleIds))
  }

  // An item is shown only if it is a candidate AND (it is a root OR its parent
  // is shown). Memoised because the tree may be more than two levels deep.
  const shown = new Map<bigint, boolean>()
  const isShown = (id: bigint): boolean => {
    const cached = shown.get(id)
    if (cached !== undefined) return cached

    const item = byId.get(id)
    if (!item) {
      shown.set(id, false)
      return false
    }

    let visible: boolean
    if (!candidate.get(id)) {
      visible = false
    } else if (item.parentId === null) {
      visible = true
    } else {
      visible = isShown(item.parentId)
    }

    shown.set(id, visible)
    return visible
  }

  for (const item of items) isShown(item.id)

  const toNode = (item: MenuSourceItem): MenuNode => ({
    id: item.id,
    code: item.code,
    label: byLocale(item, locale),
    labelMs: item.labelMs,
    labelEn: item.labelEn,
    route: item.route,
    icon: item.icon,
    children: [],
  })

  const nodes = new Map<bigint, MenuNode>()
  for (const item of items) {
    if (isShown(item.id)) nodes.set(item.id, toNode(item))
  }

  const roots: MenuNode[] = []
  for (const item of items) {
    const node = nodes.get(item.id)
    if (!node) continue
    if (item.parentId !== null && nodes.has(item.parentId)) {
      nodes.get(item.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (list: MenuNode[]): void => {
    list.sort((a, b) => {
      const orderA = items.find((i) => i.id === a.id)?.sortOrder ?? 0
      const orderB = items.find((i) => i.id === b.id)?.sortOrder ?? 0
      if (orderA !== orderB) return orderA - orderB
      return a.code.localeCompare(b.code)
    })
    for (const node of list) sortNodes(node.children)
  }
  sortNodes(roots)

  return roots
}
