-- Fixtures for the G5 / RLS verification. Fake data only.
--
-- The scenario is the one RULES.md names: an officer from Unit Keselamatan must
-- not see Unit M/T's applications by editing a URL.

BEGIN;

-- ── units
INSERT INTO internal_units (code, name_ms, name_en, sort_order, active, created_at, updated_at)
VALUES ('MT', 'Unit Marin & Trafik', 'Marine & Traffic Unit', 1, true, now(), now()),
       ('KESELAMATAN', 'Unit Keselamatan', 'Security Unit', 2, true, now(), now());

-- ── permissions
INSERT INTO permissions (code, name_ms, name_en, "group", created_at, updated_at) VALUES
  ('permohonan.application.view_all', 'Lihat Semua Permohonan', 'View All Applications', 'permohonan', now(), now()),
  ('permohonan.application.manage',   'Urus Permohonan',        'Manage Applications',   'permohonan', now(), now()),
  ('permohonan.licence.view_all',     'Lihat Semua Lesen',      'View All Licences',     'permohonan', now(), now());

-- ── roles. Neither officer role holds view_all: each must see only its own
--    unit's work, which is the whole point of the test.
INSERT INTO roles (code, name_ms, name_en, is_system, active, sort_order, created_at, updated_at) VALUES
  ('PEGAWAI_MT',          'Pegawai Unit M/T',        'M/T Officer',       false, true, 1, now(), now()),
  ('PEGAWAI_KESELAMATAN', 'Pegawai Unit Keselamatan','Security Officer',  false, true, 2, now(), now()),
  ('PEMOHON',             'Pemohon',                 'Applicant',         false, true, 3, now(), now()),
  ('ADMIN_PENUH',         'Admin Penuh',             'Full Admin',        false, true, 4, now(), now());

INSERT INTO role_permission (role_id, permission_id, created_at)
SELECT r.id, p.id, now() FROM roles r, permissions p
WHERE r.code = 'ADMIN_PENUH' AND p.code IN ('permohonan.application.view_all', 'permohonan.application.manage');

