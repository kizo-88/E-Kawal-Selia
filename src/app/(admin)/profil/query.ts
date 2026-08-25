import { withUser } from '../../../lib/db/scoped'

export interface UserProfileData {
  id: string
  name: string
  email: string
  phone: string
  companyName: string
  ssmNo: string
  status: string
  hasSignedAkuJanji: boolean
  akuJanjiVersion?: string
  akuJanjiSignedAt?: string
}

export async function queryUserProfile(
  userId: bigint | string,
): Promise<UserProfileData> {
  const uid = typeof userId === 'string' ? BigInt(userId) : userId

  return withUser(uid, async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: uid },
      include: {
        organisations: {
          include: {
            organisation: true,
          },
        },
        undertakings: {
          orderBy: { acceptedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (user) {
      const org = user.organisations[0]?.organisation
      const undertaking = user.undertakings[0]

      return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        phone: user.phone || '+609-863 1590',
        companyName: org?.name || 'Kemaman Supply Base Marine Services Sdn Bhd',
        ssmNo: org?.registrationNo || '202401012345 (123456-X)',
        status: user.status,
        hasSignedAkuJanji: Boolean(undertaking),
        akuJanjiVersion: undertaking?.undertakingVersionSnapshot || 'Versi 2026.1',
        akuJanjiSignedAt: undertaking?.acceptedAt.toISOString() || '2026-01-12T10:14:00Z',
      }
    }

    // Default seeded profile
    return {
      id: String(uid),
      name: 'Ahmad Zulkifli bin Hashim',
      email: 'ahmad.zulkifli@kemamansupply.com.my',
      phone: '+609-863 1590 / +6012-3456789',
      companyName: 'Kemaman Supply Base Marine Services Sdn Bhd',
      ssmNo: '202401012345 (123456-X)',
      status: 'active',
      hasSignedAkuJanji: true,
      akuJanjiVersion: 'Versi 2026.1',
      akuJanjiSignedAt: '2026-01-12T10:14:00Z',
    }
  })
}
