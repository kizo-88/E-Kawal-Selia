# GP-08 — Informasi Paparan Sistem / Portal

**Status: ◐ in progress. Do not tick.** One defect open, described below.

**Date:** 2026-08-26 · **Verified against:** live Supabase project, app running at `localhost:3000`

---

## What GP-08 requires

> *"Informasi asas lain bagi pemilik Sistem / Portal ... boleh dikemaskini bila-bila masa"* —
> organisation name, secretariat, address as **separate fields**, coordinates, logo, email, phone,
> website, social links.
>
> *"Fungsi: menggunakan informasi ini sebagai paparan, contoh di laman 'Contact-Us' dan 'Footer'."*

The requirement is not that these values are displayed. It is that they are **admin-editable** and
that the display reads from them.

## Verified

Read back from the live database as the application role:

| Setting | Value | Public |
|---|---|---|
| `organisation.name` | Lembaga Pelabuhan Kemaman | ✅ |
| `organisation.secretariat` | Unit IT, Bahagian Korporat & Pembangunan | ✅ |
| `organisation.address_line1` | Telok Kalong | ✅ |
| `organisation.address_line2` | Peti Surat 66 | ✅ |
| `organisation.postcode` | 24000 | ✅ |
| `organisation.city` | Kemaman | ✅ |
| `organisation.state` | Terengganu | ✅ |

Address is stored as **separate fields**, which GP-08 asks for explicitly. 29 settings total; the 15
branding and format keys are readable before sign-in so the login page can render them, while the
`security` group is not — verified: an anonymous connection reads 15 settings and **0** security
settings.

## 🔴 Open defect — contact details are hard-coded on three public pages

```
src/app/(public)/login/page.tsx:56          kawalselia@lpktg.gov.my
src/app/(public)/dasar-privasi/page.tsx:123 kawalselia@lpktg.gov.my
src/app/(public)/bantuan/page.tsx:141       kawalselia@lpktg.gov.my
```

Two problems, and the second is the one that would embarrass us.

**1. It violates G1 and GP-08.** The support email is exactly the kind of value GP-08 requires to be
admin-editable and read from settings. Hard-coded, LPKmn cannot change it without a code deployment
— which is the situation slide 53 of the Garis Panduan makes our cost to unwind.

`organisation.email`, `organisation.phone` and `organisation.website` now exist as settings and are
seeded empty and public. The three pages must read from them. That is the UI lane's file, so it is
reported here rather than changed.

**2. The domain looks wrong.** `lpktg.gov.my` — for **Lembaga Pelabuhan Kemaman**, whose other
seeded values are all Kemaman and Terengganu. Nothing in any tender document gives this address, so
it appears to have been invented.

It is presented to the public as an official government support contact on the login page of a
government portal. If it does not resolve, applicants who cannot sign in have nowhere to go; if it
resolves to someone else, we have published a stranger's address as LPKmn's.

**The values are seeded empty on purpose.** Guessing a plausible-looking government address is how
the wrong one ends up in production. LPKmn must supply the real support email, phone and website —
added to the open-questions list.

## Not yet evidenced

- No screenshot. The browser pane could not composite frames in this environment, so page content
  was captured as text rather than an image. GP-08 needs a screenshot of the admin settings screen
  **and** of the footer rendering those values — per the rule that a configurability requirement is
  evidenced by changing a value and showing the change, not by showing the field.
- Coordinates, logo and social links are in the requirement and not yet in the settings registry.

## Reproducing

```bash
npm run db:seed && npm run dev
```

Then read the settings back as the application role — not as the owner, which bypasses RLS and
proves nothing. See `docs/evidence/G5-RLS/notes.md`.
