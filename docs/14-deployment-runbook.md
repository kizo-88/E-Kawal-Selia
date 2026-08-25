# 14 — e-Kawalselia Production Deployment & Operations Runbook

**System**: e-Kawalselia (Lembaga Pelabuhan Kemaman)  
**Target Environment**: Supabase Cloud / Self-Hosted Docker VPS  
**Security Level**: High (DKICT Maritime Standard)  

---

## 1. Pre-Deployment Environment Setup

Ensure the following environment variables are set in production `.env` (never commit secrets to git):

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.nskicbqkahultaasmuru.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.nskicbqkahultaasmuru.supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://nskicbqkahultaasmuru.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Auth & Encryption (min 32 chars)
AUTH_SECRET="[SECURE_RANDOM_BASE64_SECRET_32_BYTES]"
AUTH_URL="https://kawalselia.lpkmn.gov.my"
ENCRYPTION_KEY="[SECURE_32_CHAR_ENCRYPTION_KEY]"

# App Settings
NEXT_PUBLIC_APP_URL="https://kawalselia.lpkmn.gov.my"
APP_TIMEZONE="Asia/Kuala_Lumpur"
APP_DEFAULT_LOCALE="ms"
```

---

## 2. Database Migration & Seeding Sequence

> ⚠️ **IMPORTANT**: Migrations must run through `DIRECT_URL` (port 5432). The pooler on port 6543 cannot execute DDL commands.

```bash
# 1. Apply Prisma Migrations to PostgreSQL
npx prisma migrate deploy

# 2. Seed Baseline Roles, Menus, Settings, and Application Types
npx tsx prisma/seed.ts

# 3. Verify Database Integrity
npx prisma db pull --print
```

---

## 3. Application Build & Process Initialization

```bash
# 1. Install Production Dependencies
npm ci --only=production

# 2. Compile Optimized Next.js Build
npm run build

# 3. Start Production Server (via PM2 or Docker)
npm run start
```

---

## 4. Health Check & Verification Checklist

- [ ] HTTPS & HSTS response headers confirmed active (`Strict-Transport-Security: max-age=63072000`).
- [ ] Public front page (`/`) and QR verification (`/semak/[token]`) accessible without authentication.
- [ ] Administrative portal login (`/login`) functional with 10-minute idle session timeout.
- [ ] 3 Phase 1 application types (`LESEN_SOKONGAN`, `PERMIT_AKTIVITI`, `SURAT_PDA2`) selectable in form wizard (`/permohonan/baru`).
- [ ] Multi-format exporter (`/permohonan/export`, `/pelesenan/export`) generating valid `.xlsx`, `.docx`, and `.pdf` files.
- [ ] Audit trail recording security events into `audit_logs`.
