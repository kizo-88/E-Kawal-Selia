import Link from 'next/link'
import { LoginCard } from '../../components/layout/login-card'
import { AnnouncementsPanel } from '../../components/layout/announcements-panel'
import { Badge } from '../../components/ui/badge'
import { HelpNote } from '../../components/ui/help-note'
import {
  IconAnchor,
  IconArrowRight,
  IconBuilding,
  IconCheckCircle,
  IconFileText,
  IconQrCode,
  IconShieldCheck,
  IconShip,
} from '../../components/ui/icons'


export interface ServiceCardItem {
  id: string
  titleMs: string
  titleEn: string
  descMs: string
  descEn: string
  badgeMs: string
  badgeEn: string
  iconType: 'ship' | 'file' | 'building' | 'qr'
}

export const SERVICES_LIST: ServiceCardItem[] = [
  {
    id: 'lesen-sokongan',
    titleMs: 'Lesen Perkhidmatan Sokongan',
    titleEn: 'Support Service Licence',
    descMs:
      'Permohonan lesen baharu dan pembaharuan bagi aktiviti perkhidmatan marin, bunker, bekalan air, dan pembekal perkapalan di Pelabuhan Kemaman.',
    descEn:
      'New and renewal licence applications for marine services, bunkering, freshwater supply, and ship chandling at Port of Kemaman.',
    badgeMs: 'Modul P1',
    badgeEn: 'P1 Module',
    iconType: 'ship',
  },
  {
    id: 'permit-aktiviti',
    titleMs: 'Permit Aktiviti Pelabuhan',
    titleEn: 'Port Activity Permit',
    descMs:
      'Permit kerja panas, kerja menyelam, pemindahan kargo luar pesisir, dan aktiviti operasi khas dalam had perairan Lembaga Pelabuhan Kemaman.',
    descEn:
      'Permits for hot work, diving operations, offshore cargo transfer, and special operations within Kemaman Port Authority limits.',
    badgeMs: 'Modul P1',
    badgeEn: 'P1 Module',
    iconType: 'file',
  },
  {
    id: 'surat-pda2',
    titleMs: 'Surat Sokongan PDA2',
    titleEn: 'PDA2 Support Letter',
    descMs:
      'Pengeluaran surat sokongan rasmi bagi Petroleum Development Act (PDA) untuk syarikat pembekal dan kontraktor industri minyak dan gas maritim.',
    descEn:
      'Issuance of official Petroleum Development Act (PDA) support letters for oil and gas maritime contractors and suppliers.',
    badgeMs: 'Modul P1',
    badgeEn: 'P1 Module',
    iconType: 'building',
  },
  {
    id: 'semak-qr',
    titleMs: 'Semakan Ketulenan Lesen (QR)',
    titleEn: 'Licence Verification (QR)',
    descMs:
      'Perkhidmatan carian dan pengesahan ketulenan sijil lesen pelabuhan secara terus tanpa log masuk melalui imbasan Kod QR atau nombor siri.',
    descEn:
      'Direct public verification and validation of port licence certificates without login via QR code scan or serial number.',
    badgeMs: 'Akses Awam',
    badgeEn: 'Public Access',
    iconType: 'qr',
  },
]

