# 12 — Agent Brief, Rounds 3–5

**Purpose:** finish Phase 1 of e-Kawalselia with several AI agents working at once.

This file is written to be **pasted whole into any AI tool** — Claude Code, Gemini/Antigravity,
OpenCode, Cursor, Copilot, or anything else. An agent starting cold has no memory of this project,
so everything it needs is here.

**How to use it:** pick a lane, paste §1–§7 plus that lane's prompt from §8. Nothing else.

---

## 1. The project in sixty seconds

**e-Kawalselia** is a licensing, permit and regulatory-supervision portal for **Lembaga Pelabuhan
Kemaman (LPKmn)**, a Malaysian port authority.

Shipping companies, agents and individual marine pilots apply online for licences and permits.
LPKmn officers review, evaluate and approve. The system generates the licence as a PDF carrying a
QR code that anyone can scan to verify — no login required.

| | |
|---|---|
| Tender | LPKmn 02/2026, RM 198,000 |
| Repo | https://github.com/kizo-88/E-Kawal-Selia |
| Interface language | **Bahasa Melayu** (English strings must exist but are not displayed in Phase 1) |
| Tone | Malaysian government: formal, plain, trustworthy. Not a startup landing page. |

Two documents bind the work. The second one matters more than it looks:

- **Keterangan Ringkas Sistem** — what the system does
- **Garis Panduan Pembangunan Sistem Aplikasi LPKmn** — 23 mandatory platform features, plus a
  clause stating the vendor may not classify any of them as a change request

Slide 53 of the Garis Panduan says LPKmn takes **no responsibility for the cost** of tearing out
hard-coded work. That single clause is why the rules in §2 exist and why several of them are
enforced by tooling rather than trust.

---

## 2. The rules — non-negotiable

`RULES.md` in the repo is the authority. Seven of these are ESLint rules that **fail the build**, so
breaking them is not a review conversation, it is a red pipeline.

| # | Rule | Enforced by |
|---|---|---|
| **G1** | **No hard-coding.** Every dropdown, status label, role, fee, file-type restriction and email template lives in the database, editable by an admin. About to write `const negeri = ['Johor', ...]`? Add a `lookup_type` instead. | `kawalselia/no-hardcoded-lists` |
| **G2** | **Never physically delete.** Every model has `deletedAt`. Deleting a user or a lookup value must never break a historical record referencing it. | `kawalselia/no-hard-delete` |
| **G3** | **Audit entries are sentences a human reads.** Never `update`, never `delete`. Write `PERMOHONAN_DILULUSKAN` + "Permohonan Lesen Perkhidmatan Sokongan LPK/LPS/2026/00123 diluluskan oleh Ketua Unit M/T". An auditor reads this output. | `kawalselia/no-generic-audit-label` |
| **G4** | **Bilingual from day one.** Every user-facing string has `_ms` and `_en`. Phase 1 shows Malay; the English must still exist. | `kawalselia/require-bilingual` |
| **G5** | **Permission filtering happens in the database**, via Row Level Security. Never filter in a route handler or component. | RLS policies + review |
| **G6** | **Auth, MFA, hashing, uploads, QR tokens and payment are read line by line by a human before merge.** No AI-generated code merges unread in those areas. | Human |
| **G7** | **Dependencies point inward:** `src/app → src/domain → src/lib`. `src/domain` must not import `next/*`, `react`, `@/app` or `@/components`. | `kawalselia/domain-stays-pure` |

Plus:

- **Disabling a lint rule requires a written reason** — `// eslint-disable-next-line kawalselia/x -- why`. An undocumented disable is a rejected PR.
- **Never put real LPKmn data in a prompt.** No applicant names, IC numbers, company details or uploaded documents. Seeded fake data only. Contractual and PDPA, not preference.
- **Never add a dependency** without the lead approving it. Every package is maintained through a 12–24 month warranty.
- **Never edit** `prisma/schema.prisma`, `prisma/seed.ts`, `prisma/migrations/**`, `RULES.md`, `eslint-rules/**` or `package.json` unless your lane owns them. Ask instead.

---

