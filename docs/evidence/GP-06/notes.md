# GP-06 — Pengesahan Surat Aku-Janji

**Requirement ID**: `GP-06`  
**Standard**: Garis Panduan Slide 48  
**Status**: ☑ Done & Evidenced  

---

## Evidence Summary

1. **Immutable Versioning & Snapshots**:
   - Model `UndertakingVersion` in `prisma/schema.prisma` stores official terms in bilingual pairs (`bodyMs` / `bodyEn`).
   - Model `UserUndertaking` records acceptance timestamp, IP address, user agent, and an immutable snapshot string `undertakingVersionSnapshot`.
   - Once written, rows in `UserUndertaking` are never updated (ADR 0003). Fresh acceptance creates a new record.

2. **UI Implementation**:
   - Compulsory acceptance checkbox on registration (`/daftar`) and application submission (`/permohonan/baru`).
   - Displayed with certificate badge on user profile screen (`/profil`).
