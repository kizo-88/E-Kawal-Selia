'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FIXTURE_APPLICATION_DETAIL,
  type ApplicationDetailData,
} from './fixtures'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Textarea,
  Alert,
  AlertTitle,
  AlertDescription,
  HelpNote,
} from '../../../../components/ui'
import {
  IconBuilding,
  IconCheckCircle,
  IconClock,
  IconDownload,
  IconFileText,
  IconShip,
} from '../../../../components/ui/icons'

export default function ApplicationDetailPage() {
  const [data] = useState<ApplicationDetailData>(FIXTURE_APPLICATION_DETAIL)
  const [officerRemarks, setOfficerRemarks] = useState('')
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'success' | 'warning' | 'info' | 'danger'
    messageMs: string
    messageEn: string
  } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAction = (actionType: 'approve' | 'reject' | 'return' | 'refer') => {
    if ((actionType === 'reject' || actionType === 'return') && !officerRemarks.trim()) {
      setActionFeedback({
        type: 'danger',
        messageMs: 'Sila masukkan ulasan / sebab tindakan sebelum mengembalikan atau menolak permohonan.',
        messageEn: 'Please enter remarks / justification before returning or rejecting the application.',
      })
      return
    }

    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      if (actionType === 'approve') {
        setActionFeedback({
          type: 'success',
          messageMs: 'Permohonan telah diluluskan dan disalurkan ke peringkat Pengeluaran Sijil QR (M1-R11).',
          messageEn: 'Application has been approved and routed to QR Certificate Issuance stage (M1-R11).',
        })
      } else if (actionType === 'return') {
        setActionFeedback({
          type: 'warning',
          messageMs: 'Permohonan telah dikembalikan kepada pemohon untuk pembetulan dokumen / maklumat.',
          messageEn: 'Application has been returned to applicant for document / information amendment.',
        })
      } else if (actionType === 'reject') {
        setActionFeedback({
          type: 'danger',
          messageMs: 'Permohonan telah ditolak rasmi. Notifikasi penolakan dihantar kepada pemohon.',
          messageEn: 'Application has been officially rejected. Rejection notification sent to applicant.',
        })
      } else {
        setActionFeedback({
          type: 'info',
          messageMs: 'Permohonan telah dirujuk kepada Unit Teknikal berkaitan.',
          messageEn: 'Application has been referred to the relevant Technical Unit.',
        })
      }
      setOfficerRemarks('')
    }, 800)
  }


  const getStatusVariant = (status: ApplicationDetailData['currentStatus']) => {
    switch (status) {
      case 'approved':
        return 'approved'
      case 'in_review':
        return 'in_review'
      case 'returned':
        return 'warning'
      case 'rejected':
      case 'expired':
        return 'expired'
      case 'expiring':
        return 'expiring'
      default:
        return 'default'
    }
  }


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/permohonan" className="hover:text-[#0b2545] transition-colors">
          Modul Permohonan
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{data.referenceNo}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#0b2545] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {data.referenceNo}
            </span>
            <Badge variant={getStatusVariant(data.currentStatus)} size="sm" dot={true}>
              {data.currentStatusLabelMs}
            </Badge>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            {data.typeNameMs}
          </h1>
          <p className="text-xs text-slate-500">
            Dihantar pada: <strong>{data.submittedAt}</strong> &bull; Peringkat Semasa:{' '}
            <strong className="text-slate-800">{data.currentStageNameMs}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/permohonan">
            <Button variant="outline" size="sm">
              Kembali ke Senarai
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionFeedback ? (
        <Alert variant={actionFeedback.type === 'danger' ? 'danger' : actionFeedback.type === 'warning' ? 'warning' : 'success'}>
          <AlertTitle>Status Tindakan Pegawai</AlertTitle>
          <AlertDescription>{actionFeedback.messageMs}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form Details & Documents (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Applicant Details */}
          <Card variant="default">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconBuilding className="h-4 w-4 text-[#0b2545]" />
                <span>1. Maklumat Syarikat &amp; Pemohon</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                    Nama Syarikat
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">{data.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                    No. Pendaftaran SSM
                  </span>
                  <span className="font-mono font-semibold text-slate-800 block mt-0.5">{data.ssmNo}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                    Wakil Berdaftar
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{data.applicantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                    Hubungan &amp; Telefon
                  </span>
                  <span className="font-semibold text-slate-800 block mt-0.5">{data.phone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Service & Location Scope */}
          <Card variant="default">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconShip className="h-4 w-4 text-[#0b2545]" />
                <span>2. Butiran Operasi &amp; Had Pelabuhan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs space-y-3">
              {data.vesselName ? (
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                    Nama Vesel / Bot Terlibat
                  </span>
                  <span className="font-bold text-slate-900 block mt-0.5">{data.vesselName}</span>
                </div>
              ) : null}

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Lokasi / Zon Dermaga Aktiviti
                </span>
                <span className="font-semibold text-slate-800 block mt-0.5">{data.portLocation}</span>
              </div>

              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
                  Keterangan Skop Kerja
                </span>
                <p className="text-slate-700 leading-relaxed mt-0.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {data.scopeDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Uploaded Documents (GP-11) */}
          <Card variant="default">
            <CardHeader className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconFileText className="h-4 w-4 text-[#0b2545]" />
                <span>3. Dokumen Sokongan Dimuat Naik (GP-11)</span>
              </CardTitle>
              <Badge variant="primary" size="sm">
                {data.documents.length} Dokumen
              </Badge>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-100 text-xs">
              {data.documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 block">{doc.nameMs}</span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-mono text-slate-600">{doc.fileName}</span>
                      <span>&bull;</span>
                      <span>{doc.fileSize}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={doc.verificationStatus === 'verified' ? 'approved' : 'warning'}
                      size="sm"
                    >
                      {doc.verificationStatusLabelMs}
                    </Badge>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      leadingIcon={<IconDownload className="h-3.5 w-3.5" />}
                      onClick={() => alert(`Memuat turun fail ${doc.fileName}`)}
                    >
                      Buka
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Timeline History & Officer Review Action (1 Col) */}
        <div className="space-y-6">
          {/* Officer Action Panel (Round 3) */}
          <Card variant="default" className="border-[#0b2545]/30 bg-slate-50/50">
            <CardHeader className="bg-[#0b2545] text-white p-4 rounded-t-xl">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <IconCheckCircle className="h-4 w-4 text-amber-400" />
                <span>Panel Tindakan Pegawai Penilai</span>
              </CardTitle>
              <CardDescription className="text-slate-200 text-xs">
                Tindakan ulasan teknikal dan kelulusan peringkat semasa.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div>
                <Textarea
                  id="officer-remarks"
                  label="Ulasan / Syarat Tambahan Rasmi (G3)"
                  placeholder="Masukkan ulasan teknikal, syarat had pelabuhan, atau justifikasi pindaan/penolakan..."
                  rows={4}
                  value={officerRemarks}
                  onChange={(e) => setOfficerRemarks(e.target.value)}
                />
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  type="button"
                  variant="gold"
                  size="md"
                  className="w-full font-bold shadow-xs"
                  isLoading={isProcessing}
                  onClick={() => handleAction('approve')}
                  leadingIcon={<IconCheckCircle className="h-4 w-4" />}
                >
                  Luluskan Permohonan
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-amber-800 border-amber-300 hover:bg-amber-50"
                    disabled={isProcessing}
                    onClick={() => handleAction('return')}
                  >
                    Kembali Pindaan
                  </Button>

                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="w-full"
                    disabled={isProcessing}
                    onClick={() => handleAction('reject')}
                  >
                    Tolak
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full text-slate-700 text-xs"
                  disabled={isProcessing}
                  onClick={() => handleAction('refer')}
                >
                  Rujuk Unit Teknikal Lain
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Review Stage Timeline History */}
          <Card variant="default">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <IconClock className="h-4 w-4 text-[#0b2545]" />
                <span>Garis Masa &amp; Jejak Peringkat (SLA)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <ol className="relative border-l border-slate-200 ml-2 space-y-4">
                {data.stageLogs.map((log) => (
                  <li key={log.id} className="ml-4">
                    <div
                      className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border-2 border-white ${
                        log.status === 'completed'
                          ? 'bg-emerald-500'
                          : log.status === 'current'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-slate-300'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 block leading-tight">
                        {log.stageNameMs}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {log.officerName} &bull; {log.actionDate || `Sasaran SLA: ${log.slaDueAt}`}
                      </span>
                      {log.remarksMs ? (
                        <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 mt-1">
                          {log.remarksMs}
                        </p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Panduan Semakan Dokumen &amp; Piagam Pelanggan (GP-22)"
        titleEn="Document Verification &amp; Client Charter Guide"
        descriptionMs="Setiap peringkat semakan direkodkan dalam Jejak Audit bagi pematuhan ISO 9001 LPKmn."
        descriptionEn="Each review stage is recorded in the Audit Trail for LPKmn ISO 9001 compliance."
      />
    </div>
  )
}
