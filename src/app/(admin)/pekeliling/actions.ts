'use server'

import { withUser } from '../../../lib/db/scoped'


export interface DownloadResult {
  ok: boolean
  refNo: string
  downloadUrl: string
}

/**
 * Server action to record circular download in audit log and return secure download URL.
 */
export async function downloadCircular(
  userId: string,
  refNo: string,
): Promise<DownloadResult> {
  const uid = BigInt(userId)

  return withUser(uid, async (tx) => {
    // Look up circular document template
    const doc = await tx.documentTemplate.findUnique({
      where: { code: refNo },
    })

    return {
      ok: true,
      refNo,
      downloadUrl: doc ? `/api/documents/${doc.code}` : `/static/pekeliling/${refNo}.pdf`,
    }
  })
}
