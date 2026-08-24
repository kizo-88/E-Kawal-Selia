# RULES.md — read this before you write a line

**This is the highest-authority document in the repo.** If anything — a ticket, a Slack message,
another doc, or an AI suggestion — conflicts with a rule here, the rule wins.

Applies to every human and every AI tool: Claude Code, Antigravity, OpenCode, Copilot, Cursor.

Load this file at the start of every session. Claude Code picks it up through `CLAUDE.md`; for
other tools it is `AGENTS.md`, `.cursorrules` and `.github/copilot-instructions.md`, all of which
point here.

---

## Why these rules exist

This is a **government tender** (LPKmn 02/2026, RM 198,000). Two documents bind us:

- `Keterangan Ringkas Sistem` — what the system does
- **`Garis Panduan Pembangunan Sistem Aplikasi LPKmn`** — 23 mandatory platform features, and a
  clause stating the vendor may not classify any of them as a change request

Slide 53 of the Garis Panduan says LPKmn takes **no responsibility for the cost** of tearing out
work that was hard-coded. On a project with 13 days of buffer and RM 11,450 of margin, one such
finding ends the profit. The rules below are that risk, converted into things a machine checks.

---

## The seven rules

### G1 · No hard-coding. Ever.

Every dropdown, status label, role, fee, file-type restriction, email template, document template
and application type lives in the **database**, editable by an admin through the UI.

> About to write `const negeri = ['Johor', 'Kedah', ...]`? Stop. Add a `lookup_type`.

**Enforced:** `kawalselia/no-hardcoded-lists` — an array of 3+ strings outside `prisma/`,
`scripts/`, `src/lib/enums/` or a test fails the lint.
**Traces to:** GP-01, GP-02, GP-09, GP-10, GP-11, X-R09, X-R10 · [ADR 0002](docs/adr/0002-configuration-over-code.md)

### G2 · Never physically delete.

Every model carries `deletedAt`. Deleting a user, a lookup value or an application must never break
a historical record that references it.

**Enforced:** `kawalselia/no-hard-delete` — `prisma.*.delete()` and `deleteMany()` fail the lint.
The only legitimate physical delete is the audit retention purge, which records itself.
**Traces to:** GP-02 ("Kaedah delete, tidak menjejaskan sebarang proses kerja") · [ADR 0003](docs/adr/0003-soft-delete-and-snapshots.md)

### G3 · Audit entries are sentences a human reads.

Never `update`. Never `delete`. Write what happened:

```
actionCode:    PERMOHONAN_DILULUSKAN
actionLabelMs: Permohonan Lesen Perkhidmatan Sokongan LPK/LPS/2026/00123
               diluluskan oleh Ketua Unit M/T
```

Every row carries actor, reference number, workflow stage, module, page, timestamp and IP.

**Enforced:** `kawalselia/no-generic-audit-label`
**Traces to:** GP-18, X-R01, X-R02 — audit output is used for Piagam Pelanggan compliance,
internal audit, **and overtime claim substantiation**. An auditor has to read it.

### G4 · Bilingual from day one.

Every user-facing string has `_ms` and `_en`. Phase 1 ships the UI in Malay only — the columns and
keys still exist. Retrofitting i18n later costs 3×.

**Enforced:** `kawalselia/require-bilingual` — `labelMs` without `labelEn` fails the lint.
**Traces to:** X-R06

### G5 · Permission filtering happens in the database.

Never filter in a route handler or a component. An officer from Unit Keselamatan must not see Unit
M/T's applications by editing a URL.

**Enforced:** Supabase **Row Level Security**. Every table with per-user or per-unit visibility
carries a policy. A missing policy is a failing test, not a review comment.
**Traces to:** GP-01, GP-02

### G6 · Money and identity code gets read by a human, line by line.

Auth, MFA, password hashing, file upload, QR token generation, anything touching payment.

**AI-generated code in these areas is not merged without the lead reading every line.** No
exceptions, including when the lead wrote the prompt.

### G7 · Dependencies point inward.

```
src/app  →  src/domain  →  src/lib
```

