# F9 — Vulnerability Assessment & Penetration Testing (VAPT) Preparation

**Standard**: Garis Panduan Slide 5 & DKICT Maritime Security Standard  
**Target Scope**: e-Kawalselia Production Readiness  
**Status**: ☑ Complete  

---

## 1. Security Threat Model & Defense Matrix

| Vulnerability Category | OWASP Top 10 | Implemented Mitigation | Verification Method |
|---|---|---|---|
| **SQL Injection (SQLi)** | A03:2021-Injection | All database access executed through Prisma ORM parameterized queries and Postgres Row Level Security (RLS) with session stamping. | Automated AST scanning (`rules.test.ts`), RLS policy verification. |
| **Cross-Site Scripting (XSS)** | A03:2021-Injection | React 19 JSX auto-escaping, strict CSP headers, HTML sanitization on CMS posts. | ESLint rules, client bundle isolation. |
| **Broken Access Control** | A01:2021-Broken Access Control | Row Level Security (G5 `withUser()`), RBAC permission checks, tenancy isolation. | Vitest suite (`rbac.test.ts`, `data-wiring-round3.test.ts`). |
| **Cryptographic Failures** | A02:2021-Cryptographic Failures | Passwords hashed using bcrypt / Argon2 (never plaintext), IC numbers & secrets encrypted at rest. | `auth.test.ts` (RFC 6238 vectors pass). |
| **Insecure Design (Brute Force)** | A04:2021-Insecure Design | 3-failure lockout policy with 15-minute cooldown, 10-minute session idle timeout (GP-03). | Lockout state unit tests (`auth.test.ts`). |
| **Security Misconfiguration** | A05:2021-Security Misconfiguration | Strict security response headers (`Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`). | Next.js security headers in `next.config.ts`. |
| **Server-Side Request Forgery (SSRF)** | A10:2021-SSRF | Magic-byte MIME sniffing (`magic-bytes.ts`) preventing malicious binary payload upload. | `uploads.test.ts`. |

---

## 2. API Surface Hardening (GP-23)

- **Public Endpoint (`/semak/[token]`)**: Anonymous access via `asAnonymous()` reveals ONLY 5 public fields (X-R12). Strict zero personal data disclosure.
- **Protected Actions**: All administrative server actions require verified user context and valid session tokens.
- **Audit Logging (G3)**: Every security-relevant event (login, logout, password change, permission assignment, licence download) writes an immutable audit record in `audit_logs`.
