# 04 — Data Model

PostgreSQL 16. Every table has `id` (bigserial), `created_at`, `updated_at`, `deleted_at` (soft
delete, G2) unless noted. Tables carrying user-facing text have paired `_ms` / `_en` columns (G4).

Legend: **P1** built in Phase 1 · **P2** designed now, built later.

---

## 1. Identity and access

### `users` — P1
| Column | Type | Notes |
|---|---|---|
| uuid | uuid | public identifier; never expose `id` |
| name | varchar | |
| email | varchar unique | |
| phone | varchar | |
| ic_no | varchar, nullable, encrypted | individual applicants and malim |
| user_category | enum | `internal` \| `external` |
| password | varchar | bcrypt cost 12 |
| must_change_password | boolean | GP-03 first-login change |
| mfa_secret | text, encrypted, nullable | |
| mfa_enabled_at | timestamp, nullable | GP-03, M5-R05 |
| failed_attempts | smallint default 0 | GP-03 lockout |
| locked_until | timestamp, nullable | |
| status | enum | `pending` \| `active` \| `inactive` \| `archived` (GP-02) |
| email_verified_at | timestamp, nullable | GP-04 verify chain |
| profile_photo_path | varchar, nullable | GP-05 |
| last_login_at | timestamp, nullable | |
| preferred_locale | char(2) default 'ms' | X-R06 |

### `organisations` — P1 · M5-R01
Companies, consortiums and individual-as-entity records.

`type` (lookup `JENIS_ORGANISASI`: syarikat / konsortium / individu / pengguna_pelabuhan) ·
`name` · `registration_no` · `address_line1` · `address_line2` · `postcode` · `city` · `state_code`
(lookup `NEGERI`) · `country_code` · `phone` · `email` · `website` · `status` · `verified_at` ·
`verified_by`

> GP-08 requires address stored as **separate fields**, not one blob. Same rule applies here.

### `organisation_user` — P1 · M5-R01
Links wakil syarikat to their company. `organisation_id` · `user_id` · `role_in_org` ·
`is_primary_contact` · `verified_at` · `verified_by`

### `internal_units` — P1 · M5-R02
`code` · `name_ms` · `name_en` · `parent_id` · `active`.
Seeded: Pengurus Besar, Ketua Bahagian, Unit Marin & Trafik, Unit Keselamatan, Unit Teknikal,
Unit IT, Unit Integriti.

### `user_internal_unit` — P1
`user_id` · `internal_unit_id` · `position` · `is_head`

### `roles`, `permissions`, `role_has_permissions`, `model_has_roles` — P1 · GP-01, GP-02
From `spatie/laravel-permission`, extended on `roles` with:
`name_ms` · `name_en` · `description` · `is_system` (blocks deletion of the 5 baseline levels) ·
`active` · `sort_order`

### `menu_items` / `menu_item_role` — P1 · GP-01
`parent_id` · `code` · `label_ms` · `label_en` · `route` · `icon` · `sort_order` · `active`.
The join table controls visibility per role independently of the underlying permission.

### `undertaking_versions` / `user_undertakings` — P1 · GP-06
Versions hold `version` · `title_ms/_en` · `body_ms/_en` · `template_path` · `effective_from` ·
`active`. Acceptances hold `user_id` · `undertaking_version_id` · `accepted_at` · `ip_address` ·
`user_agent`. Never updated — a new acceptance is a new row.

---

## 2. Configuration

### `settings` — P1 · GP-07, GP-08
`key` unique · `value` text · `type` (string/int/bool/json/file) · `group` · `label_ms` · `label_en`
· `description` · `is_public`

Seeded groups: `system` (name, acronym, logo, theme, banner, Go-Live year), `organisation` (LPKmn
name, secretariat, address fields, coordinates, email, phone, website, social links), `format` (date,
time, currency, default locale), `security` (session_timeout_minutes=10, lockout_threshold=3,
password_min_length=12, hash_algo), `audit` (retention_days), `notification` (email on/off).

