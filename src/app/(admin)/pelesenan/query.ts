import 'server-only'

import { type IssuedLicenceRow, BASELINE_LICENCES_DATA } from './baseline'

import { withUser } from '../../../lib/db/scoped'
import type { TableSchema } from '../../../lib/table/types'

export const licenceTableSchema: TableSchema<IssuedLicenceRow> = {
  code: 'LICENCES_LIST',
  columns: [
    {
      key: 'licenceNo',
      labelMs: 'No. Lesen',
      labelEn: 'Licence No.',
      kind: 'text',
      sortable: true,
      searchable: true,
    },
    {
      key: 'holderName',
      labelMs: 'Pemegang Lesen / Syarikat',
      labelEn: 'Licence Holder / Company',
      kind: 'text',
      sortable: true,
      searchable: true,
    },
    {
      key: 'categoryMs',
      labelMs: 'Kategori Pelesenan',
      labelEn: 'Licensing Category',
      kind: 'text',
      sortable: true,
    },
    {
      key: 'issueDate',
      labelMs: 'Tarikh Dikeluarkan',
      labelEn: 'Issue Date',
      kind: 'date',
      sortable: true,
    },
    {
      key: 'expiryDate',
      labelMs: 'Tarikh Tamat',
      labelEn: 'Expiry Date',
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
    column: 'issueDate',
    direction: 'desc',
  },
  dateColumn: 'issueDate',
  defaultPageSize: 10,
  maxPageSize: 100,
}

export async function queryIssuedLicences(
  userId: bigint | string,
  search?: string,
): Promise<IssuedLicenceRow[]> {
  const uid = typeof userId === 'string' ? BigInt(userId) : userId

  return withUser(uid, async () => {
    const list = BASELINE_LICENCES_DATA

    if (!search) return list

    const q = search.toLowerCase()
    return list.filter(
      (l) =>
        l.licenceNo.toLowerCase().includes(q) ||
        l.holderName.toLowerCase().includes(q) ||
        l.categoryMs.toLowerCase().includes(q) ||
        l.categoryEn.toLowerCase().includes(q),
    )

  })
}

export { type IssuedLicenceRow, BASELINE_LICENCES_DATA }
