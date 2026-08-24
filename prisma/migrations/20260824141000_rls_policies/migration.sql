-- ============================================================================
-- Row Level Security — G5
--
-- "Never filter in a route handler or a component. An officer from Unit
--  Keselamatan must not see Unit M/T's applications by editing a URL."
--
-- Filtering in application code is a rule people forget under deadline. A
-- database policy is a rule the database keeps. This file is what lets RULES.md
-- claim G5 is enforced rather than merely intended.
--
-- HOW IT WORKS
-- ------------
-- Auth.js owns the session, not Supabase Auth (ADR 0005), so there is no
-- auth.uid() to read. Instead every request opens a transaction and stamps the
-- authenticated user onto the connection:
--
--     await prisma.$transaction(async (tx) => {
--       await tx.$executeRaw`SELECT set_config('app.current_user_id', ${id}, true)`
--       ...queries...
--     })
--
-- src/lib/db/scoped.ts wraps that so nobody has to remember it.
--
-- REQUIRED: the application must connect as a role that is NOT the table owner
-- and does NOT have BYPASSRLS. Postgres exempts owners from RLS, so connecting
-- as `postgres` silently disables every policy below and all of this becomes
-- decoration. See docs/09-setup.md.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS app;

-- The user stamped onto this connection, or NULL for an anonymous request
-- (the public QR verification page, X-R12).
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS BIGINT AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::BIGINT;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.has_permission(permission_code TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_role ur
    JOIN role_permission rp ON rp.role_id = ur.role_id
    JOIN permissions p      ON p.id = rp.permission_id
    JOIN roles r            ON r.id = ur.role_id
    WHERE ur.user_id = app.current_user_id()
      AND p.code = permission_code
      AND r.active
      AND r.deleted_at IS NULL
      AND p.deleted_at IS NULL
  );
$$ LANGUAGE sql STABLE;

-- Unit-scoped visibility: the mechanism behind "Unit Keselamatan cannot see
-- Unit M/T's work". Used by the Modul Permohonan policies in Stage 5.
CREATE OR REPLACE FUNCTION app.user_unit_ids() RETURNS SETOF BIGINT AS $$
  SELECT internal_unit_id FROM user_internal_unit WHERE user_id = app.current_user_id();
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.is_super_admin() RETURNS BOOLEAN AS $$
  SELECT app.has_permission('system.all');
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- Reference data: readable by any signed-in user, writable only with the
-- matching permission. GP-09 lets admins edit these through the UI; it does not
-- let an applicant edit them by finding an endpoint.
-- ============================================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'settings', 'lookup_types', 'lookup_values', 'file_policies',
    'menu_items', 'menu_item_role', 'roles', 'permissions',
    'role_permission', 'internal_units', 'document_templates',
    'notification_templates', 'undertaking_versions'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);

    EXECUTE format($f$
      CREATE POLICY %1$I_read ON %1$I FOR SELECT
      USING (app.current_user_id() IS NOT NULL)
    $f$, t);

    EXECUTE format($f$
      CREATE POLICY %1$I_write ON %1$I FOR ALL
      USING (app.is_super_admin() OR app.has_permission('config.' || %1$L || '.manage'))
      WITH CHECK (app.is_super_admin() OR app.has_permission('config.' || %1$L || '.manage'))
    $f$, t);
  END LOOP;
END $$;

-- ============================================================================
-- Users — you see yourself; officers with the permission see everyone.
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY users_read_self ON users FOR SELECT
  USING (id = app.current_user_id() OR app.has_permission('identity.user.view'));

CREATE POLICY users_update_self ON users FOR UPDATE
  USING (id = app.current_user_id() OR app.has_permission('identity.user.manage'))
  WITH CHECK (id = app.current_user_id() OR app.has_permission('identity.user.manage'));

CREATE POLICY users_manage ON users FOR INSERT
  WITH CHECK (app.has_permission('identity.user.manage'));

-- ============================================================================
-- Organisations — a wakil syarikat sees the company they represent.
-- ============================================================================

ALTER TABLE organisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisations FORCE ROW LEVEL SECURITY;

CREATE POLICY organisations_read ON organisations FOR SELECT
  USING (
    app.has_permission('identity.organisation.view')
    OR EXISTS (
      SELECT 1 FROM organisation_user ou
      WHERE ou.organisation_id = organisations.id
        AND ou.user_id = app.current_user_id()
        AND ou.deleted_at IS NULL
    )
  );

CREATE POLICY organisations_write ON organisations FOR ALL
  USING (app.has_permission('identity.organisation.manage'))
  WITH CHECK (app.has_permission('identity.organisation.manage'));

ALTER TABLE organisation_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE organisation_user FORCE ROW LEVEL SECURITY;

