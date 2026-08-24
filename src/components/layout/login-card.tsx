'use client'

import { useState, type FormEvent } from 'react'
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
  IconAnchor,
  IconLock,
  IconMail,
  IconShieldCheck,
  IconUser,
} from '../ui/icons'


export interface LoginCardProps {
  redirectUrl?: string
  className?: string
}

export function LoginCard({ redirectUrl = '/dashboard', className = '' }: LoginCardProps) {
  const [identity, setIdentity] = useState('')
  const [passwordValue, setPasswordValue] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoginError(null)

    if (!identity.trim() || !passwordValue) {
      setLoginError('Sila masukkan emel / ID pengguna dan kata laluan yang sah.')
      return
    }

    setIsLoading(true)
    // Simulated auth handshake - will be wired to Auth.js policy engine in Round 2
    setTimeout(() => {
      setIsLoading(false)
      // Display informational guidance for dev / UI preview
      setLoginError(`Sistem pengesahan sedang dalam proses integrasi fasa enjin dasar (Sasaran: ${redirectUrl}).`)
    }, 800)
  }


  return (
    <div
      className={`w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden ${className}`}
    >
      {/* Header Accent Bar */}
      <div className="bg-gradient-to-r from-[#0b2545] via-[#133e87] to-[#0b2545] p-6 text-white text-center relative">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-amber-400 mb-3">
          <IconAnchor className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Log Masuk Portal</h3>
        <p className="mt-1 text-xs text-slate-200">
          Sistem Pengurusan Pelesenan, Permit &amp; Kawalselia (e-Kawalselia)
        </p>
      </div>

      {/* Form Body */}
      <div className="p-6 sm:p-8 space-y-5">
        {loginError ? (
          <Alert variant="info">
            <AlertTitle>Makluman Log Masuk</AlertTitle>
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-identity"
            label="Emel / ID Pengguna"
            type="text"
            placeholder="nama@syarikat.com.my atau ID Pengguna"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            required
            leadingIcon={<IconMail className="h-4 w-4" />}
            autoComplete="username"
          />

          <div className="space-y-1">
            <Input
              id="login-password"
              label="Kata Laluan"
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
                href="/lupa-kata-laluan"
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
            href="/bantuan"
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
