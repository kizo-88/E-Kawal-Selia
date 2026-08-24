# ADR 0001 — Technology stack

**Status:** SUPERSEDED by [ADR 0004](0004-nextjs-and-supabase.md) · **Date:** 2026-08-24

> This ADR chose Laravel + Filament and justified it partly with *"team knows it"* — an
> assumption that was never checked with the team. It was wrong: the team is React-first.
> ADR 0004 reverses the decision and shows the corrected arithmetic. Kept because the
> reasoning about Filament, PostGIS and admin-panel cost still holds, and if the hosting or
> residency answer ever forces a rethink, this is where that argument already lives.

Cheap to reverse in week 1. Expensive from week 4. Effectively impossible from month 3.

## Context

- Budget RM 198,000, effective capacity 2.2 FTE, target 8.5 months.
- The Garis Panduan's 23 mandatory features are largely admin-CRUD, list views with search and
  export, RBAC, and configuration screens.
- The team is one full-time developer plus three interns and a WBL student — high turnover, mixed
  skill, needs strong conventions and low ceremony.
- Phase 2 requires point-in-polygon validation against Port Limit and MRA Area boundaries.
- Malaysian government hosting favours mainstream, cheap, well-understood platforms.

## Decision

**Laravel 13 (PHP 8.5) + Filament 5 + PostgreSQL 16 with PostGIS.**

Supporting choices: Livewire 3 + Tailwind, `spatie/laravel-pdf`, Redis + Horizon,
Fortify + two-factor, `spatie/laravel-permission`, Pest, custom audit layer.

## Rationale

**Filament is the decision.** It ships permission-aware resources, list tables with sorting, keyword
search, filters and exports, and a form builder. That is the bulk of GP-01, GP-02 and GP-12 —
roughly 110 PD — as configuration rather than code. Without it, Phase 1 does not fit the budget.

**PostGIS now, not later.** X-R07 is Phase 2 work, but a database migration mid-project is not
something a 2.2-FTE team can absorb. The cost of choosing PostgreSQL today is near zero.

**Custom audit layer.** Off-the-shelf audit packages record `update` and `delete`. GP-18 explicitly
forbids generic labels and requires application ID, user ID, workflow stage and page in every entry.
Adapting a package costs more than writing 200 lines.

**Pest over PHPUnit.** Interns write more tests when the syntax is smaller. Test coverage is a
Definition-of-Done gate, so friction here compounds.

## Alternatives considered

| Option | Why not |
|---|---|
| Next.js + Prisma + tRPC | No admin scaffold. Every list, filter and export written by hand — roughly +110 PD, which is the entire margin. Two runtimes for a team of one senior. |
| Laravel + custom Blade admin | Same problem in a familiar language. Filament exists precisely to avoid this. |
| Django + Django Admin | Admin is closer to Filament than raw Laravel, but the team does not know Python and there is no learning budget. |
| Low-code (Retool, Budibase) | Cannot satisfy GP-23 integration readiness, the public QR verification page, or source-code handover. Licensing recurs through the warranty period. |
| MySQL instead of PostgreSQL | No PostGIS. Would force a migration in Phase 2. |

## Consequences

**Good**
- Roughly 110 PD of the mandatory features arrive as framework capability
- One language, one runtime, one deploy target
- Cheap, mainstream Malaysian hosting
- Filament resources are the right size of task for interns
- The platform layer becomes a reusable asset for future LPKmn systems

**Bad**
- Coupled to Filament's conventions. A future non-admin UI needs work — mitigated by the layering
  rule in `03-architecture.md` §3.
- Filament major-version upgrades will land during the warranty period. Budget for one.
- Livewire is less familiar to interns arriving with React experience.

**Watch**
- If Filament's list component cannot deliver all of GP-12 (quarter filter, Word export), the
  shortfall is ours to build. Verify in **task 3.5, month 3** — early enough to react.

## Versions actually installed

The first draft of this ADR said Laravel 11 / PHP 8.3 / Filament 3, written from memory before the
toolchain existed. Composer resolved the current stable set instead, and the numbers below are what
is in `composer.lock`:

| Package | Version |
|---|---|
| PHP | 8.5.9 |
| laravel/framework | 13.26.1 |
| filament/filament | ^5.7 |
| livewire/livewire | 3.x |
| spatie/laravel-permission | ^8.3 |
| spatie/laravel-pdf | ^2.13 |
| laravel/fortify | ^1.38 |
| pestphp/pest | ^4.7 |

PHP 8.5 is newer than this project needs. It is what `scoop install php` provides and Laravel 13
supports it, so there is no reason to pin lower — but if a package misbehaves, dropping to 8.4 is
the first thing to try.

## Reversal

Cheap through task 1.4. After Stage 2 the config, RBAC and audit engines are built on Filament
resources and reversal costs roughly 40 PD. Do not revisit after month 3.
