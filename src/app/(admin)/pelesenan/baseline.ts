/**
 * Row shape and fallback data for this list.
 *
 * Deliberately separate from query.ts. The page is a client component, and
 * query.ts reaches the database through withUser -> prisma -> pg — Node-only
 * modules that cannot be bundled for the browser. Importing the constant from
 * query.ts pulled the whole driver into the client bundle and broke the build
 * with "Module not found: Can't resolve 'dns'".
 *
 * Anything both the server and the client need lives here. query.ts now carries
 * `import 'server-only'`, so the same mistake fails immediately and names
 * itself rather than surfacing as a missing Node builtin.
 */

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
