# GP-12 — Paparan Senarai Universal & Eksport Laporan

**Requirement ID**: `GP-12`  
**Standard**: Garis Panduan Slide 54  
**Status**: ☑ Done & Evidenced  

---

## Evidence Summary

1. **Universal List & Keyset Pagination**:
   - Implemented in `src/components/table/data-table.tsx` and `src/lib/table/list.ts`.
   - Supports ASC / DESC sort on click across all columns with accessible chevron indicators.
   - Uniform filtering by keyword search, year, quarter (Q1–Q4), date range, and status.

2. **Multi-Format Export Engine**:
   - Exports generated via `src/lib/exports/` (`excel.ts`, `word.ts`, `pdf.ts`).
   - Exports reflect the **CURRENT filtered view** by accepting already-scoped query parameters.
   - Dedicated export route handlers deployed at `/permohonan/export` and `/pelesenan/export`.
