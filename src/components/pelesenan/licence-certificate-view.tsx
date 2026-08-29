'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Button,
  HelpNote,
  QRCodeView,
} from '../ui'
import {
  IconDownload,
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

      {/* Official Government Licence Certificate Frame (M1-R11 / GP-13) */}
      <div id="certificate-print-area" className="bg-white border border-slate-800 p-2 shadow-2xl">
        <div className="border-2 border-slate-900 p-8 sm:p-12 relative overflow-hidden bg-white text-slate-900">
          
          {/* Subtle Background Seal Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-lpkmn.png"
              alt="Watermark Lembaga Pelabuhan Kemaman"
              className="w-[500px] h-[500px] object-contain"
            />
          </div>

          {/* Header: Ministry & Port Authority Letterhead */}
          <div className="text-center space-y-1.5 relative z-10">
            <div className="h-16 w-16 mx-auto flex items-center justify-center mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo-lpkmn.png"
                alt="Logo Rasmi Lembaga Pelabuhan Kemaman"
                className="h-full w-full object-contain"
              />
            </div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
              KEMENTERIAN PENGANGKUTAN MALAYSIA
            </h3>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950 font-serif">
              LEMBAGA PELABUHAN KEMAMAN
            </h2>
            <p className="text-[11px] text-slate-600 font-medium tracking-wide">
              AKTA LEMBAGA-LEMBAGA PELABUHAN 1969 &bull; PERATURAN-PERATURAN PELABUHAN KEMAMAN
            </p>

            <div className="w-full my-3 flex items-center justify-center gap-2">
              <div className="h-[1.5px] bg-slate-900 flex-1" />
              <span className="text-slate-900 text-[10px] font-serif font-bold tracking-widest px-3 uppercase">
                Dokumen Statutori Rasmi
              </span>
              <div className="h-[1.5px] bg-slate-900 flex-1" />
            </div>
          </div>

          {/* Statutory Title & Grant Statement */}
          <div className="text-center space-y-2 py-3 relative z-10">
            <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-slate-900 font-serif">
              {licence.categoryMs || 'PERAKUAN PELESENAN OPERASI PELABUHAN'}
            </h1>
            <p className="text-xs italic text-slate-700 max-w-2xl mx-auto leading-relaxed">
              Adalah dengan ini diperakui bahawa menurut kuasa yang diperuntukkan di bawah Seksyen 19,
              Akta Lembaga-Lembaga Pelabuhan 1969, Lembaga Pelabuhan Kemaman memberi kebenaran dan melesenkan kepada:
            </p>
          </div>

          {/* Clean Formal Ledger Table (NO AI Boxes) */}
          <div className="my-5 border-t-2 border-b-2 border-slate-900 text-xs divide-y divide-slate-300 relative z-10">
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                No. Pendaftaran Lesen
              </span>
              <span className="col-span-8 font-mono font-black text-sm text-slate-950">
                {licence.licenceNo}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                Nama Pemegang Lesen
              </span>
              <span className="col-span-8 font-bold text-sm text-slate-950">
                {licence.holderName}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                No. Pendaftaran Syarikat (SSM)
              </span>
              <span className="col-span-8 font-mono font-semibold text-slate-900">
                {licence.companyRegistrationNo}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                Kategori Pelesenan
              </span>
              <span className="col-span-8 font-semibold text-slate-900">
                {licence.categoryMs}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                Zon Operasi Dibenarkan
              </span>
              <span className="col-span-8 text-slate-900">
                {licence.operatingZoning || 'Dermaga Utama & Had Pelabuhan Kemaman (Zon Bebas Cukai)'}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                Tempoh Kuasa Sah Laku
              </span>
              <span className="col-span-8 font-bold text-slate-950">
                {licence.effectiveDate} sehingga {licence.expiryDate}
              </span>
            </div>
            <div className="py-2.5 grid grid-cols-12 gap-2 items-baseline">
              <span className="col-span-4 font-bold text-slate-700 uppercase tracking-wider">
                Pematuhan Keselamatan
              </span>
              <span className="col-span-8 text-slate-900 font-medium">
                Kod Antarabangsa ISPS, Dasar Keselamatan ICT &amp; Aku-Janji Integriti GP-06
              </span>
            </div>
          </div>

          {/* Statutory Conditions Clause */}
          <div className="text-[11px] text-slate-700 italic leading-relaxed text-justify space-y-1 pt-1 relative z-10">
            <p>
              <strong>SYARAT-SYARAT AM:</strong> Lesen ini tertakluk kepada pematuhan berterusan terhadap
              Akta Lembaga-Lembaga Pelabuhan 1969, Pekeliling Pelabuhan, serta syarat-syarat khusus yang
              ditetapkan oleh Lembaga Pelabuhan Kemaman dari semasa ke semasa. Kegagalan mematuhi peraturan
              boleh mengakibatkan pembatalan atau penggantungan serta-merta lesen ini.
            </p>
          </div>

          {/* Balanced Government Footer: Digital QR, Mohor Seal & General Manager Signature */}
          <div className="pt-8 grid grid-cols-12 gap-4 items-end text-xs relative z-10">
            {/* Left: Standard ISO/IEC 18004 QR Matrix */}
            <div className="col-span-5 flex items-center gap-3">
              <div className="shrink-0 border border-slate-400 p-1 bg-white">
                <QRCodeView
                  value={`https://ekawalselia.web.app/semak/${licence.qrToken}`}
                  size={96}
                  alt={`Kod QR Pengesahan Rasmi Lesen ${licence.licenceNo}`}
                />
              </div>
              <div className="space-y-1 text-[10px] text-slate-600">
                <span className="font-bold text-slate-900 block uppercase">Pengesahan Digital Rasmi</span>
                <span className="font-mono text-[9px] text-slate-500 block truncate">
                  ID: {licence.qrToken}
                </span>
                <span className="text-slate-500 block">Piawaian ISO/IEC 18004</span>
              </div>
            </div>

            {/* Middle: Official Mohor Stamp */}
            <div className="col-span-3 flex flex-col items-center justify-center text-center">
              <div className="w-18 h-18 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center p-1 text-center text-[8px] font-bold text-slate-600 uppercase tracking-tighter leading-tight">
                MOHOR RASMI<br />LEMBAGA PELABUHAN<br />KEMAMAN
              </div>
            </div>

            {/* Right: Official Signatory Block */}
            <div className="col-span-4 text-right space-y-1">
              <p className="text-[10px] text-slate-500 italic">Dikeluarkan di bawah meterai:</p>
              <div className="h-8" />
              <p className="font-bold text-slate-950 uppercase text-xs">
                {licence.approvingAuthorityName || 'PENGURUS BESAR'}
              </p>
              <p className="text-slate-700 text-[11px]">Lembaga Pelabuhan Kemaman</p>
              <p className="text-slate-500 text-[10px]">
                Tarikh Dikeluarkan: {licence.issueDate || licence.effectiveDate}
              </p>
            </div>
          </div>

        </div>
      </div>

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
