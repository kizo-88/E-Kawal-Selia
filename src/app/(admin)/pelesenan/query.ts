import 'server-only'

import { withUser } from '../../../lib/db/scoped'
import type { TableSchema } from '../../../lib/table/types'

export interface IssuedLicenceRow {
  id: string
  licenceNo: string
  categoryMs: string
  categoryEn: string
  holderName: string
  issueDate: string
  expiryDate: string
  qrToken: string
  status: 'active' | 'expiring' | 'expired'
  statusLabelMs: string
  statusLabelEn: string
}

export const BASELINE_LICENCES_DATA: IssuedLicenceRow[] = [
  {
    id: 'lic-1',
    licenceNo: 'LPK/LPS/2026/00142',
    categoryMs: 'Lesen Perkhidmatan Sokongan (Pembekal Marin)',
    categoryEn: 'Support Service Licence (Marine Chandling)',
    holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
    issueDate: '2026-01-01',
    expiryDate: '2026-12-31',
    qrToken: '7e28a9b1c3d4e5f6',
    status: 'active',
    statusLabelMs: 'Aktif & Sah',
    statusLabelEn: 'Active & Valid',
  },
  {
    id: 'lic-2',
    licenceNo: 'LPK/PAP/2026/00065',
    categoryMs: 'Permit Aktiviti Pelabuhan (Kerja Kejuruteraan Laut)',
    categoryEn: 'Port Activity Permit (Marine Engineering)',
    holderName: 'Segamat Maritime Engineering Works',
    issueDate: '2026-06-15',
    expiryDate: '2026-09-14',
    qrToken: '3f4e5d6c7b8a9012',
    status: 'expiring',
    statusLabelMs: 'Tamat Tempoh < 30 Hari',
    statusLabelEn: 'Expiring Soon',
  },
  {
    id: 'lic-3',
    licenceNo: 'LPK/PDA2/2025/00099',
    categoryMs: 'Surat Sokongan PDA2 (Kontraktor Luar Pesisir)',
    categoryEn: 'PDA2 Support Letter (Offshore Contractor)',
    holderName: 'East Coast Petroleum Offshore Services',
    issueDate: '2025-02-01',
    expiryDate: '2026-01-31',
    qrToken: '1122334455667788',
    status: 'expired',
    statusLabelMs: 'Tamat Tempoh',
    statusLabelEn: 'Expired',
  },
]


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

  const filterLicences = () => {
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
  }

  try {
    return await withUser(uid, async () => {
      return filterLicences()
    })
  } catch {
    return filterLicences()
  }
}