### `lookup_types` / `lookup_values` — P1 · GP-09
Types: `code` unique · `name_ms` · `name_en` · `description` · `is_system` · `allow_user_request`
Values: `lookup_type_id` · `code` · `label_ms` · `label_en` · `sort_order` · `active` ·
`metadata` jsonb · `created_via` (`seed` \| `admin` \| `change_request`)

Seeded types include `NEGERI`, `KATEGORI_PENGGUNA`, `JENIS_ORGANISASI`, `JENIS_KAPAL`,
`JENIS_AKTIVITI_PELABUHAN`, `KATEGORI_DOKUMEN_RUJUKAN`, `SEBAB_PEMBATALAN`.

`allow_user_request = true` is what lets an ordinary user request an addition, which routes through
the Change Request Form (GP-20).

### `file_policies` — P1 · GP-11
`context_code` (e.g. `PERMOHONAN_SOKONGAN`, `PROFIL_GAMBAR`) · `allowed_extensions` jsonb ·
`allowed_mimes` jsonb · `max_size_kb` · `max_files` · `active`.
GP-11 requires **at least 3 allowed formats** per context and all of it editable by admin.

---

## 3. Audit — GP-18, X-R01, X-R02

### `audit_logs` — P1
No `deleted_at`; purged by retention job only.

| Column | Notes |
|---|---|
| user_id, user_name_snapshot, user_role_snapshot | snapshot survives user deletion (G2) |
| action_code | `PERMOHONAN_DILULUSKAN`, not `update` |
| action_label_ms / action_label_en | full human sentence (G3) |
| auditable_type, auditable_id | |
| reference_no | e.g. `LPK/LPS/2026/00123` |
| workflow_stage_code | |
| module_code, page_code | GP-18 requires page/section |
| ip_address, user_agent | |
| old_values, new_values | jsonb |
| created_at | indexed, partitioned by month |

Index on `(created_at, module_code)` and `(auditable_type, auditable_id)`.

### `audit_purge_runs` — P1
`purged_before` · `rows_deleted` · `triggered_by` (`manual` \| `schedule`) · `user_id` · `run_at`.
The purge itself is audited — GP-18 gives admins a flush button, so the flush must leave a trace.

---

## 4. Notification — GP-10, GP-16, X-R03, X-R04

### `notification_templates` — P1
`code` unique · `channel` (`inapp` \| `email` \| `sms`) · `category` (`pendaftaran` \| `permohonan` \|
`semakan` \| `kelulusan` \| `pemberitahuan`) · `subject_ms/_en` · `body_ms/_en` · `variables` jsonb ·
`active`

### `notification_messages` — P1
`user_id` · `template_code` · `channel` · `title` · `body` · `data` jsonb · `reference_no` ·
`read_at` · `sent_at` · `status` (`queued`/`sent`/`failed`) · `error`

> Named `notification_messages`, not `notifications`: the latter belongs to Laravel's
> `DatabaseNotification`, which we do not use — we have our own bus (CLAUDE.md §6).

### `notification_preferences` — P1 · GP-16
`user_id` (nullable → role-level default) · `role_id` (nullable) · `category` · `channel` ·
`enabled`. GP-16 requires per-user **and** per-role control plus broadcast.

### `notification_broadcasts` — P1 · GP-16
`title_ms/_en` · `body_ms/_en` · `target_roles` jsonb · `target_units` jsonb · `channels` jsonb ·
`scheduled_at` · `sent_at` · `created_by`

---

## 5. Documents — GP-13, M1-3, X-R11, X-R12

### `document_templates` — P1
`code` unique · `name_ms/_en` · `type` (`lesen` \| `permit` \| `surat` \| `borang` \| `laporan`) ·
`header_html` · `body_html` · `footer_html` · `paper_size` · `orientation` · `disclaimer_ms/_en` ·
`version` · `active` · `min_access_level` (GP-13 confidentiality filtering)

### `generated_documents` — P1
`template_code` · `template_version` · `documentable_type` · `documentable_id` · `reference_no` ·
`file_path` · **`qr_token` char(32) unique** · `valid_from` · `valid_until` · `generated_by` ·
`generated_at` · `revoked_at` · `revoke_reason`

