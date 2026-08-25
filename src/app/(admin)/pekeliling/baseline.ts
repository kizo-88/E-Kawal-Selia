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

export interface CircularRecord {
  id: string
  refNo: string
  titleMs: string
  titleEn: string
  categoryMs: string
  categoryEn: string
  publishDate: string
  fileSize: string
}

export const BASELINE_CIRCULARS: CircularRecord[] = [
  {
    id: 'circ-1',
    refNo: 'PKMN/PKL/01/2026',
    titleMs: 'Pekeliling Pelabuhan Bil. 1/2026: Garis Panduan Pematuhan Zon Keselamatan Dermaga Had Pelabuhan',
    titleEn: 'Port Circular No. 1/2026: Port Limits Wharf Safety Zone Compliance Guidelines',
    categoryMs: 'Pekeliling Pelabuhan',
    categoryEn: 'Port Circular',
    publishDate: '2026-01-15',
    fileSize: '1.4 MB (PDF)',
  },
  {
    id: 'circ-2',
    refNo: 'PKMN/NOTIS/04/2026',
    titleMs: 'Notis Kepada Pelaut: Peringatan Operasi Bunkering & Kebersihan Marin di Teluk Kalong',
    titleEn: 'Notice to Mariners: Bunkering Operation & Marine Cleanliness in Teluk Kalong',
    categoryMs: 'Notis Kepada Pelaut',
    categoryEn: 'Notice to Mariners',
    publishDate: '2026-02-02',
    fileSize: '820 KB (PDF)',
  },
  {
    id: 'circ-3',
    refNo: 'PKMN/KADAR/2026',
    titleMs: 'Jadual Fi & Caj Perkhidmatan Sokongan Pelabuhan Kemaman Terkini (M1-R10)',
    titleEn: 'Kemaman Port Support Service Fee & Charge Schedule (M1-R10)',
    categoryMs: 'Jadual Kadar & Fi',
    categoryEn: 'Rates & Fee Schedule',
    publishDate: '2026-01-01',
    fileSize: '2.1 MB (PDF)',
  },
  {
    id: 'circ-4',
    refNo: 'PKMN/SOP/ISPS/2025',
    titleMs: 'Prosedur Operasi Standard (SOP) Kawalan Keselamatan Fasiliti Maritim & Kod ISPS',
    titleEn: 'Standard Operating Procedure (SOP) Maritime Facility Security & ISPS Code',
    categoryMs: 'SOP & Peraturan',
    categoryEn: 'SOP & Regulations',
    publishDate: '2025-12-20',
    fileSize: '3.5 MB (PDF)',
  },
]
