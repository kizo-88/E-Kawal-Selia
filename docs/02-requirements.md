# 02 — Requirements Register

Every requirement extracted from the two binding tender documents, with a stable ID.
Use these IDs in branch names, commits, tests and the evidence pack.

**Sources**

| Code | Document |
|---|---|
| `KR` | `03 KETERANGAN RINGKAS SISTEM.pdf` — the domain |
| `GP` | `GARIS PANDUAN PEMBANGUNAN SISTEM APLIKASI LPKmn.pptx` — 23 mandatory platform features |

**Phase**: `P1` committed, `P2` quoted separately, `OUT` excluded.

---

## A. Domain modules (source: KR)

### M1 — Modul Permohonan

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M1-R01 | Online application submission for LPKmn services | KR §2.1 | P1 |
| M1-R02 | Multi-step stepper showing the applicant which stage they are at | KR §5.1 | P1 |
| M1-R03 | Save, Next, and Save-as-Draft so applications can be completed in stages | KR §5.1 | P1 |
| M1-R04 | Upload supporting documents | KR §5.1 | P1 |
| M1-R05 | Automatic reference / serial number generation | KR §5.1 | P1 |
| M1-R06 | Review, remarks and approval by authorised officers | KR §5.1 | P1 |
| M1-R07 | Generate licence, permit or support letter once approved | KR §5.1 | P1 |
| M1-R08 | Update application details according to the stage that permits it | KR §5.1 | P1 |
| M1-R09 | Cancellation by applicant or system administrator | KR §5.1 | P1 |
| M1-R10 | Admin status management including Dibekukan and Dibatalkan | KR §5.1 | P1 |
| M1-R11 | View, print and download approved licence/permit by registered users | KR §5.1 | P1 |
| M1-R12 | Status indicators: Approved, In Review, Expiring Soon, Expired | KR §5.1 | P1 |
| M1-R13 | Jenis: Permohonan Lesen Perkhidmatan Sokongan Pelabuhan | KR §5.1 | P1 |
| M1-R14 | Jenis: Permohonan Permit Aktiviti Pelabuhan | KR §5.1 | P1 |
| M1-R15 | Jenis: Permohonan Surat Sokongan PDA2, generated from official LPKmn template | KR §5.5 | P1 |
| M1-R16 | PDA2 support letter delivered to applicant through the system | KR §5.5 | P1 |
| M1-R17 | PDA2 letter record written into DDMS | KR §5.5 | **P2** |
| M1-R18 | Jenis: Permohonan Lesen Malim — new, with Jawatankuasa Pemaliman consideration, fee payment, licence generation with card/certificate print | KR §6.1 | **P2** |
| M1-R19 | Lesen Malim renewal: application, review, fee, regenerated licence | KR §6.1 | **P2** |
| M1-R20 | Jenis: Sijil Pengecualian Malim for OSV, submitted by shipping agent on behalf of the master | KR §6.2 | **P2** |
| M1-R21 | Pengecualian Malim: LPKmn document review, evaluation by Malim KPK twice, decision confirmation, certificate generation | KR §6.2 | **P2** |
| M1-R22 | Database of valid Sijil Pengecualian Malim holders + historical application records | KR §6.2 | **P2** |

### M2 — Modul Kawal Selia / Lawatan Tapak Berkala

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M2-R01 | Planning and scheduling of site inspections | KR §7 | **P2** |
| M2-R02 | Inspection record management | KR §7 | **P2** |
| M2-R03 | Inspection report preparation | KR §7 | **P2** |
| M2-R04 | Corrective action feedback from the supervised party | KR §7 | **P2** |
| M2-R05 | Follow-up status monitoring until confirmed closed | KR §7 | **P2** |
| M2-R06 | Certificate and licence management | KR §2.2 | **P2** |
| M2-R07 | PBB MFSO reporting | KR §2.2 | **P2** |
| M2-R08 | Incident reporting | KR §2.2 | **OUT** — named as future |
| M2-R09 | Bunkering notification within port limit, Section 419B | KR §2.2 | **OUT** — named as future |
| M2-R10 | Licence and permit verification by relevant authorities | KR §2.2 | **OUT** — named as future |

