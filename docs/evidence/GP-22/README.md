# GP-22 — User-Friendly Interface & Compliance Evidence

**Requirement ID**: `GP-22`  
**Standard**: Garis Panduan Pembangunan Sistem Aplikasi LPKmn (Slide 64)  
**Contractual Obligation**: Phase 1 Mandatory Feature (C-R01, C-R02)  
**Assigned Lane**: Gemini / Antigravity (UI)  

---

## 1. Requirement Summary

GP-22 establishes contractual standards for user friendliness, aesthetics, responsiveness, language accuracy, and performance:

| Criteria | Mandate | Implementation Evidence |
|---|---|---|
| **Responsive Design** | Must be usable and responsive at mobile viewport width **375px**, tablet **768px**, and desktop **1280px+**. | Mobile slide-out navigation drawer, stacked data cards, dynamic SVG histogram scaling, responsive table wrapper. |
| **Menu Contrast** | Contrasting menu colours adhering to WCAG 2.1 AA / AAA standards. | Malaysian port authority palette: Deep Navy `#07192F` / `#0B2545`, Gold/Amber `#B45309` / `#D97706`, High-contrast slate backgrounds. |
| **Bahasa Melayu** | Correct, formal, plain, and authoritative Bahasa Melayu. | Government-standard terminology (*"Lesen Perkhidmatan Sokongan"*, *"Surat Sokongan PDA2"*, *"Pengesahan Aku-Janji"*). |
| **Help Notes** | `HelpNote` component available on every critical data-entry and overview page. | `src/components/ui/help-note.tsx` deployed across Login, Front Page, Dashboard, and Applications List. |
| **Performance & Speed** | Clean CSS, fast loading speed, zero heavy external script libraries. | Tailwind CSS v4, pure SVG charts, lightweight React 19 server/client components. |

---

## 2. Breakpoint Validation Matrix

| Viewport | Device Profile | Target Resolution | Verification Result |
|---|---|---|---|
| **Mobile** | iPhone SE / Standard Mobile | **375px × 667px** | **PASS** — Hamburger menu opens full drawer, forms stack cleanly, table scrolls horizontally with no overflow. |
| **Tablet** | iPad Mini / Air | **768px × 1024px** | **PASS** — 2-column grid layout, header links adapt gracefully, histogram renders full 12-month bars. |
| **Desktop** | HD / Full HD Monitor | **1280px × 800px+** | **PASS** — Persistent collapsible sidebar, 4-column KPI cards, side-by-side work queue & quick links. |

---

## 3. Help Note Component Deployment (GP-22)

The reusable `HelpNote` component provides contextual guidance and collapsible tips:
- **Login Page (`/login`)**: Account lockout rules (GP-03), session expiry, password complexity.
- **Front Page (`/`)**: Document preparation checklist (SSM, insurance, previous licences).
- **Dashboard (`/dashboard`)**: Role-based access level guidance, SLA monitoring.
- **Permohonan List (`/permohonan`)**: Universal filtering instructions, quarter mapping (Q1-Q4), and export capabilities.

---

## 4. Performance & Lighthouse Audit Readiness

- **Bundle Size**: 0 heavy CSS or charting libraries added (pure React 19 + Tailwind v4 + SVGs).
- **Accessibility**: Keyboard navigable (`focus-visible` styling), explicit ARIA roles (`role="alert"`, `aria-label`, `aria-expanded`).
- **Bilingual Schema Readiness (G4)**: All UI components support paired Malay (`*_ms`, `*Ms`) and English (`*_en`, `*En`) strings.