## 3. Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | Supabase Postgres 16 + PostGIS |
| ORM | Prisma 7 — connection URLs live in `prisma.config.ts`, not the schema |
| Permission filtering | Supabase Row Level Security |
| Auth | Auth.js + our own policy engine (**not** Supabase Auth — it cannot express GP-03's admin-configurable lockout and session policy) |
| UI | Tailwind v4, own component primitives in `src/components/ui` |
| Exports | `exceljs`, `docx` |
| Tests | Vitest |

```
src/
  app/         routes, layouts, server actions
  domain/      business logic — no next/*, no react, no components (G7)
  lib/
    audit/     audit bus + registered action labels
    config/    settings store + lookup registry
    table/     universal list: filters, sort, keyset paging
    uploads/   file policy engine
    exports/   Excel / Word / PDF
  components/  UI
prisma/        schema, migrations, seed
eslint-rules/  RULES.md, enforced
docs/          01-12
```

---

## 4. Setup

```bash
git clone https://github.com/kizo-88/E-Kawal-Selia.git
```

```bash
cd E-Kawal-Selia && npm install && cp .env.example .env
```

```bash
npx supabase start && npm run db:migrate && npm run db:seed
```

Supabase's local stack includes Inbucket, which captures every outgoing email — nothing can reach a
real applicant from a dev machine.

---

## 5. The gate — run this before every push

```bash
npm run verify
```

That is **lint + typecheck + tests**. All three must be clean, and CI runs the same plus a build.

> Do not substitute `npm run lint && npm run test`. Neither typechecks, so a broken build reads as
> green locally and fails in CI after the merge. That has already happened once on this project.

---

## 6. Lanes and ownership

Parallel agents only work if nobody edits another lane's files. Two agents touching one file
produces a conflict neither can resolve.

| Lane | Owns | Never touches |
|---|---|---|
| **A · Core domain** | `src/domain/**`, `prisma/**`, `src/lib/table/**` | `src/components/**`, `src/app/(public)/**` |
| **B · UI** | `src/components/**`, `src/app/**/page.tsx`, `src/app/**/layout.tsx`, `globals.css` | `src/lib/**`, `src/domain/**`, `prisma/**` |
| **C · Platform services** | `src/lib/notifications/**`, `src/lib/documents/**`, `src/lib/exports/**` | `src/components/**`, `prisma/**`, `src/lib/auth/**` |
| **D · Data wiring** | `src/app/**/actions.ts`, `src/app/**/query.ts`, `src/app/**/route.ts` | `src/components/**`, `src/lib/**`, `prisma/**` |
| **E · QA & compliance** | `tests/**`, `docs/evidence/**` | all `src/**` |

**Lane D is the one people forget, and it is why most of this project looks finished but is not.**
Fifteen routes build; one reads from the database. The audit screen is the exception, and it works
because someone wrote `actions.ts` and `query.ts` beside the page. Every screen needs that.

> **Reading across a boundary is fine** — `import type` from another lane's directory is expected.
> **Editing** across a boundary is not.

### Protocol

```bash
git worktree add ../ekawal-<lane> -b lane/<lane>
```

One directory per agent. They share the same `.git`, so merging is unchanged, but nobody overwrites
a file another agent is mid-read on. Running several agents in one checkout has already cost this
project a phantom test failure and a set of commits landing on the wrong branch.

1. Rebase on `main` at the start of every session
2. `npm run verify` before every push — all three green
3. **The lead merges.** No lane merges its own branch.
4. Two lanes need the same file → **stop and tell the lead.** Do not "just fix it".

---

## 7. Where the project stands

**Done:** config engine, lookup registry, audit bus + retention purge, upload policy, RBAC, menu
registry, auth policy (password, lockout, session, MFA/TOTP), universal list, export engine, design
system, front page, login, dashboard shell, admin shell, audit trail screen.

**Not done — roughly 212 PD, about 45% of Phase 1:**

- **Modul Permohonan does not exist.** `src/domain/` is empty and none of the 25 database models are
  M1 — no `applications`, no `workflows`, no `licences`. This is what the tender is about.
- Six pages render fixtures instead of data
- Notification bus, document engine, identity server actions, reference backend, Change Request Form
- **RLS has never run against a live Postgres.** Until two accounts in different units are shown to
  see different rows, G5 is a claim, not a control.
- Compliance evidence pack — a payment gate, not paperwork

---

## 8. The lane prompts

Each prompt covers Rounds 3, 4 and 5 for that lane. **Stop at each round boundary and wait for the
lead to merge** — later rounds depend on earlier ones landing.

### Lane A — Core domain

```
You are Lane A on e-Kawalselia. Read RULES.md, CLAUDE.md, and
docs/04-data-model.md §6-§8 before writing anything.

Worktree ../ekawal-a, branch lane/a. Rebase on main each session.
You own: src/domain/**, prisma/**, src/lib/table/**
Never touch: src/components/**, src/app/**/page.tsx

This lane holds the blocking chain. Everything else waits on it, so favour
correctness over speed.

ROUND 3 — schema and application engine
  Create the M1 tables exactly as docs/04-data-model.md §6-§8 designs them:
  application_types, application_type_documents, applications,
  application_documents, workflows, workflow_stages, workflow_transitions,
  application_stage_logs, licences.

  Every model gets deletedAt (G2), _ms/_en on user-facing text (G4), and an RLS
  policy (G5). A table without a policy is a data leak waiting for a URL
  parameter.

  application_stage_logs must carry sla_due_at and sla_met from the start. The
  KPI module is Phase 2, but without the capture there is no history to report
  on when it arrives.

  Then the engine: multi-step stepper state, save-as-draft resuming from
  last_completed_step, race-safe reference numbers LPK/{prefix}/{year}/{seq},
  and the status machine — draft → submitted → in_review →
  returned | approved | rejected, plus cancelled, frozen, expired.

  application_types is DATA. A new licence type is a seeder row plus a
  form_schema JSON plus a workflow — no new route, no new model, no new
  migration. Writing `if (type === 'lesen_malim')` means the design is broken.

ROUND 4 — workflow engine and licence generation
  Configurable multi-stage review: each stage names its acting role or unit, an
  action type, an SLA in days, and the status to move to on approve/reject. The
  engine reads this; it must not know what a Jawatankuasa Pemaliman is.
  Actions: approve, reject, return-for-amendment, refer. Every transition
  writes an application_stage_logs row.

  Licence generation on final approval, with a random 32-character qr_token —
  never sequential, never derived from the licence number. The public
  verification page at /semak/{token} needs no login and reveals ONLY: licence
  number, type, holder name, validity dates, status. Never IC, address, phone
  or attachments.

ROUND 5 — the three Phase 1 application types, plus live RLS verification
  Lesen Perkhidmatan Sokongan, Permit Aktiviti, Surat Sokongan PDA2 — as
  seeder rows and form_schema JSON, not as code branches.

  Then verify RLS against a real Postgres with two accounts in different units.
  IMPORTANT: Postgres exempts table owners from RLS, so the app must connect as
  a role that does NOT own the tables and does NOT have BYPASSRLS. Connecting
  as `postgres` silently disables every policy and nothing fails.

Keep the status machine, reference numbers and workflow transitions pure and
testable without a database — follow src/lib/table/query.ts.

Verify with: npm run verify
```

### Lane B — UI

```
You are Lane B on e-Kawalselia. Read RULES.md and CLAUDE.md first.

Worktree ../ekawal-b, branch lane/b. Rebase on main each session.
You own: src/components/**, src/app/**/page.tsx, layouts, globals.css
Never touch: src/lib/**, src/domain/**, prisma/**, or any actions.ts/query.ts

Users are shipping companies, agents and marine pilots, plus LPKmn officers.
Interface is Bahasa Melayu. Tone is Malaysian government — formal, plain,
trustworthy.

Design primitives already exist in src/components/ui. Use them; do not add a
component library.

ROUND 3 — Modul Permohonan screens
  Application detail: form data, uploaded documents, status timeline, remarks
  history from each review stage.
  Officer review queue, built on the existing universal table components, with
  approve / reject / return-for-amendment actions.
  Licence view: the issued licence with its QR, print and download.
  Status indicators: Approved, In Review, Expiring Soon, Expired.

  Define a TypeScript interface for every data shape and use fixture data. Put
  it in src/app/<route>/fixtures.ts so it is obvious what still needs wiring —
  the project has six fixture pages and no easy way to tell them apart from the
  one real page.

ROUND 4 — replace fixtures with the real thing
  Lane D publishes actions.ts and query.ts for each screen. Import from those
  and delete the matching fixtures.ts. Deleting the fixture file is the point:
  it is how anyone can see at a glance what is genuinely wired.

ROUND 5 — GP-22, which is contractual and evidenced with a screenshot
  Usable at 375px, contrasting menus, correct Bahasa Melayu, help notes on
  every critical data-entry page, and a Lighthouse report proving load speed.
  Save the report to docs/evidence/GP-22/.

Every user-facing string needs Malay and English (G4) — the lint rule enforces
it. Check at 375px, 768px and 1280px.

Verify with: npm run verify
```

### Lane C — Platform services

```
You are Lane C on e-Kawalselia. Read RULES.md, CLAUDE.md, and
docs/04-data-model.md §4-§5 first.

Worktree ../ekawal-c, branch lane/c. Rebase on main each session.
You own: src/lib/notifications/**, src/lib/documents/**, src/lib/exports/**
Never touch: prisma/**, src/components/**, src/lib/auth/**, src/lib/table/**

ROUND 3 — notification bus and document engine
  The bus is the ONLY place that may import a mailer; the no-direct-mail lint
  rule enforces it. On every send it must do four things: resolve the user's
  channel preferences, render the BM or EN template, queue the send, and write
  the audit row using the registered action PEMBERITAHUAN_DIHANTAR. A caller
  that skips one has silently broken GP-16.
  Channels: in-app (mandatory) and email. Per-user AND per-role preferences,
  plus broadcast. The tables already exist.

  Document engine: document_templates holds admin-editable HTML with separate
  header, body and footer. Render to PDF. Every render writes a
  generated_documents row, and snapshots template_version onto it so a reprint
  years later matches what was originally issued, not the template as since
  edited.
  Ask the lead before adding a PDF renderer dependency.

ROUND 4 — identity services and reference backend
  Registration with duplicate-account checking and the welcome → verify →
  finish notification chain. Profile management. Aku-Janji acceptance,
  versioned and never updated — a fresh acceptance is a new row, because an
  acceptance is evidence and evidence that can be edited is not evidence.
  Reference repository: categories, versioning, admin CRUD, download counts.

ROUND 5 — Change Request Form
  A user requests a new value for a lookup that allows it → admin reviews →
  admin may amend the request → admin approves → the value is written straight
  into the live list. The full cycle, because the last step is what the
  requirement is actually asking for.

Keep row-shaping and template rendering pure and testable without a database —
follow src/lib/uploads/file-policy.ts.

Verify with: npm run verify
```

### Lane D — Data wiring

```
You are Lane D on e-Kawalselia. Read RULES.md and CLAUDE.md first.

Worktree ../ekawal-d, branch lane/d. Rebase on main each session.
You own: src/app/**/actions.ts, src/app/**/query.ts, src/app/**/route.ts
Never touch: src/components/**, src/app/**/page.tsx, src/lib/**, prisma/**

Your lane exists because fifteen routes build and one reads from the database.
Everything else renders fixtures. You close that gap.

Copy the shape of src/app/(admin)/audit/ — it is the one screen that came out
fully wired, and it is the pattern for every other one.

THE RULE THAT MATTERS MOST IN THIS LANE:
  Every query runs inside withUser() from src/lib/db/scoped.ts. That stamps the
  acting user onto the connection so the RLS policies can see who is asking.
  A query that skips it returns nothing and looks like a broken query rather
  than a missing permission scope.

  There must be no `where: { unitId }` in your code. An officer sees their
  unit's applications because the database policy says so — not because the
  query remembered to ask. If you find yourself filtering by user or unit in
  TypeScript, stop: that is a policy that should be in SQL.

ROUND 3 — audit-adjacent and reference screens
  Wire /pekeliling and the announcements panel.

ROUND 4 — the main flows
  Wire /dashboard, /permohonan, /permohonan/baru, /pelesenan, /profil, /daftar
  and /semak/[token]. Use the universal list from src/lib/table for every list —
  do not write bespoke queries; every list must inherit the same sort, search,
  year/quarter/date-range filtering and export.

  /semak/[token] is the public QR verification page. It runs anonymously via
  asAnonymous(), and it may return ONLY licence number, type, holder name,
  validity dates and status. Never IC, address, phone or attachments.

ROUND 5 — export routes for every list, and cleanup
  Exports must reflect the CURRENT filtered view, so pass the already-filtered
  rows in. Do not re-query inside an exporter: that bypasses the RLS scope the
  caller established, and the downloaded file would contain rows the user
  cannot see on screen.

Verify with: npm run verify
```

### Lane E — QA and compliance

```
You are Lane E on e-Kawalselia. Read RULES.md, CLAUDE.md, and
docs/07-compliance-checklist.md first.

Worktree ../ekawal-e, branch lane/e. Rebase on main each session.
You own: tests/**, docs/evidence/**
Never touch: src/** — report defects, do not fix them.

Your output is a payment gate. The Garis Panduan requires the vendor to submit
a completed checklist of all 23 mandatory features WITH evidence — screenshots,
code excerpts, process descriptions — and to demonstrate any of them live on
request. Compliance is measured for payment and completion milestones.

ROUND 3 — coverage and the evidence structure
  One folder per requirement: docs/evidence/<GP-ID>/, with numbered screenshots
  and a notes.md carrying anything a screenshot cannot show — a file path and
  line reference for code-level requirements like "no hard-coded lists" or "no
  plaintext passwords".

  Where a requirement is about CONFIGURABILITY, a screenshot of the feature is
  not evidence. GP-09 is evidenced by showing an admin adding a lookup value
  AND that value then appearing in the form. Same for GP-03's thresholds and
  GP-11's file types.

ROUND 4 — permission testing, which nothing else covers
  For every list and every screen, prove with TWO accounts in different units
  that each sees only its own rows. This is the G5 control and it has never
  been verified against a live database.

  Postgres exempts table owners from RLS. If the app connects as `postgres`,
  every policy is skipped, every query returns everything, and NOTHING FAILS.
  Confirm the connection role does not own the tables and lacks BYPASSRLS
  before trusting any result.

ROUND 5 — the pack
  Complete all 23 features. Three need a written statement rather than a
  screenshot because they are Phase 2: GP-10 SMS quota display, GP-16 the
  second optional notification channel, GP-19 the KPI module. Flag GP-16 to the
  lead — the Garis Panduan asks for a minimum of two optional channels and
  Phase 1 ships one, so it is a compliance gap worth closing rather than
  arguing at evaluation.

  Also run a load test at 50 concurrent users and attach the result.

Verify with: npm run verify
```

---

## 9. When you are blocked

**Do not guess at an LPKmn business rule.** AI is weakest exactly there, and the tender documents
leave a great deal undefined. There are thirteen open questions in `docs/02-requirements.md` §E —
including hosting, data residency, the approval hierarchy, DDMS, the payment gateway and the KPI
standards. A guess that reaches UAT costs more than the day spent waiting for an answer.

| Blocked on | Do this |
|---|---|
| A business rule | Stop. Write the question down. Give it to the lead for the URS session. |
| A file another lane owns | Stop. Tell the lead. Never edit across the boundary. |
| A missing dependency | Stop. The lead approves every package — we maintain it through the warranty. |
| A schema change | Stop. `prisma/**` belongs to Lane A. |

---

## 10. Definition of Done

A task is finished only when all nine hold:

1. Matches its requirement ID in `docs/02-requirements.md`
2. No hard-coded lists, labels, roles or statuses (G1)
3. Soft delete respected; historical records still render (G2)
4. Audit rows written with human-readable labels (G3)
5. `_ms` and `_en` present (G4)
6. **RLS policy written and verified with a second role** (G5)
7. Test covering the happy path and one permission-denied path
8. **Screenshot in `docs/evidence/<REQ-ID>/`** — a payment gate, not paperwork
9. Reviewed and merged by the lead

---

## 11. A note on adding more agents

More lanes are not linearly faster. Every agent added increases the lead's review load, and the lead
is the single point of failure on this project. Five lanes is workable because the boundaries in §6
are genuinely disjoint. A sixth would need a sixth disjoint area, and there isn't one.

The measured constraints here are the lead's review capacity, thirteen unanswered LPKmn questions,
and three missing tender files. None of the three is improved by another agent.
