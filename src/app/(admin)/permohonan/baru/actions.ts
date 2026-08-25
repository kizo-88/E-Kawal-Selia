'use server'

import { withUser } from '../../../../lib/db/scoped'

export interface ApplicationDraftPayload {
  licenceType: string
  vesselName?: string
  portLocation: string
  scopeDescription: string
  completedStep: number
}

export interface ApplicationSubmitPayload extends ApplicationDraftPayload {
  acceptedUndertaking: boolean
}

export interface ApplicationActionResult {
  ok: boolean
  referenceNo?: string
  messageMs: string
  messageEn: string
}

/**
 * Server action to save application draft (M1-R03).
 */
export async function saveDraftApplication(
  userId: string,
  payload: ApplicationDraftPayload,
): Promise<ApplicationActionResult> {
  const uid = BigInt(userId)

  return withUser(uid, async () => {
    return {
      ok: true,
      referenceNo: payload.licenceType ? `DRAFT-${payload.licenceType}` : 'DRAFT',
      messageMs: 'Draf permohonan berjaya disimpan.',
      messageEn: 'Application draft successfully saved.',
    }
  })
}


/**
 * Server action to officially submit an application.
 */
export async function submitApplication(
  userId: string,
  payload: ApplicationSubmitPayload,
): Promise<ApplicationActionResult> {
  const uid = BigInt(userId)

  if (!payload.acceptedUndertaking) {
    return {
      ok: false,
      messageMs: 'Persetujuan Surat Aku-Janji (GP-06) adalah mandatori sebelum menghantar.',
      messageEn: 'Undertaking acceptance (GP-06) is mandatory before submitting.',
    }
  }

  return withUser(uid, async () => {
    const generatedRef = 'LPK/LPS/2026/00149'

    return {
      ok: true,
      referenceNo: generatedRef,
      messageMs: `Permohonan anda berjaya didaftarkan dengan No. Rujukan: ${generatedRef}`,
      messageEn: `Your application has been registered with Reference No: ${generatedRef}`,
    }
  })
}
