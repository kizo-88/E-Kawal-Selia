# CLAUDE.md — e-Kawalselia

## ⚠️ Read [RULES.md](RULES.md) first. It outranks this file and every other.

This file is the practical companion: stack, structure, patterns, commands. The
**non-negotiable rules** — G1 through G7, security values, AI restrictions — live in `RULES.md`,
and seven of them are enforced by ESLint rules that fail the build.

---

## 1. What this is

A licensing, permit and regulatory-supervision portal for **Lembaga Pelabuhan Kemaman (LPKmn)**.
Shipping companies, agents and individual marine pilots apply online for licences and permits.
LPKmn officers review, evaluate and approve. The system generates the licence as a PDF with a QR
code anyone can scan to verify — no login.

Tender **LPKmn 02/2026**, RM 198,000, Phase 1 target 8.5 months. Requirement IDs (`M1-R02`, `GP-18`,
`X-R11`) come from [docs/02-requirements.md](docs/02-requirements.md) and belong in branch names,
commits, tests and evidence folders.

---

## 2. Stack

| Layer | Choice | Note |
|---|---|---|
| Framework | **Next.js 16** (App Router) + TypeScript | |
| Database | **Supabase Postgres 16 + PostGIS** | PostGIS needed for Phase 2 geofencing (X-R07) |
| ORM | **Prisma 7** | URLs live in `prisma.config.ts`, not the schema |
| Permission filtering | **Supabase RLS** | G5, enforced in the database |
| Storage | **Supabase Storage** | GP-11 file policies |
| In-app notifications | **Supabase Realtime** | X-R04 |
| Auth | **Auth.js + our own policy engine** | *Not* Supabase Auth — see [ADR 0005](docs/adr/0005-auth-not-supabase-auth.md) |
| Admin scaffold | Refine + shadcn/ui | |
| Tables | TanStack Table | GP-12 |
| Exports | `exceljs`, `docx`, Puppeteer | GP-12 needs Excel **and** Word **and** PDF |
| Tests | Vitest, Playwright | |

Decisions live in [docs/adr/](docs/adr/). Reverse them there, not in a chat message.

**Do not add a dependency not listed here without asking the lead.**

---

## 3. Structure

```
src/
  app/            <- routes, layouts, server actions. Framework lives here.
  domain/         <- business logic. No next/*, no react, no components. (G7)
    application/  <- M1 permohonan: the core module
    identity/     <- users, organisations, roles, aku-janji
    reference/    <- M4 repositori, notis, pekeliling
    licence/      <- issued licences, QR verification, renewals
  lib/
    audit/        <- audit bus + action labels (G3)
    config/       <- settings + lookup registry (G1)
    documents/    <- PDF template engine
    notifications/<- notification bus. Only place that may import a mailer.
    uploads/      <- file policy engine
    enums/        <- behavioural enums only, never business lists
  components/     <- UI
prisma/
  schema.prisma
  migrations/     <- includes the RLS policy migrations
  seed.ts         <- every lookup, role, permission, template
eslint-rules/     <- RULES.md, enforced
docs/
tests/
```

---

## 4. Naming

| Thing | Convention | Example |
|---|---|---|
| Tables | snake_case plural, English | `application_stage_logs` |
| Prisma models | PascalCase singular | `ApplicationStageLog` |
| Domain terms | keep Malay | `lesen`, `permohonan`, `malim`, `pemaliman` |
| Lookup type codes | SCREAMING_SNAKE | `JENIS_KAPAL`, `NEGERI` |
| Permission codes | `module.resource.action` | `permohonan.lesen_sokongan.approve` |
| Reference numbers | `LPK/{TYPE}/{YEAR}/{SEQ}` | `LPK/LPS/2026/00123` |
| Branches | `feat/<req-id>-slug` | `feat/M1-03-stepper-autosave` |
| Commits | `<req-id>: imperative summary` | `M1-03: add draft autosave to stepper` |

---

## 5. Patterns — do it this way, not your own way

### Adding a dropdown
Never an array. Add a `lookup_types` row, values to `lookup_values`, seed in `prisma/seed.ts`,
reference by code. The admin screen picks it up automatically. The lint rule will stop you anyway.

### Adding an application type
`application_types` is data. A new licence type is a seeder row plus a `form_schema` JSON plus a
workflow. **No new route, no new model, no new migration.** Writing
`if (type === 'lesen_malim')` means you have broken the design — that difference belongs in
configuration.

### Adding a workflow stage
`workflow_stages` rows ordered by `sequence`. Each names the acting role or unit, the action type,
the SLA in days, and the status to move to on approve/reject. The engine reads this; it does not
know what a Jawatankuasa Pemaliman is.

### Building a list page
Use the shared table component. You inherit, consistently: configurable default sort, ASC/DESC,
keyword search, filters by year / date range / quarter, export to Excel + Word + PDF, and RLS
filtering. Do not write a bespoke table — GP-12 requires all of it on **every** list.

### Adding a table
Every model gets `deletedAt` (G2), `_ms`/`_en` for user-facing text (G4), and **an RLS policy**
(G5). A table without a policy is a data leak waiting for a URL parameter.

### Generating a document
`document_templates` holds admin-editable HTML. Render through `src/lib/documents`. Every generated
licence gets a `generated_documents` row with a random 32-char `qr_token`; the QR points at
`/semak/{qr_token}`, public and login-free, disclosing only what X-R12 permits.

### Sending a notification
Never import a mailer. Dispatch through the notification bus with a template code — it resolves
channel preferences, renders BM or EN, queues the send and writes the audit row. The lint rule
blocks the shortcut.

---

## 6. Definition of Done

1. Matches its requirement ID in [docs/02-requirements.md](docs/02-requirements.md)
2. No hard-coded lists, labels, roles or statuses (G1)
3. Soft delete respected; historical records still render (G2)
4. Audit rows written with human-readable labels (G3)
5. `_ms` and `_en` present (G4)
6. **RLS policy written and verified with a second role** (G5)
7. Vitest covering the happy path and one permission-denied path
8. **Screenshot in `docs/evidence/<REQ-ID>/`** — this is a payment gate, not paperwork
9. Reviewed and merged by the lead

---

## 7. Commands

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run lint && npm run test
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

Setup from scratch: [docs/09-setup.md](docs/09-setup.md).

---

## 8. Which tool for what

| Tool | Use it for |
|---|---|
| **Claude Code** | Architecture, cross-file refactors, the workflow engine, status machine, turning tender docs into specs, writing tests |
| **Antigravity** | UI iteration, browser verification of end-to-end flows, parallel background tasks |
| **OpenCode** | Bulk scaffolding, CRUD screens, migrations, seeders, boilerplate exports |

AI is strongest on boilerplate and weakest on LPKmn's undocumented business rules. Budget human
time for the second category — that is the boss's job in the URS sessions, not something to guess.

**Before generating anything, re-read [RULES.md](RULES.md).** The lint rules catch G1–G4 and G7,
but nothing mechanical catches a misunderstood business rule.
