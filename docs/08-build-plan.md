# 08 — Build Plan

The coding plan, in execution order. Each task is a branch, a PR and an evidence folder.

**Format:** `ID · task · owner · PD · depends on`
**Owners:** `LEAD` · `WBL` · `I1` (UI) · `I2` (content/CRUD) · `I3` (test/docs) · `BOSS`

Nothing starts until the month-1 gate in `05-schedule.md` clears.

---

## Stage 0 — Gate (before any code)

| # | Task | Owner |
|---|---|---|
| 0.1 | Obtain tender files 01, 02, 05. Confirm warranty, LAD, delivery period, payment milestones | BOSS |
| 0.2 | Bid / no-bid decision against `06-costing.md` §8 | BOSS |
| 0.3 | URS/BRS session with Unit M/T; obtain the 3 application forms, fee schedule, licence/permit/PDA2 templates, approval hierarchy | BOSS |
| 0.4 | Confirm whether the Garis Panduan is contractually annexed (`02-requirements.md` Q4) | BOSS |
| 0.5 | Request the LPKmn compliance checklist template (Q5) | BOSS |
| 0.6 | Confirm overhead treatment with UMPSA Holding | BOSS |

> **Do not write code until 0.1–0.3 are done.** Building against guessed forms is the single most
> reliable way to lose this project.

---

## Stage 1 — Skeleton (Month 1) · 35 PD

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 1.1 | `laravel new`, PHP 8.3, PostgreSQL 16 + PostGIS, Redis, Filament 3, Pint, Pest | LEAD | 2 | — |
| 1.2 | Repo, branch protection on `main`, GitHub Actions: Pint + Pest on every PR | LEAD | 1 | 1.1 |
| 1.3 | Local / staging / production env configs, `.env.example`, no secrets committed | LEAD | 1 | 1.1 |
| 1.4 | Folder skeleton per `03-architecture.md` §4; add an architecture test asserting `Domain` does not import `Filament` or `Http` | LEAD | 1 | 1.1 |
| 1.5 | Base model: soft deletes, uuid trait, audit trait hooks (G2, G3) | LEAD | 2 | 1.4 |
| 1.6 | Translate the ERD in `04-data-model.md` into migrations for §1–§5 (identity, config, audit, notification, documents) | LEAD | 4 | 1.5 |
| 1.7 | Wireframes: front page, login, register, applicant dashboard, stepper, admin list, admin form | I1 | 6 | 0.3 |
| 1.8 | LPKmn theme: colour tokens, typography, Filament panel theme | I1 | 3 | 1.7 |
| 1.9 | Catalogue reference documents (pekeliling, UUK, ISPS, MARPOL, Green Port, kadar fi) into a seed manifest | I2 | 4 | 0.3 |
| 1.10 | Test-case template, `docs/evidence/` folder structure, Pest conventions doc | I3 | 3 | 1.1 |
| 1.11 | Onboard Laravel + Filament; build one throwaway CRUD to learn the stack | WBL | 5 | 1.1 |
| 1.12 | Process maps for the 3 P1 application types, from the URS | BOSS | 3 | 0.3 |

**Exit:** `php artisan migrate:fresh --seed` runs green, CI passes, wireframes approved.

---

## Stage 2 — Config, RBAC, Audit (Month 2) · 42 PD

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 2.1 | `settings` store: typed get/set, cache, admin UI grouped by section (GP-07, GP-08) | WBL | 5 | 1.6 |
| 2.2 | Seed all settings groups: system, organisation, format, security, audit, notification | WBL | 2 | 2.1 |
| 2.3 | Lookup registry: `lookup_types`/`lookup_values`, `Lookup::values('NEGERI')` helper, admin CRUD (GP-09) | WBL | 5 | 1.6 |
| 2.4 | `LookupSeeder` with every dropdown identified so far | I2 | 3 | 2.3 |
| 2.5 | Permission catalogue: `module.resource.action` codes, seeder | LEAD | 2 | 1.6 |
| 2.6 | Roles engine: 5 baseline levels, unlimited custom, `is_system` guard, admin UI (GP-01, GP-02) | LEAD | 5 | 2.5 |
| 2.7 | Menu registry + `menu_item_role` visibility mapping (GP-01) | LEAD | 3 | 2.6 |
| 2.8 | Global scope base class for unit/role record filtering (G5) | LEAD | 3 | 2.6 |
| 2.9 | Audit interceptor: observer + explicit domain events, human-readable BM/EN labels (G3, GP-18) | LEAD | 5 | 1.5 |
| 2.10 | Audit list + report UI, filters, export (GP-18, X-R02) | I2 | 4 | 2.9 |
| 2.11 | Audit retention setting + scheduled purge + manual flush button, purge itself audited (GP-18) | I2 | 2 | 2.9 |
| 2.12 | File policy engine: extension allowlist, MIME sniff, size cap, admin UI (GP-11) | WBL | 4 | 2.1 |
| 2.13 | Front page + login page UI build (GP-21) | I1 | 5 | 1.8 |
| 2.14 | Pest tests: settings, lookups, roles, permission denial, audit write | I3 | 4 | 2.6 |