`src/domain` must not import `next/*`, `react`, `@/app` or `@/components`. Business rules live in
domain actions, not in route handlers or components.

**Enforced:** `kawalselia/domain-stays-pure`
**Why it matters:** this codebase was already ported once, from Laravel to Next.js. The layering is
why the port cost hours instead of weeks.

---

## Security — non-negotiable

| Rule | Value | Source |
|---|---|---|
| Password hashing | argon2id or bcrypt cost 12. Never plaintext, never reversible. | GP-03 |
| Minimum password length | **12 characters** (LPKmn DKICT standard), configurable | GP-03 |
| Lockout | after **3** consecutive failures, configurable | GP-03 |
| Session timeout | **10 minutes**, configurable | GP-03 |
| MFA | required | GP-03, M5-R05 |
| Transport | HTTPS only, HSTS on, no mixed content | GP-23 |
| Uploads | extension allowlist + real MIME sniffing + size cap, via `file_policies`. Stored outside the webroot, served through a permission-checked route. | GP-11 |
| QR tokens | 32 random characters. **Never** sequential, never derived from the licence number. | X-R11 |
| Public verification page | reveals only: licence number, type, holder name, validity dates, status. **Never** IC, address, phone or documents. | X-R12 |
| Secrets | `.env` only | GP-23 |

**Every configurable value above lives in the `settings` table, not in code.** "Configurable" is
part of the requirement — a hard-coded 10-minute timeout fails GP-03 even though the number is right.

**Enforced:** `kawalselia/no-secrets-in-code`, plus G6 human review.

---

## Working agreements

1. **One task = one branch = one PR.** Branch `feat/<req-id>-slug`, e.g. `feat/M1-03-stepper-autosave`.
   Commit `<req-id>: imperative summary`.
2. **Nothing merges to `main` unreviewed** — including the lead's own work. The boss reviews the
   lead's PRs even superficially, so a second person has seen the code. Bus factor is 1; this is the
   only mitigation we have.
3. **Definition of Done** — all nine items in [CLAUDE.md §8](CLAUDE.md). Item 8, the evidence
   screenshot, is a **payment gate**, not paperwork.
4. **A disabled lint rule needs a written reason.** `// eslint-disable-next-line kawalselia/x -- why`.
   An undocumented disable is a rejected PR.
5. **`main` is always deployable to staging.**

---

## Rules for interns, WBL, and anyone using AI

1. **You must be able to explain every line you submit.** At review the lead picks a line and asks
   what it does. Cannot explain it → PR closed. This is not punishment. It is what stops the lead
   becoming a full-time reviewer of code nobody understands, which is how this project dies.
2. **AI is for scaffolding, tests, documentation and UI.** Not the workflow engine, not auth, not QR
   generation, not anything under `src/domain/application/` or `src/lib/audit/`.
3. **Never paste real LPKmn data into an AI tool.** No applicant names, IC numbers, company details
   or uploaded documents. Seeded fake data only. This is a contractual and PDPA matter, not a
   preference.
4. **Do not add a dependency that is not in [ADR 0001](docs/adr/0001-tech-stack.md) without asking
   the lead.** Every package is one we maintain through the warranty period.

---

## When LPKmn asks for something new

Check [docs/01-scope-baseline.md](docs/01-scope-baseline.md) first.

- **In the Phase 1 table** → build it.
- **In the Phase 2 table** → the answer is not "no" and not "yes". It is *"that is in the Phase 2
  list, let me get you a quote."* Route it to the boss.
- **One of the 23 mandatory features** → it is already priced in. We are contractually barred from
  calling it a change request. Check [docs/07-compliance-checklist.md](docs/07-compliance-checklist.md)
  before telling anyone it is extra.

Every silent yes costs about **RM 17,500 per month** of slip.

---

## Checking your work

```bash
npm run lint && npm run test
```

Both must be clean. CI runs the same two commands and blocks the PR otherwise.

The rules themselves are tested in [`tests/rules.test.ts`](tests/rules.test.ts) — each one has a
violation that must be caught and a clean case that must not be. A rule that silently stopped
matching is worse than no rule, because everyone assumes it is still guarding them.
