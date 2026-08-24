import Link from 'next/link'
import { Badge } from '../../../components/ui/badge'
import { Card, CardContent } from '../../../components/ui/card'
import { IconShieldCheck } from '../../../components/ui/icons'



export const PRIVACY_SECTIONS = [
  {
    id: 'sec-1',
    titleMs: '1. Pengenalan & Komitmen Kerahsiaan',
    titleEn: '1. Introduction & Confidentiality Commitment',
    contentMs:
      'Lembaga Pelabuhan Kemaman (LPKmn) komited untuk melindungi privasi dan keselamatan data semua pengguna portal e-Kawalselia, termasuk syarikat perkapalan, ejen, kontraktor maritim, dan malim berlesen selaras dengan Akta Perlindungan Data Peribadi (PDPA) dan Dasar Keselamatan ICT Sektor Awam.',
    contentEn:
      'Kemaman Port Authority (LPKmn) is committed to protecting the privacy and security of all e-Kawalselia portal users, including shipping companies, agents, maritime contractors, and licensed marine pilots in accordance with the Personal Data Protection Act (PDPA) and Public Sector ICT Security Policy.',
  },
  {
    id: 'sec-2',
    titleMs: '2. Pengumpulan & Penggunaan Data Pelesenan',
    titleEn: '2. Collection & Usage of Licensing Data',
    contentMs:
      'Maklumat peribadi dan korporat yang dikumpul merangkumi nombor pendaftaran syarikat (SSM), butiran wakil syarikat, nombor kad pengenalan (disulitkan), rekod kelayakan vesel, dan dokumen sokongan teknikal yang diperlukan untuk memproses permohonan lesen, permit, atau sokongan PDA2.',
    contentEn:
      'Personal and corporate data collected includes company registration number (SSM), representative details, identity card number (encrypted), vessel qualification records, and technical supporting documents required to process licence, permit, or PDA2 support applications.',
  },
  {
    id: 'sec-3',
    titleMs: '3. Keselamatan Kata Laluan & Pengesahan Dua Faktor (MFA)',
    titleEn: '3. Password Security & Multi-Factor Authentication (MFA)',
    contentMs:
      'Portal ini menguatkuasakan piawaian keselamatan ketat merangkumi panjang kata laluan minimum 12-aksara, pengesahan dua-faktor (MFA/TOTP), penyulitan kata laluan moden, had kunci akaun automatik selepas 3 percubaan gagal, dan tamat masa sesi automatik selepas 10 minit.',
    contentEn:
      'This portal enforces strict security standards including 12-character minimum password length, multi-factor authentication (MFA/TOTP), modern password hashing, automated account lockout after 3 failed attempts, and automatic 10-minute session timeout.',
  },
  {
    id: 'sec-4',
    titleMs: '4. Jejak Audit & Ketelusan Aktiviti (GP-18)',
    titleEn: '4. Audit Trail & Activity Transparency (GP-18)',
    contentMs:
      'Setiap tindakan dalam sistem seperti penghantaran permohonan, ulasan teknikal, perubahan status, dan kelulusan direkodkan secara terperinci dalam jejak audit tidak boleh dipadam untuk tujuan akauntabiliti, pengauditan integriti, dan pematuhan Piagam Pelanggan.',
    contentEn:
      'Every system action such as application submission, technical review, status modification, and approval is immutably recorded in the audit trail for accountability, integrity auditing, and Client Charter compliance.',
  },
  {
    id: 'sec-5',
    titleMs: '5. Pengesahan Awam Kod QR & Pendedahan Terhad (X-R12)',
    titleEn: '5. Public QR Verification & Minimal Disclosure (X-R12)',
    contentMs:
      'Halaman semakan awam Kod QR hanya mendedahkan nombor lesen, jenis perkhidmatan, nama pemegang lesen, tempoh sah laku, dan status lesen. Maklumat sensitif seperti kad pengenalan, alamat terperinci, nombor telefon, atau dokumen dalaman tidak akan didedahkan kepada umum.',
    contentEn:
      'The public QR verification page discloses only licence number, service category, licence holder name, validity dates, and licence status. Sensitive data such as identity card numbers, detailed addresses, phone numbers, or internal files are strictly protected from public disclosure.',
  },
]

export default function DasarPrivasiPage() {
  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0b2545] transition-colors">
            Laman Utama
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Dasar Privasi &amp; Keselamatan</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3">
          <Badge variant="primary" size="md">
            Dokumen Dasar Rasmi
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
            Dasar Privasi &amp; Keselamatan Maklumat
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Portal e-Kawalselia Lembaga Pelabuhan Kemaman (LPKmn) — Tarikh Kuat Kuasa: Tahun 2026
          </p>
        </div>

        {/* Security Overview Card */}
        <div className="bg-gradient-to-r from-[#0b2545] to-[#133e87] text-white rounded-xl p-6 shadow-sm flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-amber-400/20 text-amber-300 shrink-0">
            <IconShieldCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base">Jaminan Keselamatan Data Pelesenan</h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              Semua komunikasi data antara pelayar anda dan pelayan e-Kawalselia disulitkan sepenuhnya
              menggunakan protokol TLS/HTTPS berprestasi tinggi selaras dengan piawaian keselamatan ICT
              Kerajaan Malaysia.
            </p>
          </div>
        </div>

        {/* Sections Content */}
        <div className="space-y-6">
          {PRIVACY_SECTIONS.map((sec) => (
            <Card key={sec.id} variant="default">
              <CardContent className="p-6 space-y-2">
                <h3 className="text-base font-bold text-slate-900">
                  {sec.titleMs}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {sec.contentMs}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Secretariat Contact Notice */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-600 space-y-2">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
            Pegawai Perhubungan Keselamatan Maklumat
          </h4>
          <p>
            Sebarang pertanyaan, aduan, atau permintaan mengenai dasar privasi ini boleh dikemukakan
            kepada Unit IT &amp; Integriti Lembaga Pelabuhan Kemaman melalui emel{' '}
            <a
              href="mailto:kawalselia@lpktg.gov.my"
              className="text-[#0b2545] font-semibold hover:underline"
            >
              kawalselia@lpktg.gov.my
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
