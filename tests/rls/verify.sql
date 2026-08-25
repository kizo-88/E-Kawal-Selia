-- G5 verification. Run as kawalselia_app — a role that owns nothing and has
-- NOBYPASSRLS. Running this as postgres proves nothing: owners are exempt.
--
-- Each scenario is wrapped in BEGIN/COMMIT because set_config(..., true) is
-- transaction-local. Without the transaction, psql autocommits each statement,
-- the setting is discarded before the next query runs, and every scenario
-- returns zero rows — which looks like a passing "deny" test but proves
-- nothing. This mirrors withUser() in src/lib/db/scoped.ts.

\pset pager off
\pset footer off

\echo '=== PRE-FLIGHT: is RLS engaged for this role? ==='
SELECT current_user AS connected_as,
       (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user) AS can_bypass,
       (SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tableowner = current_user) AS tables_owned;

\echo ''
\echo '=== A. anonymous -> no applications ==='
BEGIN;
SELECT set_config('app.current_user_id', '', true) \gset
SELECT count(*) AS applications FROM applications;
COMMIT;

\echo '=== B. Officer, Unit M/T ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='mt@lpkmn.test'), true) \gset
SELECT count(*) AS visible, coalesce(string_agg(reference_no, ', '), '(none)') AS refs FROM applications;
COMMIT;

\echo '=== C. Officer, Unit Keselamatan ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='sec@lpkmn.test'), true) \gset
SELECT count(*) AS visible, coalesce(string_agg(reference_no, ', '), '(none)') AS refs FROM applications;
COMMIT;

\echo '=== D. Applicant A ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='a@syarikat.test'), true) \gset
SELECT count(*) AS visible, coalesce(string_agg(reference_no, ', '), '(none)') AS refs FROM applications;
COMMIT;

\echo '=== E. Applicant B ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='b@syarikat.test'), true) \gset
SELECT count(*) AS visible, coalesce(string_agg(reference_no, ', '), '(none)') AS refs FROM applications;
COMMIT;

\echo '=== F. Colleague at the same organisation ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='a2@syarikat.test'), true) \gset
SELECT count(*) AS visible, coalesce(string_agg(reference_no, ', '), '(none)') AS refs FROM applications;
COMMIT;

\echo '=== G. Admin holding view_all ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='admin@lpkmn.test'), true) \gset
SELECT count(*) AS visible, coalesce(string_agg(reference_no, ', '), '(none)') AS refs FROM applications;
COMMIT;

\echo '=== H. Uploaded documents follow their application ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='sec@lpkmn.test'), true) \gset
SELECT count(*) AS docs_visible_to_security FROM application_documents;
COMMIT;
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='mt@lpkmn.test'), true) \gset
SELECT count(*) AS docs_visible_to_mt FROM application_documents;
COMMIT;

\echo '=== I. Anonymous QR path: active licences only, never revoked ==='
BEGIN;
SELECT set_config('app.current_user_id', '', true) \gset
SELECT count(*) AS visible, coalesce(string_agg(licence_no||' ['||status||']', ', '), '(none)') AS detail FROM licences;
COMMIT;

\echo '=== J. Officer with no licence permission ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='sec@lpkmn.test'), true) \gset
SELECT count(*) AS licences_visible_to_security FROM licences;
COMMIT;

\echo '=== K. Audit trail needs audit.log.view ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='a@syarikat.test'), true) \gset
SELECT count(*) AS audit_rows_visible_to_applicant FROM audit_logs;
COMMIT;

\echo '=== L. An applicant cannot file in another person''s name ==='
BEGIN;
SELECT set_config('app.current_user_id', (SELECT id::text FROM users WHERE email='a@syarikat.test'), true) \gset
\set ON_ERROR_STOP off
INSERT INTO applications (uuid, application_type_id, applicant_user_id, status, form_data, last_completed_step, created_at, updated_at)
SELECT gen_random_uuid(), at.id, (SELECT id FROM users WHERE email='b@syarikat.test'), 'draft', '{}'::jsonb, 0, now(), now()
FROM application_types at WHERE at.code='LESEN_SOKONGAN';
\set ON_ERROR_STOP on
ROLLBACK;

\echo '=== M. Stage logs are append-only ==='
SELECT cmd, policyname FROM pg_policies
WHERE schemaname='public' AND tablename='application_stage_logs' ORDER BY cmd;

\echo '=== N. RLS enabled AND forced on every M1 table ==='
SELECT c.relname AS table_name, c.relrowsecurity AS enabled, c.relforcerowsecurity AS forced
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind='r'
  AND c.relname IN ('applications','application_documents','application_stage_logs',
                    'licences','licence_renewals','application_types','workflows',
                    'workflow_stages','workflow_transitions','application_type_documents')
ORDER BY c.relname;
