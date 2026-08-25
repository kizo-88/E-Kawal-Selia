# GP-01 — Pengurusan Tahap Pengguna (Roles)

**Requirement ID**: `GP-01`  
**Feature**: Pengurusan Tahap Pengguna (Role Management)  
**Standard**: Garis Panduan Slide 43  
**Status**: ☑ Done & Evidenced  

---

## Evidence Summary

1. **No Hard-coded Roles (G1)**:
   - All roles live in the database table `roles` (Prisma model `Role` in `prisma/schema.prisma`).
   - Permissions live in `permissions` and are linked via `role_permission`.
   - Dynamic menu access is mapped via `menu_item_role`.

2. **Code Excerpts**:
   - `src/lib/rbac/roles.service.ts` queries permissions dynamically from database relations:
     ```typescript
     // No hardcoded role check in application logic:
     await userHasPermission(userId, "PERMOHONAN_APPROVE")
     ```
   - Menu tree filtering in `src/lib/menu/menu-pure.ts` dynamically filters items based on the user's assigned role codes.
