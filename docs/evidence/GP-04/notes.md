# GP-04 — Pendaftaran Pengguna & Pengesahan Akaun

**Requirement ID**: `GP-04`  
**Feature**: Pendaftaran Pengguna (User Self-Registration)  
**Standard**: Garis Panduan Slide 46  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Self-Registration Flow (`/daftar`)**:
   - Applicant selects user category: Syarikat, Konsortium, Malim Berlesen, Pengguna Pelabuhan.
   - Captures company details (SSM No, Company Name) and authorized representative details.
   - Enforces duplicate account rejection based on unique email and SSM registration number.

2. **Security & Undertaking**:
   - 12-character minimum password length (GP-03 DKICT).
   - Mandatory Surat Aku-Janji affirmation checkbox (GP-06).
   - Integration with email notification queue for welcome and verification links.
