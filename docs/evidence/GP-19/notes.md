# GP-19 — Key Performance Index (KPI) & Pemantauan SLA

**Requirement ID**: `GP-19`  
**Feature**: Key Performance Index (KPI Module)  
**Standard**: Garis Panduan Slide 61  
**Status**: ⊗ Phase 2 (Data foundation live in Phase 1)  

---

## Evidence Summary & Phase 2 Statement

1. **Phase 1 Data Foundation**:
   - `application_stage_logs` captures `sla_due_at`, `sla_days`, and `sla_met: boolean` per workflow transition.
   - Officer review queue (`/semakan`) computes remaining SLA days in real time and highlights critical thresholds (`< 3 hari`).

2. **Phase 2 Implementation Statement**:
   - Full organizational KPI dashboards, ISMS/ISO 9001 quality mapping, and automated statistical performance index generation are scheduled for Phase 2 as stated in `docs/01-scope-baseline.md`.
