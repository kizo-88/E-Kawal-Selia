# GP-09 — Drop-Down List (Registry Pengurusan Nilai Pilihan)

**Requirement ID**: `GP-09`  
**Feature**: Drop-Down List Management  
**Standard**: Garis Panduan Slide 51  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Database-Driven Lookup Registry (G1 `no-hardcoded-lists`)**:
   - Model `LookupType` and `LookupValue` in `prisma/schema.prisma`.
   - Every selectable dropdown in the system (e.g. licence types, vessel categories, document kinds, port zones) queries `lookup_values` with `type_id`, `active = true`, `sort_order ASC`.
   - Admin can add, edit, reorder, or deactivate lookup values without deploying code.

2. **Codebase Verification**:
   - Enforced by ESLint rule `no-hardcoded-lists` in `eslint-rules/no-hardcoded-lists.js`.
