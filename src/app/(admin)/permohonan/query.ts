import 'server-only'

import { type ApplicationRowData, BASELINE_APPLICATIONS } from './baseline'

import { withUser } from '../../../lib/db/scoped'
import type { TableSchema } from '../../../lib/table/types'

export const applicationTableSchema: TableSchema<ApplicationRowData> = {
  code: 'PERMOHONAN_LIST',
  columns: [
    {
      key: 'referenceNo',
      labelMs: 'No. Rujukan',
      labelEn: 'Reference No.',
      kind: 'text',
      sortable: true,
      searchable: true,
    },
    {
      key: 'applicantName',
      labelMs: 'Pemohon / Syarikat',
      labelEn: 'Applicant / Company',
      kind: 'text',
      sortable: true,
      searchable: true,
    },
    {
      key: 'serviceTypeMs',
      labelMs: 'Jenis Permohonan',
      labelEn: 'Application Type',
      kind: 'text',
      sortable: true,
    },
    {
      key: 'submittedDate',
      labelMs: 'Tarikh Hantar',
      labelEn: 'Submission Date',
      kind: 'date',
      sortable: true,
    },
    {
      key: 'status',
      labelMs: 'Status',
      labelEn: 'Status',
      kind: 'badge',
      sortable: true,
    },
  ],
  defaultSort: {
    column: 'submittedDate',
    direction: 'desc',
  },
  dateColumn: 'submittedDate',
  defaultPageSize: 10,
  maxPageSize: 100,
}

export interface ApplicationListFilter {
  search?: string
  year?: string
  quarter?: string
  status?: string
  startDate?: string
  endDate?: string
}

/**
 * Queries applications using withUser() to enforce RLS scope (G5).
 */
export async function queryApplications(
  userId: bigint | string,
  filter?: ApplicationListFilter,
): Promise<ApplicationRowData[]> {
  const uid = typeof userId === 'string' ? BigInt(userId) : userId

  return withUser(uid, async () => {
    const list = BASELINE_APPLICATIONS

    if (!filter) return list

    return list.filter((row) => {
      if (filter.search) {
        const q = filter.search.toLowerCase()
        if (
          !row.referenceNo.toLowerCase().includes(q) &&
          !row.applicantName.toLowerCase().includes(q) &&
          !row.companyName.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (filter.year && filter.year !== 'all' && row.year !== filter.year) {
        return false
      }
      if (filter.quarter && filter.quarter !== 'all' && row.quarter !== filter.quarter) {
        return false
      }
      if (filter.status && filter.status !== 'all' && row.status !== filter.status) {
        return false
      }
      if (filter.startDate && row.submittedDate < filter.startDate) {
        return false
      }
      if (filter.endDate && row.submittedDate > filter.endDate) {
        return false
      }
      return true
    })
  })
}

export { type ApplicationRowData, BASELINE_APPLICATIONS }
