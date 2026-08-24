import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

/**
 * The Prisma client.
 *
 * Prisma 7 requires a driver adapter rather than a connection string in the
 * schema, so the pool is constructed here and reused across hot reloads in
 * development (Next.js re-evaluates modules on every change, and a fresh pool
 * per reload exhausts Postgres connections within minutes).
 *
 * IMPORTANT — G5. This client connects as the *application* role, which must
 * not own the tables and must not have BYPASSRLS. Postgres exempts table owners
 * from Row Level Security, so connecting as `postgres` silently disables every
 * policy in prisma/migrations/*_rls_policies and turns G5 into decoration.
 *
 * For any query on behalf of a signed-in user, do not use this client directly.
 * Use `withUser()` from src/lib/db/scoped.ts, which stamps the user onto the
 * connection so the RLS policies can see who is asking.
 */

const connectionString = process.env.DATABASE_URL

if (!connectionString && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is not set')
}

const createClient = () =>
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