CREATE POLICY organisation_user_read ON organisation_user FOR SELECT
  USING (user_id = app.current_user_id() OR app.has_permission('identity.organisation.view'));

CREATE POLICY organisation_user_write ON organisation_user FOR ALL
  USING (app.has_permission('identity.organisation.manage'))
  WITH CHECK (app.has_permission('identity.organisation.manage'));

-- ============================================================================
-- Per-user records.
-- ============================================================================

ALTER TABLE user_role ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_role FORCE ROW LEVEL SECURITY;
CREATE POLICY user_role_read ON user_role FOR SELECT
  USING (user_id = app.current_user_id() OR app.has_permission('identity.user.view'));
CREATE POLICY user_role_write ON user_role FOR ALL
  USING (app.has_permission('identity.role.assign'))
  WITH CHECK (app.has_permission('identity.role.assign'));

ALTER TABLE user_internal_unit ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_internal_unit FORCE ROW LEVEL SECURITY;
CREATE POLICY user_internal_unit_read ON user_internal_unit FOR SELECT
  USING (user_id = app.current_user_id() OR app.has_permission('identity.user.view'));
CREATE POLICY user_internal_unit_write ON user_internal_unit FOR ALL
  USING (app.has_permission('identity.user.manage'))
  WITH CHECK (app.has_permission('identity.user.manage'));

ALTER TABLE notification_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_messages FORCE ROW LEVEL SECURITY;
CREATE POLICY notification_messages_own ON notification_messages FOR ALL
  USING (user_id = app.current_user_id())
  WITH CHECK (user_id = app.current_user_id());

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences FORCE ROW LEVEL SECURITY;
CREATE POLICY notification_preferences_own ON notification_preferences FOR ALL
  USING (user_id = app.current_user_id() OR app.has_permission('config.notification.manage'))
  WITH CHECK (user_id = app.current_user_id() OR app.has_permission('config.notification.manage'));

-- GP-06. Read-only once written: an acceptance is evidence, and evidence that
-- can be edited is not evidence.
ALTER TABLE user_undertakings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_undertakings FORCE ROW LEVEL SECURITY;
CREATE POLICY user_undertakings_read ON user_undertakings FOR SELECT
  USING (user_id = app.current_user_id() OR app.has_permission('identity.user.view'));
CREATE POLICY user_undertakings_insert ON user_undertakings FOR INSERT
  WITH CHECK (user_id = app.current_user_id());

-- ============================================================================
-- Audit — GP-18. Append-only at the database level.
--
-- No UPDATE policy and no DELETE policy anywhere below. That is deliberate: an
-- audit trail an application can rewrite is worthless to the auditor it exists
-- for. The retention purge (GP-18's flush) runs as a separate privileged job.
-- ============================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_read ON audit_logs FOR SELECT
  USING (app.has_permission('audit.log.view'));

CREATE POLICY audit_logs_append ON audit_logs FOR INSERT
  WITH CHECK (app.current_user_id() IS NOT NULL);

ALTER TABLE audit_purge_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_purge_runs FORCE ROW LEVEL SECURITY;
CREATE POLICY audit_purge_runs_read ON audit_purge_runs FOR SELECT
  USING (app.has_permission('audit.log.view'));

-- ============================================================================
-- Generated documents — X-R12.
--
-- The public verification page runs anonymously and must reach exactly one row
-- by its qr_token. It selects only licence number, type, holder name, validity
-- dates and status; never IC, address, phone or attachments. That column
-- restriction lives in the query, but the row restriction lives here.
-- ============================================================================

ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents FORCE ROW LEVEL SECURITY;

CREATE POLICY generated_documents_read ON generated_documents FOR SELECT
  USING (
    app.has_permission('dokumen.generated.view')
    OR generated_by = app.current_user_id()
  );

-- Anonymous QR lookup. Restricted to live, unrevoked documents so a scan of a
-- revoked licence reveals nothing rather than confirming it once existed.
CREATE POLICY generated_documents_public_verify ON generated_documents FOR SELECT
  USING (
    app.current_user_id() IS NULL
    AND revoked_at IS NULL
    AND deleted_at IS NULL
  );

CREATE POLICY generated_documents_write ON generated_documents FOR INSERT
  WITH CHECK (app.has_permission('dokumen.generated.create'));

ALTER TABLE notification_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_broadcasts FORCE ROW LEVEL SECURITY;
CREATE POLICY notification_broadcasts_read ON notification_broadcasts FOR SELECT
  USING (app.current_user_id() IS NOT NULL);
CREATE POLICY notification_broadcasts_write ON notification_broadcasts FOR ALL
  USING (app.has_permission('config.notification.manage'))
  WITH CHECK (app.has_permission('config.notification.manage'));
