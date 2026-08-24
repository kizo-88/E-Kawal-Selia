# ADR 0005 — Auth.js and our own policy engine, not Supabase Auth

**Status:** Accepted · **Date:** 2026-08-24

## Context

[ADR 0004](0004-nextjs-and-supabase.md) adopts Supabase for Postgres, Storage, Realtime and RLS.
Supabase also ships an auth product, and using it would be the obvious default.

GP-03 makes that a bad default. It requires all of the following, and — this is the part that
matters — G1 requires each to be **editable by an admin through the UI at runtime**:

| GP-03 requirement | Supabase Auth |
|---|---|
| MFA | ✅ TOTP built in |
| Minimum 12 characters (LPKmn DKICT) | ⚠️ project-level setting, not admin-editable in our UI |
| Lockout after 3 consecutive failures, configurable | ❌ not available |
| Session timeout 10 minutes, configurable | ⚠️ project-level, not runtime-configurable |
| Force password change on first login | ❌ build it ourselves |
| Configurable character classes | ❌ build it ourselves |

Three of six are missing outright and two more are configurable only in Supabase's dashboard, not in
the LPKmn admin screen the Garis Panduan requires.

**"Configurable" is part of the requirement, not a nicety.** A hard-coded 10-minute timeout fails
GP-03 even though the number is correct.

## Decision

**Auth.js for session handling; the password and lockout policy is ours, driven by the `settings`
table.**

Supabase is used for Postgres, Storage, Realtime and RLS. Its auth service is not used.

Concretely:

- Credentials and MFA live in our `users` table — `passwordHash`, `mfaSecret`, `failedAttempts`,
  `lockedUntil`, `mustChangePassword`
- Every policy value is a `settings` row: `security.session_timeout_minutes`,
  `security.lockout_threshold`, `security.password_min_length`,
  `security.password_require_mixed_case`, `security.password_require_symbol`
- RLS identifies the user through `app.current_user_id()`, stamped onto the connection by
  `withUser()` in `src/lib/db/scoped.ts` — **not** through `auth.uid()`, which does not exist
  without Supabase Auth

## Rationale

Bending Supabase Auth into admin-configurable lockout and session policy costs more than writing the
policy engine, and leaves a compliance answer that depends on a third party's dashboard. Owning it
means GP-03 is evidenced by a screenshot of *our* settings screen, which is exactly what the
compliance pack needs (`docs/07-compliance-checklist.md`, GP-03).

## Consequences

**Good**
- Every GP-03 value is admin-editable and demonstrable in one screen
- No dependency on Supabase's auth roadmap for a contractual requirement
- Migrating to self-hosted Supabase (the residency mitigation in ADR 0004) does not touch auth

**Bad**
- We own password hashing, MFA enrolment, lockout and session expiry. **All of it falls under G6:
  human review, line by line, no AI-generated code merged unread.**
- RLS needs the user stamped per request. Forget `withUser()` and queries return nothing — the safe
  failure direction, but it presents as a broken query rather than a missing scope. `scoped.ts`
  documents this; the Stage 3 tests must cover it.
- The connection role must not own the tables and must not have BYPASSRLS, or Postgres exempts it
  from every policy and G5 silently evaporates. Called out in `src/lib/db.ts` and `docs/09-setup.md`.

**Watch**
- Argon2id vs bcrypt cost 12: pick in task 3.1 and record it here.
- Session storage: database-backed, so the 10-minute timeout is enforced server-side. A JWT with a
  10-minute expiry is not the same thing and does not satisfy a revocation requirement.
