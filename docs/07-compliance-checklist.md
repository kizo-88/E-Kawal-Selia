# 07 — LPKmn Mandatory Features Compliance Checklist

**This is a payment gate.** The Garis Panduan (slide 5) requires the vendor to submit this checklist
with evidence per item — screenshots, code excerpts, process descriptions or written statements — and
to demonstrate any item live on request.

Fill it as you build. Reconstructing it at the end costs ~15 PD under UAT pressure.

**Evidence location:** `docs/evidence/<GP-ID>/`
**Status:** ☐ not started · ◐ in progress · ☑ done and evidenced · ⊗ Phase 2

---

## How to evidence an item

1. Screenshot showing the feature working, saved as `docs/evidence/GP-XX/01-<description>.png`
2. Where the requirement is about *configurability*, screenshot the admin screen **and** the result
   of changing it. GP-09 is not evidenced by showing a dropdown; it is evidenced by showing an admin
   adding a value and it appearing in the form.
3. Where the requirement is about *code* (no hard-coding, no plaintext passwords), attach the file
   path and line reference in `notes.md` inside the evidence folder.
4. Anything Phase 2 gets a written statement referencing the phased implementation schedule.

---

## The 23 features

| ID | Feature | Phase | Where it lives | Evidence needed | Status |
|---|---|---|---|---|---|
| **GP-01** | Pengurusan Tahap Pengguna (Roles) | P1 | `F3` · `roles`, `permissions`, `menu_item_role` | Admin creates a new role, assigns menu + function access, role appears and restricts correctly. Show **no hard-coded roles** in code. | ☐ |
| **GP-02** | Tahap Pengguna (Level of Access) | P1 | `F3` · 5 seeded levels + unlimited custom | All 5 baseline levels exist. Create, update, activate, deactivate, delete, archive a level. **Delete a level and show historical applications still render.** | ☐ |
| **GP-03** | Pengurusan Log-in | P1 | `I1`, `I2` | bcrypt hash in DB (show the column), session timeout at 10 min from settings, lockout after 3 failures, 12-char minimum, MFA prompt, forced change on first login | ☐ |
| **GP-04** | Pendaftaran Pengguna | P1 | `I3` | Self-registration, duplicate-account rejection, welcome → verify → finish emails, CAPTCHA, admin create/activate/deactivate | ☐ |
| **GP-05** | Pengurusan Profail Pengguna | P1 | `I4` | Profile with name, email, phone, address, password change, photo upload, access level shown; print view of details + undertaking | ☐ |
| **GP-06** | Pengesahan Aku-Janji | P1 | `I4` · `undertaking_versions` | Acceptance at final registration step, downloadable official template, displayed on internal and external profiles | ☐ |
| **GP-07** | Informasi Asas LPKmn | P1 | `F2` · `settings` | Change logo, system name, theme, banner (and switch banner off), date/time/currency/language format — all from admin, all taking effect | ☐ |
| **GP-08** | Informasi Paparan Sistem/Portal | P1 | `F2` · `settings` | Org name, secretariat, **address in separate fields**, coordinates, logo, email, phone, website, social links; show them rendering in Contact Us and the footer | ☐ |
| **GP-09** | Drop-Down List | P1 | `F2` · `lookup_types`/`lookup_values` | Admin adds, edits and deactivates a dropdown value; it appears/disappears in the form. Settings location screenshot. **Code excerpt proving no hard-coded arrays.** | ☐ |
| **GP-10** | Setting & Template Emel/SMS | P1 (email) · SMS ⊗ | `F8` · `notification_templates` | Email config visible and settable, send toggle, all templates editable and previewable, categorised by workflow. SMS quota display → Phase 2 statement. | ☐ |
| **GP-11** | Muat-Naik & Turun Fail | P1 | `F9` · `file_policies` | Per-context size limit and default, **≥3 allowed formats**, admin changes allowed types and it takes effect, oversized/wrong-type upload rejected | ☐ |
| **GP-12** | Paparan Senarai | P1 | `F6` universal list | Sortable columns with configurable default, ASC/DESC on click, keyword search, filter by year / date range / quarter, download reflecting the **current filtered view**, export Excel + Word + PDF | ☐ |
| **GP-13** | Paparan Cetakan | P1 | `F7` document engine | Print button, tidy output with title + logo, disclaimer text, LPKmn letterhead template used as base, output differs by user access level | ☐ |
| **GP-14** | Grafik | P1 | `F6` + `M3-1` | Same report as list, table **and** histogram; export Excel, Word, PDF, PNG, JPG; iFrame URL loading in an external page | ☐ |
| **GP-15** | Dashboard | P1 | `M3-1` | Text + graphical summary, quick links, info varying by access level, application lists, table stats, histogram, work notifications, login summary, icons | ☐ |
| **GP-16** | Pemberitahuan / Notification | P1 (in-app + email) | `F8` | In-app notification after login, email notification, per-user toggle, per-role toggle, broadcast. **Note:** GP-16 asks for min 2 optional channels — Phase 1 delivers email; SMS/WhatsApp/Telegram are in the phased schedule. **Flag this to the boss before submission.** | ☐ |
| **GP-17** | Berita / Pengumuman / Pekeliling / Helpdesk / Polisi / FAQ | P1 | `M4-2` · `content_posts` | **At least 3 types live.** Rich editor with image upload, document upload, coloured/highlighted text, simple table. Scrolling display. Icons and colour. | ☐ |
| **GP-18** | Jejak Audit | P1 | `F5` | Audit list showing **human-readable** entries with application ID, user ID, workflow stage, page, timestamp. Search/sort/export like any list. Flush button. Retention period setting. | ☐ |
| **GP-19** | Key Performance Index (KPI) | ⊗ P2 | `kpi_definitions` schema exists | Written statement + phased schedule reference. Show `sla_days` and `sla_met` already captured in `application_stage_logs` as the foundation. | ⊗ |
| **GP-20** | Change Request Form | P1 | `change_requests` | User submits a request to add a dropdown value → admin reviews → admin amends → admin approves → **value appears in the live list**. Full cycle screenshotted. | ☐ |
| **GP-21** | Laman Front-Page / Log-in | P1 | `P1` | Introduction, LPKmn logo, system logo, full name, acronym, login form, forgot password, register link, news/FAQ panel, footer, background image | ☐ |
| **GP-22** | User-Friendly Interface | P1 | `P2` | Readable fonts, clean CSS, **responsive at 375px** (device screenshot), contrasting menus, correct BM. **Lighthouse/GTmetrix report** proving load speed. Help notes on every critical page. | ☐ |
| **GP-23** | Lain-Lain | P1 | `P3` | Privacy & security policy page, footer with copyright + Go-Live year, HTTPS enforced (show cert + HSTS header), no plaintext passwords (DB screenshot), online manual link, API surface for integration readiness | ☐ |