-- ── users
INSERT INTO users (uuid, name, email, user_category, status, must_change_password, failed_attempts, preferred_locale, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Officer MT',        'mt@lpkmn.test',       'internal', 'active', false, 0, 'ms', now(), now()),
  (gen_random_uuid(), 'Officer Keselamatan','sec@lpkmn.test',     'internal', 'active', false, 0, 'ms', now(), now()),
  (gen_random_uuid(), 'Applicant A',       'a@syarikat.test',     'external', 'active', false, 0, 'ms', now(), now()),
  (gen_random_uuid(), 'Applicant B',       'b@syarikat.test',     'external', 'active', false, 0, 'ms', now(), now()),
  (gen_random_uuid(), 'Colleague of A',    'a2@syarikat.test',    'external', 'active', false, 0, 'ms', now(), now()),
  (gen_random_uuid(), 'Full Admin',        'admin@lpkmn.test',    'internal', 'active', false, 0, 'ms', now(), now());

INSERT INTO user_internal_unit (user_id, internal_unit_id, is_head, created_at)
SELECT u.id, iu.id, false, now() FROM users u, internal_units iu
WHERE (u.email = 'mt@lpkmn.test' AND iu.code = 'MT')
   OR (u.email = 'sec@lpkmn.test' AND iu.code = 'KESELAMATAN');

INSERT INTO user_role (user_id, role_id, created_at)
SELECT u.id, r.id, now() FROM users u, roles r
WHERE (u.email = 'mt@lpkmn.test'    AND r.code = 'PEGAWAI_MT')
   OR (u.email = 'sec@lpkmn.test'   AND r.code = 'PEGAWAI_KESELAMATAN')
   OR (u.email = 'a@syarikat.test'  AND r.code = 'PEMOHON')
   OR (u.email = 'b@syarikat.test'  AND r.code = 'PEMOHON')
   OR (u.email = 'a2@syarikat.test' AND r.code = 'PEMOHON')
   OR (u.email = 'admin@lpkmn.test' AND r.code = 'ADMIN_PENUH');

-- ── an organisation, with Applicant A and their colleague both attached
INSERT INTO organisations (uuid, type, name, status, country_code, created_at, updated_at)
VALUES (gen_random_uuid(), 'SYARIKAT', 'Syarikat Perkapalan A', 'active', 'MY', now(), now());

INSERT INTO organisation_user (organisation_id, user_id, is_primary_contact, created_at, updated_at)
SELECT o.id, u.id, u.email = 'a@syarikat.test', now(), now()
FROM organisations o, users u
WHERE o.name = 'Syarikat Perkapalan A' AND u.email IN ('a@syarikat.test', 'a2@syarikat.test');

-- ── workflow: one stage owned by Unit M/T, one by Unit Keselamatan
INSERT INTO workflows (code, name_ms, name_en, version, active, created_at, updated_at)
VALUES ('WF_TEST', 'Aliran Ujian', 'Test Workflow', 1, true, now(), now());

INSERT INTO workflow_stages (workflow_id, sequence, code, name_ms, name_en, actor_internal_unit_id, action_type, sla_days, allow_return, allow_amend, min_approvals, is_final, created_at, updated_at)
SELECT w.id, 1, 'SEMAKAN_MT', 'Semakan Unit M/T', 'M/T Review', iu.id, 'review', 5, true, false, 1, false, now(), now()
FROM workflows w, internal_units iu WHERE w.code = 'WF_TEST' AND iu.code = 'MT';

INSERT INTO workflow_stages (workflow_id, sequence, code, name_ms, name_en, actor_internal_unit_id, action_type, sla_days, allow_return, allow_amend, min_approvals, is_final, created_at, updated_at)
SELECT w.id, 2, 'SEMAKAN_SEC', 'Semakan Unit Keselamatan', 'Security Review', iu.id, 'review', 5, true, false, 1, true, now(), now()
FROM workflows w, internal_units iu WHERE w.code = 'WF_TEST' AND iu.code = 'KESELAMATAN';

-- ── application type
INSERT INTO application_types (code, name_ms, name_en, category, reference_prefix, form_schema, workflow_id, requires_payment, validity_months, active, created_at, updated_at)
SELECT 'LESEN_SOKONGAN', 'Lesen Perkhidmatan Sokongan', 'Support Services Licence', 'lesen', 'LPS',
       '{"version":1,"steps":[]}'::jsonb, w.id, false, 12, true, now(), now()
FROM workflows w WHERE w.code = 'WF_TEST';

-- ── applications: one parked at the M/T stage, one at the Security stage
INSERT INTO applications (uuid, reference_no, application_type_id, applicant_user_id, applicant_organisation_id, status, current_stage_id, form_data, last_completed_step, submitted_at, created_at, updated_at)
SELECT gen_random_uuid(), 'LPK/LPS/2026/00001', at.id, u.id, o.id, 'in_review', ws.id, '{}'::jsonb, 1, now(), now(), now()
FROM application_types at, users u, organisations o, workflow_stages ws
WHERE at.code = 'LESEN_SOKONGAN' AND u.email = 'a@syarikat.test'
  AND o.name = 'Syarikat Perkapalan A' AND ws.code = 'SEMAKAN_MT';

INSERT INTO applications (uuid, reference_no, application_type_id, applicant_user_id, status, current_stage_id, form_data, last_completed_step, submitted_at, created_at, updated_at)
SELECT gen_random_uuid(), 'LPK/LPS/2026/00002', at.id, u.id, 'in_review', ws.id, '{}'::jsonb, 1, now(), now(), now()
FROM application_types at, users u, workflow_stages ws
WHERE at.code = 'LESEN_SOKONGAN' AND u.email = 'b@syarikat.test' AND ws.code = 'SEMAKAN_SEC';

-- ── a supporting document on the M/T application; this is the row that would
--    leak an IC number or a company registration if the policy were wrong
INSERT INTO application_documents (application_id, requirement_code, file_path, original_name, mime, size_kb, uploaded_by, uploaded_at, created_at, updated_at)
SELECT a.id, 'SSM', '/storage/fake/ssm.pdf', 'ssm.pdf', 'application/pdf', 120, a.applicant_user_id, now(), now(), now()
FROM applications a WHERE a.reference_no = 'LPK/LPS/2026/00001';

-- ── a licence: one active, one revoked. The revoked one must stay invisible to
--    the anonymous QR path.
INSERT INTO licences (uuid, application_id, licence_no, application_type_id, holder_user_id, holder_name_snapshot, status, issued_at, valid_from, valid_until, created_at, updated_at)
SELECT gen_random_uuid(), a.id, 'L/LPK/LPS/2026/00001', a.application_type_id, a.applicant_user_id, 'Syarikat Perkapalan A', 'active', now(), CURRENT_DATE, CURRENT_DATE + 365, now(), now()
FROM applications a WHERE a.reference_no = 'LPK/LPS/2026/00001';

INSERT INTO licences (uuid, application_id, licence_no, application_type_id, holder_user_id, holder_name_snapshot, status, issued_at, valid_from, valid_until, revoked_at, reason, created_at, updated_at)
SELECT gen_random_uuid(), a.id, 'L/LPK/LPS/2026/00002', a.application_type_id, a.applicant_user_id, 'Applicant B', 'revoked', now(), CURRENT_DATE - 30, CURRENT_DATE + 300, now(), 'Test revocation', now(), now()
FROM applications a WHERE a.reference_no = 'LPK/LPS/2026/00002';

COMMIT;