### M3 — Modul Sokongan dan Analitik

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M3-R01 | KPI display and operational reporting | KR §2.3 | **P2** |
| M3-R02 | Statistics and application records | KR §2.3 | P1 (basic) |
| M3-R03 | Trend analysis | KR §2.3 | **P2** |
| M3-R04 | List of valid and current licence holders | KR §2.3 | P1 |

### M4 — Modul Rujukan / Repositori

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M4-R01 | Pekeliling Pelabuhan | KR §8 | P1 |
| M4-R02 | Notis Sistem | KR §8 | P1 |
| M4-R03 | Activity location mapping | KR §8 | **P2** |
| M4-R04 | Akta Lembaga Pelabuhan | KR §8 | P1 |
| M4-R05 | Undang-undang Kecil (UUK) | KR §8 | P1 |
| M4-R06 | Licence and permit fee schedule | KR §8 | P1 |
| M4-R07 | ISPS Code | KR §8 | P1 |
| M4-R08 | MARPOL | KR §8 | P1 |
| M4-R09 | Green Port Policy | KR §8 | P1 |
| M4-R10 | All reference content updatable by system administrator | KR §8 | P1 |

### M5 — Modul Pengguna dan Pendaftaran

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M5-R01 | External user categories: syarikat, wakil syarikat, individu, Konsortium Pelabuhan Kemaman, pengguna pelabuhan | KR §4.1a | P1 |
| M5-R02 | Internal users: Pengurus Besar, Ketua Bahagian, Unit M/T, Unit Keselamatan, Unit Teknikal, Unit IT, Unit Integriti | KR §4.1b | P1 |
| M5-R03 | New user registration | KR §4.2 | P1 |
| M5-R04 | Identity verification via username and password | KR §4.2 | P1 |
| M5-R05 | Multi-Factor Authentication (MFA) | KR §4.2 | P1 |
| M5-R06 | Password meeting the specified security requirements | KR §4.2 | P1 |
| M5-R07 | Registration form fields as specified by LPKmn | KR §4.2 | P1 |
| M5-R08 | User database management | KR §4.2 | P1 |
| M5-R09 | Access control by assigned role | KR §4 | P1 |

### M6 — Modul Aset

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M6-R01 | Safety equipment loan and return | KR §2.6 | **P2** |
| M6-R02 | Concession asset register | KR §2.6 | **P2** |
| M6-R03 | Maintenance work planning | KR §2.6 | **P2** |
| M6-R04 | Maintenance records and reports | KR §2.6 | **P2** |
| M6-R05 | Upgrade or new-build application with review, verification and approval | KR §2.6 | **P2** |

### M7 — Modul Statistik

| ID | Requirement | Source | Phase |
|---|---|---|---|
| M7-R01 | Threshold, corporate unit access only | KR §2.7 | **P2** |
| M7-R02 | General statistics | KR §2.7 | P1 (basic) |

---

## B. Cross-cutting requirements (source: KR §3)

| ID | Requirement | Source | Phase |
|---|---|---|---|
| X-R01 | Audit trail recording every user activity, login records, timestamp, action | KR §3.1 | P1 |
| X-R02 | Audit trail generated as reports for Piagam Pelanggan compliance monitoring, internal audit, and overtime (OT) claim reference | KR §3.1 | P1 |
| X-R03 | Email notification using standard templates | KR §3.2 | P1 |
| X-R04 | In-app notification displayed after login | KR §3.2 | P1 |
| X-R05 | Online payment via payment gateway, FPX, or other method determined by LPKmn | KR §3.3 | **P2** |
| X-R06 | Bilingual interface: Bahasa Melayu and English | KR §3.4 | **P2** (schema ready in P1) |
| X-R07 | Use real geographic boundaries for Port Limit and MRA Area during application | KR §3.5 | **P2** |
| X-R08 | Warn the user when the marked location falls outside the permitted area | KR §3.5 | **P2** |
| X-R09 | Administrator can create new licence or permit types as operational needs change | KR §3.6 | **P2** (data model ready in P1) |
| X-R10 | Administrator can activate or deactivate a licence or permit type | KR §3.6 | P1 |
| X-R11 | Every generated licence or permit carries a QR code | KR §3.7 | P1 |
| X-R12 | QR code links to a verification page accessible to the public without login | KR §3.7 | P1 |

