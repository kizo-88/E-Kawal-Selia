# 03 — Architecture

## 1. Shape of the system

```
                         PUBLIC (no login)
                    ┌──────────────────────────┐
                    │  Front page / Log-in     │  GP-21
                    │  Berita, Pekeliling, FAQ │  GP-17
                    │  /semak/{qr_token}       │  X-R12  <- QR verification
                    └────────────┬─────────────┘
                                 │
        ┌────────────────────────┴────────────────────────┐
        │                                                  │
┌───────▼─────────┐                              ┌─────────▼────────┐
│ APPLICANT PORTAL│                              │  LPKmn BACKOFFICE│
│  (external)     │                              │  (internal)      │
│                 │                              │                  │
│ Register + MFA  │  M5                          │ Review + approve │  M1-R06
│ Apply (stepper) │  M1-R02                      │ Dashboard        │  GP-15
│ Save draft      │  M1-R03                      │ Audit report     │  GP-18
│ Upload docs     │  M1-R04                      │ Config + lookups │  GP-07/08/09
│ Track status    │  M1-R12                      │ Templates        │  GP-10/13
│ Download licence│  M1-R11                      │ User admin       │  GP-04
└───────┬─────────┘                              └─────────┬────────┘
        │                                                  │
        └────────────────────────┬─────────────────────────┘
                                 │
                   ┌─────────────▼──────────────┐
                   │      DOMAIN CORE           │
                   │                            │
                   │  Application engine        │  M1-1
                   │  Workflow engine           │  M1-2
                   │  Licence + QR generation   │  M1-3
                   │  Identity + RBAC           │  GP-01/02
                   └─────────────┬──────────────┘
                                 │
                   ┌─────────────▼──────────────┐
                   │      PLATFORM SUPPORT      │
                   │                            │
                   │ Config  Audit  Documents   │
                   │ Notifications  Uploads     │
                   │ Universal list + exports   │
                   └────────────────────────────┘
```

Everything in **PLATFORM SUPPORT** is domain-agnostic. It is built once, in months 1–3, and every
module above it consumes it. This is where the Garis Panduan's 23 features actually live, and it is
the part that becomes a reusable asset for the next LPKmn system.

---

## 2. Stack and why

See `adr/0004-nextjs-and-supabase.md` for the full decision record (it supersedes ADR 0001).
Summary:

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), TypeScript |
| Admin / CRUD | Refine + shadcn/ui |
| Database | Supabase Postgres 16 + PostGIS |
| ORM | Prisma 7 |
| PDF | Puppeteer over admin-editable HTML |
| Queue | BullMQ + Redis |
| Auth | Auth.js + our own policy engine (ADR 0005) |
| Permission filtering | Supabase Row Level Security |
| Audit | custom |
| Tests | Vitest + Playwright |

**The single most important choice is Filament.** It ships list tables with sorting, keyword search,
filters and exports, plus a form builder and a permission-aware resource system. That is the bulk of
GP-12, GP-01 and GP-02 — roughly 110 PD — arriving as configuration instead of code. Reject it and
Phase 1 no longer fits in the budget.

**PostGIS is chosen now, not later.** X-R07 requires point-in-polygon validation against real Port
Limit and MRA boundaries. That is Phase 2 work, but migrating databases mid-project is not something
this team has the capacity to absorb. Pay the small cost now.

---

## 3. Layering rule

```
src/app   ──depends on──▶   src/domain   ──depends on──▶   src/lib
```

- `src/domain/**` may **not** import `next/*`, `react`, `@/app` or `@/components`.
- `src/lib/**` may not import from `src/domain/**`.
- Business rules live in domain actions, never in a route handler or a component.

This is enforced by the `kawalselia/domain-stays-pure` lint rule, not by review. It is also why
porting this codebase from Laravel to Next.js cost hours rather than weeks.

---

## 4. The four engines

### 4.1 Config engine (`app/Support/Config`) — GP-07, GP-08, GP-09

Two stores:

- **`settings`** — singleton key/value with a type and a group. System name, logo path, theme,
  session timeout, lockout threshold, password minimum length, audit retention days, date and
  currency formats.
- **`lookup_types` + `lookup_values`** — every dropdown in the system. A lookup type has a code
  (`NEGERI`, `JENIS_KAPAL`, `KATEGORI_PENGGUNA`); values carry `label_ms`, `label_en`, sort order,
  active flag and a free `metadata` JSON.

