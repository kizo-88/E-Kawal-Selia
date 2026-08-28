'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Badge,
  Button,
  Card,
  HelpNote,
  QRCodeView,
} from '../ui'
import {
  IconAnchor,
  IconDownload,
  IconShieldCheck,
} from '../ui/icons'


export interface ApprovedActivity {
  id: string
  descriptionMs: string
  descriptionEn: string
}

export interface IssuedLicenceDetailData {
  id: string
  licenceNo: string
  categoryMs: string
  categoryEn: string
  applicationRefNo: string
  holderName: string
  companyRegistrationNo: string
  registeredAddress: string
  authorizedRepresentative: string
  vesselName?: string
  operatingZoning: string
  approvedActivities: ApprovedActivity[]
  issueDate: string
  effectiveDate: string
  expiryDate: string
  qrToken: string
  digitalSignatureRef: string
  approvingAuthorityName: string
  approvingAuthorityDesignationMs: string
  approvingAuthorityDesignationEn: string
  status: 'active' | 'expiring' | 'expired'
  statusLabelMs: string
  statusLabelEn: string
}

interface LicenceCertificateViewProps {
  initialLicence: IssuedLicenceDetailData
}

export function LicenceCertificateView({ initialLicence }: LicenceCertificateViewProps) {
  const [licence] = useState<IssuedLicenceDetailData>(initialLicence)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation Breadcrumb & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/pelesenan" className="hover:text-[#0b2545] transition-colors">
            Pelesenan &amp; Permit
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">{licence.licenceNo}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
          >
            Cetak Sijil
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            leadingIcon={<IconDownload className="h-4 w-4" />}
            onClick={() => alert(`Memuat turun salinan PDF rasmi bagi ${licence.licenceNo}`)}
          >
            Muat Turun PDF Rasmi
          </Button>
        </div>
      </div>

      {/* Official Government Licence Certificate Frame (M1-R11) */}
      <Card variant="default" className="border-2 border-slate-300 shadow-xl overflow-hidden bg-white p-6 sm:p-12 relative">
        {/* Decorative Certificate Border */}
        <div className="border-4 border-double border-[#0b2545]/30 p-6 sm:p-8 space-y-8 relative">
          {/* Watermark Logo Background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <IconAnchor className="h-96 w-96 text-[#0b2545]" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b-2 border-[#0b2545] pb-6">
            <div className="inline-flex p-2 rounded-2xl bg-white shadow-xs border border-slate-200 mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-lpkmn.png"
                alt="Logo Rasmi Lembaga Pelabuhan Kemaman"
                className="h-16 w-16 object-contain"
              />
            </div>
            <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500">
              Lembaga Pelabuhan Kemaman (LPKmn)
            </h2>

            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight uppercase">
              Sijil Perakuan Lesen Perkhidmatan Sokongan
            </h1>
            <p className="text-xs text-slate-600 font-medium max-w-lg mx-auto">
              Dikeluarkan di bawah Peruntukan Akta Lembaga Pelabuhan 1963 &amp; Undang-Undang Kecil
              Pelabuhan Kemaman
            </p>
          </div>

          {/* Certificate Identification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                No. Lesen Rasmi
              </span>
              <span className="font-mono text-base font-extrabold text-[#0b2545] block">
                {licence.licenceNo}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Status Penguatkuasaan
              </span>
              <Badge variant="approved" size="md" dot={true}>
                {licence.statusLabelMs}
              </Badge>
            </div>
          </div>

          {/* Certificate Body Content */}
          <div className="space-y-6 text-xs text-slate-800 leading-relaxed">
            <p className="text-center italic text-slate-600">
              Dengan ini diperakui bahawa syarikat yang dinamakan di bawah diberi kebenaran dan
              dilesenkan untuk menjalankan aktiviti perkhidmatan sokongan di dalam had Pelabuhan Kemaman:
            </p>

            <div className="space-y-3 bg-slate-50/50 p-5 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nama Pemegang Lesen / Syarikat
                </span>
                <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                  {licence.holderName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    No. Pendaftaran Syarikat (SSM)
                  </span>
                  <span className="font-mono font-bold text-slate-800 block mt-0.5">
                    {licence.companyRegistrationNo}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Wakil Diberi Kuasa
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5">
                    {licence.authorizedRepresentative}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Alamat Berdaftar Syarikat
                </span>
                <span className="text-slate-700 block mt-0.5">{licence.registeredAddress}</span>
              </div>
            </div>

            {/* Approved Scope */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 block">
                Skop Aktiviti &amp; Zon Operasi Diluluskan:
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                {licence.approvedActivities.map((act) => (
                  <li key={act.id}>{act.descriptionMs}</li>
                ))}
              </ul>
            </div>

            {/* Validity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Tarikh Mula Berkuat Kuasa
                </span>
                <span className="font-bold text-slate-900 block mt-0.5">{licence.effectiveDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  Tarikh Tamat Sah Laku
                </span>
                <span className="font-bold text-slate-900 block mt-0.5">{licence.expiryDate}</span>
              </div>
            </div>
          </div>

          {/* Certificate Footer: QR Verification & Digital Seal */}
          <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* QR Code Verification Widget */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="shrink-0">
                <QRCodeView
                  value={`http://localhost:3001/semak/${licence.qrToken}`}
                  size={96}
                  alt={`Kod QR Pengesahan Rasmi Lesen ${licence.licenceNo}`}
                />
              </div>
              <div className="space-y-1 text-[11px]">
                <span className="font-bold text-slate-900 block">Pengesahan Kod Keselamatan QR</span>
                <p className="text-slate-500 text-[10px]">
                  Imbas menggunakan telefon pintar untuk semakan ketulenan tanpa log masuk (X-R11 / X-R12).
                </p>
                <Link
                  href={`/semak/${licence.qrToken}`}
                  target="_blank"
                  className="font-mono text-[10px] font-bold text-[#0b2545] hover:underline block truncate"
                >
                  /semak/{licence.qrToken.slice(0, 16)}...
                </Link>
              </div>
            </div>


            {/* Approving Authority Signature Block */}
            <div className="text-center sm:text-right space-y-1 text-xs">
              <div className="flex items-center justify-center sm:justify-end gap-1 text-emerald-700 font-bold text-[11px]">
                <IconShieldCheck className="h-4 w-4" />
                <span>Ditandatangani Secara Digital</span>
              </div>
              <p className="font-extrabold text-slate-900">{licence.approvingAuthorityName}</p>
              <p className="text-[11px] text-slate-500">{licence.approvingAuthorityDesignationMs}</p>
              <span className="font-mono text-[9px] text-slate-400 block">
                Ref: {licence.digitalSignatureRef}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Maklumat Pengesahan Ketulenan Sijil Maritim"
        titleEn="Maritime Certificate Authenticity Information"
        descriptionMs="Sijil ini diiktiraf bagi kegunaan pelayaran dan operasi maritim di Had Pelabuhan Kemaman."
        descriptionEn="This certificate is recognized for navigation and maritime operations in Kemaman Port Limits."
      />
    </div>
  )
}