`qr_token` is random, not derived from anything. `/semak/{qr_token}` is public and returns only
licence number, type, holder name, validity dates and status (X-R12).

---

## 6. Applications — M1 (the core)

### `application_types` — P1 · X-R09, X-R10
This table is why a new licence type is configuration, not code.

| Column | Notes |
|---|---|
| code | `LESEN_SOKONGAN`, `PERMIT_AKTIVITI`, `SURAT_PDA2`, `LESEN_MALIM` (P2), `SIJIL_KECUALI_MALIM` (P2) |
| name_ms / name_en | |
| category | `lesen` \| `permit` \| `surat` |
| reference_prefix | `LPS`, `PAP`, `PDA2` |
| form_schema | jsonb — the stepper definition: steps, fields, validation, conditional logic |
| workflow_id | FK |
| document_template_code | what gets generated on approval |
| fee_amount, requires_payment | fee is P1 data; collection is P2 (X-R05) |
| validity_months | drives `valid_until` and the Expiring Soon badge (M1-R12) |
| applicant_categories | jsonb — which user categories may apply |
| active, effective_from, effective_to | X-R10 activate/deactivate |

### `application_type_documents` — P1 · M1-R04
`application_type_id` · `code` · `label_ms/_en` · `required` · `file_policy_id` · `sort_order`

### `applications` — P1
| Column | Notes |
|---|---|
| uuid, reference_no | `LPK/{prefix}/{year}/{seq}` (M1-R05) |
| application_type_id | |
| applicant_user_id, applicant_organisation_id | |
| status | `draft` `submitted` `in_review` `returned` `approved` `rejected` `cancelled` `frozen` `expired` (M1-R10, M1-R12) |
| current_stage_id | FK `workflow_stages` |
| form_data | jsonb, shaped by `form_schema` |
| last_completed_step | M1-R03 draft resume |
| submitted_at, decided_at, decision, decision_remarks | |
| valid_from, valid_until | |
| cancelled_at, cancelled_by, cancel_reason | M1-R09 |
| frozen_at, frozen_by, freeze_reason | M1-R10 |
| location_description, location_lat, location_lng | P1 stores it; PostGIS validation is P2 (X-R07) |

Index `(status, application_type_id)`, `(applicant_user_id)`, `reference_no` unique.

### `application_documents` — P1
`application_id` · `requirement_code` · `file_path` · `original_name` · `mime` · `size_kb` ·
`uploaded_by` · `uploaded_at` · `replaced_by_id`

---

## 7. Workflow — M1-2

### `workflows` — P1
`code` · `name_ms/_en` · `application_type_id` · `version` · `active`

### `workflow_stages` — P1
`workflow_id` · `sequence` · `code` · `name_ms/_en` · `actor_role_id` · `actor_internal_unit_id` ·
`action_type` (`review` \| `evaluate` \| `approve` \| `committee` \| `notify`) · `sla_days` ·
`allow_return` · `allow_amend` · `min_approvals` (Pengecualian Malim needs 2 — M1-R21) ·
`is_final` · `on_approve_status` · `on_reject_status`

### `workflow_transitions` — P1
`from_stage_id` · `to_stage_id` · `action` (`approve` \| `reject` \| `return` \| `refer`) ·
`condition` jsonb

### `application_stage_logs` — P1
`application_id` · `workflow_stage_id` · `actor_user_id` · `actor_name_snapshot` · `action` ·
`remarks` · `attachments` jsonb · `acted_at` · `sla_due_at` · `sla_met` boolean

> The `sla_due_at` / `sla_met` columns exist in Phase 1 even though the KPI module (GP-19) is Phase 2.
> Without them, Phase 2 starts with no history to report on.

---

## 8. Licences issued — M1-R11, M3-R04

### `licences` — P1
`application_id` · `licence_no` · `application_type_id` · `holder_user_id` ·
`holder_organisation_id` · `status` (`active` \| `expiring` \| `expired` \| `suspended` \| `revoked`)
· `issued_at` · `valid_from` · `valid_until` · `generated_document_id` · `suspended_at` ·
`revoked_at` · `reason`

