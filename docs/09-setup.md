# 09 — Local Setup

Follow this exactly. A half-configured environment produces bugs that look like code bugs and burn a
day of the lead's time.

---

## 1. Prerequisites

```bash
scoop install nodejs git
```

Node 22+, plus **Docker Desktop running** (Supabase's local stack runs in it).

```bash
node -v && npm -v && docker info --format "{{.ServerVersion}}"
```

---

## 2. Project

```bash
git clone https://github.com/kizo-88/E-Kawal-Selia.git
```

```bash
cd E-Kawal-Selia && npm install
```

```bash
cp .env.example .env
```

Generate the two secrets and paste them into `.env`:

```bash
node -e "console.log('AUTH_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

```bash
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

`ENCRYPTION_KEY` encrypts `ic_no` and `mfa_secret` at rest. **Lose it and those columns become
unreadable.** Back it up somewhere that is not this repository.

---

## 3. Supabase

```bash
npx supabase start
```

First run pulls several GB of images — leave it. When it finishes it prints the local URLs and keys.
Copy the `anon key` and `service_role key` into `.env`.

| Service | Where |
|---|---|
| API | http://127.0.0.1:54321 |
| Postgres | `127.0.0.1:54322` |
| Studio | http://127.0.0.1:54323 |
| Inbucket (catches all mail) | http://127.0.0.1:54324 |

**Every outgoing email is captured by Inbucket.** Nothing can reach a real applicant from a dev
machine. Do not reconfigure SMTP to a real server locally.

---

## 4. Database

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

The seed loads settings, lookups, internal units, the five baseline roles and the permission
catalogue — everything G1 says must be data rather than code.

---

## 5. Run

```bash
npm run dev
```

http://localhost:3000

---

## 6. Before every commit

```bash
npm run lint && npm run test
```

Both must be clean. CI runs the same commands plus `prisma validate` and `next build`, and blocks
the PR otherwise.

---

## ⚠️ Row Level Security — the one thing that silently breaks

**Postgres exempts table owners from RLS.** If the application connects as `postgres`, every policy
in `prisma/migrations/*_rls_policies` is skipped, every query returns everything, and **nothing
fails**. G5 evaporates and the test suite still passes.

So, before staging or production:

1. Create a dedicated application role that does **not** own the tables and does **not** have
   `BYPASSRLS`
2. Point `DATABASE_URL` at that role
3. Keep `DIRECT_URL` on the owner — migrations need DDL rights
4. Verify with two accounts in different units that each sees only their own records

Locally the default `postgres` user is convenient and fine, **as long as you know RLS is not
actually being exercised on your machine.** Treat "it worked locally" as no evidence at all for
anything permission-related.

---

## Troubleshooting

**Queries return nothing for a signed-in user** — you called `prisma` directly instead of
`withUser()` from `src/lib/db/scoped.ts`. Without the user stamped on the connection, RLS evaluates
against NULL and correctly shows you nothing.

**`prisma migrate` fails with a connection or DDL error** — `DIRECT_URL` is pointing at the pooled
endpoint. pgBouncer cannot run DDL. Use port 54322 locally, 5432 on Supabase Cloud.

**`Hard-coded list of N strings`** — that is the G1 lint rule doing its job. Add a `lookup_type` and
seed it. If it genuinely is not a business list, disable the rule *with a written reason* — an
undocumented disable is a rejected PR.

**`"labelMs" has no matching "labelEn"`** — G4. Both languages, from day one.

**`src/domain must not import "next/navigation"`** — G7. Business logic does not know about the
framework. Put the framework call in `src/app` and have it call a domain action.

**`npm audit` reports high severity in `deepmerge-ts`** — known, recorded in
[ADR 0004](adr/0004-nextjs-and-supabase.md). Build-time only, via Prisma's CLI. The fix is a
breaking downgrade to Prisma 6. Do not "fix" it without reading that ADR.

---

## Rules that are not negotiable

1. **Never point `.env` at a real LPKmn database.** Seeded fake data only, everywhere except
   production.
2. **Never paste real applicant data into an AI tool** — no names, IC numbers, company details or
   uploaded documents. Contractual and PDPA, not preference.
3. **Never commit `.env`.** It is gitignored; keep it that way.
4. `prisma migrate reset` drops everything. Local only.

Full rules: [RULES.md](../RULES.md).
