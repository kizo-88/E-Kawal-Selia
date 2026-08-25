export interface ApprovedActivity {
  id: string
  descriptionMs: string
  descriptionEn: string
}

export interface IssuedLicenceDetail {
  id: string
  licenceNo: string
  categoryMs: string
  categoryEn: string
  applicationRefNo: string
  holderName: string
  companyRegistrationNo: string
  registeredAddress: string
  authorizedRepresentative: string
  vesselName?: string
  operatingZoning: string
  approvedActivities: ApprovedActivity[]
  issueDate: string
  effectiveDate: string
  expiryDate: string
  qrToken: string
  digitalSignatureRef: string
  approvingAuthorityName: string
  approvingAuthorityDesignationMs: string
  approvingAuthorityDesignationEn: string
  status: 'active' | 'expiring' | 'expired'
  statusLabelMs: string
  statusLabelEn: string
}

export const FIXTURE_LICENCE_DETAIL: IssuedLicenceDetail = {
  id: 'lic-001',
  licenceNo: 'LPK/LPS/2026/00142',
  categoryMs: 'Lesen Perkhidmatan Sokongan Pelabuhan (Pembekal Marin)',
  categoryEn: 'Port Support Service Licence (Marine Chandling)',
  applicationRefNo: 'LPK/LPS/2026/00142',
  holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
  companyRegistrationNo: '202401012345 (123456-X)',
  registeredAddress: 'Tingkat 2, Bangunan Pentadbiran Pangkalan Bekalan Kemaman, 24007 Kemaman, Terengganu Darul Iman',
  authorizedRepresentative: 'En. Ahmad Zulkifli bin Hashim (KP: 850714-11-5431)',
  vesselName: 'MV Kemaman Pioneer (No. Pendaftaran: 334512)',
  operatingZoning: 'Zon Dermaga Teluk Kalong & Had Pelabuhan Kemaman',
  approvedActivities: [
    {
      id: 'act-1',
      descriptionMs: 'Pembekalan peralatan marin, provisyen kapal dan bahan makanan kering/basah',
      descriptionEn: 'Supply of marine equipment, vessel provisions and dry/wet foodstuffs',
    },
    {
      id: 'act-2',
      descriptionMs: 'Perkhidmatan bot sokongan dan bot penunda had pelabuhan',
      descriptionEn: 'Port limits support boat and tugboat operations',
    },
    {
      id: 'act-3',
      descriptionMs: 'Pengurusan sisa buangan marin mengikut Konvensyen MARPOL 73/78',
      descriptionEn: 'Marine waste disposal management per MARPOL 73/78 Convention',
    },
  ],

  issueDate: '01 Januari 2026',
  effectiveDate: '01 Januari 2026',
  expiryDate: '31 Disember 2026',
  qrToken: '7e28a9b1c3d4e5f6a7b8c9d0e1f2a3b4',
  digitalSignatureRef: 'LPKMN-DS-2026-00142-SECURE-SHA256',
  approvingAuthorityName: 'Dato’ Pengurus Besar',
  approvingAuthorityDesignationMs: 'Lembaga Pelabuhan Kemaman',
  approvingAuthorityDesignationEn: 'Kemaman Port Authority',
  status: 'active',
  statusLabelMs: 'Aktif & Sah Berkuat Kuasa',
  statusLabelEn: 'Active & Valid in Force',
}
