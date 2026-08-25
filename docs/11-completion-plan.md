# 11 — Completion Plan

Where Phase 1 actually stands after Rounds 1–2, and the rounds that finish it.

Verified against `main` at the point all three lanes merged: lint clean, typecheck clean,
194 tests, production build green, 15 routes.

---

## 1. What is genuinely done

| Area | State |
|---|---|
| Config engine, lookup registry | Built, tested |
| Audit bus, retention purge, audit trail screen | Built, tested, **wired to the database** |
| Upload policy engine (magic-byte sniffing) | Built, tested |
| RBAC — roles, permissions, menu registry | Built, tested |
| Auth policy — password, lockout, session, MFA/TOTP | Built, tested (RFC 6238 vectors pass) |
| Universal list — filters, sort, keyset paging | Built, tested |
| Export engine — Excel, Word, PDF, aggregates | Built, tested |
| Design system, front page, login, dashboard, admin shell | Built |
| RLS policies across 25 tables | Written, **not yet verified against a live database** |

## 2. What is not done — read this before quoting progress

**Fifteen routes build. One of them reads from the database.**

`/audit` is wired. `/dashboard`, `/permohonan`, `/pelesenan`, `/pekeliling`, `/semak/[token]` and
the announcements panel all render fixture data. The system looks substantially more complete than
it is, and that gap is the single easiest thing to misreport to LPKmn.

### 2.1 The core module does not exist

`src/domain/` is empty. The schema has 25 models and **none of them are M1**:

- no `application_types`, `applications`, `application_documents`
- no `workflows`, `workflow_stages`, `workflow_transitions`, `application_stage_logs`
- no `licences`

Modul Permohonan is what this tender is *about* — the five application types, the review and
approval chain, the generated licence with its QR code. It is roughly **78 PD of the 384 PD Phase 1
scope** and it is at zero.

### 2.2 Remaining work

| # | Work | Req IDs | PD | Blocks |
|---|---|---|---|---|
| R1 | M1 schema + migration + RLS policies | M1-R01..R12 | 10 | everything below |
| R2 | Application engine: stepper, draft, ref numbers, status machine | M1-R02/R03/R05/R09/R10/R12 | 26 | R4, R6 |
| R3 | Notification bus + email channel | GP-10, GP-16, X-R03, X-R04 | 12 | R4 |
| R4 | Workflow engine: stages, actions, SLA capture | M1-R06 | 18 | R6 |
| R5 | Document engine: template render → PDF | GP-13 | 12 | R6 |
| R6 | Licence generation + QR + public verification | M1-R07/R11, X-R11, X-R12 | 20 | R8 |
| R7 | Identity server actions: registration, profile, Aku-Janji, MFA enrolment | GP-04/05/06, M5-R03 | 20 | — |
| R8 | The three Phase 1 application types | M1-R13/R14/R15 | 14 | — |
| R9 | Wire every fixture page to real data | GP-15, M3-R02/R04, M4 | 25 | R2, R7 |
| R10 | Reference repository + content backend | M4-R01..R10, GP-17 | 12 | — |
| R11 | Change Request Form | GP-20 | 10 | — |
| R12 | RLS verified against a live database with two roles | G5, GP-01/02 | 6 | — |
| R13 | Compliance evidence pack, 23 features | C-R01, C-R02 | 15 | all |
| R14 | VAPT remediation, load test, deployment | GP-22, GP-23 | 12 | all |
| | **Total remaining** | | **≈ 212 PD** | |

Against Phase 1's 384 PD budget, roughly **45% remains**. That is consistent with the schedule —
the platform layer was always the front-loaded half.

> **R12 is not paperwork.** The RLS policies have never run against Postgres. Until two accounts in
> different units have been shown to see different rows, G5 is a claim, not a control. Do this early
> — if the policies are wrong, everything built on them is wrong.

---

## 3. Rounds 3–5

The dependency chain is real this time: R2 blocks R4 blocks R6. Nobody can parallelise their way
around it, so each round gives the blocking work to Claude and genuinely independent work to the
other two.

### Round 3

| Lane | Work | Why this lane |
|---|---|---|
| Claude | R1 schema + R2 application engine | Schema is lead-only; the status machine is the spine |
| Gemini | R9a — application detail, review queue, licence view screens | Pure UI, no dependency on R2 |
| OpenCode | R3 notification bus + R5 document engine | Independent of M1 entirely |

### Round 4

| Lane | Work |
|---|---|
| Claude | R4 workflow engine + R6 licence generation, QR, public verification |
| Gemini | R9b — wire pages to the server actions the other lanes publish |
| OpenCode | R7 identity server actions + R10 reference backend |

### Round 5

| Lane | Work |
|---|---|
| Claude | R8 the three application types + R12 live RLS verification |
| Gemini | Responsive pass, Lighthouse, help notes, GP-22 evidence |
| OpenCode | R11 Change Request Form + R13 evidence pack |

Then R14 — VAPT, load test, deploy — as one team.

---

## 4. The split that works

Round 2 proved a pattern worth making explicit, because the audit screen is the one feature that
came out fully wired:

> **Services lane writes `actions.ts` and `query.ts`. UI lane writes `page.tsx`.**

`src/app/(admin)/audit/` has exactly that shape. Every screen from here on follows it. It keeps
Gemini out of `src/lib` without leaving it unable to fetch anything.

---

## 5. Round 3 prompts

**Claude Code**

