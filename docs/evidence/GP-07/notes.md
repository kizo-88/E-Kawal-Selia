# GP-07 — Informasi Asas LPKmn & Konfigurasi Sistem

**Requirement ID**: `GP-07`  
**Feature**: Informasi Asas LPKmn (Base Organization Information)  
**Standard**: Garis Panduan Slide 49  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Dynamic Organization Settings**:
   - Stored in the `settings` database table (Prisma model `Setting`).
   - Admin-configurable fields:
     - `org_name_ms` / `org_name_en`: Lembaga Pelabuhan Kemaman / Kemaman Port Authority
     - `system_title_ms` / `system_title_en`: Sistem e-Kawalselia LPKmn
     - `logo_url`, `theme_color`, `banner_active` (toggleable banner)
     - `date_format`, `time_format`, `currency_format` (MYR), `default_locale` (`ms`).

2. **No Hard-coded Settings (G1)**:
   - UI pulls branding and formatting directly from settings queries without hard-coded configuration constants.
