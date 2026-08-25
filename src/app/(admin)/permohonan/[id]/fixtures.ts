export interface ApplicationDocument {
  id: string
  nameMs: string
  nameEn: string
  fileName: string
  fileSize: string
  mimeType: string
  uploadedAt: string
  verificationStatus: 'verified' | 'pending' | 'rejected'
  verificationStatusLabelMs: string
  verificationStatusLabelEn: string
}

export interface StageLogEntry {
  id: string
  stageCode: string
  stageNameMs: string
  stageNameEn: string
  officerName: string
  officerRoleMs: string
  officerRoleEn: string
  status: 'completed' | 'current' | 'pending'
  statusLabelMs: string
  statusLabelEn: string
  actionDate?: string
  remarksMs?: string
  remarksEn?: string
  slaDueAt: string
  slaMet: boolean
}

export interface ApplicationDetailData {
  id: string
  referenceNo: string
  typeCode: string
  typeNameMs: string
  typeNameEn: string
  applicantName: string
  companyName: string
  ssmNo: string
  email: string
  phone: string
  vesselName?: string
  portLocation: string
  scopeDescription: string
  submittedAt: string
  currentStatus: 'draft' | 'submitted' | 'in_review' | 'returned' | 'approved' | 'rejected' | 'expiring' | 'expired'
  currentStatusLabelMs: string
  currentStatusLabelEn: string
  currentStageCode: string
  currentStageNameMs: string
  currentStageNameEn: string
  documents: ApplicationDocument[]
  stageLogs: StageLogEntry[]
}

