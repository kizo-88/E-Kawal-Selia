# GP-03 — Pengurusan Log-in & Keselamatan Kata Laluan (DKICT)

**Requirement ID**: `GP-03`  
**Standard**: Garis Panduan Slide 45  
**Status**: ☑ Done & Evidenced  

---

## Evidence Summary

1. **Password Policy & Hashing**:
   - Strictly no plaintext passwords stored in DB.
   - Enforces bcrypt / Argon2 hashing via `src/lib/auth/password.ts` with upgradeable cost parameters.
   - 12-character minimum password length enforced across registration (`/daftar`) and password update (`/profil`).

2. **Session Timeout & Lockout**:
   - Lockout threshold ($3$ failed attempts) and lockout duration ($15$ minutes) stored in `settings` table (`Setting` model), not in application code.
   - Configurable session timeout threshold ($10$ minutes).
   - MFA/TOTP secret generation and verification supported via `src/lib/auth/mfa.ts`.
