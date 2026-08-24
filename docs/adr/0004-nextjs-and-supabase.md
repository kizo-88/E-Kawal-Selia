# ADR 0004 — Next.js and Supabase

**Status:** Accepted · **Date:** 2026-08-24 · **Supersedes:** [ADR 0001](0001-tech-stack.md)

## Context

ADR 0001 chose Laravel 13 + Filament 5 and justified it partly with *"team knows it"*. That
justification was never verified with the team. When it was, the answer was **React/Next.js**, and
PHP would have been new to everyone.

That changes the arithmetic completely. ADR 0001 costed what Filament saves and never costed what
learning PHP would take.

| | Laravel + Filament | Next.js + Refine |
|---|---|---|
| Framework covers the admin work | −70 PD | −40 PD |
| Lead reaching real fluency — the dynamic form renderer and workflow engine need more than CRUD familiarity | +20 PD | 0 |
| Interns and WBL on PHP, Blade, Livewire | +20 PD | 0 |
| Stepper and mobile UX (M1-R02, M1-R03, GP-22) | baseline | −4 PD |
| Excel/Word/PDF exports — Filament ships them, Refine gives CSV | baseline | +10 PD |
| **Net** | **−30 PD** | **−34 PD** |

Within noise of each other on cost. Once cost is equal, risk decides — and the lead is the bus
factor on a project with 13 days of buffer. Learning an unfamiliar stack in that seat is the wrong
risk.

Two of ADR 0001's supporting arguments also reverse under scrutiny: React interns are easier to
recruit in Malaysia in 2026 than Laravel ones, and the warranty is carried by *this* team, so their
fluency matters more than a hypothetical successor's.

## Decision

**Next.js 16 (App Router, TypeScript) + Supabase Postgres with PostGIS.**

Supporting: Prisma 7, Refine + shadcn/ui, TanStack Table, Auth.js, exceljs + docx + Puppeteer,
Vitest + Playwright.

Supabase provides **Postgres, Storage, Realtime and Row Level Security**. It does **not** provide
auth — see [ADR 0005](0005-auth-not-supabase-auth.md).

## Rationale

**RLS is the reason Supabase earns its place.** G5 says permission filtering happens at the data
layer, never in a route handler. With RLS that stops being a convention people remember and becomes
a policy the database keeps. An officer sees their unit's applications because Postgres says so.
That is a materially stronger answer at security review than "we filter in the service layer".

Estimated saving over plain Postgres: **~19 PD** across auth plumbing, storage, RLS and Realtime.

**PostGIS carries over from ADR 0001 unchanged.** X-R07 needs point-in-polygon validation against
real Port Limit and MRA boundaries in Phase 2, and this team cannot absorb a mid-project database
migration.

**The architecture did not change.** The four engines, the layering rule, the data model, ADR 0002
and ADR 0003 all survived the port intact. That is not luck — it is what the layering rule in
`03-architecture.md` §3 was for, and the port is the evidence that it works.

## Consequences

**Good**
- The team is fluent from day one; no learning tax on the critical path
- RLS makes G5 structural
- Storage covers GP-11; Realtime covers X-R04
- One language across the stack for a team of 2.2 FTE

**Bad**
- **Data residency is now an open risk** — see below. This is the most serious consequence.
- Recurring cost: Supabase Pro ~USD 25/month ≈ RM 118. Across 9 months of development plus a
  24-month warranty that is **~RM 3,900**, and it becomes a dependency LPKmn inherits.
- Refine gives CSV export; GP-12 requires Excel, Word and PDF. Roughly 10 PD is ours.
- Prisma 7 is recent: connection URLs moved to `prisma.config.ts`, driver adapters are mandatory,
  and `npm audit` currently flags `deepmerge-ts` (high) through Prisma's CLI config loader. That is
  build-time only, not runtime, and the "fix" is a breaking downgrade to Prisma 6. Recorded, not
  taken. **Re-check before go-live.**

## The residency risk

Supabase Cloud's nearest region is **Singapore. There is no Malaysian region.**

This system stores applicant **IC numbers**, company registration details and uploaded documents for
a government agency. The tender cites **DKICT** (LPKmn's ICT security policy) and the Garis Panduan
names **Audit Dalam** as a stakeholder. Malaysian public-sector data on foreign-hosted cloud is a
question that will be asked — at VAPT, at audit, or by Unit IT.

**None of the four tender documents we hold says anything about hosting.** No cPanel, no server
spec, no data-centre requirement, no residency clause. The only adjacent line is GP-23's
*"Penggunaan HTTPS:// wajib dan hendaklah disediakan pembekal"*, which weakly implies the vendor
provides hosting. The answer is presumably in tender files 01/02/05, which we do not have.

**Mitigation, in order of preference:**

1. **Self-hosted Supabase** on a Malaysian VPS or LPKmn infrastructure. It is Docker, and underneath
   it is ordinary Postgres. Costs ~8 PD of setup and puts upgrades on us through the warranty, and
   removes the question entirely.
2. **Supabase Cloud (Singapore) with written LPKmn sign-off** obtained before go-live, not after.
3. Supabase Cloud with no sign-off — **not acceptable** for this data.

**Practical path:** Supabase Cloud for development, self-hosted for production. Because it is
genuinely Postgres, that migration is real rather than theoretical. **Decide before month 6.**

**Action:** ask Unit IT at the briefing session, in writing — *"Adakah LPKmn menetapkan data sistem
mesti berada dalam Malaysia?"* Tracked as Q12 in `docs/02-requirements.md`.

## Reversal

Cheap now: two commits, no business logic. Expensive from Stage 5 (month 5), when the application
engine and workflow engine land. If the residency answer forces a change, it will be *where*
Supabase runs, not *whether* — and that is a deployment change, not a rewrite.
