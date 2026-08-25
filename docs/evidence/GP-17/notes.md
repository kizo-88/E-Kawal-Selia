# GP-17 — Berita, Pengumuman, Pekeliling, Helpdesk, Polisi & FAQ

**Requirement ID**: `GP-17`  
**Feature**: Pengurusan Kandungan Portal (CMS / Post Content Engine)  
**Standard**: Garis Panduan Slide 59  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Multi-Type Content Support ($\ge 3$ Types Live)**:
   - Managed through `content_posts` table (`ContentPost` model).
   - Seeded and live across 4 distinct categories:
     1. `PEKELILING`: Port Circulars (`/pekeliling`)
     2. `PENGUMUMAN`: Public Announcements (`/` front page ticker)
     3. `FAQ`: Frequently Asked Questions (`/bantuan` helpdesk)
     4. `DASAR`: Privacy & Security Policy (`/dasar-privasi`)

2. **Rich Text Formatting & Attachment Integration**:
   - Supports document attachments, highlighted warning callouts, and bilingual Malay/English publishing.
