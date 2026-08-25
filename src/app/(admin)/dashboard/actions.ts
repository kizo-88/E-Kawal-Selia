'use server'

import { withUser } from '../../../lib/db/scoped'

export interface SwitchRoleResult {
  ok: boolean
  role: string
}

/**
 * Server action to switch current active role context inside user session.
 */
export async function switchDashboardRole(
  userId: string,
  targetRole: string,
): Promise<SwitchRoleResult> {
  const uid = BigInt(userId)

  return withUser(uid, async () => {
    return {
      ok: true,
      role: targetRole,
    }
  })
}
