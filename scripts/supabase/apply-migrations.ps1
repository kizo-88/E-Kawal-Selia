# F3 — apply migrations to the real Supabase project and create the app role.
#
# Prerequisites (supplied by the lead):
#   * DIRECT_URL  in .env  — postgres://postgres:<DB_PASSWORD>@db.<ref>.supabase.co:5432/postgres
#     (the pooler on 6543 cannot run DDL; migrations need the direct 5432 path)
#   * DATABASE_URL in .env  — the pooled connection (6543) the app uses at runtime,
#     with the kawalselia_app role from scripts/supabase/setup-app-role.sql
#
# Usage:  pwsh scripts/supabase/apply-migrations.ps1
#
# Step 1 applies every pending migration (creates tables, RLS policies, the
# app.current_user_id() helper, etc.). Step 2 creates the non-owner,
# non-BYPASSRLS application role and grants it the minimum privileges.

$ErrorActionPreference = 'Stop'

Write-Host "==> Applying Prisma migrations to Supabase (DIRECT_URL)..." -ForegroundColor Cyan
npx prisma migrate deploy --schema prisma/schema.prisma
if ($LASTEXITCODE -ne 0) { throw "prisma migrate deploy failed" }

Write-Host "==> Creating the kawalselia_app role (NOSUPERUSER, NOBYPASSRLS)..." -ForegroundColor Cyan
# Runs against the direct connection; the role password is set in the SQL file.
npx prisma db execute --schema prisma/schema.prisma --file scripts/supabase/setup-app-role.sql
if ($LASTEXITCODE -ne 0) { throw "role setup failed" }

Write-Host "==> Done. Confirm: SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname='kawalselia_app';" -ForegroundColor Green
