import { asAnonymous } from '../../lib/db/scoped'


export interface PublicAnnouncementItem {
  id: string
  titleMs: string
  titleEn: string
  date: string
  type: 'announcement' | 'circular' | 'news'
  categoryMs: string
  categoryEn: string
  summaryMs: string
  summaryEn: string
  link?: string
}

export interface PublicFaqItem {
  id: string
  questionMs: string
  questionEn: string
  answerMs: string
  answerEn: string
}

/**
 * Public query for portal announcements and FAQs (GP-21, GP-17).
 * Runs anonymously via asAnonymous() with no user credentials required.
 */
export async function queryPublicAnnouncements(): Promise<PublicAnnouncementItem[]> {
  return asAnonymous(async (tx) => {
    const broadcasts = await tx.notificationBroadcast.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    if (broadcasts.length > 0) {
      return broadcasts.map((b) => ({
        id: String(b.id),
        titleMs: b.titleMs,
        titleEn: b.titleEn,
        date: b.createdAt.toISOString().slice(0, 10),
        type: 'announcement' as const,
        categoryMs: 'Pengumuman Awam',
        categoryEn: 'Public Announcement',
        summaryMs: b.bodyMs,
        summaryEn: b.bodyEn,
      }))
    }

    return BASELINE_ANNOUNCEMENTS
  })
}

export const BASELINE_ANNOUNCEMENTS: PublicAnnouncementItem[] = [
  {
    id: 'ann-1',
    titleMs: 'Pembukaan Permohonan Lesen Perkhidmatan Sokongan & Permit Aktiviti Pelabuhan 2026',
    titleEn: 'Opening of Support Service Licences & Port Activity Permits Applications 2026',
    date: '2026-08-15',
    type: 'announcement',
    categoryMs: 'Pelesenan',
    categoryEn: 'Licensing',
    summaryMs: 'Semua syarikat perkapalan dan kontraktor marin boleh mula mengemukakan permohonan pembaharuan atau lesen baharu secara dalam talian.',
    summaryEn: 'All shipping companies and marine contractors may submit renewal or new applications online.',
  },
  {
    id: 'ann-2',
    titleMs: 'Pekeliling Pelabuhan Bil. 2/2026: Garis Panduan Keselamatan Operasi Bunkering di Had Pelabuhan',
    titleEn: 'Port Circular No. 2/2026: Safety Guidelines for Bunkering Operations within Port Limits',
    date: '2026-08-10',
    type: 'circular',
    categoryMs: 'Pekeliling',
    categoryEn: 'Circular',
    summaryMs: 'Pematuhan mandatori terhadap zon berlabuh dan langkah pencegahan tumpahan minyak semasa aktiviti pembekalan minyak kapal.',
    summaryEn: 'Mandatory compliance with anchorage zoning and oil spill prevention protocols during bunkering.',
  },
  {
    id: 'ann-3',
    titleMs: 'Penambahbaikan Sistem e-Kawalselia: Ciri Keselamatan Pengesahan Kod QR Pada Sijil Digital',
    titleEn: 'e-Kawalselia System Enhancement: QR Code Verification on Digital Certificates',
    date: '2026-08-01',
    type: 'news',
    categoryMs: 'Berita',
    categoryEn: 'News',
    summaryMs: 'Semua lesen dan permit yang dikeluarkan kini dilengkapi dengan kod QR digital yang boleh disahkan kesahihannya secara serta-merta.',
    summaryEn: 'All issued licences and permits now include a digital QR code for instant authenticity verification.',
  },
]

export const BASELINE_FAQS: PublicFaqItem[] = [
  {
    id: 'faq-1',
    questionMs: 'Berapa lamakah tempoh masa yang diambil untuk memproses permohonan lesen?',
    questionEn: 'How long does it take to process a licence application?',
    answerMs: 'Tempoh pemprosesan standard adalah 14 hari bekerja dari tarikh penerimaan dokumen lengkap, tertakluk kepada semakan teknikal Unit M/T.',
    answerEn: 'Standard processing time is 14 working days from receipt of complete documentation, subject to technical review by the M/T Unit.',
  },
  {
    id: 'faq-2',
    questionMs: 'Bagaimanakah cara untuk menyemak ketulenan sijil lesen atau permit pelabuhan?',
    questionEn: 'How can I verify the authenticity of a port licence or permit?',
    answerMs: 'Setiap sijil rasmi yang dikeluarkan dilengkapi dengan kod QR. Anda boleh mengimbas kod tersebut atau memasukkan token di halaman Semakan QR Awam tanpa perlu log masuk.',
    answerEn: 'Every official certificate carries a QR code. You can scan the code or enter the token on the Public QR Verification page without logging in.',
  },
  {
    id: 'faq-3',
    questionMs: 'Apakah dokumen wajib yang perlu dimuat naik semasa memohon?',
    questionEn: 'What are the mandatory documents required during application?',
    answerMs: 'Dokumen asas merangkumi Sijil SSM yang sah, Polisi Insurans Tanggungan Awam (P&I), dan dokumen sokongan vesel (jika berkenaan) dalam format PDF/JPG/PNG tidak melebihi 10MB.',
    answerEn: 'Basic requirements include valid SSM certificate, Public Liability Insurance (P&I), and vessel supporting documents (if applicable) in PDF/JPG/PNG under 10MB.',
  },
]

export async function queryPublicFaqs(): Promise<PublicFaqItem[]> {
  return asAnonymous(async () => {
    return BASELINE_FAQS
  })
}

