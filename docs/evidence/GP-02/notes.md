# GP-02 — Tahap Pengguna (Level of Access)

**Requirement ID**: `GP-02`  
**Feature**: Tahap Pengguna / Level of Access  
**Standard**: Garis Panduan Slide 44  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **5 Baseline Access Levels**:
   - Seeded in `prisma/seed.ts` through `access_levels` table:
     1. `SUPER_ADMIN` (Pentadbir Sistem Utama)
     2. `DATA_ADMIN` (Pentadbir Data & Konfigurasi)
     3. `MANAGEMENT` (Pihak Pengurusan & Eksekutif)
     4. `APPROVER` (Pegawai Penilai / Unit Marin & Trafik)
     5. `END_USER` (Pemohon / Pengguna Pelabuhan)
   - Supports unlimited custom access levels created via admin settings.

2. **Soft-Delete & Historical Integrity (G2)**:
   - When an access level is deactivated or soft-deleted (`deletedAt != null`), historical applications and audit records linked to that level continue to render correctly without cascade breaks.
   - Enforced by ESLint rule `no-hard-delete`.
