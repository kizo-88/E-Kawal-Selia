# 10 — Parallel Workstreams

Three AI tools working at once: **Claude Code** (lead), **Gemini / Antigravity** (UI),
**OpenCode** (services and bulk work).

This only works if nobody edits anybody else's files. The boundaries below are not a suggestion —
two agents touching one file produces a conflict neither of them can resolve, and the lead loses an
afternoon to it.

---

## ⚠️ Read this before starting three agents

Parallel agents **increase** the lead's review load. Three streams of generated code means three
streams to review, and the lead is already the bus factor on a project with 13 days of buffer.

This is worth it for **Round 1**, where the three lanes are genuinely independent. It stops being
worth it the moment two lanes need the same file. If you find yourself arbitrating merge conflicts
more than once a day, drop to two agents.

**G6 still applies.** Auth, MFA, password hashing, file upload, QR tokens and payment are read line
by line by the lead regardless of which tool wrote them. Those tasks stay in the Claude Code lane
for exactly that reason.

---

## Ownership map

| Lane | Owns | Must never touch |
|---|---|---|
| **Claude Code** | `src/lib/auth/**`, `src/domain/**`, `src/lib/db/**`, `prisma/**`, `eslint-rules/**`, `docs/**` | `src/components/**`, `src/app/(public)/**` |
| **Gemini / Antigravity** | `src/components/**`, `src/app/(public)/**`, `src/app/globals.css`, `src/app/layout.tsx` | `src/lib/**`, `prisma/**`, `src/domain/**` |
| **OpenCode** | `src/lib/rbac/**`, `src/lib/menu/**`, `src/lib/audit/purge.ts`, `src/lib/exports/**`, `src/app/(admin)/**` | `src/components/**`, `prisma/**`, `src/lib/auth/**`, `src/lib/config/**`, `src/lib/audit/*` except `purge.ts` |

**Lead-only files, no exceptions:** `prisma/schema.prisma`, `prisma/seed.ts`,
`prisma/migrations/**`, `RULES.md`, `eslint-rules/**`, `package.json`.

Need a schema change or a new dependency? **Ask the lead.** Do not edit these files, and do not run
`npm install`.

---

## Branch and merge protocol

```bash
git checkout -b lane/claude    # or lane/gemini, lane/opencode
```

1. Each lane works on its own branch, and rebases on `main` at the start of every session.
2. Before pushing, **every lane runs the same two commands** and both must be clean:
   ```bash
   npm run lint && npm run test
   ```
3. The lead merges to `main`. No lane merges its own branch.
4. `main` is always deployable.
5. If two lanes need the same file, **stop and tell the lead**. Do not "just fix it" — the fix
   usually means one lane's work gets thrown away.

---

## Round 1 — three genuinely independent lanes

No file overlap at all. Start all three at once.

| Lane | Tasks | Requirement IDs |
|---|---|---|
| Claude Code | 3.1 password policy, 3.2 lockout + session, 3.4 MFA | GP-03, M5-R05 |
| Gemini | 2.13 design system, front page, login screen | GP-21, GP-22 |
| OpenCode | 2.6 roles service, 2.7 menu registry, 2.11 audit purge | GP-01, GP-02, GP-18 |

## Round 2 — after Round 1 merges

Gemini's components must exist before OpenCode builds admin screens on them.

| Lane | Tasks | Requirement IDs |
|---|---|---|
| Claude Code | 3.5 universal list component | GP-12 |
| Gemini | dashboard shell, responsive pass, help-note component | GP-15, GP-22 |
| OpenCode | 3.7 exports (Excel, Word, PDF), audit trail screens | GP-12, GP-14, GP-18 |

---

## The prompts

Copy these verbatim. Each is self-contained — an agent starting cold has no memory of this project.

### Claude Code — auth policy engine

```
Read RULES.md, then CLAUDE.md, then docs/02-requirements.md.

You are the lead lane. Branch: lane/claude.

Build tasks 3.1, 3.2 and 3.4 from docs/08-build-plan.md — the authentication
policy engine.

You own: src/lib/auth/**, src/domain/identity/**, tests/auth.test.ts
Do not touch: src/components/**, src/app/(public)/**, src/lib/rbac/**

Requirements, all from GP-03. Every value below is ALREADY in the settings
table and MUST be read through getSecurityPolicy() in src/lib/config/settings.ts.
Hard-coding any of them fails the requirement even when the number is right,
because GP-03 asks for them to be admin-configurable:

  - password minimum 12 characters (LPKmn DKICT standard)
  - configurable character classes: mixed case, symbol
  - lockout after 3 consecutive failures, configurable
  - session timeout 10 minutes, configurable
  - force password change on first login
  - MFA (TOTP) — enrolment, challenge, recovery codes

The users table already has passwordHash, mustChangePassword, mfaSecret,
mfaEnabledAt, failedAttempts, lockedUntil. Do not change the schema; if you
believe you need to, stop and say so.

Write pure, testable functions for the policy itself — validatePassword(policy,
candidate), shouldLock(attempts, policy) — separate from anything touching the
database, so the whole matrix is testable without a live connection. Follow the
pattern in src/lib/uploads/file-policy.ts.

Every auth event writes an audit row through src/lib/audit/record.ts using the
registered actions PENGGUNA_LOG_MASUK, PENGGUNA_LOG_MASUK_GAGAL,
PENGGUNA_DIKUNCI, KATA_LALUAN_DITUKAR, MFA_DIAKTIFKAN. Do not invent action
codes; add them to src/lib/audit/actions.ts with both language templates if
something is genuinely missing.

Never log or audit a password, hash, MFA secret or recovery code. Run diffs
through redact().

This code falls under G6: it will be read line by line before merge. Write it
to be read.

Verify with: npm run lint && npm run test
```

