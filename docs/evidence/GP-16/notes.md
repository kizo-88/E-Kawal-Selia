# GP-16 — Pemberitahuan / Notification System

**Requirement ID**: `GP-16`  
**Feature**: Pemberitahuan / Notification Engine  
**Standard**: Garis Panduan Slide 58  
**Status**: ◐ In Progress (Phase 1 in-app + email live; SMS/WhatsApp/Telegram Phase 2)  

---

## Evidence Summary

1. **In-App & Email Dispatch (F8)**:
   - In-app notification bell and work queue panel deployed on dashboard (`src/components/dashboard/work-notifications-panel.tsx`).
   - Supports broadcast announcements, per-user notification toggles, and per-role assignment alerts.
   - Centralized notification bus in `src/lib/notifications/bus.ts` triggers transactional emails upon application state changes.

2. **Phase 2 Statement (GP-16)**:
   - Phase 1 delivers In-App and Email channels.
   - Additional optional channels (SMS, WhatsApp, Telegram) are scheduled in Phase 2 per scope baseline.
