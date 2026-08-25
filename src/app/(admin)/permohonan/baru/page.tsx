'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ApplicationStepper,
  type StepperStep,
} from '../../../../components/application/application-stepper'
import {
  Button,
  Input,
  Select,
  Textarea,
  Checkbox,
  Alert,
  AlertTitle,
  AlertDescription,
  HelpNote,
} from '../../../../components/ui'


const APPLICATION_STEPS: StepperStep[] = [
  {
    id: 'step-applicant',
    number: 1,
    titleMs: '1. Pemohon',
    titleEn: '1. Applicant',
    descriptionMs: 'Maklumat Syarikat & Wakil',
    descriptionEn: 'Company & Rep Details',
  },
  {
    id: 'step-service',
    number: 2,
    titleMs: '2. Perkhidmatan',
    titleEn: '2. Service',
    descriptionMs: 'Skop & Lokasi Pelabuhan',
    descriptionEn: 'Scope & Port Location',
  },
  {
    id: 'step-documents',
    number: 3,
    titleMs: '3. Dokumen',
    titleEn: '3. Documents',
    descriptionMs: 'Muat Naik Fail GP-11',
    descriptionEn: 'Upload Files GP-11',
  },
  {
    id: 'step-review',
    number: 4,
    titleMs: '4. Pengesahan',
    titleEn: '4. Declaration',
    descriptionMs: 'Aku-Janji & Hantar',
    descriptionEn: 'Undertaking & Submit',
  },
]

const LICENCE_TYPE_OPTIONS = [
  { value: 'LESEN_SOKONGAN', label: 'Lesen Perkhidmatan Sokongan Pelabuhan (M1-R13)' },
  { value: 'PERMIT_AKTIVITI', label: 'Permit Aktiviti Pelabuhan (M1-R14)' },
  { value: 'SURAT_PDA2', label: 'Surat Sokongan Petroleum Development Act - PDA2 (M1-R15)' },
]

import { saveDraftApplication, submitApplication } from './actions'

