import 'server-only'

import { type CircularRecord, BASELINE_CIRCULARS } from './baseline'

import { withUser } from '../../../lib/db/scoped'
import type { Prisma } from '@prisma/client'

export interface CircularQueryFilter {
  search?: string
  category?: string
  year?: number
}

export function buildCircularWhere(
  filter?: CircularQueryFilter,
): Prisma.DocumentTemplateWhereInput {
  const where: Prisma.DocumentTemplateWhereInput = {
    active: true,
    deletedAt: null,
  }

  if (filter?.search) {
    where.OR = [
      { code: { contains: filter.search } },
      // eslint-disable-next-line kawalselia/require-bilingual -- Prisma single-column search clause
      { nameMs: { contains: filter.search } },
      // eslint-disable-next-line kawalselia/require-bilingual -- Prisma single-column search clause
      { nameEn: { contains: filter.search } },
    ]
  }

  if (filter?.category && filter.category !== 'all') {
    where.type = filter.category
  }

  return where
}

export function shapeCircularRecord(d: {
  id: bigint
  code: string
  nameMs: string
  nameEn: string
  type: string
  createdAt: Date
}): CircularRecord {
  return {
    id: String(d.id),
    refNo: d.code,
    titleMs: d.nameMs,
    titleEn: d.nameEn,
    categoryMs: d.type === 'pekeliling' ? 'Pekeliling Pelabuhan' : 'Notis & Peraturan',
    categoryEn: d.type === 'pekeliling' ? 'Port Circular' : 'Notice & Regulations',
    publishDate: d.createdAt.toISOString().slice(0, 10),
    fileSize: '1.5 MB (PDF)',
  }
}

/**
 * RLS-scoped query for circulars, notices, and port regulations (M4, GP-17).
 * Every query runs through withUser() to ensure tenant and permission scoping (G5).
 */
export async function queryCirculars(
  userId: bigint | string,
  filter?: CircularQueryFilter,
): Promise<CircularRecord[]> {
  const uid = typeof userId === 'string' ? BigInt(userId) : userId

  return withUser(uid, async (tx) => {
    const where = buildCircularWhere(filter)

    const docs = await tx.documentTemplate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    if (docs.length > 0) {
      return docs.map(shapeCircularRecord)
    }

    return BASELINE_CIRCULARS
  })
}

export { type CircularRecord, BASELINE_CIRCULARS }
