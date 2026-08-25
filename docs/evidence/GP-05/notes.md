# GP-05 — Pengurusan Profail Pengguna & Keselamatan Sesi

**Requirement ID**: `GP-05`  
**Feature**: Pengurusan Profail Pengguna (User Profile Management)  
**Standard**: Garis Panduan Slide 47  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **User Profile View & Settings (`/profil`)**:
   - Displays authorized company representative details (Name, Official Email, Company, SSM Number, Phone Number).
   - Shows active account verification badge and assigned access level.
   - Includes official certificate badge displaying the registered Surat Aku-Janji (GP-06) with timestamp and reference identifier.

2. **Password Update (GP-03)**:
   - Built-in password change form enforcing minimum 12 characters, uppercase, numbers, and special symbols.
   - Triggers `changeUserPassword` server action with audit event emission.
