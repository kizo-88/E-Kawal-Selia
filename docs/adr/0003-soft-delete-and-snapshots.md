# ADR 0003 — Soft delete and historical snapshots

**Status:** Accepted · **Date:** 2026-08-24

## Context

Garis Panduan slide 9, on user levels:

> *"Kaedah delete, tidak menjejaskan sebarang proses kerja yang telah dibuat sebelum tindakan
> tersebut dijalankan."*

The same requirement appears for lookup values and list entries. Meanwhile GP-18 requires an audit
trail that stays meaningful, and X-R02 requires audit reports usable for internal audit and overtime
claim substantiation — that is, records that must still be readable years later.

Soft delete alone does not achieve this. If an audit row joins to `users` for the actor's name and
that user is soft-deleted and later purged, the entry becomes `Permohonan diluluskan oleh —`. The
audit trail is intact and useless.

## Decision

Two mechanisms, both required.

### 1. Soft delete everywhere

Every table carries `deleted_at`. Nothing is physically removed by application code. Exceptions:

- `audit_logs` — no soft delete; removed only by the retention purge required by GP-18, and the
  purge writes an `audit_purge_runs` row
- pure join tables with no history value

### 2. Snapshot columns on historical records

Any table recording a past event stores the human-readable identity **as text**, alongside the
foreign key:

| Table | FK | Snapshot |
|---|---|---|
| `audit_logs` | `user_id` | `user_name_snapshot`, `user_role_snapshot` |
| `application_stage_logs` | `actor_user_id` | `actor_name_snapshot` |
| `generated_documents` | `template_code` | `template_version` |
| `user_undertakings` | `undertaking_version_id` | never updated — a new acceptance is a new row |

**Rule:** rendering a historical record reads the snapshot. The FK exists for filtering and joins,
never for display.

## Consequences

**Good**
- Deleting a user, role or lookup value cannot corrupt history — satisfies GP-02 directly
- Audit reports remain legible years later, which is what X-R02 actually needs
- Document reprints match what was originally issued, even after the template is edited
- Restoring an accidentally deleted record is trivial

**Bad**
- Denormalised data; a renamed user shows the old name on old records. **This is intended** — the
  record states who acted under the name they held at the time.
- Every list query needs the soft-delete scope. Filament handles this; hand-written queries must
  not forget it.
- Storage grows. Negligible at LPKmn's volume.

**Watch**
- Unique constraints must account for soft-deleted rows. Use partial indexes:
  `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL`
- A `restore` must check that the parent is not itself deleted.

## Enforcement

- The base model in task 1.5 applies soft deletes and snapshot helpers by default
- Definition of Done item 3 (`CLAUDE.md` §8) requires proving historical records still render
- GP-02 evidence explicitly requires deleting an access level and showing prior applications intact —
  see `07-compliance-checklist.md`
