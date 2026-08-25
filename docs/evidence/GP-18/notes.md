# GP-18 — Jejak Audit Sistem & Pematuhan Integriti

**Requirement ID**: `GP-18`  
**Feature**: Jejak Audit Sistem (Audit Trail Engine)  
**Standard**: Garis Panduan Slide 60  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Human-Readable Sentences (G3 `no-generic-audit-label`)**:
   - Every audit log entry records a clear human sentence (e.g. `PERMOHONAN_DILULUSKAN`, `KATA_LALUAN_DIKEMAS_KINI`, `DOKUMEN_DIMUAT_TURUN`) along with User ID, Role, IP Address, Resource ID, and Timestamp.
   - Enforced by ESLint rule `no-generic-audit-label`.

2. **Audit Purge & Retention Management (GP-18)**:
   - Configurable retention period setting in `settings` table.
   - `flushAudit` server action (`/audit/actions.ts`) purges expired records safely while logging the purge event itself into the audit trail.
