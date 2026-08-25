# 13 — Final Push: audited state and the last rounds

All lanes merged. `main` verified: lint clean, typecheck clean, **318 tests**, production build
green, 18 routes.

---

## ⚠️ The compliance checklist is overstating. Fix this before anyone sees it.

`docs/07-compliance-checklist.md` currently marks **21 of 23 features ☑ "done and evidenced"**.

Measured against the repo:

| Claim | Reality |
|---|---|
| 21 features evidenced | **7 evidence folders exist. Zero screenshots.** |
| GP-04 registration evidenced | No Auth.js config anywhere — nothing can log in |
| GP-12/GP-15 lists evidenced | 6 pages still render fixtures |
| M1-R13/14/15 licence types | **None seeded.** No application types, no workflows |

That checklist is a **payment gate**. Submitting it as it stands would put claims in front of LPKmn
that a ten-minute demo disproves — and the Garis Panduan lets them measure compliance for payment.

**Action: reset every ☑ to ◐ or ☐ until a screenshot exists in `docs/evidence/<GP-ID>/`.** A tick
means "demonstrated", not "code merged".

---

## What is genuinely built

This is a lot, and it is good work — the platform layer is real, tested and coherent:

config engine · lookup registry · audit bus with human-readable labels · retention purge · upload
policy with magic-byte sniffing · RBAC · menu registry · password/lockout/session/MFA policy (RFC
6238 vectors pass) · universal list with keyset paging · export engine (Excel/Word/PDF) · notification
bus · document engine · M1 schema (35 models) · application status machine · workflow engine · QR
tokens and public-verification disclosure · RLS policies verified live on Postgres 18 · design
system · 18 routes.

## What is not done

| # | Gap | Evidence | PD |
|---|---|---|---|
| **F1** | **Nothing can log in.** The auth *policy* engine exists — password rules, lockout, session, TOTP — but there is no Auth.js config, no login route handler, no session middleware. | no `auth.config.ts` anywhere | 12 |
| **F2** | **No application types or workflows seeded.** M1-R13/14/15 (Lesen Sokongan, Permit Aktiviti, Surat Sokongan PDA2) do not exist as data. The engine has nothing to run. | `grep LESEN_SOKONGAN prisma/seed.ts` → 0 | 8 |
| **F3** | **Supabase is empty.** Migrations have never been applied to the real project; `public.applications` returns 404 via REST. | verified against the live project | 4 |
| **F4** | **6 pages still on fixtures.** pekeliling, pelesenan, pelesenan/[id], permohonan, permohonan/[id], semakan | `grep -l BASELINE_ src/app/**/page.tsx` | 15 |
| **F5** | **No domain orchestration.** `src/domain` holds pure engines only. Nothing composes submit → review → approve → issue inside a transaction with its audit row. | 5 files, all pure | 14 |
| **F6** | **Licence issuance not end-to-end.** Document engine and QR generation exist separately; approval does not produce a PDF with a QR. | no issuance action | 10 |
| **F7** | **Evidence pack empty.** 23 features, 0 screenshots. Payment gate. | `find docs/evidence -name '*.png'` → 0 | 15 |
| **F8** | RLS verified on Postgres 18, **not on Supabase**. 15 tables from the first migration still unexercised. | `docs/evidence/G5-RLS/notes.md` | 6 |
| **F9** | VAPT, load test at 50 users, production deploy, HTTPS/HSTS | not started | 12 |
| | **Total remaining** | | **≈ 96 PD** |

Earlier estimate was 212 PD; the lanes closed roughly half of it. **~96 PD ≈ 2 months** at the
team's 46 PD/month. Phase 1 is genuinely close — but "close" is not "complete", and the four items
in bold are what stand between a demo that works and one that does not.

## How many phases remain

| | Scope | PD | Status |
|---|---|---|---|
| **Phase 1** | The committed tender scope | 96 remaining of 384 | **~75% done** |
| **Phase 2** | Malim modules, Kawal Selia, Aset, payment, GIS, bilingual, KPI, DDMS | ~270 | Not started, quoted separately |

Phase 1 is one phase from done. Everything in `docs/01-scope-baseline.md` Phase 2 stays out.

---

## Rounds 6–7: the division

The blocking chain is **F1 → F5 → F6**. Nothing can be demonstrated until login works, so that goes
first and to one lane.

### Round 6

| Lane | Work | PD |
|---|---|---|
| **Claude** | F1 auth session wiring · F2 seed the 3 types + workflows | 20 |
| **Gemini** | F4 wire the 6 fixture pages, deleting each `baseline.ts`/`fixtures.ts` as it goes | 15 |
| **OpenCode** | F3 apply migrations to Supabase · F6 licence issuance end-to-end | 14 |

### Round 7

