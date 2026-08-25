export interface LicencesSummaryItem {
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

export const FIXTURE_LICENCES_LIST: LicencesSummaryItem[] = [
  {
    id: 'lic-1',
    licenceNo: 'LPK/LPS/2026/00142',
    categoryMs: 'Lesen Perkhidmatan Sokongan (Pembekal Marin)',
    categoryEn: 'Support Service Licence (Marine Chandling)',
    holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
    issueDate: '01 Jan 2026',
    expiryDate: '31 Dis 2026',
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
    issueDate: '15 Jun 2026',
    expiryDate: '14 Sep 2026',
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
    issueDate: '01 Feb 2025',
    expiryDate: '31 Jan 2026',
    qrToken: '1122334455667788',
    status: 'expired',
    statusLabelMs: 'Tamat Tempoh',
    statusLabelEn: 'Expired',
  },
]