**Exit:** an admin can add a dropdown value, create a role, and see a readable audit entry for both.

---

## Stage 3 — Auth, MFA, Universal List, Documents (Month 3) · 48 PD

🎯 **MILESTONE 1** — demo login + MFA + RBAC + audit trail to LPKmn

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 3.1 | Fortify auth, bcrypt cost 12, 12-char policy, configurable character classes (GP-03) | LEAD | 3 | 2.1 |
| 3.2 | Lockout after 3 failures (configurable), session timeout 10 min (configurable) | LEAD | 2 | 3.1 |
| 3.3 | Forced password change on first login | LEAD | 1 | 3.1 |
| 3.4 | MFA: TOTP enrolment, challenge, recovery codes (GP-03, M5-R05) | LEAD | 5 | 3.1 |
| 3.5 | Universal list trait: configurable default sort, ASC/DESC, keyword search (GP-12) | LEAD | 5 | 2.8 |
| 3.6 | List filters: year, date range, quarter (GP-12) | LEAD | 3 | 3.5 |
| 3.7 | Export current view to Excel, Word, PDF (GP-12) | LEAD | 4 | 3.5 |
| 3.8 | Document template engine: editable HTML header/body/footer, paper size, version (GP-13) | WBL | 6 | 2.1 |
| 3.9 | Seed LPKmn letterhead template + disclaimer block | WBL | 2 | 3.8 |
| 3.10 | `generated_documents` + PDF render pipeline via queue | WBL | 4 | 3.8 |
| 3.11 | UI system: responsive breakpoints, contrast menus, help-note component (GP-22) | I1 | 6 | 2.13 |
| 3.12 | Registration screens + CAPTCHA integration (GP-04) | I2 | 4 | 2.13 |
| 3.13 | Test: auth, lockout, MFA, list filters, export; evidence for GP-01/02/03/18 | I3 | 3 | 3.4 |

**Exit:** log in with MFA, land on a permission-filtered list, filter it by quarter, export to Excel,
and see every step in a readable audit trail.

---

## Stage 4 — Modul Pengguna (Month 4) · 50 PD

🎯 **MILESTONE 2** — Modul Pengguna complete

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 4.1 | `organisations` + external categories: syarikat, konsortium, individu, pengguna pelabuhan (M5-R01) | LEAD | 5 | 2.6 |
| 4.2 | Company ↔ wakil syarikat linkage, primary contact, verification (M5-R01) | LEAD | 5 | 4.1 |
| 4.3 | Registration flow end to end: self-register, duplicate check, verify chain (GP-04) | LEAD | 4 | 3.12 |
| 4.4 | Admin user management: create, activate, deactivate, review, archive (GP-04, GP-02) | LEAD | 3 | 4.3 |
| 4.5 | Notification bus: channel resolver, preference lookup, queue dispatch, audit write | WBL | 6 | 2.9 |
| 4.6 | In-app notification channel + post-login notification panel (X-R04, GP-16) | WBL | 3 | 4.5 |
| 4.7 | Email channel + template manager UI, preview, send toggle, categories (GP-10, X-R03) | WBL | 5 | 4.5 |
| 4.8 | Broadcast + per-role notification preferences (GP-16) | WBL | 3 | 4.5 |
| 4.9 | User profile: fields, photo upload, password change, access level, print view (GP-05) | I1 | 5 | 3.11 |
| 4.10 | Aku-Janji: versioned undertaking, acceptance at final registration step, template download, profile display (GP-06) | I1 | 4 | 4.3 |
| 4.11 | `internal_units` + user/unit/role mapping, identity verification workflow (M5-R02) | I2 | 4 | 2.6 |
| 4.12 | Test: registration, duplicate rejection, notification delivery, Aku-Janji; evidence GP-04/05/06/10/16 | I3 | 3 | 4.10 |

**Exit:** an external company registers, verifies, accepts the Aku-Janji, and appears in admin with the
right role — and an officer gets notified about it in-app and by email.

---

## Stage 5 — Application Engine (Month 5) · 50 PD ⚠️

