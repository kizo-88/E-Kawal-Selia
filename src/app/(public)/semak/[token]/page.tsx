import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, QRCodeView } from '../../../../components/ui'
import {
  IconShield,
  IconShieldCheck,
} from '../../../../components/ui/icons'

import { queryLicenceVerification } from './query'

interface VerificationPageProps {
  params: Promise<{ token: string }>
}

export default async function PublicVerificationPage({ params }: VerificationPageProps) {
  const { token } = await params
  const record = await queryLicenceVerification(token)
  const isFound = record.found

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
                <div className="h-14 w-14 rounded-xl bg-white p-1 shadow-sm border border-white/40 flex items-center justify-center shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/logo-lpkmn.png"
                    alt="Logo Lembaga Pelabuhan Kemaman"
                    className="h-full w-full object-contain"
                  />
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
                <Badge variant={isFound ? 'approved' : 'expired'} size="md" dot={true}>
                  {isFound ? record.statusLabelMs : 'Token Tidak Sah'}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {isFound ? (
              <>
                {/* Official Seal Banner */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <IconShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Dokumen Rasmi Sah Berdaftar</span>
                    <span>
                      Rekod ini disahkan wujud dan berkuat kuasa dalam Pangkalan Data Pelesenan Lembaga Pelabuhan Kemaman.
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
                <div className="p-5 bg-slate-100 rounded-xl text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-200">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                    <QRCodeView
                      value={`http://localhost:3001/semak/${record.qrToken}`}
                      size={110}
                      alt={`Kod QR Pengesahan ${record.licenceNo}`}
                    />
                    <div className="space-y-1 font-mono text-xs">
                      <span className="font-bold text-slate-900 block text-sm">Cap Tapak Keselamatan Kod QR:</span>
                      <span className="text-slate-600 block break-all text-[11px]">{record.qrToken}</span>
                      <span className="text-emerald-700 font-semibold text-[11px] block">✓ Disahkan Tulen oleh Lembaga Pelabuhan Kemaman</span>
                    </div>
                  </div>
                  <span className="italic text-[11px] text-slate-500 shrink-0">Piawaian Keselamatan Maritim X-R11 / X-R12</span>
                </div>


              </>
            ) : (
              <div className="py-8 text-center space-y-4">
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

                {/* Sample Verified Links For Demo */}
                <div className="pt-4 border-t border-slate-200 max-w-md mx-auto text-left space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Uji Contoh Sijil Sah Berdaftar:
                  </span>
                  <div className="flex flex-col gap-1.5 text-xs">
                    <Link
                      href="/semak/7e28a9b1c3d4e5f6a7b8c9d0e1f2a3b4"
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md font-mono text-[#0b2545] font-semibold flex items-center justify-between"
                    >
                      <span>LPK/LPS/2026/00142 (Lesen Sokongan)</span>
                      <span className="text-[10px] text-emerald-700 font-bold">Sah →</span>
                    </Link>
                    <Link
                      href="/semak/3f4e5d6c7b8a9012"
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-md font-mono text-[#0b2545] font-semibold flex items-center justify-between"
                    >
                      <span>LPK/PAP/2026/00065 (Permit Aktiviti)</span>
                      <span className="text-[10px] text-amber-700 font-bold">Amaran →</span>
                    </Link>
                  </div>
                </div>
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
