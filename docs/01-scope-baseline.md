# 01 — Scope Baseline

**This document is the contract with ourselves.** It defines exactly what Phase 1 delivers for
RM 198,000, and exactly what is deferred. Every scope conversation resolves against this file.

Effort is in person-days (PD) of a team running framework reuse + AI-assisted development.
Team capacity is **46 PD/month**. See `05-schedule.md`.

---

## Phase 1 — committed (384 PD, 8.5 months)

### Platform foundation — 81 PD

| ID | Package | PD |
|---|---|---|
| F1 | Project setup, repo, CI, environments, architecture, ERD | 6 |
| F2 | Config engine: settings, lookup registry, LPKmn base info, portal info | 11 |
| F3 | RBAC engine: roles, level of access, permission matrix, menu mapping | 12 |
| F4 | Soft-delete + archive base model + snapshot fields | 4 |
| F5 | Audit trail: interceptor, human-readable labels, report, flush + retention | 11 |
| F6 | Universal list component: sort, keyword/year/range/quarter filter, exports | 12 |
| F7 | Print / document template engine: letterhead, logo, disclaimer, admin-editable | 10 |
| F8 | Notification bus (in-app + email) + template manager + settings | 12 |
| F9 | File upload policy engine: extension allowlist, MIME sniff, size caps | 5 |

### Identity and access — 26 PD

| ID | Package | PD |
|---|---|---|
| I1 | Login: hashing, 12-char policy, lockout ×3, session timeout 10 min, first-login change | 7 |
| I2 | MFA | 5 |
| I3 | Self-registration: verify chain, CAPTCHA, duplicate-account check | 7 |
| I4 | User profile + Aku-Janji acceptance, template download, profile display | 7 |

### Modul Pengguna (M5) — 20 PD

| ID | Package | PD |
|---|---|---|
| M5-1 | External user categories: syarikat, wakil syarikat, individu, KPK, pengguna pelabuhan; company↔representative linkage | 12 |
| M5-2 | Internal LPKmn structure, unit/role mapping, identity verification workflow | 8 |

### Modul Permohonan (M1) — 78 PD ← the core

| ID | Package | PD |
|---|---|---|
| M1-1 | Application engine: multi-step stepper, save draft, Next/Save, auto reference number, status machine, cancel, freeze, status badges | 26 |
| M1-2 | Review and approval workflow engine: configurable multi-stage, remarks, return-for-amendment, SLA tracking | 18 |
| M1-3 | Licence/permit generation: PDF from template, QR code, public verification page, print/download | 20 |
| M1-4 | Jenis: Lesen Perkhidmatan Sokongan Pelabuhan | 4 |
| M1-5 | Jenis: Permit Aktiviti Pelabuhan (location as text/coordinate field; geofencing is Phase 2) | 4 |
| M1-6 | Jenis: Surat Sokongan PDA2 — letter generation from LPKmn template (DDMS write-back is Phase 2) | 6 |

### Modul Rujukan / Repositori (M4) — 18 PD

| ID | Package | PD |
|---|---|---|
| M4-1 | Document repository: categories, versioning, admin CRUD, download tracking | 12 |
| M4-2 | Notis Sistem, Pekeliling Pelabuhan, FAQ — rich text editor with image + document upload | 6 |

### Dashboard and basic statistics (M3 partial) — 18 PD

| ID | Package | PD |
|---|---|---|
| M3-1 | Role-based dashboard: quick links, application lists, table stats, histogram, notifications | 12 |
| M3-2 | Basic statistics + valid licence-holder registry | 6 |

### Front-end and cross-cutting — 30 PD

| ID | Package | PD |
|---|---|---|
| P1 | Front page / login page: logos, system name + acronym, login form, forgot password, register, news panel, footer, background | 8 |
| P2 | UI system: responsive, theme, contrast menus, help notes on critical pages, performance tuning + proof report | 12 |
| P3 | Privacy and security policy page, footer with copyright + Go-Live year, security hardening, HTTPS, online manual link, integration-readiness API surface | 10 |

### Non-development — 113 PD

| Package | PD |
|---|---|
| Business analysis, URS/BRS, process mapping | 15 |
| UI/UX design, wireframes, design system | 25 |
| QA: test cases, SIT, regression, UAT scripts | 45 |
| DevOps: environments, deployment, backup, HTTPS | 8 |
| Documentation: user manual, technical doc, **LPKmn compliance evidence pack** | 20 |

