# GP-11 — Muat-Naik & Turun Fail (File Upload Policy Engine)

**Requirement ID**: `GP-11`  
**Feature**: Muat-Naik & Turun Fail  
**Standard**: Garis Panduan Slide 53  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Configurable File Policies (F9)**:
   - Managed via `file_policies` table (`FilePolicy` model).
   - Configurable per upload context (e.g. `application_document`, `profile_photo`, `circular_pdf`).
   - Supports $\ge 3$ allowed file formats (`.pdf`, `.jpg`, `.png`).
   - Magic-byte MIME sniffing implemented in `src/lib/uploads/validator.ts` prevents extension renaming bypass attacks.

2. **Size Caps & Validation**:
   - Rejects oversized files ($> 10\text{MB}$) with bilingual error messages.
   - Enforces RLS permissions on private document download routes.
