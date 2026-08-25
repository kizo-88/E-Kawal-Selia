-- ============================================================================
-- Row Level Security for Modul Permohonan — G5
--
-- "An officer from Unit Keselamatan must not see Unit M/T's applications by
--  editing a URL."
--
-- This file is where that stops being a convention and becomes something the
-- database keeps. The rules below are the ones that matter most in the whole
-- system: applications carry applicant IC numbers, company details and
-- uploaded documents, and they are visible to two very different populations.
--
-- Depends on the helpers in 20260824141000_rls_policies:
--   app.current_user_id()          the user stamped on this connection
--   app.has_permission(code)       role -> permission lookup
--   app.user_unit_ids()            the internal units the user belongs to
--   app.is_super_admin()
--
-- REQUIRED, and easy to get wrong: the application must connect as a role that
-- is NOT the table owner and does NOT have BYPASSRLS. Postgres exempts owners
-- from row-level security, so connecting as `postgres` silently disables every
-- policy here, returns every row, and fails nothing. See docs/09-setup.md.
-- ============================================================================

-- Whether the current user is an officer acting at a given workflow stage.
-- Actor matching is by role OR unit, whichever the stage names — the engine
-- never hard-codes a unit, so neither does this.
CREATE OR REPLACE FUNCTION app.can_act_on_stage(stage_id BIGINT) RETURNS BOOLEAN AS $$
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
$$ LANGUAGE sql STABLE;

-- Whether the current user may see a given application at all.
-- Three ways in, and no fourth:
--   the applicant who filed it
--   a colleague at the same organisation (a company's other representatives
--     must be able to continue a submission when someone is on leave)
--   an officer whose role or unit acts at the stage the application is on
CREATE OR REPLACE FUNCTION app.can_view_application(app_id BIGINT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM applications a
    WHERE a.id = app_id
      AND (
        a.applicant_user_id = app.current_user_id()
        OR (a.applicant_organisation_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM organisation_user ou
          WHERE ou.organisation_id = a.applicant_organisation_id
            AND ou.user_id = app.current_user_id()
            AND ou.deleted_at IS NULL
        ))
        OR app.has_permission('permohonan.application.view_all')
        OR (a.current_stage_id IS NOT NULL AND app.can_act_on_stage(a.current_stage_id))
      )
  );
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- Configuration tables: readable by any signed-in user, writable only with the
-- permission. An applicant must be able to READ the list of licence types and
-- the documents each one demands — they cannot fill the form otherwise — but
-- must never be able to edit a fee or a validity period.
-- ============================================================================

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'application_types', 'application_type_documents',
    'workflows', 'workflow_stages', 'workflow_transitions'
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
-- Applications — the policy that matters most.
-- ============================================================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications FORCE ROW LEVEL SECURITY;

CREATE POLICY applications_read ON applications FOR SELECT
  USING (app.can_view_application(id));

-- An applicant creates only their own applications. Without the WITH CHECK, a
-- crafted request could file an application in someone else's name.
CREATE POLICY applications_insert ON applications FOR INSERT
  WITH CHECK (applicant_user_id = app.current_user_id());

-- The applicant may edit only while it is still theirs to edit. Once submitted,
-- changes come from the workflow engine acting as an officer — which is the
-- point: an applicant must not be able to alter a submission under review.
CREATE POLICY applications_update_own ON applications FOR UPDATE
  USING (
    (applicant_user_id = app.current_user_id() AND status IN ('draft', 'returned'))
    OR app.has_permission('permohonan.application.manage')
    OR (current_stage_id IS NOT NULL AND app.can_act_on_stage(current_stage_id))
  )
  WITH CHECK (
    (applicant_user_id = app.current_user_id() AND status IN ('draft', 'returned', 'submitted', 'cancelled'))
    OR app.has_permission('permohonan.application.manage')
    OR (current_stage_id IS NOT NULL AND app.can_act_on_stage(current_stage_id))
  );

-- No DELETE policy anywhere in this file. G2: applications are soft-deleted.

-- ============================================================================
-- Supporting documents inherit their application's visibility.
--
-- This is the leak that would matter: these rows point at uploaded files
-- containing IC numbers, company registrations and signed undertakings.
-- ============================================================================

ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents FORCE ROW LEVEL SECURITY;

CREATE POLICY application_documents_read ON application_documents FOR SELECT
  USING (app.can_view_application(application_id));

CREATE POLICY application_documents_insert ON application_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_id
        AND a.applicant_user_id = app.current_user_id()
        AND a.status IN ('draft', 'returned')
    )
    OR app.has_permission('permohonan.application.manage')
  );

-- ============================================================================
-- Stage logs — append-only, like the audit trail and for the same reason.
--
-- No UPDATE and no DELETE policy. This table is the application's history and
-- the evidence behind X-R02; a history the application can rewrite is not
-- evidence of anything.
-- ============================================================================

ALTER TABLE application_stage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_stage_logs FORCE ROW LEVEL SECURITY;

CREATE POLICY application_stage_logs_read ON application_stage_logs FOR SELECT
  USING (app.can_view_application(application_id));

CREATE POLICY application_stage_logs_append ON application_stage_logs FOR INSERT
  WITH CHECK (
    app.can_act_on_stage(workflow_stage_id)
    OR app.has_permission('permohonan.application.manage')
  );

-- ============================================================================
-- Licences.
--
-- M3-R04 requires a public register of valid licence holders, and X-R12 needs
-- the QR page to resolve anonymously. Both are satisfied by disclosing only
-- what the licence itself already states in public — never the application
-- behind it, and never the holder's IC or address.
-- ============================================================================

ALTER TABLE licences ENABLE ROW LEVEL SECURITY;
ALTER TABLE licences FORCE ROW LEVEL SECURITY;

CREATE POLICY licences_read ON licences FOR SELECT
  USING (
    holder_user_id = app.current_user_id()
    OR (holder_organisation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM organisation_user ou
      WHERE ou.organisation_id = licences.holder_organisation_id
        AND ou.user_id = app.current_user_id()
        AND ou.deleted_at IS NULL
    ))
    OR app.has_permission('permohonan.licence.view_all')
  );

-- Anonymous access, restricted to live licences. A scan of a revoked or expired
-- licence reveals nothing rather than confirming it once existed.
CREATE POLICY licences_public_register ON licences FOR SELECT
  USING (
    app.current_user_id() IS NULL
    AND status = 'active'
    AND revoked_at IS NULL
    AND deleted_at IS NULL
  );

CREATE POLICY licences_write ON licences FOR ALL
  USING (app.has_permission('permohonan.licence.manage'))
  WITH CHECK (app.has_permission('permohonan.licence.manage'));

ALTER TABLE licence_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE licence_renewals FORCE ROW LEVEL SECURITY;

CREATE POLICY licence_renewals_read ON licence_renewals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM licences l
      WHERE l.id = licence_id AND l.holder_user_id = app.current_user_id()
    )
    OR app.has_permission('permohonan.licence.view_all')
  );

CREATE POLICY licence_renewals_write ON licence_renewals FOR ALL
  USING (app.has_permission('permohonan.licence.manage'))
  WITH CHECK (app.has_permission('permohonan.licence.manage'));
