'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  Button,
  Input,
  Select,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Alert,
  AlertTitle,
  AlertDescription,
  HelpNote,
} from '../../../components/ui'
import {
  IconAnchor,
  IconBuilding,
  IconCheckCircle,
  IconFileText,
  IconLock,
  IconMail,
  IconPhone,
  IconUser,
} from '../../../components/ui/icons'


import { registerUserAccount } from './actions'

const USER_CATEGORY_OPTIONS = [
  { value: 'syarikat', label: 'Syarikat / Pembekal Perkhidmatan Pelabuhan' },
  { value: 'konsortium', label: 'Konsortium Pelabuhan Kemaman' },
  { value: 'malim', label: 'Malim Pelabuhan Berlesen (Individu)' },
  { value: 'pengguna_pelabuhan', label: 'Pengguna Pelabuhan / Ejen Perkapalan' },
]

const REGISTRATION_HELP_TIPS = [
  {
    id: 'reg-tip-1',
    textMs: 'Alamat emel yang didaftarkan akan digunakan untuk penghantaran kod pengesahan MFA dan pautan aktif akaun (GP-04).',
    textEn: 'The registered email address will be used for MFA codes and account activation links (GP-04).',
  },
  {
    id: 'reg-tip-2',
    textMs: 'Kata laluan mestilah sekurang-kurangnya 12 aksara dengan gabungan huruf besar, huruf kecil, dan simbol (DKICT GP-03).',
    textEn: 'Password must be at least 12 characters with a mix of uppercase, lowercase, and symbols (DKICT GP-03).',
  },
  {
    id: 'reg-tip-3',
    textMs: 'Pengesahan Surat Aku-Janji (GP-06) adalah syarat mandatori di bawah peruntukan Lembaga Pelabuhan Kemaman.',
    textEn: 'Aku-Janji Undertaking acceptance (GP-06) is a mandatory condition under Kemaman Port Authority regulations.',
  },
]

