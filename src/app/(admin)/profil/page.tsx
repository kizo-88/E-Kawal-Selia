'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Alert, AlertTitle, AlertDescription } from '../../../components/ui/alert'
import { HelpNote } from '../../../components/ui/help-note'
import {
  IconBuilding,
  IconFileText,
  IconLock,
  IconMail,
  IconPhone,
  IconUser,
} from '../../../components/ui/icons'


export default function UserProfilePage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(null)

    if (newPassword.length < 12) {
      setPasswordError('Kata laluan baharu mestilah sekurang-kurangnya 12 aksara (Piawaian GP-03).')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Pengesahan kata laluan baharu tidak sepadan.')
      return
    }

    setPasswordSuccess('Kata laluan anda telah berjaya dikemas kini!')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Modul Profil GP-05
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Akaun Berdaftar</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            Profil Pengguna &amp; Tetapan Keselamatan
          </h1>
          <p className="text-xs text-slate-500">
            Maklumat syarikat berdaftar, perakuan Surat Aku-Janji (GP-06) dan pengurusan kata laluan.
          </p>
        </div>
      </div>

      {/* Profile Details & Company Info (GP-05) */}
      <Card variant="default">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <IconUser className="h-4 w-4 text-[#0b2545]" />
              <span>Maklumat Pengguna &amp; Wakil Syarikat</span>
            </CardTitle>
            <Badge variant="approved" size="sm" dot={true}>
              Akaun Disahkan (Aktif)
            </Badge>
          </div>
          <CardDescription>
            Maklumat berdaftar rasmi yang digunakan dalam semua permohonan pelesenan.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              id="profile-name"
              label="Nama Penuh Wakil"
              value="Ahmad Zulkifli bin Hashim"
              disabled
            />

            <Input
              id="profile-email"
              label="Alamat Emel Rasmi"
              value="ahmad.zulkifli@kemamansupply.com.my"
              disabled
              leadingIcon={<IconMail className="h-4 w-4" />}
            />

            <Input
              id="profile-company"
              label="Syarikat Berdaftar"
              value="Kemaman Supply Base Marine Services Sdn Bhd"
              disabled
              leadingIcon={<IconBuilding className="h-4 w-4" />}
            />

            <Input
              id="profile-ssm"
              label="No. Pendaftaran SSM"
              value="202401012345 (123456-X)"
              disabled
            />

            <div className="sm:col-span-2">
              <Input
                id="profile-phone"
                label="No. Telefon Pejabat / Bimbit"
                value="+609-863 1590 / +6012-3456789"
                disabled
                leadingIcon={<IconPhone className="h-4 w-4" />}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aku-Janji Undertaking Certificate Display (GP-06) */}
      <Card variant="default" className="border-amber-200 bg-amber-50/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-amber-950 flex items-center gap-2">
              <IconFileText className="h-4 w-4 text-amber-700" />
              <span>Surat Aku-Janji Pematuhan Berdaftar (GP-06)</span>
            </CardTitle>
            <Badge variant="gold" size="sm">
              Versi 2026.1 (Sah)
            </Badge>
          </div>
          <CardDescription className="text-amber-900">
            Perakuan persetujuan rasmi terhadap undang-undang kecil dan keselamatan Lembaga Pelabuhan Kemaman.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs">
          <div className="p-4 bg-white rounded-xl border border-amber-200 space-y-2 text-slate-700">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pb-2 border-b border-slate-100">
              <span>Tarikh Pengesahan: 12 Jan 2026, 10:14 PG</span>
              <span className="font-mono text-[#0b2545]">ID Aku-Janji: AJ-2026-00412</span>
            </div>
            <p className="text-slate-800 leading-relaxed italic">
              &quot;Syarikat dengan ini berikrar untuk sentiasa mematuhi tatacara keselamatan maritim,
              peraturan had pelabuhan, kod ISPS dan arahan pekeliling Lembaga Pelabuhan Kemaman.&quot;
            </p>
          </div>

          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => alert('Mencetak Sijil Perakuan Surat Aku-Janji (GP-06)')}
            >
              Cetak Sijil Aku-Janji
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Form (GP-03) */}
      <Card variant="default">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <IconLock className="h-4 w-4 text-[#0b2545]" />
            <span>Tukar Kata Laluan (Piawaian Keselamatan GP-03)</span>
          </CardTitle>
          <CardDescription>
            Kata laluan mestilah mengandungi minimum 12 aksara dengan gabungan huruf besar, angka dan simbol.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {passwordSuccess ? (
            <Alert variant="success">
              <AlertTitle>Berjaya</AlertTitle>
              <AlertDescription>{passwordSuccess}</AlertDescription>
            </Alert>
          ) : null}

          {passwordError ? (
            <Alert variant="danger">
              <AlertTitle>Ralat</AlertTitle>
              <AlertDescription>{passwordError}</AlertDescription>
            </Alert>
          ) : null}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <Input
              id="current-password"
              label="Kata Laluan Semasa"
              type="password"
              placeholder="••••••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="new-password"
                label="Kata Laluan Baharu (Min. 12 Aksara)"
                type="password"
                placeholder="••••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                helperText="Gabungan simbol, angka &amp; huruf besar."
              />

              <Input
                id="confirm-new-password"
                label="Sahkan Kata Laluan Baharu"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              Kemas Kini Kata Laluan
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Keselamatan Kata Laluan &amp; Sesi (GP-03, GP-22)"
        titleEn="Password Security &amp; Session Management"
        descriptionMs="Peringatan keselamatan akaun di bawah Pekeliling Keselamatan ICT (DKICT)."
        descriptionEn="Account security guidelines under the ICT Security Circular (DKICT)."
      />
    </div>
  )
}
