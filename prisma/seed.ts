/**
 * Seeds everything the system treats as configuration.
 *
 * This file is the practical expression of G1: if a list lives here, no
 * developer needs to hard-code it, and LPKmn can edit it after go-live without
 * calling us. The ESLint rule that bans literal arrays exempts prisma/ for
 * exactly this reason — this is where lists are allowed to exist.
 *
 * Fake data only. Never seed real applicant names, IC numbers or company
 * details, on any machine.
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { validateFormSchema } from '../src/domain/application/form-schema'
import { hashPassword } from '../src/lib/auth/hash'


// Prisma 7 requires a driver adapter — a bare `new PrismaClient()` throws at
// construction. The seeder uses DIRECT_URL rather than DATABASE_URL because
// seeding is DDL-adjacent bulk work and Supabase's pooled endpoint is the wrong
// connection for it.
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL must be set to seed. See docs/09-setup.md.')
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

// ─────────────────────────────────────────────────────────────── settings
const SETTINGS = [
  // GP-07 system identity
  { key: 'system.name', value: 'e-Kawalselia', group: 'system', labelMs: 'Nama Sistem', labelEn: 'System Name' },
  { key: 'system.acronym', value: 'eKS', group: 'system', labelMs: 'Singkatan Sistem', labelEn: 'System Acronym' },
  { key: 'system.logo_path', value: '', type: 'file', group: 'system', labelMs: 'Logo Sistem', labelEn: 'System Logo' },
  { key: 'system.banner_enabled', value: 'true', type: 'bool', group: 'system', labelMs: 'Papar Banner', labelEn: 'Show Banner' },
  { key: 'system.go_live_year', value: '2026', type: 'int', group: 'system', labelMs: 'Tahun Go-Live', labelEn: 'Go-Live Year' },

  // GP-08 organisation identity, address as separate fields
  { key: 'organisation.name', value: 'Lembaga Pelabuhan Kemaman', group: 'organisation', labelMs: 'Nama Organisasi', labelEn: 'Organisation Name' },
  { key: 'organisation.secretariat', value: 'Unit IT, Bahagian Korporat & Pembangunan', group: 'organisation', labelMs: 'Urusetia', labelEn: 'Secretariat' },
  { key: 'organisation.address_line1', value: 'Telok Kalong', group: 'organisation', labelMs: 'Alamat 1', labelEn: 'Address Line 1' },
  { key: 'organisation.address_line2', value: 'Peti Surat 66', group: 'organisation', labelMs: 'Alamat 2', labelEn: 'Address Line 2' },
  { key: 'organisation.postcode', value: '24000', group: 'organisation', labelMs: 'Poskod', labelEn: 'Postcode' },
  { key: 'organisation.city', value: 'Kemaman', group: 'organisation', labelMs: 'Bandar', labelEn: 'City' },
  { key: 'organisation.state', value: 'Terengganu', group: 'organisation', labelMs: 'Negeri', labelEn: 'State' },

  // GP-07 formats
  { key: 'format.date', value: 'd/m/Y', group: 'format', labelMs: 'Format Tarikh', labelEn: 'Date Format' },
  { key: 'format.currency', value: 'RM', group: 'format', labelMs: 'Mata Wang', labelEn: 'Currency' },
  { key: 'format.default_locale', value: 'ms', group: 'format', labelMs: 'Bahasa Lalai', labelEn: 'Default Locale' },

  // GP-03. These must be editable by an admin — a correct value hard-coded in
  // application code still fails the requirement.
  { key: 'security.session_timeout_minutes', value: '10', type: 'int', group: 'security', labelMs: 'Tamat Sesi (minit)', labelEn: 'Session Timeout (minutes)' },
  { key: 'security.lockout_threshold', value: '3', type: 'int', group: 'security', labelMs: 'Had Cubaan Log Masuk', labelEn: 'Login Attempt Limit' },
  { key: 'security.lockout_duration_minutes', value: '15', type: 'int', group: 'security', labelMs: 'Tempoh Kunci Akaun (minit)', labelEn: 'Account Lock Duration (minutes)' },
  { key: 'security.password_min_length', value: '12', type: 'int', group: 'security', labelMs: 'Panjang Minimum Kata Laluan', labelEn: 'Minimum Password Length' },
  { key: 'security.password_max_length', value: '128', type: 'int', group: 'security', labelMs: 'Panjang Maksimum Kata Laluan', labelEn: 'Maximum Password Length' },
  { key: 'security.password_require_mixed_case', value: 'true', type: 'bool', group: 'security', labelMs: 'Wajib Huruf Besar & Kecil', labelEn: 'Require Mixed Case' },
  { key: 'security.password_require_symbol', value: 'true', type: 'bool', group: 'security', labelMs: 'Wajib Simbol', labelEn: 'Require Symbol' },
  { key: 'security.password_require_digit', value: 'true', type: 'bool', group: 'security', labelMs: 'Wajib Nombor', labelEn: 'Require Digit' },
  { key: 'security.mfa_required', value: 'true', type: 'bool', group: 'security', labelMs: 'MFA Diwajibkan', labelEn: 'MFA Required' },

  // GP-18 retention. The flush button writes an audit_purge_runs row.
  { key: 'audit.retention_days', value: '1095', type: 'int', group: 'audit', labelMs: 'Tempoh Simpan Jejak Audit (hari)', labelEn: 'Audit Retention (days)' },

  { key: 'notification.email_enabled', value: 'true', type: 'bool', group: 'notification', labelMs: 'Emel Diaktifkan', labelEn: 'Email Enabled' },
]

// ────────────────────────────────────────────────────── lookups (GP-09)
const LOOKUPS: Array<{
  code: string
  nameMs: string
  nameEn: string
  allowUserRequest?: boolean
  values: Array<{ code: string; labelMs: string; labelEn: string }>
}> = [
  {
    code: 'NEGERI',
    nameMs: 'Negeri',
    nameEn: 'State',
    values: [
      { code: 'JHR', labelMs: 'Johor', labelEn: 'Johor' },
      { code: 'KDH', labelMs: 'Kedah', labelEn: 'Kedah' },
      { code: 'KTN', labelMs: 'Kelantan', labelEn: 'Kelantan' },
      { code: 'MLK', labelMs: 'Melaka', labelEn: 'Malacca' },
      { code: 'NSN', labelMs: 'Negeri Sembilan', labelEn: 'Negeri Sembilan' },
      { code: 'PHG', labelMs: 'Pahang', labelEn: 'Pahang' },
      { code: 'PRK', labelMs: 'Perak', labelEn: 'Perak' },
      { code: 'PLS', labelMs: 'Perlis', labelEn: 'Perlis' },
      { code: 'PNG', labelMs: 'Pulau Pinang', labelEn: 'Penang' },
      { code: 'SBH', labelMs: 'Sabah', labelEn: 'Sabah' },
      { code: 'SWK', labelMs: 'Sarawak', labelEn: 'Sarawak' },
      { code: 'SGR', labelMs: 'Selangor', labelEn: 'Selangor' },
      { code: 'TRG', labelMs: 'Terengganu', labelEn: 'Terengganu' },
      { code: 'KUL', labelMs: 'W.P. Kuala Lumpur', labelEn: 'F.T. Kuala Lumpur' },
      { code: 'LBN', labelMs: 'W.P. Labuan', labelEn: 'F.T. Labuan' },
      { code: 'PJY', labelMs: 'W.P. Putrajaya', labelEn: 'F.T. Putrajaya' },
    ],
  },
  {
    // M5-R01
    code: 'JENIS_ORGANISASI',
    nameMs: 'Jenis Organisasi',
    nameEn: 'Organisation Type',
    values: [
      { code: 'SYARIKAT', labelMs: 'Syarikat', labelEn: 'Company' },
      { code: 'KONSORTIUM', labelMs: 'Konsortium Pelabuhan Kemaman', labelEn: 'Kemaman Port Consortium' },
      { code: 'INDIVIDU', labelMs: 'Individu', labelEn: 'Individual' },
      { code: 'PENGGUNA_PELABUHAN', labelMs: 'Pengguna Pelabuhan', labelEn: 'Port User' },
    ],
  },
  {
    code: 'JENIS_PERKHIDMATAN_SOKONGAN',
    nameMs: 'Jenis Perkhidmatan Sokongan',
    nameEn: 'Support Service Type',
    allowUserRequest: true,
    values: [
      { code: 'TUNDA', labelMs: 'Perkhidmatan Tunda', labelEn: 'Towage Services' },
      { code: 'TONGKANG', labelMs: 'Perkhidmatan Tongkang', labelEn: 'Barge Services' },
      { code: 'BUNKERING', labelMs: 'Perkhidmatan Bunkering', labelEn: 'Bunkering Services' },
      { code: 'STEVEDORING', labelMs: 'Perkhidmatan Stevedoring', labelEn: 'Stevedoring Services' },
      { code: 'BEKALAN', labelMs: 'Bekalan Kapal', labelEn: 'Ship Supply' },
      { code: 'LAIN_LAIN', labelMs: 'Lain-lain', labelEn: 'Other' },
    ],
  },
  {
    code: 'JENIS_AKTIVITI_PELABUHAN',
    nameMs: 'Jenis Aktiviti Pelabuhan',
    nameEn: 'Port Activity Type',
    allowUserRequest: true,
    values: [
      { code: 'HOT_WORKS', labelMs: 'Kerja Panas (Hot Works)', labelEn: 'Hot Works' },
      { code: 'SELAM', labelMs: 'Kerja Menyelam', labelEn: 'Diving Works' },
      { code: 'BAIK_PULIH', labelMs: 'Kerja Baik Pulih', labelEn: 'Repair Works' },
      { code: 'PEMINDAHAN', labelMs: 'Pemindahan Kargo', labelEn: 'Cargo Transfer' },
      { code: 'LAIN_LAIN', labelMs: 'Lain-lain', labelEn: 'Other' },
    ],
  },
  {
    code: 'SEBAB_PEMBATALAN',
    nameMs: 'Sebab Pembatalan',
    nameEn: 'Cancellation Reason',
    allowUserRequest: true,
    values: [
      { code: 'SALAH_MAKLUMAT', labelMs: 'Maklumat tidak tepat', labelEn: 'Incorrect information' },
      { code: 'TIDAK_LAGI_PERLU', labelMs: 'Tidak lagi diperlukan', labelEn: 'No longer required' },
      { code: 'HANTAR_SEMULA', labelMs: 'Akan dihantar semula', labelEn: 'Will resubmit' },
      { code: 'LAIN_LAIN', labelMs: 'Lain-lain', labelEn: 'Other' },
    ],
  },
]

// ───────────────────────────────────────── internal units (M5-R02)
const UNITS = [
  { code: 'PB', nameMs: 'Pengurus Besar', nameEn: 'General Manager' },
  { code: 'OKS', nameMs: 'Bahagian Operasi & Kawalselia', nameEn: 'Operations & Regulatory Division' },
  { code: 'MT', nameMs: 'Unit Marin & Trafik', nameEn: 'Marine & Traffic Unit' },
  { code: 'KESELAMATAN', nameMs: 'Unit Keselamatan', nameEn: 'Security Unit' },
  { code: 'TEKNIKAL', nameMs: 'Unit Teknikal', nameEn: 'Technical Unit' },
  { code: 'IT', nameMs: 'Unit Teknologi Maklumat', nameEn: 'Information Technology Unit' },
  { code: 'INTEGRITI', nameMs: 'Unit Integriti', nameEn: 'Integrity Unit' },
]

// ─────────────────────────────── the five baseline access levels (GP-02)
// isSystem blocks deletion. Unlimited further roles are creatable in the UI —
// GP-02 requires that, so these are a starting point, not the full set.
const ROLES = [
  { code: 'SUPER_ADMIN', nameMs: 'Super Admin', nameEn: 'Super Admin', sortOrder: 1 },
  { code: 'ADMIN_DATA', nameMs: 'Admin Data', nameEn: 'Data Admin', sortOrder: 2 },
  { code: 'PENGURUSAN', nameMs: 'Pengurusan', nameEn: 'Management', sortOrder: 3 },
  { code: 'REVIEWER', nameMs: 'Penyemak / Pelulus', nameEn: 'Reviewer / Approver', sortOrder: 4 },
  { code: 'END_USER', nameMs: 'Pengguna', nameEn: 'End User', sortOrder: 5 },
]

const PERMISSIONS = [
  { code: 'system.all', nameMs: 'Akses Penuh Sistem', nameEn: 'Full System Access', group: 'system' },
  { code: 'identity.user.view', nameMs: 'Lihat Pengguna', nameEn: 'View Users', group: 'identity' },
  { code: 'identity.user.manage', nameMs: 'Urus Pengguna', nameEn: 'Manage Users', group: 'identity' },
  { code: 'identity.role.assign', nameMs: 'Tetapkan Peranan', nameEn: 'Assign Roles', group: 'identity' },
  { code: 'identity.organisation.view', nameMs: 'Lihat Organisasi', nameEn: 'View Organisations', group: 'identity' },
  { code: 'identity.organisation.manage', nameMs: 'Urus Organisasi', nameEn: 'Manage Organisations', group: 'identity' },
  { code: 'audit.log.view', nameMs: 'Lihat Jejak Audit', nameEn: 'View Audit Trail', group: 'audit' },
  { code: 'audit.log.purge', nameMs: 'Buang Jejak Audit', nameEn: 'Purge Audit Trail', group: 'audit' },
  { code: 'config.settings.manage', nameMs: 'Urus Tetapan', nameEn: 'Manage Settings', group: 'config' },
  { code: 'config.lookup_values.manage', nameMs: 'Urus Senarai Pilihan', nameEn: 'Manage Lookup Values', group: 'config' },
  { code: 'config.notification.manage', nameMs: 'Urus Pemberitahuan', nameEn: 'Manage Notifications', group: 'config' },
  { code: 'dokumen.generated.view', nameMs: 'Lihat Dokumen Dijana', nameEn: 'View Generated Documents', group: 'dokumen' },
  { code: 'dokumen.generated.create', nameMs: 'Jana Dokumen', nameEn: 'Generate Documents', group: 'dokumen' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSIONS.map((p) => p.code),
  ADMIN_DATA: [
    'identity.user.view',
    'identity.user.manage',
    'identity.organisation.view',
    'identity.organisation.manage',
    'config.settings.manage',
    'config.lookup_values.manage',
    'config.notification.manage',
    'audit.log.view',
  ],
  PENGURUSAN: ['identity.user.view', 'identity.organisation.view', 'audit.log.view', 'dokumen.generated.view'],
  REVIEWER: ['identity.organisation.view', 'dokumen.generated.view', 'dokumen.generated.create'],
  END_USER: [],
}


// ═══════════════════════════════════════════ M1 — application types (ADR 0002)
//
// The three Phase 1 licence types exist as DATA. Each is one row plus a
// form_schema plus a workflow. Adding Lesen Malim in Phase 2 means adding to
// this array — no new route, no new model, no code branch.
//
// ⚠️ The field lists below are a WORKING DRAFT. The real forms are one of the
// thirteen open questions in docs/02-requirements.md §E (Q2), and LPKmn has not
// supplied them. They are shaped to be replaced: change the JSON, not the code.

const WORKFLOWS = [
  {
    code: 'WF_LESEN_SOKONGAN',
    nameMs: 'Aliran Kerja Lesen Perkhidmatan Sokongan',
    nameEn: 'Support Services Licence Workflow',
    stages: [
      { sequence: 1, code: 'SEMAKAN_MT', nameMs: 'Semakan Unit Marin & Trafik', nameEn: 'Marine & Traffic Review', unitCode: 'MT', actionType: 'review', slaDays: 7, allowReturn: true, minApprovals: 1, isFinal: false },
      { sequence: 2, code: 'SEMAKAN_KESELAMATAN', nameMs: 'Semakan Unit Keselamatan', nameEn: 'Security Review', unitCode: 'KESELAMATAN', actionType: 'review', slaDays: 5, allowReturn: true, minApprovals: 1, isFinal: false },
      { sequence: 3, code: 'KELULUSAN', nameMs: 'Kelulusan Ketua Bahagian', nameEn: 'Division Head Approval', unitCode: 'OKS', actionType: 'approve', slaDays: 5, allowReturn: true, minApprovals: 1, isFinal: true },
    ],
  },
  {
    code: 'WF_PERMIT_AKTIVITI',
    nameMs: 'Aliran Kerja Permit Aktiviti Pelabuhan',
    nameEn: 'Port Activity Permit Workflow',
    stages: [
      { sequence: 1, code: 'SEMAKAN_MT', nameMs: 'Semakan Unit Marin & Trafik', nameEn: 'Marine & Traffic Review', unitCode: 'MT', actionType: 'review', slaDays: 3, allowReturn: true, minApprovals: 1, isFinal: false },
      { sequence: 2, code: 'KELULUSAN', nameMs: 'Kelulusan Unit Marin & Trafik', nameEn: 'Marine & Traffic Approval', unitCode: 'MT', actionType: 'approve', slaDays: 2, allowReturn: true, minApprovals: 1, isFinal: true },
    ],
  },
  {
    code: 'WF_SURAT_PDA2',
    nameMs: 'Aliran Kerja Surat Sokongan PDA2',
    nameEn: 'PDA2 Support Letter Workflow',
    stages: [
      { sequence: 1, code: 'SEMAKAN_MT', nameMs: 'Semakan Unit Marin & Trafik', nameEn: 'Marine & Traffic Review', unitCode: 'MT', actionType: 'review', slaDays: 5, allowReturn: true, minApprovals: 1, isFinal: false },
      { sequence: 2, code: 'KELULUSAN_PB', nameMs: 'Kelulusan Pengurus Besar', nameEn: 'General Manager Approval', unitCode: 'PB', actionType: 'approve', slaDays: 7, allowReturn: true, minApprovals: 1, isFinal: true },
    ],
  },
]

const APPLICATION_TYPES = [
  {
    code: 'LESEN_SOKONGAN',
    nameMs: 'Lesen Perkhidmatan Sokongan Pelabuhan',
    nameEn: 'Port Support Services Licence',
    category: 'lesen',
    referencePrefix: 'LPS',
    workflowCode: 'WF_LESEN_SOKONGAN',
    validityMonths: 12,
    requiresPayment: true,
    applicantCategories: ['SYARIKAT', 'KONSORTIUM'],
    documents: [
      { code: 'SSM', labelMs: 'Salinan Pendaftaran SSM', labelEn: 'SSM Registration Copy', required: true },
      { code: 'PROFIL', labelMs: 'Profil Syarikat', labelEn: 'Company Profile', required: true },
      { code: 'INSURANS', labelMs: 'Sijil Insurans', labelEn: 'Insurance Certificate', required: false },
    ],
    formSchema: {
      version: 1,
      steps: [
        {
          sequence: 1,
          code: 'pemohon',
          titleMs: 'Maklumat Syarikat',
          titleEn: 'Company Details',
          fields: [
            { name: 'namaSyarikat', labelMs: 'Nama Syarikat', labelEn: 'Company Name', kind: 'text', required: true, minLength: 3, maxLength: 200 },
            { name: 'noPendaftaran', labelMs: 'No. Pendaftaran SSM', labelEn: 'SSM Registration No.', kind: 'text', required: true, maxLength: 50 },
            { name: 'negeri', labelMs: 'Negeri', labelEn: 'State', kind: 'select', required: true, lookupType: 'NEGERI' },
            { name: 'alamat', labelMs: 'Alamat Perniagaan', labelEn: 'Business Address', kind: 'textarea', required: true, maxLength: 500 },
          ],
        },
        {
          sequence: 2,
          code: 'perkhidmatan',
          titleMs: 'Perkhidmatan Dipohon',
          titleEn: 'Services Applied For',
          fields: [
            { name: 'jenisPerkhidmatan', labelMs: 'Jenis Perkhidmatan', labelEn: 'Service Type', kind: 'select', required: true, lookupType: 'JENIS_PERKHIDMATAN_SOKONGAN' },
            { name: 'bilanganPekerja', labelMs: 'Bilangan Pekerja', labelEn: 'Number of Employees', kind: 'number', required: true, min: 1, max: 10000 },
            { name: 'butiranLain', labelMs: 'Butiran Perkhidmatan Lain', labelEn: 'Other Service Details', kind: 'textarea', required: true, maxLength: 1000, showWhen: { field: 'jenisPerkhidmatan', equals: ['LAIN_LAIN'] } },
          ],
        },
        {
          sequence: 3,
          code: 'dokumen',
          titleMs: 'Dokumen Sokongan',
          titleEn: 'Supporting Documents',
          fields: [
            { name: 'pengesahanDokumen', labelMs: 'Saya mengesahkan dokumen yang dilampirkan adalah benar', labelEn: 'I confirm the attached documents are true', kind: 'checkbox', required: true },
          ],
        },
      ],
    },
  },
  {
    code: 'PERMIT_AKTIVITI',
    nameMs: 'Permit Aktiviti Pelabuhan',
    nameEn: 'Port Activity Permit',
    category: 'permit',
    referencePrefix: 'PAP',
    workflowCode: 'WF_PERMIT_AKTIVITI',
    validityMonths: 3,
    requiresPayment: true,
    applicantCategories: ['SYARIKAT', 'KONSORTIUM', 'PENGGUNA_PELABUHAN'],
    documents: [
      { code: 'PELAN', labelMs: 'Pelan Aktiviti', labelEn: 'Activity Plan', required: true },
      { code: 'RISIKO', labelMs: 'Penilaian Risiko', labelEn: 'Risk Assessment', required: true },
    ],
    formSchema: {
      version: 1,
      steps: [
        {
          sequence: 1,
          code: 'aktiviti',
          titleMs: 'Butiran Aktiviti',
          titleEn: 'Activity Details',
          fields: [
            { name: 'jenisAktiviti', labelMs: 'Jenis Aktiviti', labelEn: 'Activity Type', kind: 'select', required: true, lookupType: 'JENIS_AKTIVITI_PELABUHAN' },
            { name: 'tarikhMula', labelMs: 'Tarikh Mula', labelEn: 'Start Date', kind: 'date', required: true },
            { name: 'tarikhTamat', labelMs: 'Tarikh Tamat', labelEn: 'End Date', kind: 'date', required: true },
          ],
        },
        {
          sequence: 2,
          code: 'lokasi',
          titleMs: 'Lokasi Aktiviti',
          titleEn: 'Activity Location',
          // X-R07 validates this against the real Port Limit and MRA polygons.
          // That is Phase 2; Phase 1 captures the coordinate so the data is
          // already there when the check arrives.
          fields: [
            { name: 'lokasi', labelMs: 'Keterangan Lokasi', labelEn: 'Location Description', kind: 'text', required: true, maxLength: 300, helpMs: 'Nyatakan lokasi tepat dalam kawasan pelabuhan.', helpEn: 'State the exact location within the port area.' },
            { name: 'koordinat', labelMs: 'Koordinat', labelEn: 'Coordinates', kind: 'coordinate', required: false },
          ],
        },
      ],
    },
  },
  {
    code: 'SURAT_PDA2',
    nameMs: 'Surat Sokongan PDA2',
    nameEn: 'PDA2 Support Letter',
    category: 'surat',
    referencePrefix: 'PDA2',
    workflowCode: 'WF_SURAT_PDA2',
    validityMonths: 6,
    requiresPayment: false,
    applicantCategories: ['SYARIKAT'],
    documents: [
      { code: 'SSM', labelMs: 'Salinan Pendaftaran SSM', labelEn: 'SSM Registration Copy', required: true },
      { code: 'BORANG_PDA', labelMs: 'Borang Permohonan PDA', labelEn: 'PDA Application Form', required: true },
    ],
    formSchema: {
      version: 1,
      steps: [
        {
          sequence: 1,
          code: 'pemohon',
          titleMs: 'Maklumat Pemohon',
          titleEn: 'Applicant Details',
          fields: [
            { name: 'namaSyarikat', labelMs: 'Nama Syarikat', labelEn: 'Company Name', kind: 'text', required: true, minLength: 3, maxLength: 200 },
            { name: 'noPendaftaran', labelMs: 'No. Pendaftaran SSM', labelEn: 'SSM Registration No.', kind: 'text', required: true, maxLength: 50 },
          ],
        },
        {
          sequence: 2,
          code: 'tujuan',
          titleMs: 'Tujuan Permohonan',
          titleEn: 'Purpose of Application',
          fields: [
            { name: 'tujuan', labelMs: 'Tujuan Surat Sokongan', labelEn: 'Purpose of Support Letter', kind: 'textarea', required: true, maxLength: 1000 },
            { name: 'skopKerja', labelMs: 'Skop Kerja', labelEn: 'Scope of Work', kind: 'textarea', required: true, maxLength: 1000 },
          ],
        },
      ],
    },
  },
]

async function main() {
  console.log('Seeding configuration...')

  for (const s of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { labelMs: s.labelMs, labelEn: s.labelEn, group: s.group, type: s.type ?? 'string' },
      create: { ...s, type: s.type ?? 'string' },
    })
  }
  console.log(`  ${SETTINGS.length} settings`)

  for (const lookup of LOOKUPS) {
    const type = await prisma.lookupType.upsert({
      where: { code: lookup.code },
      update: { nameMs: lookup.nameMs, nameEn: lookup.nameEn },
      create: {
        code: lookup.code,
        nameMs: lookup.nameMs,
        nameEn: lookup.nameEn,
        isSystem: true,
        allowUserRequest: lookup.allowUserRequest ?? false,
      },
    })

    for (const [i, v] of lookup.values.entries()) {
      const existing = await prisma.lookupValue.findFirst({
        where: { lookupTypeId: type.id, code: v.code, deletedAt: null },
      })

      if (existing) {
        await prisma.lookupValue.update({
          where: { id: existing.id },
          data: { labelMs: v.labelMs, labelEn: v.labelEn, sortOrder: i },
        })
      } else {
        await prisma.lookupValue.create({
          data: { lookupTypeId: type.id, code: v.code, labelMs: v.labelMs, labelEn: v.labelEn, sortOrder: i },
        })
      }
    }
  }
  console.log(`  ${LOOKUPS.length} lookup types`)

  for (const [i, u] of UNITS.entries()) {
    await prisma.internalUnit.upsert({
      where: { code: u.code },
      update: { nameMs: u.nameMs, nameEn: u.nameEn, sortOrder: i },
      create: { ...u, sortOrder: i },
    })
  }
  console.log(`  ${UNITS.length} internal units`)

  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { nameMs: p.nameMs, nameEn: p.nameEn, group: p.group },
      create: p,
    })
  }

  for (const r of ROLES) {
    const role = await prisma.role.upsert({
      where: { code: r.code },
      update: { nameMs: r.nameMs, nameEn: r.nameEn, sortOrder: r.sortOrder },
      create: { ...r, isSystem: true },
    })

    for (const code of ROLE_PERMISSIONS[r.code] ?? []) {
      const permission = await prisma.permission.findUnique({ where: { code } })
      if (!permission) continue

      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      })
    }
  }
  console.log(`  ${ROLES.length} roles, ${PERMISSIONS.length} permissions`)


  // ── M1: workflows, then application types (ADR 0002)
  const unitByCode = new Map(
    (await prisma.internalUnit.findMany({ select: { id: true, code: true } })).map((u) => [
      u.code,
      u.id,
    ]),
  )

  for (const wf of WORKFLOWS) {
    const workflow = await prisma.workflow.upsert({
      where: { code: wf.code },
      update: { nameMs: wf.nameMs, nameEn: wf.nameEn },
      create: { code: wf.code, nameMs: wf.nameMs, nameEn: wf.nameEn },
    })

    for (const st of wf.stages) {
      const existing = await prisma.workflowStage.findFirst({
        where: { workflowId: workflow.id, sequence: st.sequence },
      })

      const data = {
        workflowId: workflow.id,
        sequence: st.sequence,
        code: st.code,
        nameMs: st.nameMs,
        nameEn: st.nameEn,
        actorInternalUnitId: unitByCode.get(st.unitCode) ?? null,
        actionType: st.actionType,
        slaDays: st.slaDays,
        allowReturn: st.allowReturn,
        minApprovals: st.minApprovals,
        isFinal: st.isFinal,
        onApproveStatus: st.isFinal ? 'approved' : null,
        onRejectStatus: 'rejected',
      }

      if (existing) {
        await prisma.workflowStage.update({ where: { id: existing.id }, data })
      } else {
        await prisma.workflowStage.create({ data })
      }
    }
  }
  console.log(`  ${WORKFLOWS.length} workflows`)

  for (const type of APPLICATION_TYPES) {
    // A malformed form_schema does not fail loudly — it renders a form with a
    // missing field, and the applicant submits something incomplete that an
    // officer rejects weeks later. Catch it here instead.
    const problems = validateFormSchema(type.formSchema)

    if (problems.length > 0) {
      console.error(`\nInvalid form_schema for ${type.code}:`)
      for (const p of problems) console.error(`  ${p.path}: ${p.messageEn}`)
      throw new Error(`form_schema validation failed for ${type.code}`)
    }

    const workflow = await prisma.workflow.findUnique({ where: { code: type.workflowCode } })

    const applicationType = await prisma.applicationType.upsert({
      where: { code: type.code },
      update: {
        nameMs: type.nameMs,
        nameEn: type.nameEn,
        category: type.category,
        referencePrefix: type.referencePrefix,
        formSchema: type.formSchema,
        workflowId: workflow?.id ?? null,
        validityMonths: type.validityMonths,
        requiresPayment: type.requiresPayment,
        applicantCategories: type.applicantCategories,
      },
      create: {
        code: type.code,
        nameMs: type.nameMs,
        nameEn: type.nameEn,
        category: type.category,
        referencePrefix: type.referencePrefix,
        formSchema: type.formSchema,
        workflowId: workflow?.id ?? null,
        validityMonths: type.validityMonths,
        requiresPayment: type.requiresPayment,
        applicantCategories: type.applicantCategories,
        active: true,
      },
    })

    for (const [i, doc] of type.documents.entries()) {
      await prisma.applicationTypeDocument.upsert({
        where: {
          applicationTypeId_code: { applicationTypeId: applicationType.id, code: doc.code },
        },
        update: { labelMs: doc.labelMs, labelEn: doc.labelEn, required: doc.required, sortOrder: i },
        create: {
          applicationTypeId: applicationType.id,
          code: doc.code,
          labelMs: doc.labelMs,
          labelEn: doc.labelEn,
          required: doc.required,
          filePolicyCode: 'PERMOHONAN_SOKONGAN',
          sortOrder: i,
        },
      })
    }
  }
  console.log(`  ${APPLICATION_TYPES.length} application types`)

  // ── Seed Dummy Accounts (Admin, Reviewer, User)
  const DUMMY_USERS = [
    {
      name: 'Pentadbir Sistem LPKmn',
      email: 'admin@lpkmn.gov.my',
      plainPassword: 'Admin@LPKmn2026!',
      userCategory: 'internal',
      roleCode: 'SUPER_ADMIN',
      unitCode: 'IT',
      phone: '+609-863 1000',
    },
    {
      name: 'Kapt. Mohd Roslan (Pegawai Penilai)',
      email: 'reviewer@lpkmn.gov.my',
      plainPassword: 'Officer@LPKmn2026!',
      userCategory: 'internal',
      roleCode: 'REVIEWER',
      unitCode: 'MT',
      phone: '+609-863 1022',
    },
    {
      name: 'En. Ahmad Zulkifli (Kemaman Supply Base)',
      email: 'user@kemamansupply.com.my',
      plainPassword: 'User@Kemaman2026!',
      userCategory: 'external',
      roleCode: 'END_USER',
      companyName: 'Kemaman Supply Base Marine Services Sdn Bhd',
      ssmNo: '202401012345 (123456-X)',
      phone: '+609-863 1590',
    },
  ]

  for (const acc of DUMMY_USERS) {
    const passwordHash = await hashPassword(acc.plainPassword)
    const role = await prisma.role.findUnique({ where: { code: acc.roleCode } })

    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        passwordHash,
        userCategory: acc.userCategory,
        status: 'active',
        mustChangePassword: false,
        phone: acc.phone,
        emailVerifiedAt: new Date(),
      },
      create: {
        name: acc.name,
        email: acc.email,
        passwordHash,
        userCategory: acc.userCategory,
        status: 'active',
        mustChangePassword: false,
        phone: acc.phone,
        emailVerifiedAt: new Date(),
      },
    })

    if (role) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId: role.id } },
        update: {},
        create: { userId: user.id, roleId: role.id },
      })
    }

    if (acc.unitCode) {
      const unit = await prisma.internalUnit.findUnique({ where: { code: acc.unitCode } })
      if (unit) {
        await prisma.userInternalUnit.upsert({
          where: { userId_internalUnitId: { userId: user.id, internalUnitId: unit.id } },
          update: {},
          create: { userId: user.id, internalUnitId: unit.id, position: 'Pegawai Berdaftar' },
        })
      }
    }

    if (acc.companyName) {
      const org = await prisma.organisation.upsert({
        where: { uuid: 'org-kemaman-supply-base' },
        update: { name: acc.companyName, registrationNo: acc.ssmNo, status: 'verified' },
        create: {
          uuid: 'org-kemaman-supply-base',
          name: acc.companyName,
          type: 'SYARIKAT',
          registrationNo: acc.ssmNo,
          status: 'verified',
          verifiedAt: new Date(),
        },
      })

      await prisma.organisationUser.upsert({
        where: { organisationId_userId: { organisationId: org.id, userId: user.id } },
        update: { isPrimaryContact: true },
        create: {
          organisationId: org.id,
          userId: user.id,
          roleInOrg: 'Wakil Berdaftar',
          isPrimaryContact: true,
          verifiedAt: new Date(),
        },
      })
    }
  }
  console.log(`  ${DUMMY_USERS.length} demo user accounts`)

  console.log('Done.')
}


main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