### `licence_renewals` — P2 · M1-R19
`licence_id` · `renewal_application_id` · `previous_valid_until` · `new_valid_until`

---

## 9. Reference repository — M4

### `reference_categories` — P1
`code` · `name_ms/_en` · `sort_order` · `active`.
Seeded: Pekeliling Pelabuhan, Akta Lembaga Pelabuhan, UUK, Kadar Fi, ISPS Code, MARPOL,
Green Port Policy.

### `reference_documents` — P1 · M4-R01..R10
`category_id` · `title_ms/_en` · `description_ms/_en` · `file_path` · `external_url` · `version` ·
`effective_from` · `published_at` · `published_by` · `active` · `download_count`

### `content_posts` — P1 · GP-17
`type` (`berita` \| `pengumuman` \| `pekeliling` \| `helpdesk` \| `polisi` \| `faq`) ·
`title_ms/_en` · `body_ms/_en` (rich HTML) · `excerpt` · `cover_image_path` · `attachments` jsonb ·
`pinned` · `scroll_display` · `published_at` · `expires_at` · `active`

GP-17 requires **at least 3** of these types live. `scroll_display` drives the scrolling ticker.

---

## 10. Change Request Form — GP-20

### `change_requests` — P1
`requested_by` · `target_type` (`lookup_value` \| `user_status` \| `application_withdrawal` \|
`other`) · `target_lookup_type_id` · `proposed_payload` jsonb · `justification` ·
`status` (`submitted` \| `under_review` \| `amended` \| `approved` \| `rejected`) ·
`reviewed_by` · `reviewer_remarks` · `amended_payload` jsonb · `decided_at` · `applied_at`

On approval the payload is written straight into the live reference list — that is exactly what
GP-20 asks for. `applied_at` records that it happened; the write itself is audited.

---

## 11. Analytics — M3, M7, GP-19

### `kpi_definitions` — P2 (schema P1)
`code` · `name_ms/_en` · `module_code` · `workflow_stage_id` · `measure_unit`
(`minutes`/`hours`/`days`) · `target_value` · `standard_ref` (`ISMS`/`ISO9001`/`ABMS`/`UNIT`) ·
`notes` · `active` · `created_by` · `updated_by`

GP-19 explicitly requires created/modified timestamps **and** created-by/modified-by, for tracing.

### `kpi_measurements` — P2
`kpi_definition_id` · `application_id` · `measured_value` · `period_start` · `period_end` · `met`

### `statistic_thresholds` — P2 · M7-R01
`code` · `name_ms/_en` · `value` · `unit` · `visible_to_role_id` · `active`

---

## 12. Phase 2 tables — designed, not built

Listed so nobody redesigns the core when these arrive.

| Module | Tables |
|---|---|
| M2 Kawal Selia | `inspection_plans`, `inspections`, `inspection_checklist_items`, `inspection_findings`, `corrective_actions`, `corrective_action_updates` |
| M6 Aset | `assets`, `asset_categories`, `asset_loans`, `maintenance_plans`, `maintenance_records` |
| X-R05 Payment | `payments`, `payment_transactions`, `payment_receipts` |
| X-R07 GIS | `geo_boundaries` (PostGIS `geometry(Polygon,4326)`), types Port Limit and MRA Area |
| M1-R18..R22 Pemaliman | reuses `applications` + `application_types`; adds `pilot_licences`, `exemption_certificates`, `committee_sessions` |

---

## 13. Conventions

1. **Snapshots over joins for history.** Any table recording a past event stores the actor's name and
   role as text alongside the FK. Soft-deleting a user must not blank out last year's audit trail.
2. **`jsonb`, never `json`.** Indexable.
3. **No enum columns in PostgreSQL.** Use `varchar` + a PHP enum for behavioural states, or a lookup
   table for business lists. Altering a PG enum requires a migration; LPKmn will want changes.
4. **`uuid` for anything a URL exposes.** Never leak sequential `id`.
5. **Encrypt `ic_no` and `mfa_secret` at rest.**
6. **Every FK has an index.** Filament generates queries that will find the ones you skipped.
