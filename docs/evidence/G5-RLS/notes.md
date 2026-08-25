# G5 — Row Level Security, verified against a live database

**Date:** 2026-08-25 · **Lane:** E (QA & compliance) · **Requirement:** G5, GP-01, GP-02, X-R12

> RULES.md G5: *"Never filter in a route handler or a component. An officer from Unit Keselamatan
> must not see Unit M/T's applications by editing a URL."*

Until this run, G5 was a claim. The policies had been written across two migrations and had never
touched Postgres. This is the record of them actually running.

---

## Environment

| | |
|---|---|
| Postgres | 18.6 |
| Migrations applied | all four, cleanly — 35 tables |
| Connection role | `kawalselia_app` |
| `rolsuper` | **false** |
| `rolbypassrls` | **false** |
| Tables owned by that role | **0** |

**The pre-flight check is not a formality.** Postgres exempts table owners from row-level security.
Had this run as `postgres`, every policy would have been skipped, every query would have returned
every row, and nothing would have failed — a green result proving the opposite of what it appeared
to prove. Any future run must confirm those three values first.

PostGIS was stubbed out for this database (not available in the local build). It is unused in Phase 1
and irrelevant to RLS; the committed migration is unchanged.

---

## 🔴 Defect found and fixed: infinite recursion on `applications`

**Severity: critical. `SELECT * FROM applications` failed outright for every user.**

```
ERROR: stack depth limit exceeded
CONTEXT: SQL function "can_view_application" statement 1   (× ~1000)
```

`app.can_view_application()` restated the visibility rule by selecting from `applications`. That
SELECT triggered the `applications_read` policy, which called the function, which selected from
`applications` again.

The core table of the system was unusable. Nothing would have caught this earlier: the SQL is valid,
the migration applies without complaint, and the whole TypeScript test suite passes because none of
it touches a database.

It would have surfaced the first time anyone loaded the application list — after Lane D wired the
queries and Lane B built screens on top, with both lanes' work already merged.

**Fix** (`20260825091000_m1_rls_policies`): the `applications_read` policy now states the rule inline
using the row's own columns, and `can_view_application()` reduces to `EXISTS (SELECT 1 FROM
applications WHERE id = $1)` — the policy filters that SELECT, so visibility follows by construction.
A document is visible exactly when its application is.

**The general rule, now recorded in the migration:** *a policy on table X must never call a function
that queries X.*

---

## 🟡 Harness defects — worth recording, because both produced false passes

Both of these made the suite report "0 rows visible" for every user, which reads as a strict, passing
deny-by-default result and proves nothing at all.

**1. `set_config(..., true)` is transaction-local.** psql autocommits each statement, so the setting
was discarded before the next query ran. Every scenario ran effectively anonymous. Fixed by wrapping
each scenario in `BEGIN`/`COMMIT`, which is what `withUser()` in `src/lib/db/scoped.ts` already does.

**2. The `users` table is itself RLS-protected.** Resolving a test user's id via
`(SELECT id FROM users WHERE email = ...)` from the app role returned NULL, so `set_config` stamped
NULL. Fixed by resolving ids as owner first — which mirrors production, where Auth.js resolves the
user through a privileged path at login and only then stamps the id.

> Anyone re-running this: **a scenario returning zero rows is not automatically a pass.** Confirm at
> least one positive case returns rows, or you are testing a broken harness.

---

## Results

### Applications — the G5 scenario

| Acting as | Visible | References |
|---|---|---|
| anonymous | 0 | — |
| **Officer, Unit M/T** | **1** | `LPK/LPS/2026/00001` |
| **Officer, Unit Keselamatan** | **1** | `LPK/LPS/2026/00002` |
| Applicant A | 1 | `LPK/LPS/2026/00001` |
| Applicant B | 1 | `LPK/LPS/2026/00002` |
| Colleague at A's organisation | 1 | `LPK/LPS/2026/00001` |
| Admin holding `view_all` | 2 | both |

Two officers, two units, two applications parked at different workflow stages — each officer sees
only their own unit's. That is the requirement, demonstrated.

The colleague row matters too: a company's other representatives can continue a submission when
someone is on leave, without being able to see any other company's filings.

### Supporting documents — the real leak risk

These rows point at uploaded files holding IC numbers, company registrations and signed undertakings.

| Acting as | Documents visible |
|---|---|
| Officer, Unit M/T (owns the stage) | 1 |
| Officer, Unit Keselamatan | 0 |
| Applicant B (different applicant) | 0 |

### Licences — X-R12, the public QR path

| Acting as | Visible | Detail |
|---|---|---|
| **anonymous** | **1** | `L/LPK/LPS/2026/00001 [active]` |
| Applicant A (holder) | 1 | own licence |
| Officer, Unit Keselamatan | 0 | — |

The revoked licence is **not** returned anonymously. A scan of a revoked licence reveals nothing,
rather than confirming that one once existed.

### Audit trail

| Acting as | Rows visible |
|---|---|
| Applicant, no `audit.log.view` | 0 |

### Write policies

| Attempt | Result |
|---|---|
| Applicant files an application in **another person's name** | `ERROR: new row violates row-level security policy` ✅ |
| Applicant edits an application already **in review** | `UPDATE 0` ✅ |
| Same applicant edits their own **draft** | `UPDATE 1` ✅ |

The in-review case denies by invisibility rather than by error, which is correct RLS behaviour — the
row is simply not there to update.

### Structural

All ten M1 tables report `rowsecurity = true` **and** `forcerowsecurity = true`.

`application_stage_logs` carries exactly two policies — `SELECT` and `INSERT`. No `UPDATE`, no
`DELETE`. The application cannot rewrite its own history, which is what makes it evidence for X-R02.

---

## Verdict

**G5 is a working control, not a claim** — for the tables covered above.

Still outstanding:

- The 15 tables from the first RLS migration (settings, lookups, users, organisations, notifications,
  documents) have **not** been exercised with two roles. Same method applies.
- Production and staging must connect as a non-owner, `NOBYPASSRLS` role. This is the single
  configuration mistake that would silently void everything above. See `docs/09-setup.md`.
- This ran on plain Postgres 18. Re-run against Supabase before go-live — the policies are standard
  SQL and should behave identically, but "should" is not evidence.

## Reproducing

Fixtures and the verification script are in `tests/rls/`. They need a live database, so they are not
part of `npm run verify`; run them deliberately, and read the pre-flight output before trusting any
result.
