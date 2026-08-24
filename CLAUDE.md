# CLAUDE.md — Working rules for e-Kawalselia

Applies to every human and every AI tool touching this repo (Claude Code, Antigravity, OpenCode).
Read this before writing any code. If a rule here conflicts with your instinct, the rule wins.

---

## 1. What this is

A licensing, permit and regulatory-supervision portal for **Lembaga Pelabuhan Kemaman (LPKmn)**.
External parties (shipping companies, agents, individual marine pilots) apply online for licences and
permits. LPKmn officers review, evaluate and approve. The system generates the licence as a PDF with a
QR code that anyone can scan to verify without logging in.

Two governing documents, both binding:

- `Keterangan Ringkas Sistem` — the domain (7 modules)
- `Garis Panduan Pembangunan Sistem Aplikasi LPKmn` — 23 mandatory platform features that apply
  regardless of domain. **The vendor may not claim any of these as a change request.**

Requirement IDs used throughout the code and commits are defined in `docs/02-requirements.md`.

---

## 2. Golden rules — violating these means rework

### G1. No hard-coding. Ever.

Every list, dropdown, role, permission, status label, fee, file-type restriction, email template,
document template and application type lives in the **database** and is editable by an admin through
the UI. The Garis Panduan states LPKmn takes no responsibility for the cost of tearing out hard-coded
work. This is the single most expensive mistake available to us.

If you are about to write an array of options in PHP, stop and add a `lookup_type` instead.

### G2. Never physically delete.

Every table uses soft delete. Deleting a user, a lookup value or an application must not break any
historical record that references it. Archive, do not destroy. Historical records display the
**snapshot** of the name at the time of the event, not a live join.

### G3. Everything is audited, and audit entries must be readable by a human.

Never write `update` or `delete` as an action label. Write what actually happened:
`Permohonan Lesen Perkhidmatan Sokongan LPK/LPS/2026/00123 diluluskan oleh Ketua Unit M/T`.
Every audit row carries: actor, reference number, workflow stage, module, page, timestamp, IP.

### G4. Everything is bilingual-ready from day one.

Every user-facing string has `_ms` and `_en`. Even in Phase 1 where the UI ships in BM only, the
columns and translation keys exist. Retrofitting i18n later costs 3x.

### G5. Every query is permission-filtered at the model layer.

Never filter in the controller or the view. An officer from Unit Keselamatan must not be able to see
Unit M/T's applications by changing a URL parameter. Use global scopes.

### G6. Money and identity code gets human review, line by line.

Auth, MFA, password hashing, file upload, QR token generation, and anything touching payment.
AI-generated code in these areas is **not** merged without the lead reading every line.

---

## 3. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Laravel 13** (PHP 8.5) | Team knows it; cheap hosting; fits Malaysian govt norms |
| Admin / CRUD | **Filament 5** | Gives us RBAC UI, list tables with sort/search/export, and form builder — roughly 110 PD of the Garis Panduan for free |
| Database | **PostgreSQL 16 + PostGIS** | PostGIS is required for Port Limit / MRA geofencing in Phase 2. Do not pick MySQL. |
| Frontend | Blade + Livewire 3 + Tailwind | Ships with Filament; no separate SPA to maintain |
| PDF | `spatie/laravel-pdf` (Chromium) | HTML templates admins can edit, not hard-coded layouts |
| Queue | Redis + Horizon | Email, PDF generation, notification fan-out |
| Auth | Laravel Fortify + two-factor | MFA required by both documents |
| Permissions | `spatie/laravel-permission` | Backing store for the roles engine |
| Audit | Custom, in `app/Support/Audit` | Off-the-shelf packages log `update`, which violates G3 |
| Tests | Pest | Faster for interns to write than PHPUnit |

Decisions are recorded in `docs/adr/`. Reverse them there, not in a chat message.

---

## 4. Folder structure

```
app/
  Domain/                      <- business logic, no framework glue
    Application/               <- M1: permohonan (the core module)
      Models/
      States/                  <- status machine
      Actions/                 <- SubmitApplication, ApproveStage, GenerateLicence
      Workflow/
    Identity/                  <- users, organisations, roles, aku-janji
    Reference/                 <- M4: repositori, notis, pekeliling
    Licence/                   <- issued licences, QR verification, renewals
    Analytics/                 <- M3 + M7: KPI, statistik
  Support/
    Audit/                     <- audit interceptor + action labels
    Config/                    <- settings + lookup registry
    Documents/                 <- PDF template engine
    Notifications/             <- notification bus + channels
    Uploads/                   <- file policy engine
  Filament/
    Resources/                 <- admin CRUD screens
    Pages/
    Widgets/                   <- dashboard
  Http/                        <- public-facing controllers (QR verify page, applicant portal)
database/
  migrations/
  seeders/
    LookupSeeder.php           <- every dropdown in the system
    RolePermissionSeeder.php
    ApplicationTypeSeeder.php  <- the 3 Phase 1 types
docs/
tests/
```

**Rule:** `app/Domain/**` must not import from `app/Filament/**` or `app/Http/**`. Dependencies point
inward. This is what lets us swap the admin UI later without rewriting business logic.

---

## 5. Naming

| Thing | Convention | Example |
|---|---|---|
| Tables | snake_case, plural, English | `application_stage_logs` |
| Domain terms | keep Malay | `lesen`, `permohonan`, `malim`, `pemaliman` |
| Models | PascalCase singular | `ApplicationStageLog` |
| Enums | PascalCase, backed by string | `ApplicationStatus::InReview` |
| Lookup type codes | SCREAMING_SNAKE | `JENIS_KAPAL`, `NEGERI` |
| Permission codes | `module.resource.action` | `permohonan.lesen_sokongan.approve` |
| Reference numbers | `LPK/{TYPE}/{YEAR}/{SEQ}` | `LPK/LPS/2026/00123` |
| Migrations | timestamped, one concern each | never combine two tables in one migration |
| Branches | `feat/<req-id>-slug` | `feat/M1-03-multi-step-stepper` |
| Commits | `<req-id>: imperative summary` | `M1-03: add draft autosave to stepper` |

