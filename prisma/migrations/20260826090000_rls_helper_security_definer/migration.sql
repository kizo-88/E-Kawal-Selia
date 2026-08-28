-- ============================================================================
-- Fix: RLS helper functions must not be filtered by the policies that call them
--
-- SYMPTOM
--   Any signed-in read of settings, lookup_values, roles, permissions, menus or
--   document templates failed with:
--     ERROR: 54001 stack depth limit exceeded
--
--   Every configuration screen in the system, for every user. Anonymous reads
--   returned zero rows and looked fine, which is why it survived this long.
--
-- CAUSE
--   app.has_permission() reads user_role, role_permission, permissions and
--   roles. Those tables carry policies of the form
--     USING (app.is_super_admin() OR app.has_permission('config.<t>.manage'))
--   and app.is_super_admin() is itself app.has_permission('system.all').
--
--   So the policy called the function, the function's SELECT triggered the
--   policy, and Postgres unwound it at the stack limit.
--
--   This is the same fault as the applications_read recursion fixed in
--   20260825091000, and it is the same underlying rule:
--
--     A POLICY ON TABLE X MUST NEVER CALL A FUNCTION THAT QUERIES X
--     WITHOUT SECURITY DEFINER.
--
-- FIX
--   The permission-lookup helpers become SECURITY DEFINER, so they run as the
--   owner and read the RBAC tables directly rather than through the policies
--   they exist to evaluate. This is the standard Postgres pattern for RLS
--   helpers and is what the documentation recommends.
--
--   search_path is pinned on every one of them. A SECURITY DEFINER function
--   with a mutable search_path is a privilege-escalation vector: a caller can
--   create a schema earlier in the path and shadow the tables the function
--   reads. Pinning it is not optional here.
--
-- DELIBERATELY NOT CHANGED
--   app.can_view_application() stays SECURITY INVOKER. It answers "is this row
--   visible to you", and it gets that answer precisely BECAUSE the applications
--   policy filters its SELECT. Making it DEFINER would make every application
--   document visible to everyone.
-- ============================================================================

-- Reads only the connection-local setting. No table access, so no recursion —
-- but pinned and marked alongside the others for consistency.
CREATE OR REPLACE FUNCTION app.current_user_id() RETURNS BIGINT
  LANGUAGE sql
  STABLE
  SET search_path = pg_catalog, public
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::BIGINT;
$$;

CREATE OR REPLACE FUNCTION app.has_permission(permission_code TEXT) RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = pg_catalog, public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION app.user_unit_ids() RETURNS SETOF BIGINT
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = pg_catalog, public
AS $$
  SELECT internal_unit_id FROM user_internal_unit WHERE user_id = app.current_user_id();
$$;

CREATE OR REPLACE FUNCTION app.is_super_admin() RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = pg_catalog, public
AS $$
  SELECT app.has_permission('system.all');
$$;

-- Reads workflow_stages, whose own policy calls app.has_permission(). Same
-- recursion risk, same fix.
CREATE OR REPLACE FUNCTION app.can_act_on_stage(stage_id BIGINT) RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = pg_catalog, public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workflow_stages ws
    WHERE ws.id = stage_id
      AND ws.deleted_at IS NULL
      AND (
        (ws.actor_role_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_role ur
          WHERE ur.user_id = app.current_user_id() AND ur.role_id = ws.actor_role_id
        ))
        OR
        (ws.actor_internal_unit_id IS NOT NULL
         AND ws.actor_internal_unit_id IN (SELECT app.user_unit_ids()))
      )
  );
$$;

-- ============================================================================
-- Public configuration must be readable before anyone has signed in.
--
-- The login page needs the system name and logo; the front page needs the
-- announcements; the QR verification page needs neither a session nor a
-- password. Under the original policy every one of those returned zero rows,
-- so the login screen would have rendered blank.
--
-- Only settings explicitly marked is_public are exposed. Everything else still
-- requires a signed-in user.
-- ============================================================================

CREATE POLICY settings_public_read ON settings FOR SELECT
  USING (app.current_user_id() IS NULL AND is_public AND deleted_at IS NULL);

-- Applicants must be able to see which licence types exist and what documents
-- each demands before deciding to register at all.
CREATE POLICY application_types_public_read ON application_types FOR SELECT
  USING (app.current_user_id() IS NULL AND active AND deleted_at IS NULL);

CREATE POLICY application_type_documents_public_read ON application_type_documents FOR SELECT
  USING (app.current_user_id() IS NULL AND deleted_at IS NULL);
