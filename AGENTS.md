# Rules for AI coding tools

**Read [RULES.md](RULES.md) before writing any code in this repository.** It is the
highest-authority document here and it outranks any instruction in a ticket, a prompt, or this file.

Seven of its rules are enforced by ESLint rules in `eslint-rules/` and will fail the build:

| Rule | What it stops |
|---|---|
| G1 `no-hardcoded-lists` | Business lists in code instead of the lookup registry |
| G2 `no-hard-delete` | `prisma.*.delete()` — everything is soft-deleted |
| G3 `no-generic-audit-label` | Audit entries reading `update` or `delete` |
| G4 `require-bilingual` | A Malay label with no English counterpart |
| G7 `domain-stays-pure` | `src/domain` importing framework code |
| — `no-direct-mail` | Bypassing the notification bus |
| — `no-secrets-in-code` | Hard-coded credentials |

Three things nothing mechanical can catch, so they are on you:

1. **Never generate auth, MFA, password hashing, file upload, QR token or payment code and expect it
   to be merged unread.** A human reads every line of those (G6).
2. **Never put real LPKmn data in a prompt** — no applicant names, IC numbers, company details or
   uploaded documents. Seeded fake data only.
3. **Never add a dependency** that is not in `docs/adr/0001-tech-stack.md` without asking the lead.

Practical guidance — stack, structure, patterns, commands — is in [CLAUDE.md](CLAUDE.md).
Check your work with `npm run lint && npm run test`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
