'use server'

import { withUser } from '../../../lib/db/scoped'

export interface LicenceDownloadResult {
  ok: boolean
  licenceNo: string
  downloadUrl: string
}

export async function downloadLicencePdf(
  userId: string,
  licenceNo: string,
): Promise<LicenceDownloadResult> {
  const uid = BigInt(userId)

  return withUser(uid, async () => {
    return {
      ok: true,
      licenceNo,
      downloadUrl: `/api/licences/${encodeURIComponent(licenceNo)}/pdf`,
    }
  })
}
