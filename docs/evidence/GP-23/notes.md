# GP-23 — Lain-Lain Keperluan & Piawaian Keselamatan

**Requirement ID**: `GP-23`  
**Feature**: Lain-Lain Keperluan Platform  
**Standard**: Garis Panduan Slide 65  
**Status**: ☑ Done & Evidenced  

---

## 1. Evidence Summary

1. **Privacy & Security Policies (`/dasar-privasi`)**:
   - Official LPKmn Privacy & Security policy screen detailing data protection, session cookie usage, and personal data safety under PDPV standards.
   - Bilingual terms and user rights protection.

2. **Security Headers & Production Safeguards (`next.config.ts`)**:
   - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload` (HSTS).
   - `X-Content-Type-Options`: `nosniff`.
   - `X-Frame-Options`: `DENY`.
   - `Referrer-Policy`: `strict-origin-when-cross-origin`.
   - `Permissions-Policy`: `camera=(), microphone=(), geolocation=()`.
   - Zero plaintext credentials stored in database (hashed via bcrypt cost 12).
   - API endpoints designed for external integration readiness.

3. **Footer & Copyright (GP-23)**:
   - System displays Go-Live year (2026) and official copyright notice in all footers.
