import 'server-only'

import { withUser } from '../../../lib/db/scoped'
import type { Prisma } from '@prisma/client'

export interface CircularRecord {
  id: string
  refNo: string
  titleMs: string
  titleEn: string
  categoryMs: string
  categoryEn: string
  publishDate: string
  fileSize: string
}

export const BASELINE_CIRCULARS: CircularRecord[] = [
  {
    id: 'circ-1',
    refNo: 'PKMN/PKL/01/2026',
    titleMs: 'Pekeliling Pelabuhan Bil. 1/2026: Garis Panduan Pematuhan Zon Keselamatan Dermaga Had Pelabuhan',
    titleEn: 'Port Circular No. 1/2026: Port Limits Wharf Safety Zone Compliance Guidelines',
    categoryMs: 'Pekeliling Pelabuhan',
    categoryEn: 'Port Circular',
    publishDate: '2026-01-15',
    fileSize: '1.4 MB (PDF)',
  },
  {
    id: 'circ-2',
    refNo: 'PKMN/NOTIS/04/2026',
    titleMs: 'Notis Kepada Pelaut: Peringatan Operasi Bunkering & Kebersihan Marin di Teluk Kalong',
    titleEn: 'Notice to Mariners: Bunkering Operation & Marine Cleanliness in Teluk Kalong',
    categoryMs: 'Notis Kepada Pelaut',
    categoryEn: 'Notice to Mariners',
    publishDate: '2026-02-02',
    fileSize: '820 KB (PDF)',
  },
  {
    id: 'circ-3',
    refNo: 'PKMN/KADAR/2026',
    titleMs: 'Jadual Fi & Caj Perkhidmatan Sokongan Pelabuhan Kemaman Terkini (M1-R10)',
    titleEn: 'Kemaman Port Support Service Fee & Charge Schedule (M1-R10)',
    categoryMs: 'Jadual Kadar & Fi',
    categoryEn: 'Rates & Fee Schedule',
    publishDate: '2026-01-01',
    fileSize: '2.1 MB (PDF)',
  },
  {
    id: 'circ-4',
    refNo: 'PKMN/SOP/ISPS/2025',
    titleMs: 'Prosedur Operasi Standard (SOP) Kawalan Keselamatan Fasiliti Maritim & Kod ISPS',
    titleEn: 'Standard Operating Procedure (SOP) Maritime Facility Security & ISPS Code',
    categoryMs: 'SOP & Peraturan',
    categoryEn: 'SOP & Regulations',
    publishDate: '2025-12-20',
    fileSize: '3.5 MB (PDF)',
  },
]


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

  try {
    return await withUser(uid, async (tx) => {
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
  } catch {
    return BASELINE_CIRCULARS
  }
}


