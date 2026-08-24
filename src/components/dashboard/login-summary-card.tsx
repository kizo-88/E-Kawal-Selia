import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { IconCheckCircle, IconLock, IconShieldCheck, IconUser } from '../ui/icons'

export interface LoginSummaryCardProps {
  lastLoginAt?: string
  lastLoginIp?: string
  sessionExpiresInMinutes?: number
  mfaEnabled?: boolean
  userName?: string
  userEmail?: string
  className?: string
}

export function LoginSummaryCard({
  lastLoginAt = '24 Ogos 2026, 09:15:22 PG',
  lastLoginIp = '103.14.28.45 (Kemaman, MY)',
  sessionExpiresInMinutes = 10,
  mfaEnabled = true,
  userName = 'En. Ahmad Zulkifli (Pegawai Penilai)',
  userEmail = 'ahmad.zulkifli@lpktg.gov.my',
  className = '',
}: LoginSummaryCardProps) {
  return (
    <Card variant="default" className={`overflow-hidden ${className}`}>
      <CardHeader className="bg-slate-50 border-b border-slate-100 py-3.5 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconLock className="h-4 w-4 text-[#0b2545]" />
          <CardTitle className="text-xs sm:text-sm font-bold">
            Ringkasan Sesi &amp; Keselamatan Log Masuk (GP-15)
          </CardTitle>
        </div>
        <Badge variant="success" size="sm" dot={true}>
          Sesi Aktif &amp; Sah
        </Badge>
      </CardHeader>

      <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* User Snapshot */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Pengguna Semasa
          </span>
          <div className="flex items-center gap-2">
            <IconUser className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="font-bold text-slate-900 truncate">{userName}</span>
          </div>
          <span className="text-[11px] text-slate-500 block truncate">{userEmail}</span>
        </div>

        {/* Last Login Info */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Log Masuk Terakhir
          </span>
          <span className="font-semibold text-slate-900 block">{lastLoginAt}</span>
          <span className="text-[11px] text-slate-500 block">IP: {lastLoginIp}</span>
        </div>

        {/* MFA Status (GP-03, M5-R05) */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Pengesahan 2-Faktor (MFA)
          </span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <IconShieldCheck className="h-4 w-4 shrink-0" />
            <span>{mfaEnabled ? 'TOTP Aktif & Dilindungi' : 'Tidak Aktif'}</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Piawaian Keselamatan DKICT</span>
        </div>

        {/* Session Timeout (GP-03) */}
        <div className="space-y-1">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Tamat Masa Sesi Automatik
          </span>
          <div className="flex items-center gap-1.5 text-slate-800 font-bold">
            <IconCheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
            <span>{sessionExpiresInMinutes} Minit (Konfigurasi Admin)</span>
          </div>
          <span className="text-[11px] text-slate-500 block">Kunci automatik jika tiada aktiviti</span>
        </div>
      </CardContent>
    </Card>
  )
}