Anything that would otherwise be a PHP array or an enum of business values goes here. Enums in code
are reserved for things that have **behaviour attached** — application status, workflow action type —
never for lists LPKmn might want to edit.

### 4.2 Workflow engine (`app/Domain/Application/Workflow`) — M1-2

A workflow is data:

```
workflows
  └── workflow_stages (sequence, actor role/unit, action type, SLA days, is_final)
        └── workflow_transitions (approve / reject / return / refer)
```

The engine reads the stages and moves an application through them. It has no knowledge of
Jawatankuasa Pemaliman, Unit M/T or PDA2. Adding the Lesen Malim committee stage in Phase 2 is a
seeder row, not a code change.

Each transition writes an `application_stage_logs` row: who acted, what action, remarks, attachments,
when, and whether the SLA was met. That table is also the raw material for GP-19 (KPI) in Phase 2 —
which is why the SLA fields exist in Phase 1 even though the KPI module does not.

### 4.3 Document engine (`app/Support/Documents`) — GP-13, M1-3

`document_templates` holds admin-editable HTML with separate header and footer, paper size and
orientation, and a version number. Rendering produces a `generated_documents` row carrying the file
path, a random 32-character `qr_token`, and validity dates.

The QR points at `/semak/{qr_token}`. That route is public, rate-limited, and returns only:
licence number, type, holder name, valid from, valid until, status. Nothing else — no IC, no address,
no phone, no uploaded documents.

### 4.4 Audit engine (`app/Support/Audit`) — GP-18, X-R01, X-R02

A model observer captures create, update, delete and restore, plus explicit domain events dispatched
from Actions. Every row records actor, actor name snapshot, a human-readable action label in BM and
EN, the auditable model, the reference number, workflow stage, module code, page code, IP, user agent,
and the changed values.

GP-18 requires a flush button and an automatic retention period. Both live in `settings`. Purged rows
are counted and the purge itself is audited.

---

## 5. Universal list — GP-12, GP-14

One shared Filament table trait. Every list in the system extends it and inherits:

- configurable default sort column and direction, plus user click ASC/DESC
- keyword search
- filters: by year, by date range (start–end), by quarter
- export of the **current view** — default list or search results — to Excel, Word, PDF
- charts exported to PNG, JPG, PDF
- an iFrame-embeddable URL for charts, for the LPKmn public website (GP-14)
- permission filtering applied at the model layer

Nobody writes a bespoke table. If a list needs something the trait does not have, the trait grows.

---

## 6. Permission model — GP-01, GP-02

Three layers, all data-driven:

1. **Permissions** — `module.resource.action`, e.g. `permohonan.lesen_sokongan.approve`
2. **Roles** — bundles of permissions. Seeded with the five GP-02 baseline levels (Super Admin,
   Admin Data, Pengurusan, Reviewer/Approver, End-user) but **unlimited new roles are creatable**.
3. **Scope** — a global Eloquent scope filters records by the user's unit and role. An officer sees
   their unit's applications, not everyone's.

Menu visibility is a separate mapping table (`menu_item_role`) so LPKmn can hide a menu without
revoking the underlying permission.

---

## 7. Environments

| Env | Purpose | Data |
|---|---|---|
| local | Each developer's machine | Seeded fake data only |
| staging | LPKmn demos, UAT | Seeded fake data; refreshed from seeders |
| production | Go-live | Real |

**Never put real applicant data in local or staging.** IC numbers, company details and uploaded
documents are personal data. This also matters for the AI-tool rule in `CLAUDE.md` §9.3.

---

## 8. Non-functional targets

| Requirement | Target | How proven |
|---|---|---|
| GP-22 fast loading | First contentful paint under 2.0s on 4G | Lighthouse report attached to evidence pack |
| GP-22 responsive | Usable at 375px width | Manual check on real device, screenshot |
| GP-03 session timeout | 10 min, configurable | Setting + test |
| GP-23 HTTPS | Enforced, HSTS on | Deployment checklist |
| Concurrency | 50 concurrent users | Load test in month 8 |
| GP-18 audit retention | Configurable, with flush | Setting + test |

## 9. What we deliberately are not building

- No microservices. One Laravel application.
- No separate SPA frontend. Livewire.
- No Kubernetes. One VPS, or LPKmn's hosting.
- No event-sourcing. `application_stage_logs` is enough history.
- No custom design system. Filament's, themed to LPKmn colours.

Every one of these would be defensible on a RM 500k project. On RM 198k with 2.2 effective FTE, each
is a way to miss the deadline.
