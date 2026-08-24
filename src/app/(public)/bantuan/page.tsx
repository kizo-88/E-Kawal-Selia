import Link from 'next/link'
import { Badge } from '../../../components/ui/badge'
import { HelpNote } from '../../../components/ui/help-note'
import { IconMail, IconPhone } from '../../../components/ui/icons'



const GUIDE_STEPS = [

  {
    id: 'step-1',
    stepNumber: '01',
    titleMs: 'Pendaftaran Akaun Pengguna / Syarikat',
    titleEn: 'User / Company Account Registration',
    descMs:
      'Lengkapkan borang pendaftaran dengan maklumat syarikat (SSM), wakil yang diberi kuasa, dan muat naik dokumen pengesahan. Akaun akan disahkan oleh Urus Setia LPKmn.',
    descEn:
      'Complete the registration form with company information (SSM), authorized representative details, and verification documents.',
  },
  {
    id: 'step-2',
    stepNumber: '02',
    titleMs: 'Pilih & Lengkapkan Borang Permohonan',
    titleEn: 'Select & Complete Application Form',
    descMs:
      'Pilih jenis permohonan yang diperlukan (Lesen Sokongan, Permit Aktiviti, atau PDA2). Borang interaktif berperingkat menyokong fungsi Simpan Draf untuk dilengkapkan kemudian.',
    descEn:
      'Select the desired application type (Support Licence, Activity Permit, or PDA2). The multi-step form supports Save Draft for completion anytime.',
  },
  {
    id: 'step-3',
    stepNumber: '03',
    titleMs: 'Muat Naik Dokumen & Pengakuan Aku-Janji',
    titleEn: 'Upload Documents & Aku-Janji Undertaking',
    descMs:
      'Muat naik dokumen sokongan mengikut format yang dibenarkan (PDF/JPG/PNG sehingga saiz ditetapkan). Buat pengesahan surat aku-janji pematuhan operasi pelabuhan.',
    descEn:
      'Upload supporting documents adhering to authorized formats and complete the operational compliance undertaking agreement.',
  },
  {
    id: 'step-4',
    stepNumber: '04',
    titleMs: 'Semakan Teknikal & Pengeluaran Sijil Digital',
    titleEn: 'Technical Evaluation & Digital Certificate Issuance',
    descMs:
      'Permohonan disemak oleh Unit Marin & Trafik serta diluluskan oleh Pengurusan LPKmn. Sijil digital rasmi beserta Kod QR boleh dimuat turun terus dari portal.',
    descEn:
      'Applications are evaluated by the Marine & Traffic Unit and approved by Management. Official digital certificates with QR codes can be downloaded directly.',
  },
]

export default function BantuanPage() {
  return (
    <div className="py-12 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0b2545] transition-colors">
            Laman Utama
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Pusat Bantuan &amp; Panduan</span>
        </div>

        {/* Page Header */}
        <div className="space-y-3">
          <Badge variant="primary" size="md">
            Meja Bantuan &amp; Manual
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b2545] tracking-tight">
            Panduan Pengguna Sistem e-Kawalselia
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Langkah demi langkah prosedur permohonan pelesenan, permit aktiviti, dan sokongan
            pelabuhan Lembaga Pelabuhan Kemaman.
          </p>
        </div>

        {/* Step-by-Step Workflow Guide */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Aliran Proses Permohonan Pelesenan
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {GUIDE_STEPS.map((step) => (
              <div
                key={step.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-amber-500 font-mono">
                    {step.stepNumber}
                  </span>
                  <Badge variant="secondary" size="sm">
                    Fasa {step.stepNumber}
                  </Badge>
                </div>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {step.titleMs}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.descMs}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* GP-22 Help Note */}
        <HelpNote
          titleMs="Nota Penting Pengendalian Format Dokumen"
          titleEn="Important Notes on Document Format Handling"
          descriptionMs="Sistem menerima fail berformat PDF, PNG, atau JPG sahaja dengan saiz maksimum 10MB setiap fail (Dasar GP-11)."
          descriptionEn="The system accepts PDF, PNG, or JPG formats only with a maximum size of 10MB per file (GP-11 Policy)."
          collapsible={false}
        />

        {/* Helpdesk Contact Channels (GP-17) */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Hubungi Meja Bantuan Urus Setia LPKmn
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <IconPhone className="h-4 w-4 text-[#0b2545]" />
                <span>Pertanyaan Telefon</span>
              </div>
              <p>+609-863 1590 / 1591</p>
              <p className="text-slate-500 text-[11px]">
                Waktu Operasi: 8:00 PG – 5:00 PTG (Ahad – Khamis)
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <IconMail className="h-4 w-4 text-[#0b2545]" />
                <span>E-mel Sokongan Teknikal</span>
              </div>
              <p>kawalselia@lpktg.gov.my</p>
              <p className="text-slate-500 text-[11px]">
                Maklum balas dalam tempoh 1 hari bekerja
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
