export interface ApplicationListItem {
  id: string
  referenceNo: string
  applicantName: string
  companyName: string
  serviceTypeMs: string
  serviceTypeEn: string
  submittedDate: string
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: string
  status: 'approved' | 'in_review' | 'submitted' | 'rejected' | 'expiring' | 'expired'
  statusLabelMs: string
  statusLabelEn: string
}

export const FIXTURE_APPLICATIONS_LIST: ApplicationListItem[] = [
  {
    id: 'app-1',
    referenceNo: 'LPK/LPS/2026/00142',
    applicantName: 'En. Ahmad Zulkifli bin Hashim',
    companyName: 'Kemaman Supply Base Marine Services Sdn Bhd',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-08-20',
    quarter: 'Q3',
    year: '2026',
    status: 'approved',
    statusLabelMs: 'Diluluskan',
    statusLabelEn: 'Approved',
  },
  {
    id: 'app-2',
    referenceNo: 'LPK/PAP/2026/00088',
    applicantName: 'Cik Farah Nabilah',
    companyName: 'East Coast Marine Logistics Consortium',
    serviceTypeMs: 'Permit Aktiviti Pelabuhan',
    serviceTypeEn: 'Port Activity Permit',
    submittedDate: '2026-08-18',
    quarter: 'Q3',
    year: '2026',
    status: 'in_review',
    statusLabelMs: 'Dalam Semakan Teknikal',
    statusLabelEn: 'Technical Review',
  },
  {
    id: 'app-3',
    referenceNo: 'LPK/PDA2/2026/00019',
    applicantName: 'En. Kamaruddin Yusof',
    companyName: 'Offshore Energy Resources Sdn Bhd',
    serviceTypeMs: 'Surat Sokongan PDA2',
    serviceTypeEn: 'PDA2 Support Letter',
    submittedDate: '2026-08-15',
    quarter: 'Q3',
    year: '2026',
    status: 'submitted',
    statusLabelMs: 'Dihantar',
    statusLabelEn: 'Submitted',
  },
  {
    id: 'app-4',
    referenceNo: 'LPK/LPS/2026/00139',
    applicantName: 'En. Lee Wei Hong',
    companyName: 'Bintulu-Kemaman Bunker Suppliers Ltd',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-07-28',
    quarter: 'Q3',
    year: '2026',
    status: 'expiring',
    statusLabelMs: 'Tamat Tempoh < 30 Hari',
    statusLabelEn: 'Expiring Soon',
  },
  {
    id: 'app-5',
    referenceNo: 'LPK/PAP/2026/00065',
    applicantName: 'Ir. Tan Chee Keong',
    companyName: 'Segamat Maritime Engineering Works',
    serviceTypeMs: 'Permit Aktiviti Pelabuhan',
    serviceTypeEn: 'Port Activity Permit',
    submittedDate: '2026-06-12',
    quarter: 'Q2',
    year: '2026',
    status: 'approved',
    statusLabelMs: 'Diluluskan',
    statusLabelEn: 'Approved',
  },
  {
    id: 'app-6',
    referenceNo: 'LPK/LPS/2026/00091',
    applicantName: 'Kapt. Zainal Abidin',
    companyName: 'Perintis Malim & Navigasi Terengganu',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-05-04',
    quarter: 'Q2',
    year: '2026',
    status: 'rejected',
    statusLabelMs: 'Ditolak',
    statusLabelEn: 'Rejected',
  },
]
