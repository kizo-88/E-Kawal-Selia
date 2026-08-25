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

/**
 * The check is deliberately inside the factory rather than at module scope.
 *
 * Next.js evaluates this module while collecting page data during `next build`,
 * so a module-level throw makes the build itself require a runtime secret — and
 * it fails on a page that never runs at build time. Building an artefact and
 * connecting to a database are different concerns, and only the second one
 * needs a connection string.
 */
const createClient = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and fill it in — see docs/09-setup.md.',
    )
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createClient> | undefined
}

/**
 * Constructed on first use, not on import.
 *
 * `next build` imports this module while collecting page data. Building the
 * client eagerly there would open a pool — and demand a connection string —
 * during a step that never touches the database. The proxy defers both to the
 * first actual query.
 *
 * It also keeps the single-instance behaviour that matters in development,
 * where Next re-evaluates modules on every change and a fresh pool per reload
 * exhausts Postgres connections within minutes.
 */
export const prisma = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, property, receiver) {
    globalForPrisma.prisma ??= createClient()
    const value = Reflect.get(globalForPrisma.prisma, property, receiver)
    return typeof value === 'function' ? value.bind(globalForPrisma.prisma) : value
  },
})
