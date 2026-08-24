# e-Kawalselia — Documentation Index

Sistem pelesenan, permit dan kawal selia untuk **Lembaga Pelabuhan Kemaman**.
Sebut Harga **LPKmn Bil. 02/2026**.

---

## Read in this order

| # | Document | Read it when |
|---|---|---|
| 01 | [Scope Baseline](01-scope-baseline.md) | Anyone asks what is in or out. This is the contract with ourselves. |
| 02 | [Requirements Register](02-requirements.md) | You need the ID for a branch, commit, test or evidence folder |
| 03 | [Architecture](03-architecture.md) | Before writing any code, and before adding any dependency |
| 04 | [Data Model](04-data-model.md) | Before writing a migration |
| 05 | [Schedule](05-schedule.md) | Weekly. Contains the control points and the risk register. |
| 06 | [Costing](06-costing.md) | Before the bid, and at every monthly burn check |
| 07 | [Compliance Checklist](07-compliance-checklist.md) | Every time a task is done — this is a payment gate |
| 08 | [Build Plan](08-build-plan.md) | Daily. Task-by-task execution order. |
| 09 | [Local Setup](09-setup.md) | First day on the project, or when your environment breaks |

Plus [CLAUDE.md](../CLAUDE.md) — working rules for every human and every AI tool on this repo.

## Decision records

| ADR | Decision |
|---|---|
| [0001](adr/0001-tech-stack.md) | Laravel 13 + Filament 5 + PostgreSQL/PostGIS |
| [0002](adr/0002-configuration-over-code.md) | Anything LPKmn might change is data, not code |
| [0003](adr/0003-soft-delete-and-snapshots.md) | Never physically delete; snapshot identities on historical records |

---

## The four numbers to remember

| | |
|---|---|
| Bid | **RM 198,000** |
| Monthly burn | **RM 17,500** |
| Target delivery | **8.5 months** |
| Break-even | **9.1 months** |

Buffer between target and break-even: **0.6 months ≈ 13 working days.**

---

## Current status: PRE-BID, Stage 1 skeleton in place

The application skeleton is committed (Laravel 13 + Filament 5, Stage 1.6 migrations, base model,
architecture tests, Docker services). Build tasks from Stage 2 onward remain blocked on:

1. Tender files **01, 02, 05** — warranty period, LAD penalty, delivery deadline, payment milestones
2. Bid / no-bid decision against [06-costing.md](06-costing.md) §8
3. URS/BRS signed by Unit M/T, with the actual forms, fee schedule, licence templates and approval
   hierarchy for the 3 Phase 1 application types

Nothing in this documentation set is reliable until item 1 is resolved. A 24-month free warranty
alone turns a RM 11,450 profit into a RM 48,550 loss.

## Source documents

Both live in `Documents/.WORK/UMPSA HOLDING/DocSystem/Ekawal Selia/`:

| File | What it gives us |
|---|---|
| `03 KETERANGAN RINGKAS SISTEM.pdf` | The domain — 7 modules, 5 application types, cross-cutting requirements |
| `GARIS PANDUAN PEMBANGUNAN SISTEM APLIKASI LPKmn.pptx` | 23 mandatory platform features, binding, not claimable as change requests |
| `Harga Indikatif Jabatan SH LPKmn 02.2026.pdf` | RM 180,000 – RM 200,000, 90-day validity |
| `04 Lampiran A3 - Borang Akuan Sebut Harga.docx` | Bid form. Note the blank **"Dalam tempoh ______"** — that field is ours to set. |
| `06 Lampiran C - Pengalaman Syarikat.docx` | Company experience. Check we can complete it before investing in the bid. |
| `06 Lampiran C - Maklumat Projek Sedia ada.docx` | Current project commitments |
| `Kod Etika Vendor LPKmn.pdf` | Vendor code of ethics |

**Missing: 01, 02, 05.** Get them.