---

## C. Mandatory platform features (source: GP — all 23)

**These may not be classified as change requests.** All are P1 unless marked.

| ID | Feature | GP slide | Phase |
|---|---|---|---|
| GP-01 | Pengurusan Tahap Pengguna (Roles) — configurable value, access limits, mapped to menu, sub-menu, function, admin, documents, links; CRUD any time; no hard-coding | 8 | P1 |
| GP-02 | Tahap Pengguna (Level of Access) — Super Admin, Admin Data, Pengurusan, Reviewer/Approver, End-user; create/update/activate/deactivate/delete/archive; delete must not break history; unlimited levels; no hard-coding | 9 | P1 |
| GP-03 | Pengurusan Log-in — hashed passwords (bcrypt), upgradeable hashing, session timeout 10 min configurable, lockout after 3 failures configurable, min 12 characters (DKICT), MFA, configurable character classes, force change on first login | 11 | P1 |
| GP-04 | Pendaftaran Pengguna — self-registration by email/name/IC, access-level selection, automatic duplicate check, welcome/verify/finish notification chain, admin create/activate/deactivate/review, CAPTCHA or anti-spam or SMS verification | 13 | P1 |
| GP-05 | Pengurusan Profail Pengguna — name, email, phone, address, password change, profile photo upload, access-level display, view and print of details and undertaking | 15 | P1 |
| GP-06 | Pengesahan Aku-Janji — compliance acceptance at final registration step, downloadable official template, displayed on every internal and external profile | 60 | P1 |
| GP-07 | Informasi Asas LPKmn — logo/icon/avatar, system name, theme, banner with off switch, minor function toggles, base formats for time, date, currency, language | 19 | P1 |
| GP-08 | Informasi Paparan Sistem/Portal — org and branch name, secretariat, address as separate fields, coordinates, logo, email, phone, website, social links; feeds Contact Us and footer | 20 | P1 |
| GP-09 | Drop-Down List — admin add/remove/update every dropdown, placed under settings/configuration, hard-coding forbidden | 53 | P1 |
| GP-10 | Setting & Template Emel/SMS — SMS quota and usage display, email config viewable and settable, send toggle, all templates editable and previewable, categorised by workflow | 26 | P1 (email); SMS **P2** |
| GP-11 | Muat-Naik & Turun Fail — per-type size limits with defaults, minimum 3 allowed formats, types configurable by LPKmn any time | 29 | P1 |
| GP-12 | Paparan Senarai — CRUD + activate/deactivate, user-requested additions with admin approval, configurable default sort with ASC/DESC, search on every list, multi-search by year / date range / quarter / keyword, download reflecting current view, export to Excel/Word/PDF and image for charts | 32, 33 | P1 |
| GP-13 | Paparan Cetakan — print button, tidy complete format, titled with logo or stamp, disclaimer statement, templates per LPKmn requirement, existing LPKmn templates usable as base, filtered by confidentiality and user level | 36 | P1 |
| GP-14 | Grafik — every statistical report available as list, table and graph/histogram; export to Excel, Word, PDF, PNG, JPG, Icon; iFrame URL for embedding into the LPKmn public website | 38 | P1 |
| GP-15 | Dashboard — text and graphical summary, quick links, user/system info by access level, application and declaration lists, table statistics, histograms, work notifications, login summary; icons and histograms prioritised | 42 | P1 |
| GP-16 | Pemberitahuan / Notification — in-app mandatory; minimum 2 and maximum 4 optional channels from SMS, email, phone messaging, WhatsApp, Telegram; automatic, targeted and individual sending; per-user and per-role enable/disable; broadcast | 46 | P1 (in-app + email); further channels **P2** |
| GP-17 | Berita / Pengumuman / Pekeliling / Help Desk / Polisi / FAQ — at least 3 types, rich text editor with image and document upload, coloured and highlighted text, simple tables, scrolling display, small icons and colour | 50 | P1 |
| GP-18 | Jejak Audit — all activity traceable, no generic delete/update labels, must show application ID, user ID, workflow stage, page/section, timestamp; same capabilities as list views; flush button and automatic retention period setting | 24 | P1 |
| GP-19 | Key Performance Index (KPI) — per workflow process, aligned to ISMS, ISO 9001, ABMS and unit standards, measured in hours/minutes/days, notes field, created/modified timestamps and by-whom, displayed against actual workflow stages, statistics as data/table and histogram | 30 | **P2** |
| GP-20 | Change Request Form — online change requests, review and approval by Data/Technical Admin, admin may amend the request, approved data written directly into the live reference list | 62 | P1 |
| GP-21 | Laman Front-Page / Log-in — brief introduction, LPKmn logo, system logo, full system name, acronym, login form, forgot password, new registration, news/announcement/helpdesk/circular/FAQ panel, footer, background image | 55 | P1 |
| GP-22 | User-Friendly Interface — readable fonts, clean CSS, responsive on mobile, contrasting menu colours, correct language, fast loading proven by an online testing tool, help notes on every critical page | 64 | P1 |
| GP-23 | Lain-Lain — privacy and security policy page, footer with copyright and Go-Live year, security hardening, no inline coding without functions/classes, no plaintext passwords, HTTPS mandatory and vendor-provided, online user manual, integration readiness | 65 | P1 |

