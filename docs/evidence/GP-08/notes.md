# GP-08 — Informasi Paparan Sistem / Portal

**Requirement ID**: `GP-08`  
**Feature**: Informasi Paparan Sistem / Portal (Portal Display Details)  
**Standard**: Garis Panduan Slide 50  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **Separate Address Fields Requirement**:
   - Address data is decomposed into discrete database columns in `settings` per Garis Panduan mandate:
     - `address_line_1`, `address_line_2`, `city`, `postcode`, `state` (Terengganu), `country` (Malaysia)
     - Geographical coordinates: `latitude` (4.2562), `longitude` (103.4542)
     - Official contact: `secretariat_name`, `email`, `phone`, `website_url`, `social_media_links`.

2. **UI Rendering**:
   - Deployed on Public Contact/Helpdesk page (`/bantuan`), Portal footer, and official licence certificate headers.