The heart of the system. No leave, no side projects this month.

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 5.1 | `application_types` + `form_schema` JSON contract, seeder-driven (X-R09, X-R10) | LEAD | 5 | 2.3 |
| 5.2 | Dynamic form renderer driven by `form_schema`: field types, validation, conditional logic | LEAD | 8 | 5.1 |
| 5.3 | Multi-step stepper: step navigation, progress indicator, Save / Next (M1-R02) | LEAD | 5 | 5.2 |
| 5.4 | Save as draft + resume from `last_completed_step` + autosave (M1-R03) | LEAD | 4 | 5.3 |
| 5.5 | Reference number generator, `LPK/{prefix}/{year}/{seq}`, race-safe (M1-R05) | LEAD | 2 | 5.1 |
| 5.6 | Status machine: draft → submitted → in_review → returned/approved/rejected; plus cancelled, frozen, expired (M1-R09, R10, R12) | LEAD | 5 | 5.5 |
| 5.7 | Status badges incl. Expiring Soon derived from `valid_until` (M1-R12) | LEAD | 2 | 5.6 |
| 5.8 | Supporting-document upload against `application_type_documents`, required/optional, replace (M1-R04) | WBL | 6 | 2.12 |
| 5.9 | Applicant portal: my applications list, track status, resume draft | WBL | 4 | 5.4 |
| 5.10 | Stepper UI components, form widgets, mobile layout | I1 | 6 | 5.3 |
| 5.11 | Reference repository: categories, versioning, admin CRUD, download tracking (M4-1) | I2 | 5 | 3.5 |
| 5.12 | Test: draft resume, validation, status transitions, reference number uniqueness under concurrency | I3 | 4 | 5.6 |

**Exit:** an applicant completes a 4-step application over two sessions and submits it.

---

## Stage 6 — Workflow, Licence, QR (Month 6) · 50 PD

🎯 **MILESTONE 3** — apply → review → approve → licence with QR → public verification

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 6.1 | Workflow tables + engine: stage resolution, actor matching by role/unit (M1-2) | LEAD | 6 | 5.6 |
| 6.2 | Stage actions: approve, reject, return for amendment, refer; remarks + attachments (M1-R06) | LEAD | 5 | 6.1 |
| 6.3 | `application_stage_logs` with `sla_due_at` / `sla_met` capture (foundation for GP-19) | LEAD | 3 | 6.2 |
| 6.4 | Officer review queue: filtered by unit and role, with the universal list (GP-12) | LEAD | 3 | 6.2 |
| 6.5 | Licence generation on final approval: render template, create `licences` row, set validity (M1-R07) | LEAD | 4 | 3.10 |
| 6.6 | QR token generation (random 32 char) + embed in PDF (X-R11) | LEAD | 2 | 6.5 |
| 6.7 | View / print / download approved licence by the holder (M1-R11) | LEAD | 2 | 6.5 |
| 6.8 | Public `/semak/{qr_token}` page: rate-limited, minimal disclosure, no login (X-R12) | WBL | 5 | 6.6 |
| 6.9 | Expiry job: mark expiring/expired, notify holder (M1-R12) | WBL | 3 | 6.5 |
| 6.10 | Notification templates for every workflow event: submitted, returned, approved, rejected, expiring | WBL | 3 | 4.7 |
| 6.11 | Repository UI, notis sistem, scrolling display, rich editor (GP-17, M4-2) | I1 | 6 | 5.11 |
| 6.12 | Seed the 3 P1 application types: form schemas + workflows from the URS process maps | I2 | 5 | 6.1, 1.12 |
| 6.13 | Full regression pass + evidence GP-12/13/14/17 | I3 | 3 | 6.8 |

**Exit:** the milestone-3 demo runs end to end on staging, and the QR scans from a phone.

---

## Stage 7 — Three Types, Dashboard, Hardening (Month 7) · 48 PD

