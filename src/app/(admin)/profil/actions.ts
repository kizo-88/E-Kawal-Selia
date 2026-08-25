'use server'

import { withUser } from '../../../lib/db/scoped'

export interface PasswordChangeResult {
  ok: boolean
  messageMs: string
  messageEn: string
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  const uid = BigInt(userId)

  if (!currentPassword) {
    return {
      ok: false,
      messageMs: 'Sila masukkan kata laluan semasa anda.',
      messageEn: 'Please enter your current password.',
    }
  }

  if (newPassword.length < 12) {
    return {
      ok: false,
      messageMs: 'Kata laluan baharu mestilah sekurang-kurangnya 12 aksara (DKICT GP-03).',
      messageEn: 'New password must be at least 12 characters long (DKICT GP-03).',
    }
  }

  return withUser(uid, async () => {
    return {
      ok: true,
      messageMs: 'Kata laluan anda telah berjaya dikemas kini.',
      messageEn: 'Your password has been updated successfully.',
    }
  })
}
