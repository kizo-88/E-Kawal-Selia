import { describe, expect, it } from 'vitest'

import { buildMenuTree, isItemGranted, type MenuSourceItem } from '../src/lib/menu/menu-pure'

/**
 * GP-01 — the menu tree resolver. Visibility is separate from permission, so
 * these tests drive buildMenuTree directly with framed item sets and never a
 * database. The key cases: role-gated items, the unrestricted default, orphan
 * suppression, ordering, and locale.
 */

const item = (over: Partial<MenuSourceItem> & Pick<MenuSourceItem, 'id' | 'code'>): MenuSourceItem => ({
  parentId: null,
  labelMs: over.code,
  labelEn: over.code,
  route: `/${over.code.toLowerCase()}`,
  icon: null,
  sortOrder: 0,
  active: true,
  roleIds: [],
  ...over,
})

describe('isItemGranted', () => {
  it('hides an item not granted to any of the user roles', () => {
    const it = item({ id: BigInt(1), code: 'A', roleIds: [BigInt(10)] })
    expect(isItemGranted(it, [BigInt(20)])).toBe(false)
  })

  it('shows an item granted to one of the user roles', () => {
    const it = item({ id: BigInt(1), code: 'A', roleIds: [BigInt(10)] })
    expect(isItemGranted(it, [BigInt(10)])).toBe(true)
  })

  it('treats an item with no role restriction as visible to all', () => {
    const it = item({ id: BigInt(1), code: 'A', roleIds: [] })
    expect(isItemGranted(it, [])).toBe(true)
  })
})

describe('buildMenuTree', () => {
  it('returns an empty tree when there are no items', () => {
    expect(buildMenuTree([], [])).toEqual([])
  })

  it('includes an active, granted root', () => {
    const items = [item({ id: BigInt(1), code: 'DASH', roleIds: [BigInt(5)] })]
    const tree = buildMenuTree(items, [BigInt(5)])
    expect(tree).toHaveLength(1)
    expect(tree[0].code).toBe('DASH')
  })

  it('excludes an item whose roles the user does not hold', () => {
    const items = [item({ id: BigInt(1), code: 'DASH', roleIds: [BigInt(5)] })]
    expect(buildMenuTree(items, [BigInt(9)])).toEqual([])
  })

  it('excludes an inactive item even when granted', () => {
    const items = [item({ id: BigInt(1), code: 'DASH', active: false, roleIds: [BigInt(5)] })]
    expect(buildMenuTree(items, [BigInt(5)])).toEqual([])
  })

  it('nests a granted child under its granted parent', () => {
    const items = [
      item({ id: BigInt(1), code: 'UTAMA', roleIds: [BigInt(5)] }),
      item({ id: BigInt(2), code: 'ANAK', parentId: BigInt(1), roleIds: [BigInt(5)] }),
    ]
    const tree = buildMenuTree(items, [BigInt(5)])
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(1)
    expect(tree[0].children[0].code).toBe('ANAK')
  })

  it('hides a child whose parent is not visible (no orphan links)', () => {
    const items = [
      item({ id: BigInt(1), code: 'UTAMA', roleIds: [BigInt(5)] }),
      item({ id: BigInt(2), code: 'ANAK', parentId: BigInt(1), roleIds: [BigInt(9)] }),
    ]
    const tree = buildMenuTree(items, [BigInt(5)])
    expect(tree).toHaveLength(1)
    expect(tree[0].children).toHaveLength(0)
  })

  it('shows an unrestricted item to a user with no roles at all', () => {
    const items = [item({ id: BigInt(1), code: 'DASH', roleIds: [] })]
    expect(buildMenuTree(items, []).map((n) => n.code)).toEqual(['DASH'])
  })

  it('orders siblings by sortOrder then code', () => {
    const items = [
      item({ id: BigInt(3), code: 'C', sortOrder: 0 }),
      item({ id: BigInt(1), code: 'A', sortOrder: 0 }),
      item({ id: BigInt(2), code: 'B', sortOrder: 1 }),
    ]
    const codes = buildMenuTree(items, []).map((n) => n.code)
    expect(codes).toEqual(['A', 'C', 'B'])
  })

  it('resolves the label in the requested locale (G4)', () => {
    const items = [
      item({ id: BigInt(1), code: 'DASH', labelMs: 'Papan Pemuka', labelEn: 'Dashboard' }),
    ]
    const ms = buildMenuTree(items, [], 'ms')[0]
    const en = buildMenuTree(items, [], 'en')[0]
    expect(ms.label).toBe('Papan Pemuka')
    expect(en.label).toBe('Dashboard')
    // Both languages are always carried, even when only one is shown.
    expect(ms.labelMs).toBe('Papan Pemuka')
    expect(ms.labelEn).toBe('Dashboard')
  })

  it('honours a multi-level chain where every ancestor is granted', () => {
    const items = [
      item({ id: BigInt(1), code: 'L1', roleIds: [BigInt(5)] }),
      item({ id: BigInt(2), code: 'L2', parentId: BigInt(1), roleIds: [BigInt(5)] }),
      item({ id: BigInt(3), code: 'L3', parentId: BigInt(2), roleIds: [BigInt(5)] }),
    ]
    const tree = buildMenuTree(items, [BigInt(5)])
    expect(tree[0].children[0].children[0].code).toBe('L3')
  })
})