| Lane | Work | PD |
|---|---|---|
| **Claude** | F5 domain orchestration · F8 RLS verified on Supabase | 20 |
| **Gemini** | F7 evidence screenshots for all 23 features, GP-22 Lighthouse | 15 |
| **OpenCode** | F9 VAPT prep, load test, deployment runbook · reset the checklist honestly | 12 |

---

## Prompts

**Claude — Round 6**

```
Read RULES.md, CLAUDE.md, docs/13-final-push.md.
Worktree ../kawalselia-claude, branch lane/claude. Rebase on main.
You own: src/lib/auth/**, src/domain/**, prisma/**, src/app/api/auth/**

F1 — nothing can log in. The policy engine is built and tested
(src/lib/auth: password, lockout, session, totp, recovery) but nothing calls
it. Wire Auth.js: credentials provider calling validatePassword and the lockout
functions, the MFA challenge step, session storage that honours the 10-minute
idle timeout from settings, and the forced password change on first login.

Read the thresholds through getSecurityPolicy(). Never hard-code them — GP-03
requires them admin-configurable and a correct constant still fails it.

Every auth event writes an audit row through the registered actions already in
src/lib/audit/actions.ts. Never log a password, hash, MFA secret or recovery
code; run diffs through redact().

G6: this is read line by line before merge.

F2 — seed the three Phase 1 application types as DATA: LESEN_SOKONGAN,
PERMIT_AKTIVITI, SURAT_PDA2. Each is an application_types row with a
form_schema JSON, a workflow, and its required documents. Validate every
form_schema with validateFormSchema() in the seeder — a malformed schema does
not fail loudly, it renders a form with a missing field.

If you write `if (type === '...')` anywhere, the design is broken (ADR 0002).

Verify with: npm run verify — and run npm run build before saying you are done.
```

**Gemini — Round 6**

```
Read RULES.md, CLAUDE.md, docs/13-final-push.md.
Worktree ../kawalselia-gemini, branch lane/gemini. Rebase on main.
You own: src/components/**, src/app/**/page.tsx, layouts, globals.css
Never touch: src/lib/**, src/domain/**, prisma/**, actions.ts, query.ts

F4 — six pages still render fixtures: pekeliling, pelesenan, pelesenan/[id],
permohonan, permohonan/[id], semakan.

Convert each to a server component that calls the query module, and push the
interactive parts down into a client child. THIS IS THE RULE THAT WAS MISSING
AND IT BROKE THE BUILD: a 'use client' page must never import ./query. Doing so
pulls Prisma and the pg driver into the browser bundle. query.ts now carries
`import 'server-only'` so it fails immediately — if you see that error, the fix
is to move the fetch up into a server component, never to delete the guard.

Delete each baseline.ts / fixtures.ts as you replace it. Deleting the file is
the point: it is how anyone can see at a glance what is genuinely wired. Six
files should be gone when you finish.

Every user-facing string needs Malay and English (G4). Usable at 375px.

Verify with: npm run verify — and npm run build.
```

**OpenCode — Round 6**

```
Read RULES.md, CLAUDE.md, docs/13-final-push.md, docs/evidence/G5-RLS/notes.md.
Worktree ../kawalselia-opencode, branch lane/opencode. Rebase on main.
You own: src/lib/documents/**, src/lib/exports/**, scripts/**
Never touch: prisma/schema.prisma, src/components/**, src/lib/auth/**

F3 — apply the migrations to the real Supabase project. The lead will supply
DATABASE_URL and DIRECT_URL; the anon key alone cannot do this. Migrations need
the DIRECT connection (port 5432), not the pooler — pgBouncer cannot run DDL,
and it fails in ways that read as unrelated errors.

Then create the application role the app connects as. It must NOT own the tables
and must NOT have BYPASSRLS: Postgres exempts owners from row-level security, so
connecting as the owner silently disables every policy, returns every row, and
fails nothing. Read docs/evidence/G5-RLS/notes.md first — that document records
a critical recursion bug and two harness bugs that produced false passes.

F6 — licence issuance end to end. On final approval: render the document
template to PDF, write a generated_documents row with a fresh 32-character
qr_token from src/domain/licence/qr-token.ts, create the licences row, and make
/semak/{token} resolve it. Snapshot template_version so a reprint years later
matches what was issued.

The public page returns ONLY what publicVerification() produces. Do not add
fields to that payload.

Verify with: npm run verify — and npm run build.
```

---

## Two rules that were missing and cost us

Both came from real failures this week. They belong in `docs/10-parallel-workstreams.md`:

1. **A `'use client'` page must never import `./query`.** Lane D owns query.ts, Lane B owns
   page.tsx, and neither file was wrong on its own — the boundary that mattered was between a page
   that fetches and a page that is interactive, and nothing stated it. It broke the build with
   `Can't resolve 'dns'`, seven layers from the cause.

2. **`npm run build` before declaring done.** `npm run verify` does not build. Two separate red-main
   incidents this week were both a passing verify with a failing build.