export const FIXTURE_APPLICATION_DETAIL: ApplicationDetailData = {
  id: 'app-001',
  referenceNo: 'LPK/LPS/2026/00142',
  typeCode: 'LESEN_SOKONGAN',
  typeNameMs: 'Lesen Perkhidmatan Sokongan Pelabuhan (Pembekal Marin)',
  typeNameEn: 'Port Support Service Licence (Marine Chandling)',
  applicantName: 'En. Ahmad Zulkifli bin Hashim',
  companyName: 'Kemaman Supply Base Marine Services Sdn Bhd',
  ssmNo: '202401012345 (123456-X)',
  email: 'ahmad.zulkifli@kemamansupply.com.my',
  phone: '+609-863 1590',
  vesselName: 'MV Kemaman Pioneer / Bot Penunda K1',
  portLocation: 'Dermaga Teluk Kalong & Dermaga Barat Had Pelabuhan Kemaman',
  scopeDescription: 'Membekal perkhidmatan logistik marin, pembekalan peralatan kapal, dan perkhidmatan sokongan teknikal maritim di dalam had pelabuhan Lembaga Pelabuhan Kemaman.',
  submittedAt: '18 Ogos 2026, 09:30 PG',
  currentStatus: 'in_review',
  currentStatusLabelMs: 'Dalam Semakan Teknikal Unit M/T',
  currentStatusLabelEn: 'Under Technical Review (M/T Unit)',
  currentStageCode: 'SEMAKAN_TEKNIKAL_MT',
  currentStageNameMs: 'Semakan Teknikal Pegawai Marin & Trafik',
  currentStageNameEn: 'Marine & Traffic Technical Review',
  documents: [
    {
      id: 'doc-1',
      nameMs: 'Sijil Pendaftaran SSM & Lesen Perniagaan PBT',
      nameEn: 'SSM Company Certificate & Council Business Licence',
      fileName: 'SSM_KemamanSupplyBase_2026.pdf',
      fileSize: '2.4 MB',
      mimeType: 'application/pdf',
      uploadedAt: '18 Ogos 2026',
      verificationStatus: 'verified',
      verificationStatusLabelMs: 'Disahkan Sah',
      verificationStatusLabelEn: 'Verified Valid',
    },
    {
      id: 'doc-2',
      nameMs: 'Polisi Insurans Tanggungan Awam (P&I / Third-Party)',
      nameEn: 'Public Liability & Marine Insurance Policy',
      fileName: 'Insurance_Policy_Marine_2026.pdf',
      fileSize: '4.1 MB',
      mimeType: 'application/pdf',
      uploadedAt: '18 Ogos 2026',
      verificationStatus: 'verified',
      verificationStatusLabelMs: 'Disahkan Sah',
      verificationStatusLabelEn: 'Verified Valid',
    },
    {
      id: 'doc-3',
      nameMs: 'Sijil Kelayakan Vesel & Juragan',
      nameEn: 'Vessel & Master Competency Certificate',
      fileName: 'Vessel_MVKemamanPioneer_Cert.pdf',
      fileSize: '1.8 MB',
      mimeType: 'application/pdf',
      uploadedAt: '18 Ogos 2026',
      verificationStatus: 'pending',
      verificationStatusLabelMs: 'Menunggu Semakan',
      verificationStatusLabelEn: 'Pending Verification',
    },
  ],
  stageLogs: [
    {
      id: 'log-1',
      stageCode: 'PERMOHONAN_DIHANTAR',
      stageNameMs: 'Penghantaran Permohonan oleh Pemohon',
      stageNameEn: 'Application Submission by Applicant',
      officerName: 'En. Ahmad Zulkifli (Pemohon)',
      officerRoleMs: 'Pemohon Syarikat',
      officerRoleEn: 'Company Applicant',
      status: 'completed',
      statusLabelMs: 'Selesai',
      statusLabelEn: 'Completed',
      actionDate: '18 Ogos 2026, 09:30 PG',
      remarksMs: 'Borang dan dokumen lengkap dihantar melalui portal e-Kawalselia.',
      remarksEn: 'Completed form and documents submitted via e-Kawalselia portal.',
      slaDueAt: '18 Ogos 2026',
      slaMet: true,
    },
    {
      id: 'log-2',
      stageCode: 'SEMAKAN_DOKUMEN_URUSSETIA',
      stageNameMs: 'Semakan Kelayakan & Dokumen Awal',
      stageNameEn: 'Initial Document & Eligibility Screening',
      officerName: 'Puan Siti Noraini (Urus Setia)',
      officerRoleMs: 'Pegawai Tadbir Pelesenan',
      officerRoleEn: 'Licensing Administrative Officer',
      status: 'completed',
      statusLabelMs: 'Selesai & Disokong',
      statusLabelEn: 'Completed & Endorsed',
      actionDate: '19 Ogos 2026, 02:15 PTG',
      remarksMs: 'Semakan SSM dan polisi insurans lengkap dan sah. Disalurkan kepada Unit M/T untuk ulasan teknikal zon pelabuhan.',
      remarksEn: 'SSM and insurance policy verified and valid. Routed to M/T Unit for port zone technical evaluation.',
      slaDueAt: '21 Ogos 2026',
      slaMet: true,
    },
    {
      id: 'log-3',
      stageCode: 'SEMAKAN_TEKNIKAL_MT',
      stageNameMs: 'Penilaian Teknikal & Zon Had Pelabuhan (Unit M/T)',
      stageNameEn: 'Technical Assessment & Port Limit Zoning (M/T Unit)',
      officerName: 'Kapt. Mohd Roslan (Ketua Unit M/T)',
      officerRoleMs: 'Pegawai Laut Kanan Unit M/T',
      officerRoleEn: 'Senior Marine Officer (M/T Unit)',
      status: 'current',
      statusLabelMs: 'Sedang Diproses',
      statusLabelEn: 'In Progress',
      slaDueAt: '25 Ogos 2026',
      slaMet: true,
    },
    {
      id: 'log-4',
      stageCode: 'KELULUSAN_PENGURUS_BESAR',
      stageNameMs: 'Kelulusan Akhir & Pengeluaran Sijil QR',
      stageNameEn: 'Final Approval & QR Certificate Issuance',
      officerName: 'Pengurus Besar LPKmn',
      officerRoleMs: 'Pihak Berkuasa Melulus LPKmn',
      officerRoleEn: 'LPKmn Approving Authority',
      status: 'pending',
      statusLabelMs: 'Menunggu',
      statusLabelEn: 'Pending',
      slaDueAt: '01 Sep 2026',
      slaMet: true,
    },
  ],
}
