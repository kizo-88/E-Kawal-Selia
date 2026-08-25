import Link from 'next/link'
import { Badge } from '../../../../components/ui/badge'
import { Card, CardContent, CardHeader } from '../../../../components/ui/card'
import {
  IconAnchor,
  IconQrCode,
  IconShield,
  IconShieldCheck,
} from '../../../../components/ui/icons'


interface VerificationPageProps {
  params: Promise<{ token: string }>
}

export default async function PublicVerificationPage({ params }: VerificationPageProps) {
  const { token } = await params

  // Minimal public disclosure data fixture (X-R12)
  const isDemoValid = token.length >= 8
  const record = {
    licenceNo: 'LPK/LPS/2026/00142',
    categoryMs: 'Lesen Perkhidmatan Sokongan Pelabuhan (Pembekal Marin)',
    categoryEn: 'Port Support Service Licence (Marine Chandling)',
    holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
    validFrom: '01 Januari 2026',
    validUntil: '31 Disember 2026',
    status: 'active' as const,
    statusLabelMs: 'Sah & Berkuat Kuasa',
    statusLabelEn: 'Valid & Active',
    qrToken: token,
    issuingAuthorityMs: 'Lembaga Pelabuhan Kemaman (LPKmn)',
    issuingAuthorityEn: 'Kemaman Port Authority',
  }

  return (
    <div className="py-12 bg-slate-50 min-h-[85vh] flex flex-col justify-center">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0b2545] transition-colors">
            Laman Utama
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Semakan Ketulenan Sijil (QR)</span>
        </div>

        {/* Verification Card (X-R12) */}
        <Card variant="default" className="shadow-lg overflow-hidden border-slate-300">
          <CardHeader className="bg-gradient-to-r from-[#0b2545] to-[#133e87] text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <IconAnchor className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight">
                    Pengesahan Ketulenan Sijil Lesen
                  </h1>
                  <p className="text-xs text-slate-200">
                    Sistem e-Kawalselia Lembaga Pelabuhan Kemaman
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <Badge variant={isDemoValid ? 'approved' : 'expired'} size="md" dot={true}>
                  {isDemoValid ? record.statusLabelMs : 'Token Tidak Sah'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {isDemoValid ? (
              <>
                {/* Official Seal Banner */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <IconShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Dokumen Rasmi Sah Berdaftar</span>
                    <span>
                      Rekod ini disahkan wujud dalam Pangkalan Data Pelesenan Lembaga Pelabuhan Kemaman.
                    </span>
                  </div>
                </div>

                {/* Minimal Disclosure Details Table (X-R12) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Nombor Rujukan Sijil / Lesen
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 block">
                      {record.licenceNo}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Kategori Pelesenan
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      {record.categoryMs}
                    </span>
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Nama Pemegang Lesen / Syarikat
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      {record.holderName}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tarikh Mula Berkuat Kuasa
                    </span>
                    <span className="text-sm font-semibold text-slate-800 block">
                      {record.validFrom}
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Tarikh Tamat Tempoh Sah Laku
                    </span>
                    <span className="text-sm font-semibold text-slate-800 block">
                      {record.validUntil}
                    </span>
                  </div>
                </div>

                {/* Token Signature Footprint */}
                <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <IconQrCode className="h-4 w-4 text-slate-400" />
                    <span>Token Keselamatan: {record.qrToken}</span>
                  </div>
                  <span className="italic">Piawaian Keselamatan Maritim X-R11 / X-R12</span>
                </div>
              </>
            ) : (
              <div className="py-8 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-red-100 text-red-600">
                  <IconShield className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Token Pengesahan Tidak Sah atau Telah Tamat Tempoh
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Kod QR ini tidak sepadan dengan mana-mana sijil lesen atau permit aktif dalam sistem
                  e-Kawalselia LPKmn. Sila hubungi Urus Setia untuk semakan lanjut.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0b2545] hover:text-[#133e87] hover:underline"
          >
            <span>Kembali ke Laman Utama Portal</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
