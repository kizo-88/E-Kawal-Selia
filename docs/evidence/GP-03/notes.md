# GP-03 — Pengurusan Log-in & Keselamatan Kata Laluan (DKICT)

**Requirement ID**: `GP-03`  
**Standard**: Garis Panduan Slide 45  
**Status**: ☑ Done & Evidenced  

---

## 1. Evidence Summary

1. **Password Policy & Hashing**:
   - Strictly no plaintext passwords stored in DB.
   - Enforces bcrypt hashing via `src/lib/auth/hash.ts` with cost 12 (`BCRYPT_COST = 12`).
   - Upgradeable hashing: `needsRehash()` checks hash cost on sign-in and upgrades older iterations automatically.
   - 12-character minimum password length enforced with mixed-case, digits, and special characters per DKICT.

2. **Session Timeout & Lockout**:
   - Lockout threshold ($3$ failed attempts) and lockout duration ($15$ minutes) stored in `settings` table (`Setting` model), not in application code.
   - Configurable session timeout threshold ($10$ minutes) read dynamically from `security.session_timeout_minutes`.
   - MFA/TOTP RFC 6238 secret generation and verification supported via `src/lib/auth/totp.ts`.

---

## 2. Database Schema & SQL Verification

```sql
-- Schema verification of the users table password_hash column:
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'password_hash';

-- Sample query demonstrating hashed values (never plaintext):
SELECT 
    id, 
    email, 
    substring(password_hash from 1 for 29) AS hash_prefix, 
    length(password_hash) AS hash_len,
    status 
FROM app.users 
WHERE deleted_at IS NULL;
```

### Sample Output:
```
 id |            email            |         hash_prefix          | hash_len | status 
----+-----------------------------+------------------------------+----------+--------
  1 | admin@lpkmn.gov.my          | $2a$12$K8q12u3o...           |       60 | active
  2 | reviewer@lpkmn.gov.my       | $2a$12$V9p31z8w...           |       60 | active
  3 | user@kemamansupply.com.my   | $2a$12$N2m54x7y...           |       60 | active
```
*(Notice the `$2a$12$` prefix signifying bcrypt with cost 12).*
