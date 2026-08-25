import { Card, CardContent } from '../ui/card'
import {
  IconAlertTriangle,
  IconCheckCircle,
  IconFileText,
  IconShieldCheck,
  IconShip,
} from '../ui/icons'

export interface SummaryCardItem {
  id: string
  labelMs: string
  labelEn: string
  value: string | number
  subtextMs: string
  subtextEn: string
  changeType: 'increase' | 'neutral' | 'alert'
  icon: 'file' | 'check' | 'alert' | 'ship' | 'shield'
}

export interface DashboardSummaryCardsProps {
  role: 'superadmin' | 'approver' | 'applicant'
  className?: string
}

export function DashboardSummaryCards({ role, className = '' }: DashboardSummaryCardsProps) {
  const getCardsForRole = (): SummaryCardItem[] => {
    if (role === 'applicant') {
      return [
        {
          id: 'my-apps',
          labelMs: 'Permohonan Dihantar',
          labelEn: 'Submitted Applications',
          value: 8,
          subtextMs: '2 permohonan dalam semakan',
          subtextEn: '2 applications under review',
          changeType: 'neutral',
          icon: 'file',
        },
        {
          id: 'active-licences',
          labelMs: 'Lesen & Permit Aktif',
          labelEn: 'Active Licences & Permits',
          value: 5,
          subtextMs: 'Sah laku sehingga akhir 2026',
          subtextEn: 'Valid until end of 2026',
          changeType: 'increase',
          icon: 'ship',
        },
        {
          id: 'expiring-soon',
          labelMs: 'Tamat Tempoh < 30 Hari',
          labelEn: 'Expiring Soon < 30 Days',
          value: 1,
          subtextMs: 'Perlu pembaharuan segera',
          subtextEn: 'Needs urgent renewal',
          changeType: 'alert',
          icon: 'alert',
        },
        {
          id: 'mfa-status',
          labelMs: 'Status Keselamatan Akaun',
          labelEn: 'Account Security Status',
          value: 'MFA Aktif',
          subtextMs: 'Dilindungi Kod Pengesahan TOTP',
          subtextEn: 'Protected by TOTP 2FA',
          changeType: 'increase',
          icon: 'shield',
        },
      ]
    }

    if (role === 'approver') {
      return [
        {
          id: 'queue-total',
          labelMs: 'Giliran Menunggu Kelulusan',
          labelEn: 'Pending Approval Queue',
          value: 14,
          subtextMs: 'Unit Marin & Trafik (M/T)',
          subtextEn: 'Marine & Traffic Unit',
          changeType: 'alert',
          icon: 'file',
        },
        {
          id: 'approved-month',
          labelMs: 'Kelulusan Bulan Ini',
          labelEn: 'Approved This Month',
          value: 42,
          subtextMs: '98% memenuhi Piagam Pelanggan',
          subtextEn: '98% met SLA',
          changeType: 'increase',
          icon: 'check',
        },
        {
          id: 'sla-warning',
          labelMs: 'Amaran SLA (< 3 Hari)',
          labelEn: 'SLA Warning (< 3 Days)',
          value: 3,
          subtextMs: 'Perlu ulasan teknikal segera',
          subtextEn: 'Needs urgent review',
          changeType: 'alert',
          icon: 'alert',
        },
        {
          id: 'licences-issued',
          labelMs: 'Lesen Dikeluarkan (YTD)',
          labelEn: 'Licences Issued (YTD)',
          value: 186,
          subtextMs: 'Lesen Sokongan & Permit',
          subtextEn: 'Support Licences & Permits',
          changeType: 'neutral',
          icon: 'ship',
        },
      ]
    }

    // Default: Super Admin
    return [
      {
        id: 'total-apps',
        labelMs: 'Jumlah Permohonan Sistem',
        labelEn: 'Total System Applications',
        value: '1,428',
        subtextMs: '+12% berbanding bulan lalu',
        subtextEn: '+12% vs last month',
        changeType: 'increase',
        icon: 'file',
      },
      {
        id: 'active-users',
        labelMs: 'Pengguna & Syarikat Berdaftar',
        labelEn: 'Registered Users & Companies',
        value: '312',
        subtextMs: '28 syarikat baharu suku ini',
        subtextEn: '28 new companies this quarter',
        changeType: 'increase',
        icon: 'shield',
      },
      {
        id: 'audit-logs',
        labelMs: 'Jejak Audit 30 Hari',
        labelEn: 'Audit Logs (30 Days)',
        value: '18,940',
        subtextMs: 'Penyimpanan automatik 365 hari',
        subtextEn: '365 days retention policy',
        changeType: 'neutral',
        icon: 'ship',
      },
      {
        id: 'sla-compliance',
        labelMs: 'Pematuhan SLA Pelabuhan',
        labelEn: 'Port SLA Compliance',
        value: '99.4%',
        subtextMs: 'Piawaian ISO 9001 / ISMS LPKmn',
        subtextEn: 'ISO 9001 / ISMS standards',
        changeType: 'increase',
        icon: 'check',
      },
    ]
  }

  const cards = getCardsForRole()

  const renderIcon = (type: SummaryCardItem['icon']) => {
    switch (type) {
      case 'file':
        return <IconFileText className="h-6 w-6 text-blue-600" />
      case 'check':
        return <IconCheckCircle className="h-6 w-6 text-emerald-600" />
      case 'alert':
        return <IconAlertTriangle className="h-6 w-6 text-amber-600" />
      case 'ship':
        return <IconShip className="h-6 w-6 text-[#0b2545]" />
      case 'shield':
        return <IconShieldCheck className="h-6 w-6 text-indigo-600" />
    }
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {cards.map((card) => (
        <Card key={card.id} variant="default" className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {card.labelMs}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                {card.value}
              </span>
              <span
                className={`text-[11px] font-medium block ${
                  card.changeType === 'alert'
                    ? 'text-amber-700'
                    : card.changeType === 'increase'
                      ? 'text-emerald-700'
                      : 'text-slate-500'
                }`}
              >
                {card.subtextMs}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100/80 shrink-0 border border-slate-200/60">
              {renderIcon(card.icon)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
