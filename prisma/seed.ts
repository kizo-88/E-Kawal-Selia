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

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