---

## Phase 2 items — written statement required

Three items cannot be fully evidenced in Phase 1. Each needs a written statement referencing the
phased implementation schedule, prepared by the boss and submitted with the checklist:

| ID | Gap | Statement to prepare |
|---|---|---|
| GP-10 | SMS quota and usage display | SMS channel is in Phase 2; email templates fully delivered in Phase 1 |
| GP-16 | Only 1 of the required 2+ optional channels delivered | Email delivered; SMS/WhatsApp/Telegram in Phase 2 |
| GP-19 | KPI module | Data foundation (SLA capture per workflow stage) delivered in Phase 1; reporting and ISMS/ISO 9001/ABMS mapping in Phase 2, pending LPKmn supplying the KPI standards |

> ⚠️ **GP-16 is the one to watch.** The Garis Panduan states a *minimum* of two optional channels
> plus the mandatory in-app channel. Phase 1 delivers one. Adding SMS is roughly 3 PD and would close
> the gap — **discuss with the boss whether to pull it into Phase 1** rather than argue it at
> evaluation. Cheap insurance on a compliance-scored tender.

---

## Contractual reminders

From the Garis Panduan, slides 3–5:

1. **Nothing on this list may be claimed as a change request.** If LPKmn asks for any of it, it is
   already priced in. Check here before telling the boss something is extra.
2. **Evidence must accompany the checklist** — screenshots, code excerpts, process descriptions.
3. **Be ready to demonstrate live** in the system under development, on request.
4. **Compliance is measured for payment and completion milestones.**
5. LPKmn will consider vendor objections where a feature is technically constrained, obsolete or
   unreasonable — **but the final decision is theirs.** Raise objections early and in writing,
   never at UAT.

## Missing input

The Garis Panduan references an **LPKmn checklist template** (slide 5). It is not in the tender
folder. Request it from Unit IT — see `02-requirements.md` Q5. Until it arrives, this file is our
format, which the Garis Panduan explicitly permits.