### Gemini / Antigravity — front page and design system

```
Read RULES.md, then CLAUDE.md.

You are the UI lane. Branch: lane/gemini.

Build task 2.13 and the P2 design system from docs/08-build-plan.md.

You own: src/components/**, src/app/(public)/**, src/app/globals.css,
         src/app/layout.tsx
Do not touch: src/lib/**, src/domain/**, prisma/**. If you need data, define a
TypeScript interface for the shape you want and use fixture data. Another lane
wires it up.

This is e-Kawalselia, a licensing and permit portal for Lembaga Pelabuhan
Kemaman, a Malaysian port authority. Users are shipping companies, agents and
individual marine pilots, plus LPKmn officers. Interface language is Bahasa
Melayu. Tone is Malaysian government: formal, plain, trustworthy. Not a startup
landing page.

GP-21 — the front page must contain all of:
  brief introduction, LPKmn organisation logo, system logo, full system name,
  system acronym, login form, forgot-password link, new-registration link, a
  news / announcement / circular / FAQ panel, footer, background image.

GP-22 — the interface requirements, which are contractual:
  readable fonts, clean CSS, RESPONSIVE AND USABLE AT 375px WIDTH, contrasting
  menu colours, correct Bahasa Melayu, fast loading, and a help-note component
  available on every critical data-entry page.

Build the design system primitives first — button, input, card, alert, badge,
table shell — because another lane builds admin screens on them next round.
Tailwind v4 is already installed. Use it; do not add a component library
without asking the lead.

G4 applies to every string you write: anything user-facing needs a Malay and an
English value. Phase 1 displays Malay, but the English must exist. The
require-bilingual lint rule will stop you if you forget.

Verify visually at 375px, 768px and 1280px, and with: npm run lint && npm run test
```

### OpenCode — roles, menu registry, audit purge

```
Read RULES.md, then CLAUDE.md, then docs/04-data-model.md.

You are the services lane. Branch: lane/opencode.

Build tasks 2.6, 2.7 and 2.11 from docs/08-build-plan.md.

You own: src/lib/rbac/**, src/lib/menu/**, src/lib/audit/purge.ts,
         tests/rbac.test.ts, tests/menu.test.ts, tests/purge.test.ts
Do not touch: src/components/**, prisma/**, src/lib/auth/**,
              src/lib/config/**, or any file in src/lib/audit/ except purge.ts

Task 2.6 — roles service (GP-01, GP-02)
  The tables already exist: roles, permissions, role_permission, user_role.
  Five baseline roles are seeded with isSystem = true. Build the service layer:
  create, update, activate, deactivate, archive a role; assign and revoke
  permissions; check whether a user holds a permission.
  isSystem roles cannot be deleted. Deleting any role must not break historical
  records that reference it — soft delete only, per G2.
  GP-02 requires unlimited additional roles to be creatable, so nothing may
  assume the five baseline codes are the complete set.

Task 2.7 — menu registry (GP-01)
  Tables menu_items and menu_item_role exist. Build a tree resolver returning
  the menu a given user can see. Menu visibility is deliberately SEPARATE from
  the underlying permission, so LPKmn can hide a menu item without revoking
  anyone's access. Do not collapse the two.

Task 2.11 — audit retention purge (GP-18)
  GP-18 requires a flush button and an automatic retention period. The period is
  the audit.retention_days setting — read it, never hard-code it.
  The purge itself must write an audit_purge_runs row recording what was
  removed, by whom, and when, plus an audit row using the registered action
  JEJAK_AUDIT_DIBUANG. A flush that leaves no trace defeats the point of the
  audit trail it is trimming.
  This is the only physical delete allowed anywhere in the system. The
  no-hard-delete lint rule will flag it — disable it on that line WITH A WRITTEN
  REASON referencing GP-18.

Every business list belongs in the lookup registry, never in code. The
no-hardcoded-lists rule enforces this. Read lookups through
src/lib/config/lookups.ts.

Every user-facing string needs a Malay and an English value (G4).

Prefer pure functions the tests can reach without a database, following
src/lib/uploads/file-policy.ts.

Verify with: npm run lint && npm run test
```

---

## What each lane does when blocked

**Do not guess at an LPKmn business rule.** AI is weakest exactly there, and the tender documents
leave a lot undefined — see the thirteen open questions in `docs/02-requirements.md` §E.

Blocked on a business rule → stop, write the question down, tell the lead. It goes to the boss for
the URS session. A guess that reaches UAT costs more than the day spent waiting.

Blocked on a file another lane owns → stop, tell the lead. Never edit across the boundary.

Blocked on a missing dependency → stop. Adding a package is an ADR 0001 decision and the lead makes
it, because we maintain every dependency through the warranty period.
