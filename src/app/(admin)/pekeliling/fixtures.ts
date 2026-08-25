export interface CircularItem {
  id: string
  refNo: string
  titleMs: string
  titleEn: string
  categoryMs: string
  categoryEn: string
  publishDate: string
  fileSize: string
}

export const FIXTURE_CIRCULARS_LIST: CircularItem[] = [
  {
    id: 'circ-1',
    refNo: 'PKMN/PKL/01/2026',
    titleMs: 'Pekeliling Pelabuhan Bil. 1/2026: Garis Panduan Pematuhan Zon Keselamatan Dermaga Had Pelabuhan',
    titleEn: 'Port Circular No. 1/2026: Port Limits Wharf Safety Zone Compliance Guidelines',
    categoryMs: 'Pekeliling Pelabuhan',
    categoryEn: 'Port Circular',
    publishDate: '15 Jan 2026',
    fileSize: '1.4 MB (PDF)',
  },
  {
    id: 'circ-2',
    refNo: 'PKMN/NOTIS/04/2026',
    titleMs: 'Notis Kepada Pelaut: Peringatan Operasi Bunkering & Kebersihan Marin di Teluk Kalong',
    titleEn: 'Notice to Mariners: Bunkering Operation & Marine Cleanliness in Teluk Kalong',
    categoryMs: 'Notis Kepada Pelaut',
    categoryEn: 'Notice to Mariners',
    publishDate: '02 Feb 2026',
    fileSize: '820 KB (PDF)',
  },
  {
    id: 'circ-3',
    refNo: 'PKMN/KADAR/2026',
    titleMs: 'Jadual Fi & Caj Perkhidmatan Sokongan Pelabuhan Kemaman Terkini (M1-R10)',
    titleEn: 'Kemaman Port Support Service Fee & Charge Schedule (M1-R10)',
    categoryMs: 'Jadual Kadar & Fi',
    categoryEn: 'Rates & Fee Schedule',
    publishDate: '01 Jan 2026',
    fileSize: '2.1 MB (PDF)',
  },
  {
    id: 'circ-4',
    refNo: 'PKMN/SOP/ISPS/2025',
    titleMs: 'Prosedur Operasi Standard (SOP) Kawalan Keselamatan Fasiliti Maritim & Kod ISPS',
    titleEn: 'Standard Operating Procedure (SOP) Maritime Facility Security & ISPS Code',
    categoryMs: 'SOP & Peraturan',
    categoryEn: 'SOP & Regulations',
    publishDate: '20 Dis 2025',
    fileSize: '3.5 MB (PDF)',
  },
]
