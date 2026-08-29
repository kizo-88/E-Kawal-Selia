/**
 * Script to create / seed dummy Admin, Reviewer, and Applicant User accounts.
 *
 * All passwords conform to GP-03 DKICT (>= 12 chars, uppercase, lowercase, numbers, symbols)
 * and are hashed using bcrypt (cost 12).
 */

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth/hash'

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL

if (!connectionString) {
  console.log('No DATABASE_URL or DIRECT_URL set. Generating user credentials payload for reference.')
}

export const DUMMY_ACCOUNTS = [
  {
    name: 'Pentadbir Sistem LPKmn',
    email: 'admin@lpkmn.gov.my',
    plainPassword: 'Admin@LPKmn2026!',
    userCategory: 'internal',
    roleCode: 'SUPER_ADMIN',
    unitCode: 'IT',
    phone: '+609-863 1000',
    description: 'Pentadbir Sistem Utama (Super Admin) - Akses penuh kepada semua tetapan dan modul.',
  },
  {
    name: 'Kapt. Mohd Roslan (Pegawai Penilai)',
    email: 'reviewer@lpkmn.gov.my',
    plainPassword: 'Officer@LPKmn2026!',
    userCategory: 'internal',
    roleCode: 'REVIEWER',
    unitCode: 'MT',
    phone: '+609-863 1022',
    description: 'Pegawai Laut Kanan Unit Marin & Trafik - Ulasan teknikal & giliran semakan (M1-2).',
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
    description: 'Pemohon Syarikat Perkapalan - Permohonan lesen, permit, dan surat sokongan.',
  },
]

export async function seedDummyAccounts() {
  if (!connectionString) {
    console.table(
      DUMMY_ACCOUNTS.map((a) => ({
        Nama: a.name,
        Emel: a.email,
        Katalaluan: a.plainPassword,
        Peranan: a.roleCode,
        Kategori: a.userCategory,
      })),
    )
    return
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

  try {
    console.log('Creating demo user accounts in database...')

    for (const acc of DUMMY_ACCOUNTS) {
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

    console.log('Demo accounts seeded successfully:')
    console.table(
      DUMMY_ACCOUNTS.map((a) => ({
        Nama: a.name,
        Emel: a.email,
        Katalaluan: a.plainPassword,
        Peranan: a.roleCode,
        Kategori: a.userCategory,
      })),
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1]?.includes('seed-dummy-accounts')) {
  void seedDummyAccounts()
}