export const HELP_TIPS = [
  {
    id: 'tip-1',
    textMs: 'Pastikan dokumen pendaftaran syarikat (SSM), lesen operasi terdahulu, dan polisi insurans yang sah telah disediakan dalam format PDF sebelum memulakan permohonan.',
    textEn: 'Ensure company registration documents (SSM), previous operational licences, and valid insurance policies are prepared in PDF format prior to starting.',
  },
  {
    id: 'tip-2',
    textMs: 'Setiap permohonan yang dihantar akan melalui semakan teknikal oleh Unit Marin & Trafik sebelum kelulusan dikeluarkan oleh pihak Pengurusan LPKmn.',
    textEn: 'Every submitted application undergoes technical review by the Marine & Traffic Unit before final approval by LPKmn Management.',
  },
  {
    id: 'tip-3',
    textMs: 'Sebarang bantuan teknikal atau pertanyaan proses pelesenan boleh dirujuk melalui talian Urus Setia di +609-863 1590.',
    textEn: 'Any technical assistance or licensing process enquiries can be directed to the Secretariat helpline at +609-863 1590.',
  },
]

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section (GP-21, GP-22) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0b2545] via-[#0f3460] to-[#07192f] text-white py-12 sm:py-16 lg:py-20">
        {/* Decorative Grid & Maritime Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: System Introduction */}
            <div className="lg:col-span-7 space-y-6">
              {/* Emblem & Portal Label */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-amber-300 text-xs font-semibold">
                <IconAnchor className="h-4 w-4 shrink-0" />
                <span>LEMBAGA PELABUHAN KEMAMAN</span>
              </div>

              {/* Full Title & Acronym (GP-21) */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight sm:leading-tight">
                  Sistem Pengurusan Pelesenan, Permit &amp; Kawalselia Pelabuhan
                </h1>
                <p className="text-lg sm:text-xl font-medium text-amber-400">
                  e-Kawalselia (LPKmn)
                </p>
              </div>

              {/* Brief Introduction Text */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Gerbang rasmi digital Lembaga Pelabuhan Kemaman bagi urusan permohonan lesen
                perkhidmatan sokongan pelabuhan, permit aktiviti maritim, surat sokongan PDA2,
                dan pemantauan kawal selia operasi pelabuhan yang telus, cekap dan selamat.
              </p>

              {/* Key Features Quick Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Permohonan &amp; Kelulusan Dalam Talian</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Pengecaman &amp; Semakan Kod QR Sah</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Pematuhan Akta &amp; Piawaian ISPS</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconCheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Jejak Audit &amp; Keselamatan DKICT</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a
                  href="#perkhidmatan"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-colors"
                >
                  <span>Lihat Perkhidmatan</span>
                  <IconArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="#pengumuman"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-colors"
                >
                  <IconFileText className="h-4 w-4" />
                  <span>Pekeliling Terkini</span>
                </a>
              </div>
            </div>

            {/* Right Column: Interactive Login Card (GP-21) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <LoginCard className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section id="perkhidmatan" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="primary" size="md">
              Katalog Perkhidmatan
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
              Modul Pelesenan &amp; Kawal Selia Pelabuhan
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pilihan kategori permohonan utama di bawah kuasa kawal selia Lembaga Pelabuhan
              Kemaman selaras dengan peruntukan undang-undang pelabuhan persekutuan.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES_LIST.map((srv) => (
              <div
                key={srv.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center text-[#0b2545] border border-slate-200">
                      {srv.iconType === 'ship' ? (
                        <IconShip className="h-6 w-6" />
                      ) : srv.iconType === 'file' ? (
                        <IconFileText className="h-6 w-6" />
                      ) : srv.iconType === 'building' ? (
                        <IconBuilding className="h-6 w-6" />
                      ) : (
                        <IconQrCode className="h-6 w-6" />
                      )}
                    </div>
                    <Badge variant="gold" size="sm">
                      {srv.badgeMs}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {srv.titleMs}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {srv.descMs}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2545] hover:text-[#133e87] group"
                  >
                    <span>Mohon / Semak Sekarang</span>
                    <IconArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Help Note Callout (GP-22) */}
          <div className="pt-4">
            <HelpNote
              titleMs="Panduan Permohonan &amp; Dokumen Wajib"
              titleEn="Application Guidelines &amp; Mandatory Documents"
              descriptionMs="Sila pastikan syarikat anda mematuhi senarai semak sebelum menghantar permohonan rasmi."
              descriptionEn="Please ensure your company adheres to the checklist before submitting official applications."
              items={HELP_TIPS}
              collapsible={true}
              defaultOpen={true}
            />
          </div>
        </div>
      </section>

      {/* Announcements & Circulars Section (GP-21, GP-17) */}
      <section id="pengumuman" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge variant="primary" size="md">
                Pusat Sumber
              </Badge>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight mt-2">
                Pekeliling, Notis &amp; Soalan Lazim
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-md">
              Maklumat terkini operasi pelabuhan, garis panduan keselamatan ISPS, dan jawapan kepada
              pertanyaan lazim pengguna portal.
            </p>
          </div>

          <AnnouncementsPanel />
        </div>
      </section>

      {/* Security & Verification Callout (GP-23, X-R11, X-R12) */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-[#0b2545] to-[#133e87] p-8 sm:p-10 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <IconShieldCheck className="h-4 w-4" />
                <span>Pengesahan Lesen Digital Berkuasa Kod QR</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Semak Ketulenan Sijil Lesen &amp; Permit Secara Segera
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Setiap dokumen rasmi yang dijana oleh sistem e-Kawalselia dilengkapi dengan token
                keselamatan rawak 32-aksara yang boleh disahkan oleh orang awam, pihak berkuasa
                maritim, dan agensi penguatkuasaan tanpa memerlukan log masuk.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-colors"
              >
                <IconQrCode className="h-4 w-4" />
                <span>Imbas Kod QR Lesen</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
