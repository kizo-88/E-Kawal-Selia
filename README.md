# e-Kawalselia — Lembaga Pelabuhan Kemaman

Sistem web untuk LPKmn menguruskan **pelesenan, permit, pemaliman, lawatan tapak, aset dan pelaporan** secara dalam talian.

| | |
|---|---|
| Sebut Harga | **LPKmn Bil. 02/2026** |
| Pemilik sistem | Unit Marin & Trafik, Bahagian Operasi & Kawalselia |
| Urusetia | Unit IT, Bahagian Korporat & Pembangunan |
| Bajet indikatif | RM 180,000 – RM 200,000 |
| Tempoh sah bid | 90 hari |
| Sasaran dalaman | **8.5 bulan** (isytihar 10 bulan) |
| Break-even | **9.1 bulan** — setiap bulan lewat = −RM 17,500 |

## Baca ikut turutan

| Dok | Isi |
|---|---|
| [docs/01-scope-baseline.md](docs/01-scope-baseline.md) | Apa yang kita commit (Phase 1) vs apa yang kita tolak (Phase 2) |
| [docs/02-requirements.md](docs/02-requirements.md) | Setiap keperluan dari 2 dokumen tender, dengan ID boleh jejak |
| [docs/03-architecture.md](docs/03-architecture.md) | Stack, sempadan modul, struktur folder |
| [docs/04-data-model.md](docs/04-data-model.md) | Semua jadual & hubungan |
| [docs/05-schedule.md](docs/05-schedule.md) | Jadual 9 bulan, sprint, siapa buat apa |
| [docs/06-costing.md](docs/06-costing.md) | P&L, break-even, titik kawalan |
| [docs/07-compliance-checklist.md](docs/07-compliance-checklist.md) | 23 features mandatori LPKmn + ruangan bukti |
| [docs/08-build-plan.md](docs/08-build-plan.md) | **Pelan coding — task demi task, ikut turutan** |
| [docs/09-setup.md](docs/09-setup.md) | Cara pasang environment tempatan |
| **[RULES.md](RULES.md)** | **Peraturan tertinggi. Tujuh daripadanya dikuatkuasakan oleh ESLint dan akan gagalkan build.** |
| [CLAUDE.md](CLAUDE.md) | Stack, struktur, corak, arahan |

## Bahasa dokumen

Dokumen teknikal ditulis dalam **Bahasa Inggeris** supaya konsisten dengan kod dan tool AI.
Istilah domain kekal **Bahasa Melayu** (permohonan, lesen, malim, kawalselia) sebab itu bahasa rasmi LPKmn dan akan muncul dalam UI, jadual dan kod.

## Mula

Ikut [docs/09-setup.md](docs/09-setup.md). Ringkasnya:

```bash
npm install && cp .env.example .env
```

```bash
npx supabase start && npm run db:migrate && npm run db:seed
```

```bash
npm run dev
```

## Status

**PRA-BID.** Rangka aplikasi sudah ada (Next.js 16 + Supabase, skema Prisma 25 jadual, polisi RLS,
tujuh peraturan dikuatkuasakan oleh ESLint). Tugas Stage 2 ke atas masih tersekat sehingga:

1. Fail tender **01, 02, 05** diperoleh (tempoh siap, LAD, tempoh waranti, milestone bayaran)
2. URS/BRS ditandatangan Unit M/T
3. Borang sebenar 3 jenis permohonan + kadar fi + templat lesen diperoleh
4. Keputusan bid/no-bid dibuat — lihat [docs/06-costing.md](docs/06-costing.md)