---

## 6. Patterns — do it this way, not your own way

### Adding a dropdown

Never a PHP array. Add a row to `lookup_types`, values to `lookup_values`, seed it in
`LookupSeeder`, and reference it by code. The admin UI at Settings > Senarai Pilihan picks it up
automatically. See `docs/04-data-model.md`.

### Adding an application type

`application_types` is data, not code. A new licence type is a seeder row plus a `form_schema` JSON
plus a workflow. **No new controller, no new model, no new migration.** If you find yourself writing
`if ($type === 'lesen_malim')`, you have broken the design — the difference belongs in configuration.

### Adding a workflow stage

`workflow_stages` rows, ordered by `sequence`. Each stage names the acting role or unit, the action
type, the SLA in days, and what status the application moves to on approve/reject. The engine reads
this; it does not know what a Jawatankuasa Pemaliman is.

### Building a list page

Extend the shared Filament table trait. You get, for free and consistently:
sortable columns with a configurable default, search by keyword, filter by year / date range /
quarter, export to Excel + Word + PDF, and permission filtering. Do not write a bespoke table.

### Generating a document

`document_templates` holds editable HTML with a header and footer. Render through
`app/Support/Documents`. Every generated licence or permit gets a row in `generated_documents` with
a `qr_token`, and the QR points to `/semak/{qr_token}` which is public and requires no login.

### Sending a notification

Never call Mail directly. Dispatch through the notification bus with a template code. The bus
resolves the user's channel preferences, renders the BM or EN template, queues the send, and writes
the audit row.

---

## 7. Security — non-negotiable

- Passwords: bcrypt (cost 12) or argon2id. Never plaintext, never reversible.
- Password policy: minimum **12 characters** (LPKmn DKICT standard), configurable character classes,
  forced change on first login.
- Lockout after **3 consecutive failures**, configurable.
- Session timeout **10 minutes**, configurable.
- **MFA required.**
- HTTPS only. HSTS on. No mixed content.
- Every upload validated by the `file_policies` engine: extension allowlist, real MIME sniffing, size
  cap. Files are stored outside the webroot and served through a permission-checked route.
- QR tokens are random 32-character strings — not sequential IDs, not derived from the licence number.
- The public verification page reveals **only**: licence number, type, holder name, validity dates and
  status. Never the applicant's IC, address, phone or uploaded documents.
- No secrets in the repo. `.env` only.

---

## 8. Definition of Done

A task is not done until all of these are true:

1. Feature works and matches the requirement ID in `docs/02-requirements.md`
2. No hard-coded lists, labels, roles or statuses (G1)
3. Soft delete respected; historical records still render (G2)
4. Audit rows written with human-readable action labels (G3)
5. `_ms` and `_en` strings present (G4)
6. Permission scope applied at model layer and verified with a second role (G5)
7. Pest test covering the happy path and one permission-denied path
8. Screenshot saved to `docs/evidence/<REQ-ID>/` for the LPKmn compliance pack
9. Reviewed and merged by the lead

Item 8 is not optional. The evidence pack is a **payment gate** in this contract.

---

## 9. Rules for interns and WBL using AI tools

1. **You must be able to explain every line you submit.** At code review the lead will pick a line and
   ask what it does. Cannot explain it, the PR is closed. This is not a punishment — it is what stops
   the lead from becoming a full-time reviewer of code nobody understands.
2. **AI is for scaffolding, tests, documentation and UI.** Not for the workflow engine, not for auth,
   not for QR generation, not for anything in `app/Domain/Application` or `app/Support/Audit`.
3. **Never paste real LPKmn data into an AI tool.** No applicant names, IC numbers, company details or
   uploaded documents. Use seeded fake data.
4. **Load this file at the start of every session.** Claude Code picks it up automatically; for
   OpenCode and Antigravity, load it explicitly.
5. If AI proposes a package that is not in section 3, **ask the lead first.** Every added dependency is
   something we maintain through the warranty period.

## 10. Which tool for what

| Tool | Use it for | Owner |
|---|---|---|
| Claude Code | Architecture, cross-file refactors, workflow engine, status machine, turning tender docs into specs, writing tests | Lead |
| Antigravity | UI iteration, browser verification of end-to-end flows, parallel background tasks | Intern 1 (UI), lead for E2E verification |
| OpenCode | Bulk scaffolding, CRUD resources, migrations, seeders, boilerplate exports | Intern 2, WBL |

AI is strongest on boilerplate and weakest on LPKmn's undocumented business rules. Budget human time
for the second category — that is the boss's job in the URS sessions, not something to guess at.

---

## 11. Commands

```bash
composer install && npm install
```

```bash
php artisan migrate:fresh --seed
```

```bash
php artisan test
```

```bash
./vendor/bin/pint
```

```bash
php artisan horizon
```

`migrate:fresh` drops everything — never run it against staging or production.

---

## 12. Scope discipline

`docs/01-scope-baseline.md` is the contract with ourselves. Phase 2 items are listed there explicitly.

If LPKmn asks for something in the Phase 2 list, the answer is not "no" and it is not "yes" —
it is *"that is in the Phase 2 list, let me get you a quote."* Route it to the boss. Every silent
yes costs about RM 17,500 per month of slip.