---

## D. Contractual obligations (source: GP slides 3–5)

| ID | Obligation | Phase |
|---|---|---|
| C-R01 | Submit the completed mandatory-features checklist using the LPKmn template or an equivalent format | P1 |
| C-R02 | Attach evidence per item: screenshots, code excerpts, process descriptions, written statements | P1 |
| C-R03 | Be ready to demonstrate any feature live in the system under development, on request | P1 |
| C-R04 | Nothing in GP may be claimed as a new requirement or change request against the agreed spec | — |
| C-R05 | Compliance is a measurement for payment and work-completion milestones | — |

> `C-R01` and `C-R02` are why every task in `CLAUDE.md` §8 requires a screenshot in
> `docs/evidence/<REQ-ID>/`. Build the evidence pack as you go — reconstructing it at the end costs
> 15 PD and will be done under UAT pressure.

---

## E. Open questions blocking the estimate

Resolve these before or during month 1. Each one has an unbounded tail if left open.

| # | Question | Ask | Blocks |
|---|---|---|---|
| Q1 | Warranty period, LAD penalty, payment milestones, delivery deadline | Tender files 01, 02, 05 | The bid decision itself |
| Q2 | Actual application forms, fee schedule, licence/permit templates for the 3 P1 types | Unit M/T | M1-R13/14/15 |
| Q3 | Approval hierarchy — who approves what, how many stages | Unit M/T | M1-R06 |
| Q4 | Is the Garis Panduan contractually annexed to this sebut harga, or advisory? | Unit IT | 40–60 PD of scope |
| Q5 | LPKmn mandatory-features checklist template | Unit IT | C-R01 |
| Q6 | DDMS — is there an API, or is filing manual? | Unit IT | M1-R17, P2 pricing |
| Q7 | Port Limit and MRA boundary data — does LPKmn hold shapefiles? | Unit M/T | X-R07, 5 PD vs 25 PD |
| Q8 | Payment gateway — which one, who holds the merchant account | Bahagian Korporat | X-R05, 6–8 week lead time |
| Q9 | Which 2–4 optional notification channels does LPKmn want | Unit IT | GP-16 |
| Q10 | DKICT policy document — are there password rules beyond the 12-character minimum | Unit IT | GP-03 |
| Q11 | KPI thresholds under ISMS / ISO 9001 / ABMS | Unit Integriti / Korporat | GP-19, P2 pricing |
