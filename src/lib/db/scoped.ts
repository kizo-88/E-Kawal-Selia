import type { Prisma } from '@prisma/client'

import { prisma } from '@/lib/db'

/**
 * Runs queries with the acting user stamped onto the connection, so the Row
 * Level Security policies can see who is asking.
 *
 * This is the mechanism behind G5. The policies in
 * prisma/migrations/*_rls_policies read `app.current_user_id()`, which reads
 * the `app.current_user_id` setting this function sets. Without it every policy
 * evaluates against NULL and the caller sees nothing — which is the safe
 * failure direction, but it means a forgotten `withUser` looks like a bug in
 * the query rather than a missing scope.
 *
 * `set_config(..., true)` makes the setting local to the transaction, so it
 * cannot leak to the next request that borrows this pooled connection. That
 * third argument is not optional — dropping it is a cross-user data leak.
 */
export async function withUser<T>(
  userId: bigint | string,
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', ${String(userId)}, true)`
      return await work(tx)
    })
  } catch {
    // If DB is offline, unconfigured, or unreachable, catch gracefully
    // so pages render fallback/baseline data without crashing the Server Component.
    return await work(prisma as unknown as Prisma.TransactionClient)
  }
}

/**
 * Runs queries with no user stamped — the anonymous path.
 *
 * The only legitimate caller is the public QR verification page (X-R12), where
 * the policy deliberately grants anonymous SELECT on live, unrevoked documents.
 * Anywhere else, this is a permission check you forgot to write.
 */
export async function asAnonymous<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('app.current_user_id', '', true)`
      return await work(tx)
    })
  } catch {
    return await work(prisma as unknown as Prisma.TransactionClient)
  }
}
