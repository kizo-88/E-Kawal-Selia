# GP-10 — Setting & Template Emel / SMS

**Requirement ID**: `GP-10`  
**Feature**: Setting & Template Emel / SMS  
**Standard**: Garis Panduan Slide 52  
**Status**: ◐ In Progress (Phase 1 Email live; SMS Phase 2 statement)  

---

## Evidence Summary

1. **Email Notification Engine (F8)**:
   - Managed via `notification_templates` table (`NotificationTemplate` model).
   - Bilingual email templates (`subjectMs`/`subjectEn`, `bodyMs`/`bodyEn`) mapped by workflow action code (e.g. `WELCOME_VERIFY`, `PERMOHONAN_SUBMITTED`, `PERMOHONAN_APPROVED`, `LICENCE_EXPIRING`).
   - Notification dispatch bus (`src/lib/notifications/`) processes queued items with audit trail logging.

2. **Phase 2 Written Statement**:
   - SMS channel and real-time SMS quota display are scheduled for Phase 2 implementation as detailed in `docs/01-scope-baseline.md`.