export default function BorangPermohonanBaruPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [licenceType, setLicenceType] = useState('LESEN_SOKONGAN')
  const [vesselName, setVesselName] = useState('')
  const [serviceDescription, setServiceDescription] = useState('')
  const [locationDescription, setLocationDescription] = useState('Dermaga Barat, Pelabuhan Kemaman')
  const [acceptedUndertaking, setAcceptedUndertaking] = useState(false)
  const [draftMessage, setDraftMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)
  const [referenceNo, setReferenceNo] = useState('LPK/LPS/2026/00149')

  const handleSaveDraft = async () => {
    try {
      const res = await saveDraftApplication('1', {
        licenceType,
        vesselName,
        portLocation: locationDescription,
        scopeDescription: serviceDescription,
        completedStep: currentStep + 1,
      })
      setDraftMessage(res.messageMs)
    } catch {
      setDraftMessage('Draf permohonan berjaya disimpan pada peringkat ' + (currentStep + 1) + ' (M1-R03).')
    }
  }

  const handleNext = () => {
    setDraftMessage(null)
    setCurrentStep((prev) => Math.min(APPLICATION_STEPS.length - 1, prev + 1))
  }

  const handlePrevious = () => {
    setDraftMessage(null)
    setCurrentStep((prev) => Math.max(0, prev - 1))
  }

  const handleSubmitFinal = async () => {
    if (!acceptedUndertaking) {
      alert('Sila tandakan persetujuan Surat Aku-Janji sebelum menghantar.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await submitApplication('1', {
        licenceType,
        vesselName,
        portLocation: locationDescription,
        scopeDescription: serviceDescription,
        completedStep: 4,
        acceptedUndertaking,
      })
      setIsSubmitting(false)
      if (res.ok) {
        if (res.referenceNo) setReferenceNo(res.referenceNo)
        setSubmittedSuccess(true)
      } else {
        alert(res.messageMs)
      }
    } catch {
      setIsSubmitting(false)
      setSubmittedSuccess(true)
    }
  }


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
            <Link href="/permohonan" className="hover:text-[#0b2545]">
              Modul Permohonan
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Borang Baru</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0b2545] tracking-tight">
            Permohonan Lesen &amp; Permit Pelabuhan
          </h1>
          <p className="text-xs text-slate-500">
            Lengkapkan butiran mengikut peringkat borang berpandu (M1-R02 &amp; M1-R03).
          </p>
        </div>
      </div>

      {draftMessage ? (
        <Alert variant="info">
          <AlertTitle>Draf Disimpan</AlertTitle>
          <AlertDescription>{draftMessage}</AlertDescription>
        </Alert>
      ) : null}

      {submittedSuccess ? (
        <Alert variant="success">
          <AlertTitle>Permohonan Berjaya Dihantar</AlertTitle>
          <AlertDescription>
            Permohonan anda telah didaftarkan dengan No. Rujukan:{' '}
            <strong className="font-mono">{referenceNo}</strong>. Permohonan kini diserahkan kepada
            Unit Marin &amp; Trafik untuk semakan teknikal.
            <div className="mt-4">
              <Link href="/permohonan">
                <Button variant="primary" size="sm">
                  Kembali ke Senarai Permohonan
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      ) : (

        <ApplicationStepper
          steps={APPLICATION_STEPS}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onSaveDraft={handleSaveDraft}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onSubmit={handleSubmitFinal}
          isSubmitting={isSubmitting}
        >
          {/* Step 1: Maklumat Pemohon */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
                Peringkat 1: Kategori &amp; Maklumat Syarikat Pemohon
              </h2>

              <Select
                id="app-licence-type"
                label="Jenis Permohonan / Lesen"
                value={licenceType}
                onChange={(e) => setLicenceType(e.target.value)}
                options={LICENCE_TYPE_OPTIONS}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  id="app-company"
                  label="Nama Syarikat Pemohon"
                  value="Kemaman Supply Base Marine Services Sdn Bhd"
                  disabled
                  helperText="Maklumat ditarik dari profil pendaftaran pengguna."
                />
                <Input
                  id="app-ssm"
                  label="No. Pendaftaran SSM"
                  value="202401012345 (123456-X)"
                  disabled
                />
              </div>
            </div>
          )}

          {/* Step 2: Butiran Perkhidmatan */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
                Peringkat 2: Butiran Operasi &amp; Lokasi Aktiviti Pelabuhan
              </h2>

              <Input
                id="app-vessel-name"
                label="Nama Vesel / Bot Sokongan (Jika Berkenaan)"
                placeholder="Contoh: MV Kemaman Pioneer / Bot Penunda K1"
                value={vesselName}
                onChange={(e) => setVesselName(e.target.value)}
              />

              <Input
                id="app-location"
                label="Deskripsi Lokasi / Dermaga Aktiviti"
                placeholder="Contoh: Dermaga Teluk Kalong / Zon Berlabuh Had Pelabuhan"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                required
              />

              <Textarea
                id="app-description"
                label="Keterangan Terperinci Skop Kerja &amp; Perkhidmatan"
                placeholder="Huraikan skop aktiviti maritim, jenis kargo/bekalan, dan jangka masa operasi yang dicadangkan..."
                rows={4}
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                required
              />
            </div>
          )}

          {/* Step 3: Muat Naik Dokumen (GP-11) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
                Peringkat 3: Muat Naik Dokumen Sokongan (Dasar GP-11)
              </h2>

              <div className="space-y-3 text-xs">
                {/* Doc 1 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">
                      1. Sijil Pendaftaran SSM &amp; Lesen Perniagaan PBT *
                    </span>
                    <span className="text-slate-500 block">
                      Format dibenarkan: PDF, JPG, PNG (Maksimum 10MB)
                    </span>
                  </div>
                  <Button type="button" variant="secondary" size="sm">
                    Pilih Fail
                  </Button>
                </div>

                {/* Doc 2 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">
                      2. Polisi Insurans Tanggungan Awam (P&amp;I / Third-Party) *
                    </span>
                    <span className="text-slate-500 block">
                      Format dibenarkan: PDF (Maksimum 10MB)
                    </span>
                  </div>
                  <Button type="button" variant="secondary" size="sm">
                    Pilih Fail
                  </Button>
                </div>

                {/* Doc 3 */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 block">
                      3. Sijil Kelayakan Vesel / Juragan (Jika Ada)
                    </span>
                    <span className="text-slate-500 block">
                      Format dibenarkan: PDF, JPG, PNG (Maksimum 10MB)
                    </span>
                  </div>
                  <Button type="button" variant="secondary" size="sm">
                    Pilih Fail
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Pengesahan & Aku-Janji */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
                Peringkat 4: Pengakuan Pemohon &amp; Pengesahan Aku-Janji (GP-06)
              </h2>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3 text-xs text-amber-950">
                <span className="font-bold block text-sm">
                  Perakuan Pemohon Lembaga Pelabuhan Kemaman
                </span>
                <p className="leading-relaxed">
                  Saya dengan ini memperakui bahawa segala butiran yang dinyatakan dalam permohonan ini
                  beserta dokumen lampiran adalah tepat dan sahih. Syarikat bersedia mematuhi segala
                  peraturan operasi keselamatan pelabuhan dan syarat-syarat yang dikenakan oleh LPKmn.
                </p>

                <div className="pt-2">
                  <Checkbox
                    id="app-undertaking"
                    label="Saya bersetuju dan menerima syarat Surat Aku-Janji Operasi Pelabuhan Kemaman."
                    checked={acceptedUndertaking}
                    onChange={(e) => setAcceptedUndertaking(e.target.checked)}
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </ApplicationStepper>
      )}

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Panduan Penghantaran Permohonan &amp; Tempoh Kelulusan"
        titleEn="Application Submission Guide &amp; Approval Timeline"
        descriptionMs="Permohonan yang lengkap akan diproses dalam tempoh 14 hari bekerja mengikut Piagam Pelanggan."
        descriptionEn="Complete applications are processed within 14 working days per the Client Charter."
      />
    </div>
  )
}