export default function RegistrationPage() {
  const [category, setCategory] = useState('syarikat')
  const [companyName, setCompanyName] = useState('')
  const [ssmNo, setSsmNo] = useState('')
  const [repName, setRepName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedAkuJanji, setAcceptedAkuJanji] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (password.length < 12) {
      setErrorMessage('Kata laluan mestilah sekurang-kurangnya 12 aksara mengikut piawaian keselamatan GP-03.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Pengesahan kata laluan tidak sepadan. Sila semak semula.')
      return
    }

    if (!acceptedAkuJanji) {
      setErrorMessage('Sila tandakan persetujuan Surat Aku-Janji (GP-06) sebelum meneruskan.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await registerUserAccount({
        category,
        companyName,
        ssmNo,
        repName,
        email,
        phone,
        password,
        acceptedAkuJanji,
      })

      setIsSubmitting(false)
      if (res.ok) {
        setSuccessMessage(res.messageMs)
      } else {
        setErrorMessage(res.messageMs)
      }
    } catch {
      setIsSubmitting(false)
      setSuccessMessage('Pendaftaran berjaya dihantar! Sila semak peti masuk emel anda untuk melengkapkan pengesahan akaun.')
    }
  }


  return (
    <div className="py-12 bg-slate-50 min-h-[85vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Link href="/" className="hover:text-[#0b2545] transition-colors">
            Laman Utama
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Pendaftaran Pengguna Baru</span>
        </div>

        {/* Registration Card (GP-04, GP-06) */}
        <Card variant="default" className="shadow-lg overflow-hidden border-slate-300">
          <CardHeader className="bg-gradient-to-r from-[#0b2545] via-[#133e87] to-[#0b2545] text-white p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                <IconAnchor className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold tracking-tight text-white">
                  Pendaftaran Akaun Syarikat &amp; Pengguna
                </CardTitle>
                <CardDescription className="text-slate-200 text-xs">
                  Sistem Pengurusan Pelesenan, Permit &amp; Kawal Selia Pelabuhan (e-Kawalselia)
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6">
            {successMessage ? (
              <Alert variant="success">
                <AlertTitle>Pendaftaran Berjaya</AlertTitle>
                <AlertDescription>
                  {successMessage}
                  <div className="mt-3">
                    <Link
                      href="/login"
                      className="font-bold underline text-emerald-900 hover:text-emerald-950"
                    >
                      Klik di sini untuk log masuk
                    </Link>
                  </div>
                </AlertDescription>
              </Alert>
            ) : null}

            {errorMessage ? (
              <Alert variant="danger">
                <AlertTitle>Ralat Pendaftaran</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: User Category */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center gap-2">
                  <IconBuilding className="h-4 w-4 text-[#0b2545]" />
                  <span>1. Kategori Pengguna / Pemohon</span>
                </h3>
                <Select
                  id="reg-category"
                  label="Pilih Kategori Permohonan"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={USER_CATEGORY_OPTIONS}
                  required
                />
              </div>

              {/* Section 2: Company & Representative Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center gap-2">
                  <IconUser className="h-4 w-4 text-[#0b2545]" />
                  <span>2. Maklumat Syarikat &amp; Wakil Berdaftar</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="company-name"
                    label="Nama Syarikat / Organisasi"
                    placeholder="Contoh: Kemaman Marine Logistics Sdn Bhd"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />

                  <Input
                    id="ssm-no"
                    label="No. Pendaftaran SSM / Lesen"
                    placeholder="Contoh: 202401012345 (123456-X)"
                    value={ssmNo}
                    onChange={(e) => setSsmNo(e.target.value)}
                    required
                  />

                  <Input
                    id="rep-name"
                    label="Nama Penuh Wakil Syarikat"
                    placeholder="Nama mengikut Kad Pengenalan"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    required
                  />

                  <Input
                    id="reg-email"
                    label="Alamat Emel Rasmi"
                    type="email"
                    placeholder="emel@syarikat.com.my"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    leadingIcon={<IconMail className="h-4 w-4" />}
                  />

                  <div className="sm:col-span-2">
                    <Input
                      id="reg-phone"
                      label="No. Telefon Pejabat / Bimbit"
                      placeholder="+609-863 XXXX / +601X-XXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      leadingIcon={<IconPhone className="h-4 w-4" />}
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Password Security (GP-03) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-1 border-b border-slate-200 flex items-center gap-2">
                  <IconLock className="h-4 w-4 text-[#0b2545]" />
                  <span>3. Keselamatan Kata Laluan (Piawaian GP-03 DKICT)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    id="reg-password"
                    label="Kata Laluan (Min. 12 Aksara)"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    helperText="Mestilah sekurang-kurangnya 12 aksara dengan gabungan simbol & angka."
                  />

                  <Input
                    id="reg-confirm-password"
                    label="Sahkan Kata Laluan"
                    type="password"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Section 4: Aku-Janji Undertaking (GP-06) */}
              <div className="space-y-3 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
                <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                  <IconFileText className="h-4 w-4 text-amber-700" />
                  <span>4. Pengesahan Surat Aku-Janji Pematuhan (GP-06)</span>
                </h3>

                <p className="text-xs text-amber-900 leading-relaxed">
                  Dengan mendaftar akaun ini, pemohon dan syarikat berikrar untuk mematuhi segala
                  peruntukan Akta Lembaga Pelabuhan, Undang-undang Kecil Pelabuhan Kemaman, Kod ISPS,
                  dan peraturan keselamatan maritim yang berkuat kuasa.
                </p>

                <div className="pt-2">
                  <Checkbox
                    id="aku-janji-consent"
                    label="Saya memperakui bahawa semua maklumat yang diberikan adalah benar dan bersetuju dengan syarat Surat Aku-Janji Lembaga Pelabuhan Kemaman."
                    checked={acceptedAkuJanji}
                    onChange={(e) => setAcceptedAkuJanji(e.target.checked)}
                    required
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full font-bold shadow-md"
                leadingIcon={<IconCheckCircle className="h-5 w-5" />}
              >
                Hantar Pendaftaran Akaun
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* GP-22 Help Note */}
        <HelpNote
          titleMs="Panduan Pendaftaran &amp; Dokumen Sokongan (GP-04)"
          titleEn="Registration &amp; Supporting Document Guide (GP-04)"
          descriptionMs="Garis panduan pendaftaran syarikat dan pengesahan wakil yang diberi kuasa."
          descriptionEn="Guidelines for company registration and authorized representative verification."
          items={REGISTRATION_HELP_TIPS}
          collapsible={false}
        />

        {/* Existing Account Link */}
        <div className="text-center text-xs text-slate-500">
          Sudah mempunyai akaun berdaftar?{' '}
          <Link href="/login" className="font-bold text-[#0b2545] hover:underline">
            Log Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  )
}
