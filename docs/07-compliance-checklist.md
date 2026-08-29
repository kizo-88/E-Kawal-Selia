# 07 — LPKmn Mandatory Features Compliance Checklist

**This is a payment gate.** The Garis Panduan (slide 5) requires the vendor to submit this checklist
with evidence per item — screenshots, code excerpts, process descriptions or written statements — and
to demonstrate any item live on request.

**Evidence location:** `docs/evidence/<GP-ID>/`  
**Status:** ☐ not started · ◐ in progress · ☑ done and evidenced · ⊗ Phase 2  

---

## The 23 features

| ID | Feature | Phase | Where it lives | Evidence File & Reference | Status |
|---|---|---|---|---|---|
| **GP-01** | Pengurusan Tahap Pengguna (Roles) | P1 | `F3` · `roles`, `permissions` | `docs/evidence/GP-01/01-roles-management.png`, `notes.md` | ☑ |
| **GP-02** | Tahap Pengguna (Level of Access) | P1 | `F3` · 5 seeded levels + custom | `docs/evidence/GP-02/01-access-levels.png`, `notes.md` | ☑ |
| **GP-03** | Pengurusan Log-in & Keselamatan Kata Laluan | P1 | `I1`, `I2` | `docs/evidence/GP-03/01-login-mfa-security.png`, bcrypt cost 12 DB proof | ☑ |
| **GP-04** | Pendaftaran Pengguna & Syarikat | P1 | `I3` | `docs/evidence/GP-04/01-user-registration.png`, `notes.md` | ☑ |
| **GP-05** | Pengurusan Profail Pengguna | P1 | `I4` | `docs/evidence/GP-05/01-user-profile.png`, `notes.md` | ☑ |
| **GP-06** | Pengesahan Aku-Janji (Undertaking) | P1 | `I4` · `undertaking_versions` | `docs/evidence/GP-06/01-akujanji-undertaking.png`, `notes.md` | ☑ |
| **GP-07** | Informasi Asas LPKmn | P1 | `F2` · `settings` | `docs/evidence/GP-07/01-basic-info-settings.png`, `notes.md` | ☑ |
| **GP-08** | Informasi Paparan Sistem/Portal | P1 | `F2` · `settings` | `docs/evidence/GP-08/01-org-portal-info.png`, `notes.md` | ☑ |
| **GP-09** | Drop-Down List (Lookup Registry) | P1 | `F2` · `lookup_types`/`lookup_values` | `docs/evidence/GP-09/01-lookup-dropdowns.png`, `notes.md` | ☑ |
| **GP-10** | Setting & Template Emel/SMS | P1 (email) · SMS ⊗ | `F8` · `notification_templates` | `docs/evidence/GP-10/01-notification-templates.png`, Phase 2 Statement | ☑ |
| **GP-11** | Muat-Naik & Turun Fail (Magic Bytes) | P1 | `F9` · `file_policies` | `docs/evidence/GP-11/01-file-upload-policy.png`, `notes.md` | ☑ |
| **GP-12** | Paparan Senarai Universal & Eksport | P1 | `F6` universal list | `docs/evidence/GP-12/01-universal-list-export.png`, `notes.md` | ☑ |
| **GP-13** | Paparan Cetakan & Penjana PDF Rasmi | P1 | `F7` document engine | `docs/evidence/GP-13/01-licence-certificate-print.png`, `src/lib/documents/pdf.ts` | ☑ |
| **GP-14** | Grafik & Visualisasi Histogram | P1 | `F6` + `M3-1` | `docs/evidence/GP-14/01-histogram-graphics.png`, `notes.md` | ☑ |
| **GP-15** | Papan Pemuka Pentadbir (Dashboard) | P1 | `M3-1` | `docs/evidence/GP-15/01-admin-dashboard.png`, `notes.md` | ☑ |
| **GP-16** | Pemberitahuan / Notification Engine | P1 (in-app + email) | `F8` | `docs/evidence/GP-16/01-notification-bus.png`, Phase 2 Statement | ☑ |
| **GP-17** | Berita / Pengumuman / Pekeliling / FAQ | P1 | `M4-2` · `content_posts` | `docs/evidence/GP-17/01-circulars-announcements.png`, `notes.md` | ☑ |
| **GP-18** | Jejak Audit Sistem (Audit Trail) | P1 | `F5` | `docs/evidence/GP-18/01-audit-trail-retention.png`, `notes.md` | ☑ |
| **GP-19** | Key Performance Index (KPI) | ⊗ P2 | `kpi_definitions` schema | `docs/evidence/GP-19/01-kpi-sla-tracking.png`, Phase 2 Statement | ⊗ |
| **GP-20** | Borang Change Request | P1 | `change_requests` | `docs/evidence/GP-20/01-change-request-flow.png`, `notes.md` | ☑ |
| **GP-21** | Laman Front-Page & Log-in Rasmi | P1 | `P1` | `docs/evidence/GP-21/01-front-page-portal.png`, Pelabuhan Kemaman logo | ☑ |
| **GP-22** | Antaramuka Pengguna & Responsif 375px | P1 | `P2` | `docs/evidence/GP-22/01-responsive-375px-ui.png`, `lighthouse-report.md` | ☑ |
| **GP-23** | Lain-Lain Piawaian Keselamatan | P1 | `P3` | `docs/evidence/GP-23/01-security-policy-headers.png`, HSTS headers | ☑ |

---

## Phase 2 Written Statements

Three items are delivered in accordance with the phased schedule:

| ID | Feature | Written Statement & Scope Summary |
|---|---|---|
| **GP-10** | SMS Quota Display | Email template engine fully live in Phase 1; SMS quota gateway interface scheduled for Phase 2. |
| **GP-16** | Multi-channel Delivery | In-App notifications and transactional email bus live in Phase 1; SMS/WhatsApp/Telegram telco adapters scheduled for Phase 2. |
| **GP-19** | KPI Module | Workflow stage SLA capture foundation (`sla_due_at`, `sla_met`, `sla_days`) live in Phase 1; organizational ISO 9001 reporting scheduled for Phase 2. |
