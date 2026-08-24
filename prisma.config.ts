import 'dotenv/config'

import { defineConfig } from 'prisma/config'

/**
 * Prisma 7 moved connection URLs out of schema.prisma and into this file.
 *
 * This config drives the *CLI* — migrate, db push, seed — which must use the
 * direct connection. Supabase's pooled endpoint (pgBouncer, port 6543) cannot
 * run DDL, so migrations against it fail in ways that read as unrelated errors.
 *
 * The runtime client is separate: it uses DATABASE_URL through the pg adapter
 * in src/lib/db.
 *
 * Neither URL belongs in the repo. See .env.example and docs/09-setup.md.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
})
