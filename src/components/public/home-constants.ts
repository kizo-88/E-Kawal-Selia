export interface ServiceCardItem {
  id: string
  titleMs: string
  titleEn: string
  descMs: string
  descEn: string
  badgeMs: string
  badgeEn: string
  iconType: 'ship' | 'file' | 'building' | 'qr'
}

export const SERVICES_LIST: ServiceCardItem[] = [
  {
    id: 'lesen-sokongan',
    titleMs: 'Lesen Perkhidmatan Sokongan',
    titleEn: 'Support Service Licence',
    descMs:
      'Permohonan lesen baharu dan pembaharuan bagi aktiviti perkhidmatan marin, bunker, bekalan air, dan pembekal perkapalan di Pelabuhan Kemaman.',
    descEn:
      'New and renewal licence applications for marine services, bunkering, freshwater supply, and ship chandling at Port of Kemaman.',
    badgeMs: 'Modul P1',
    badgeEn: 'P1 Module',
    iconType: 'ship',
  },
  {
    id: 'permit-aktiviti',
    titleMs: 'Permit Aktiviti Pelabuhan',
    titleEn: 'Port Activity Permit',
    descMs:
      'Permit kerja panas, kerja menyelam, pemindahan kargo luar pesisir, dan aktiviti operasi khas dalam had perairan Lembaga Pelabuhan Kemaman.',
    descEn:
      'Permits for hot work, diving operations, offshore cargo transfer, and special operations within Kemaman Port Authority limits.',
    badgeMs: 'Modul P1',
    badgeEn: 'P1 Module',
    iconType: 'file',
  },
  {
    id: 'surat-pda2',
    titleMs: 'Surat Sokongan PDA2',
    titleEn: 'PDA2 Support Letter',
    descMs:
      'Pengeluaran surat sokongan rasmi bagi Petroleum Development Act (PDA) untuk syarikat pembekal dan kontraktor industri minyak dan gas maritim.',
    descEn:
      'Issuance of official Petroleum Development Act (PDA) support letters for oil and gas maritime contractors and suppliers.',
    badgeMs: 'Modul P1',
    badgeEn: 'P1 Module',
    iconType: 'building',
  },
  {
    id: 'semak-qr',
    titleMs: 'Semakan Ketulenan Lesen (QR)',
    titleEn: 'Licence Verification (QR)',
    descMs:
      'Perkhidmatan carian dan pengesahan ketulenan sijil lesen pelabuhan secara terus tanpa log masuk melalui imbasan Kod QR atau nombor siri.',
    descEn:
      'Direct public verification and validation of port licence certificates without login via QR code scan or serial number.',
    badgeMs: 'Akses Awam',
    badgeEn: 'Public Access',
    iconType: 'qr',
  },
]

export const HELP_TIPS = [
  {
    id: 'tip-1',
    textMs: 'Pastikan dokumen pendaftaran syarikat (SSM), lesen operasi terdahulu, dan polisi insurans yang sah telah disediakan dalam format PDF sebelum memulakan permohonan.',
    textEn: 'Ensure company registration documents (SSM), previous operational licences, and valid insurance policies are prepared in PDF format prior to starting.',
  },
  {
    id: 'tip-2',
    textMs: 'Setiap permohonan yang dihantar akan melalui semakan teknikal oleh Unit Marin & Trafik sebelum kelulusan dikeluarkan oleh pihak Pengurusan LPKmn.',
    textEn: 'Every submitted application undergoes technical review by the Marine & Traffic Unit before final approval by LPKmn Management.',
  },
  {
    id: 'tip-3',
    textMs: 'Sebarang bantuan teknikal atau pertanyaan proses pelesenan boleh dirujuk melalui talian Urus Setia di +609-863 1590.',
    textEn: 'Any technical assistance or licensing process enquiries can be directed to the Secretariat helpline at +609-863 1590.',
  },
]
