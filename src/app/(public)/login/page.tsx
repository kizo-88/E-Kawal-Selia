import Link from 'next/link'
import { LoginCard } from '../../../components/layout/login-card'
import { HelpNote } from '../../../components/ui/help-note'



const LOGIN_HELP_ITEMS = [
  {
    id: 'login-tip-1',
    textMs: 'Masukkan alamat emel rasmi syarikat yang telah didaftarkan dan disahkan oleh Urus Setia LPKmn.',
    textEn: 'Enter the official company email address registered and verified by the LPKmn Secretariat.',
  },
  {
    id: 'login-tip-2',
    textMs: 'Akaun akan dikunci secara automatik selepas 3 kali percubaan log masuk yang gagal (Piawaian Keselamatan GP-03).',
    textEn: 'Accounts are automatically locked after 3 consecutive failed login attempts (GP-03 Security Standard).',
  },
  {
    id: 'login-tip-3',
    textMs: 'Sesi log masuk tamat tempoh selepas 10 minit ketidakaktifan bagi melindungi integriti data pelesenan.',
    textEn: 'Login sessions expire after 10 minutes of inactivity to protect licensing data integrity.',
  },
]

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-100/60">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0b2545] transition-colors">
            Laman Utama
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Log Masuk</span>
        </div>

        {/* Login Card */}
        <LoginCard />

        {/* GP-22 Help Note for Data-Entry Page */}
        <HelpNote
          titleMs="Panduan Keselamatan Akses Pengguna"
          titleEn="User Access Security Guide"
          descriptionMs="Pematuhan kepada Dasar Keselamatan ICT Lembaga Pelabuhan Kemaman (DKICT LPKmn)."
          descriptionEn="Compliance with the Kemaman Port Authority ICT Security Policy (DKICT LPKmn)."
          items={LOGIN_HELP_ITEMS}
          collapsible={false}
        />

        {/* Quick Links */}
        <div className="text-center text-xs text-slate-500 space-y-2">
          <p>
            Perlukan bantuan teknikal segera? Hubungi{' '}
            <a
              href="mailto:kawalselia@lpkmn.gov.my"
              className="text-[#0b2545] font-semibold hover:underline"
            >
              kawalselia@lpkmn.gov.my
            </a>

          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <Link href="/dasar-privasi" className="hover:text-slate-600">
              Dasar Privasi
            </Link>
            <span>&bull;</span>
            <Link href="/bantuan" className="hover:text-slate-600">
              Soalan Lazim
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
