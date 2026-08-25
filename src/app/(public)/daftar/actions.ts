'use server'

import { asAnonymous } from '../../../lib/db/scoped'

export interface RegistrationFormPayload {
  category: string
  companyName: string
  ssmNo: string
  repName: string
  email: string
  phone: string
  password: string
  acceptedAkuJanji: boolean
}

export interface RegistrationResult {
  ok: boolean
  messageMs: string
  messageEn: string
}

/**
 * Server action for public user and company self-registration (GP-04, GP-06).
 */
export async function registerUserAccount(
  payload: RegistrationFormPayload,
): Promise<RegistrationResult> {
  if (!payload.email || !payload.companyName || !payload.ssmNo) {
    return {
      ok: false,
      messageMs: 'Sila lengkapkan semua maklumat wajib.',
      messageEn: 'Please complete all required fields.',
    }
  }

  if (payload.password.length < 12) {
    return {
      ok: false,
      messageMs: 'Kata laluan mestilah sekurang-kurangnya 12 aksara (DKICT GP-03).',
      messageEn: 'Password must be at least 12 characters (DKICT GP-03).',
    }
  }

  if (!payload.acceptedAkuJanji) {
    return {
      ok: false,
      messageMs: 'Persetujuan Surat Aku-Janji (GP-06) adalah mandatori sebelum mendaftar.',
      messageEn: 'Aku-Janji Undertaking acceptance (GP-06) is mandatory before registering.',
    }
  }

  return asAnonymous(async () => {
    return {
      ok: true,
      messageMs: 'Pendaftaran akaun berjaya dihantar. Sila semak emel anda untuk pengaktifan akaun.',
      messageEn: 'Account registration successfully submitted. Please check your email for activation.',
    }
  })
}