```
Read RULES.md, then CLAUDE.md, then docs/04-data-model.md §6-§8.

Branch: lane/claude, in worktree ../kawalselia-claude. Rebase on main.

Build R1 and R2 from docs/11-completion-plan.md — the M1 schema and the
application engine. This is the core of the tender and it is at zero.

You own: prisma/**, src/domain/application/**, src/lib/table/**, tests/
Do not touch: src/components/**, src/app/(public)/**, src/lib/exports/**

R1 — schema. docs/04-data-model.md §6-§8 already designs these tables; follow
it. application_types, application_type_documents, applications,
application_documents, workflows, workflow_stages, workflow_transitions,
application_stage_logs, licences. Every model gets deletedAt (G2), _ms/_en on
user-facing text (G4), and an RLS policy (G5) — a table without a policy is a
data leak waiting for a URL parameter.

application_stage_logs must carry sla_due_at and sla_met from day one. GP-19 is
Phase 2, but without the capture there is no history to report on when it
arrives.

R2 — the engine. Multi-step stepper state, save-as-draft with resume from
last_completed_step, race-safe reference numbers in the form
LPK/{prefix}/{year}/{seq}, and the status machine:
draft → submitted → in_review → returned | approved | rejected,
plus cancelled, frozen, expired.

application_types is DATA. A new licence type is a seeder row plus a
form_schema JSON plus a workflow — no new route, no new model. If you write
`if (type === 'lesen_malim')` you have broken the design (ADR 0002).

Keep the status machine and reference-number logic pure and testable without a
database, as src/lib/table/query.ts is.

Verify with: npm run verify
```

**Gemini / Antigravity**

```
Read RULES.md, then CLAUDE.md.

Branch: lane/gemini, in worktree ../kawalselia-gemini. Rebase on main.

Build R9a — the screens for Modul Permohonan. Presentation only; the data layer
lands in another lane this round.

You own: src/components/**, src/app/(public)/**, src/app/(admin)/**
Do not touch: src/lib/**, src/domain/**, prisma/**

Screens:
  application detail — form data, uploaded documents, status timeline, the
    remarks history from each review stage
  officer review queue — built on the universal table components you already
    have, with approve / reject / return-for-amendment actions
  licence view — the issued licence with its QR, print and download
  status indicators — Approved, In Review, Expiring Soon, Expired (M1-R12)

Define a TypeScript interface for every data shape you need and use fixture
data. Name the file src/app/<route>/fixtures.ts so it is obvious what still has
to be replaced — the project currently has six fixture-driven pages and no easy
way to tell them from the wired one.

Every user-facing string needs Malay and English (G4).
Usable at 375px (GP-22).

Verify with: npm run verify
```

**OpenCode**

```
Read RULES.md, then CLAUDE.md, then docs/04-data-model.md §4-§5.

Branch: lane/opencode, in worktree ../kawalselia-opencode. Rebase on main.

Build R3 and R5. Both are independent of M1, so nothing blocks you this round.

You own: src/lib/notifications/**, src/lib/documents/**, tests/
Do not touch: prisma/**, src/components/**, src/lib/auth/**, src/lib/table/**

R3 — the notification bus (GP-10, GP-16, X-R03, X-R04).
Nothing anywhere may import a mailer directly; the no-direct-mail lint rule
enforces it and src/lib/notifications is the only exempt directory. The bus
resolves the user's channel preferences, renders the BM or EN template, queues
the send, and writes the audit row using the registered action
PEMBERITAHUAN_DIHANTAR. All four, every time — a caller that skips one has
silently broken GP-16.
Channels: in-app (mandatory) and email. Per-user AND per-role preferences, plus
broadcast. Tables already exist.

R5 — the document engine (GP-13).
document_templates holds admin-editable HTML with separate header, body and
footer. Render to PDF. Every render writes a generated_documents row with a
random 32-character qr_token — never sequential, never derived from the licence
number.
Snapshot template_version onto the row so a reprint years later matches what was
originally issued, not the template as since edited (ADR 0003).
Ask the lead before adding a PDF renderer dependency.

Verify with: npm run verify
```

---

## 6. On BRAIN and DeerFlow

Both repositories were inspected before writing this section.

**BRAIN** (`kizo-88/BRAIN`) is 209 KB and contains no code — a README listing 60+ starred
repositories, a systems catalogue, a work-plan document, and one PowerShell script that adds git
submodules. There is no module, no calculation engine and no design skill in it. It is a bookmark
collection. Nothing in it can be imported here.

**DeerFlow 2.0** (`stophobia/deerflow2.0-enhanced`) is 35 MB and is real software: a Python 3.12 +
Node 22 "super agent harness" that orchestrates sub-agents, memory and sandboxes for research
workflows. It is a fork of a fork of ByteDance's deer-flow.

It is not a fit here, for three reasons:

1. **It solves a problem we do not have.** DeerFlow orchestrates research agents. Three coding
   agents are already running against this repo and producing merged work.
2. **It is unaudited third-party code**, a fork of a fork, standing up a Python service beside a
   Malaysian government tender codebase. RULES.md requires the lead to approve every dependency
   because we maintain it through a 12–24 month warranty. This one is not maintainable by this team.
3. **Agent throughput is not the bottleneck.** The measured constraints on this project are the
   lead's review capacity (bus factor 1), thirteen unanswered LPKmn business questions, and three
   missing tender files. A fourth harness makes the first one worse and the other two no better.

The genuine accelerators available, in order of payback:

| Lever | Saves | Cost |
|---|---|---|
| Answer the 13 open questions in `02-requirements.md` §E | Removes the largest rework risk on the project | One meeting |
| Verify RLS against a live database (R12) | Prevents rebuilding everything above a broken control | 6 PD |
| Keep the `actions.ts` / `page.tsx` split | Already the reason the audit screen shipped wired | Free |
| Delete the fixture pages as they are wired | Stops the progress overstatement in §2 | Free |

If you want DeerFlow evaluated properly rather than dismissed, that is a separate spike with its own
budget — not something to bolt onto Phase 1 with 13 days of buffer left.