> **Phase 1 total: 384 PD**

---

## Phase 2 — quoted separately (approx. 270 PD, RM 180k–200k)

Not in the Phase 1 price. If LPKmn asks for any of it, route to the boss for a quote.

| ID | Package | PD | Why deferred |
|---|---|---|---|
| M1-7 | Permohonan Lesen Malim: new + renewal, Jawatankuasa Pemaliman stage, fee, card/certificate print | 14 | Needs the committee process documented and the fee schedule confirmed |
| M1-8 | Permohonan Sijil Pengecualian Malim: agent-on-behalf, Malim KPK evaluation ×2, holder database | 10 | Multi-party evaluation flow, external party (KPK) involvement |
| M2-1 | Modul Kawal Selia: inspection planning and scheduling | 10 | Whole module; no inspection checklist supplied in tender docs |
| M2-2 | Inspection execution, checklist, records | 10 | |
| M2-3 | Inspection report + corrective action (CAR) + follow-up tracking | 18 | |
| M2-4 | Certificate and licence register, expiry and renewal alerts | 10 | |
| M2-5 | PBB MFSO reporting | 6 | Report format not supplied |
| M6-1 | Modul Aset: safety equipment loan and return | 10 | Whole module |
| M6-2 | Concession asset register | 8 | |
| M6-3 | Maintenance planning, records, reports | 14 | |
| M6-4 | Upgrade / new-build application workflow | 8 | |
| M3-3 | Trend analysis, KPI module against ISMS / ISO 9001 / ABMS | 26 | KPI standards not supplied with tender |
| M7-1 | Statistik + threshold access control for corporate unit | 8 | Threshold definition not supplied |
| X-1 | Payment gateway / FPX + reconciliation + receipts | 18 | Merchant account owner undecided |
| X-2 | GIS: Port Limit + MRA polygons, map picker, point-in-polygon validation | 18 | LPKmn has not confirmed whether boundary shapefiles exist |
| X-3 | Bilingual BM/EN: full i18n across UI and generated documents | 16 | Phase 1 ships BM only; the `_ms`/`_en` columns exist from day one so this is additive, not a rewrite |
| X-4 | Configurable licence/permit type builder (admin creates new types via UI) | 16 | Phase 1 adds types via seeder; the data model already supports it |
| X-5 | DDMS integration for PDA2 letters | 10 | No API spec supplied; may not have one |

---

## Explicitly out of scope entirely

Named in `Keterangan Ringkas Sistem` as future considerations, not requirements:

- Incident reporting (pelaporan insiden)
- Bunkering activity notification under Section 419B
- Licence and permit verification by external authorities beyond the public QR page

---

## Assumptions Phase 1 is priced on

If any of these turn out false, the estimate moves and the boss must be told the same week.

1. LPKmn supplies the actual application forms, fee schedule, licence/permit templates and approval
   hierarchy for the 3 Phase 1 types **during month 1**. Every week of delay costs RM 4,400.
2. Each of the 3 Phase 1 application types has **at most 4 approval stages**.
3. UI ships in **Bahasa Melayu only** in Phase 1. The database and translation keys are bilingual.
4. Hosting is provided by LPKmn, or is a single VPS. No HA cluster, no load balancer.
5. No data migration from an existing system.
6. Warranty terms come from tender files 01/02/05 and are **not yet known**. A 24-month free warranty
   adds RM 60,000–80,000 of unbilled cost and would change the bid decision.
7. VAPT is performed by an external party at RM 15,000, budgeted in `06-costing.md`.
8. LPKmn provides the sign-off checklist template referenced in the Garis Panduan.

---

## Guarding the baseline

- Any request not in the Phase 1 table above is a **change request**, routed to the boss.
- Exception: anything in the Garis Panduan's 23 mandatory features. That document forbids us from
  classifying those as change requests, so they are already priced into Phase 1. See
  `07-compliance-checklist.md` for the full list — check it before agreeing anything is "extra".
- Slip is measured monthly against `05-schedule.md`. Two consecutive missed milestones triggers a
  scope-cut conversation, not an overtime conversation.
