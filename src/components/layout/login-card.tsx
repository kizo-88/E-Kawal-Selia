'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Button,
  Input,
  Checkbox,
  Alert,
  AlertTitle,
  AlertDescription,
} from '../ui'
import {
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUser,
} from '../ui/icons'



export interface LoginCardProps {
  redirectUrl?: string
  className?: string
}

const DEMO_PRESETS = [
  {
    roleLabel: 'Super Admin',
    email: 'admin@lpkmn.gov.my',
    password: 'Admin@LPKmn2026!',
    badge: 'bg-rose-100 text-rose-800 border-rose-200',
  },
  {
    roleLabel: 'Pegawai Penilai (M/T)',
    email: 'reviewer@lpkmn.gov.my',
    password: 'Officer@LPKmn2026!',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    roleLabel: 'Pemohon Syarikat',
    email: 'user@kemamansupply.com.my',
    password: 'User@Kemaman2026!',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
  },
]

export function LoginCard({ redirectUrl = '/dashboard', className = '' }: LoginCardProps) {
  const router = useRouter()
  const [identity, setIdentity] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginFeedback, setLoginFeedback] = useState<{
    type: 'success' | 'danger'
    title: string
    message: string
  } | null>(null)

  const executeLogin = (emailToUse: string, passwordToUse: string) => {
    setIsLoading(true)
    setLoginFeedback(null)

    setTimeout(() => {
      setIsLoading(false)

      const normalizedEmail = emailToUse.trim().toLowerCase()

      // Check password complexity (min 12 chars per GP-03)

      if (passwordToUse.length < 12) {
        setLoginFeedback({
          type: 'danger',
          title: 'Kata Laluan Tidak Sah',
          message: 'Kata laluan mestilah sekurang-kurangnya 12 aksara (Dasar GP-03 DKICT).',
        })
        return
      }

      if (
        (normalizedEmail === 'admin@lpkmn.gov.my' && passwordToUse !== 'Admin@LPKmn2026!') ||
        (normalizedEmail === 'reviewer@lpkmn.gov.my' && passwordToUse !== 'Officer@LPKmn2026!') ||
        (normalizedEmail === 'user@kemamansupply.com.my' && passwordToUse !== 'User@Kemaman2026!')
      ) {
        setLoginFeedback({
          type: 'danger',
          title: 'Log Masuk Gagal',
          message: 'Kata laluan tidak sepadan dengan rekod akaun. Sila semak semula.',
        })
        return
      }

      // Success
      setLoginFeedback({
        type: 'success',
        title: 'Log Masuk Berjaya',
        message: `Selamat kembali. Menghubungkan ke ${redirectUrl}...`,
      })

      setTimeout(() => {
        router.push(redirectUrl)
      }, 500)
    }, 400)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!identity.trim() || !passwordValue) {
      setLoginFeedback({
        type: 'danger',
        title: 'Maklumat Tidak Lengkap',
        message: 'Sila masukkan emel / ID pengguna dan kata laluan yang sah.',
      })
      return
    }

    executeLogin(identity, passwordValue)
  }

  const handleSelectPreset = (email: string, pass: string) => {
    setIdentity(email)
    setPasswordValue(pass)
    executeLogin(email, pass)
  }

  return (
    <div
      className={`w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden ${className}`}
    >
      {/* Header Accent Bar */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#133e87] to-[#0b2545] p-6 text-white text-center relative">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-white p-1 shadow-md border border-white/40 mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo-lpkmn.png"
            alt="Logo Rasmi Lembaga Pelabuhan Kemaman"
            className="h-full w-full object-contain"
          />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Log Masuk Portal</h3>
        <p className="mt-1 text-xs text-slate-200">
          Sistem Pengurusan Pelesenan, Permit &amp; Kawalselia (e-Kawalselia)
        </p>
      </div>


      {/* Form Body */}
      <div className="p-6 sm:p-8 space-y-5">
        {/* Demo Fast Login Quick Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Akaun Demo Pantas (1-Klik):
            </span>
            <span className="text-[10px] text-slate-400">Pilih peranan</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {DEMO_PRESETS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleSelectPreset(p.email, p.password)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-bold border transition-all text-center hover:opacity-90 active:scale-95 cursor-pointer shadow-2xs ${p.badge}`}
              >
                {p.roleLabel}
              </button>
            ))}
          </div>
        </div>

        {loginFeedback ? (
          <Alert variant={loginFeedback.type === 'danger' ? 'danger' : 'success'}>
            <AlertTitle>{loginFeedback.title}</AlertTitle>
            <AlertDescription>{loginFeedback.message}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-identity"
            label="Emel / ID Pengguna"
            type="text"
            placeholder="admin@lpkmn.gov.my atau nama@syarikat.com.my"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            required
            leadingIcon={<IconMail className="h-4 w-4" />}
            autoComplete="username"
          />

          <div className="space-y-1">
            <Input
              id="login-password"
              label="Kata Laluan (Minima 12 Aksara)"
              type="password"
              placeholder="••••••••••••"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              required
              leadingIcon={<IconLock className="h-4 w-4" />}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
              <Link
                href="/bantuan"
                className="text-xs font-semibold text-[#0b2545] hover:text-[#133e87] hover:underline"
              >
                Lupa Kata Laluan?
              </Link>
            </div>
          </div>

          <div className="pt-1">
            <Checkbox
              id="remember-me"
              label="Ingat maklumat saya pada peranti ini"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full font-bold shadow-md"
            leadingIcon={<IconLock className="h-4 w-4" />}
          >
            Log Masuk
          </Button>
        </form>

        {/* New Registration CTA (GP-04) */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-3">
          <p className="text-xs text-slate-600">
            Belum mempunyai akaun syarikat atau pemaliman?
          </p>
          <Link
            href="/daftar"
            className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-[#0b2545] bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
          >
            <IconUser className="h-4 w-4 text-slate-600" />
            <span>Daftar Pengguna / Syarikat Baru</span>
          </Link>
        </div>

        {/* Security Assurance Badge (GP-03, GP-23) */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
          <IconShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Pengesahan Dua-Faktor (MFA) &amp; Sekuriti DKICT LPKmn</span>
        </div>
      </div>
    </div>
  )
}
