-- F3 — create the application role the app connects as (G5, GP-01/02, X-R12).
--
-- Run ONCE against Supabase using the DIRECT_URL (port 5432), as a role that
-- can CREATE ROLE (e.g. postgres from the Supabase connection string). The lead
-- supplies the database password; this role's password should be taken from the
-- Supabase dashboard and placed in DATABASE_URL (pooler 6543) for the app.
--
-- CRITICAL — documented in docs/evidence/G5-RLS/notes.md:
--   * NOSUPERUSER        (rolsuper = false)
--   * NOBYPASSRLS        (rolbypassrls = false)  — otherwise every RLS policy
--                         is silently skipped and the green suite proves nothing
--   * must own ZERO tables — migrations are applied by postgres, then we GRANT
--                         the minimum privileges to this role.
--
-- Re-running is safe (guarded by the existence check).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'kawalselia_app') THEN
    CREATE ROLE kawalselia_app LOGIN PASSWORD 'CHANGE_ME_FROM_SUPABASE'
      NOSUPERUSER NOBYPASSRLS NOREPLICATION NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO kawalselia_app;
GRANT USAGE ON SCHEMA public TO kawalselia_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kawalselia_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kawalselia_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kawalselia_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO kawalselia_app;