| ID | Task | Owner | PD | Deps |
|---|---|---|---|---|
| 7.1 | Jenis: Lesen Perkhidmatan Sokongan Pelabuhan — schema, workflow, template, fee (M1-R13) | LEAD | 4 | 6.12 |
| 7.2 | Jenis: Permit Aktiviti Pelabuhan, location captured as description + lat/lng (M1-R14) | LEAD | 4 | 6.12 |
| 7.3 | Jenis: Surat Sokongan PDA2 — letter from LPKmn template, delivered in-system (M1-R15, R16) | LEAD | 6 | 6.12 |
| 7.4 | Change Request Form: submit → review → amend → approve → write into live lookup (GP-20) | LEAD | 5 | 2.3 |
| 7.5 | Security hardening: headers, CSRF, rate limits, upload isolation, HTTPS/HSTS (GP-23) | LEAD | 4 | — |
| 7.6 | Role-based dashboard: quick links, lists, table stats, histogram, notifications, login summary (GP-15) | WBL | 7 | 6.4 |
| 7.7 | Basic statistics + valid licence-holder registry (M3-R02, M3-R04) | WBL | 4 | 7.6 |
| 7.8 | Chart exports PNG/JPG/PDF + iFrame embed endpoint (GP-14) | WBL | 3 | 7.6 |
| 7.9 | UI polish, help notes on every critical page, responsive fixes, Lighthouse tuning (GP-22) | I1 | 5 | 6.11 |
| 7.10 | Online user manual, privacy & security policy page, footer with Go-Live year (GP-23) | I2 | 4 | — |
| 7.11 | UAT scripts + evidence pack assembly (`07-compliance-checklist.md`) | I3 | 5 | — |

**Exit:** all three application types run end to end; the dashboard renders per role; the evidence
pack is 80% complete.

---

## Stage 8 — SIT, UAT, Compliance (Month 8) · 45 PD

| ID | Task | Owner | PD |
|---|---|---|---|
| 8.1 | SIT: full system integration test across all roles | ALL | 8 |
| 8.2 | Bug fixing from SIT | LEAD + WBL | 12 |
| 8.3 | External VAPT engagement + remediation | LEAD | 5 |
| 8.4 | Load test at 50 concurrent users; performance tuning | LEAD | 3 |
| 8.5 | Lighthouse report for the GP-22 evidence | I1 | 1 |
| 8.6 | UAT sessions with LPKmn + user training | BOSS | 5 |
| 8.7 | Complete the 23-feature evidence pack with screenshots | I2 + I3 | 8 |
| 8.8 | Production deployment runbook, backup and restore verification | LEAD | 3 |

**Exit:** UAT signed off.

---

## Stage 9 — Go-Live (Month 9, buffer)

| ID | Task | Owner |
|---|---|---|
| 9.1 | UAT round 2 fixes | LEAD |
| 9.2 | Production deploy, HTTPS + HSTS, DNS, monitoring | LEAD |
| 9.3 | Data seeding: real lookups, reference documents, LPKmn settings, user accounts | I2 |
| 9.4 | Handover: technical documentation, user manual, evidence pack, source code | BOSS |
| 9.5 | Warranty period starts — confirm terms from tender file 02 | BOSS |

---

## Critical path

```
1.6 migrations
  └─ 2.6 roles ──┬─ 2.8 scopes ── 3.5 universal list ── 3.7 exports
                 └─ 2.9 audit
                        └─ 5.1 application_types
                             └─ 5.2 dynamic form ── 5.3 stepper ── 5.4 draft
                                  └─ 5.6 status machine
                                       └─ 6.1 workflow engine ── 6.2 stage actions
                                            └─ 6.5 licence generation ── 6.6 QR ── 6.8 public verify
                                                 └─ 7.1/7.2/7.3 the three types
```

**Everything downstream of 5.2 is the lead's alone.** That is the bus-factor risk in
`05-schedule.md` §6, drawn as a picture. If the lead is unavailable for two weeks in month 5 or 6,
the project misses break-even.

---

## Scope-cut order

If a control point trips, cut in this order. Cut early — a cut in month 4 saves the PD; a cut in
month 7 saves nothing because the work is already done.

| Order | Cut | PD saved | Cost |
|---|---|---|---|
| 1 | `7.8` iFrame chart embed | 3 | GP-14 partially evidenced by statement |
| 2 | `7.7` valid licence-holder registry | 4 | M3-R04 moves to Phase 2 |
| 3 | `6.11` scrolling display + rich editor polish | 3 | GP-17 delivered plainer |
| 4 | `7.3` Surat Sokongan PDA2 | 6 | Two application types instead of three |
| 5 | `5.11` reference repository | 5 | M4 moves entirely to Phase 2 |

Do **not** cut: audit trail, RBAC, MFA, universal list, QR verification, evidence pack. Those are
compliance-scored or structural.

---

## Working agreements

1. One task = one branch = one PR. Branch `feat/<task-id>-slug`.
2. No merge to `main` without lead review. No exceptions, including for the lead — the boss reviews
   the lead's PRs, even superficially, so a second person has seen the code.
3. Definition of Done in `CLAUDE.md` §8. Item 8 (evidence screenshot) is not optional.
4. Update this file's PD-burned column at each fortnightly sprint close. If burned exceeds planned by
   more than 15% at any control point, trigger the scope-cut conversation the same week.
5. `main` is always deployable to staging.
