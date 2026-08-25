import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  IconAlertTriangle,
  IconArrowRight,
  IconCheckCircle,
  IconFileText,
  IconQrCode,
  IconShip,
} from '../ui/icons'

export interface WorkNotificationItem {
  id: string
  titleMs: string
  titleEn: string
  type: 'urgent' | 'info' | 'success'
  time: string
  referenceNo?: string
  link: string
}

export interface QuickLinkItem {
  id: string
  labelMs: string
  labelEn: string
  href: string
  icon: 'file' | 'ship' | 'qr' | 'audit'
}

export interface WorkNotificationsPanelProps {
  role: 'superadmin' | 'approver' | 'applicant'
  className?: string
}

export function WorkNotificationsPanel({ role, className = '' }: WorkNotificationsPanelProps) {
  const getTasksForRole = (): WorkNotificationItem[] => {
    if (role === 'applicant') {
      return [
        {
          id: 'app-task-1',
          titleMs: 'Tindakan Diperlukan: Muat Naik Semula Polisi Insurans Kapal',
          titleEn: 'Action Required: Reupload Vessel Insurance Policy',
          type: 'urgent',
          time: '3 jam lalu',
          referenceNo: 'LPK/LPS/2026/00140',
          link: '/permohonan',
        },
        {
          id: 'app-task-2',
          titleMs: 'Permohonan Permit Aktiviti Diluluskan (PAP/2026/0071)',
          titleEn: 'Activity Permit Approved',
          type: 'success',
          time: 'Semalam',
          referenceNo: 'LPK/PAP/2026/0071',
          link: '/pelesenan',
        },
        {
          id: 'app-task-3',
          titleMs: 'Peringatan: Lesen Sokongan LPK/LPS/2025/0099 Tamat Tempoh dalam 25 Hari',
          titleEn: 'Reminder: Support Licence Expiring in 25 Days',
          type: 'info',
          time: '2 hari lalu',
          referenceNo: 'LPK/LPS/2025/0099',
          link: '/permohonan/baru',
        },
      ]
    }

    if (role === 'approver') {
      return [
        {
          id: 'appr-task-1',
          titleMs: 'Semakan Teknikal: Permohonan Lesen Sokongan Pembekal Marin',
          titleEn: 'Technical Review: Marine Supplier Support Licence Application',
          type: 'urgent',
          time: '30 min lalu',
          referenceNo: 'LPK/LPS/2026/00148',
          link: '/permohonan',
        },
        {
          id: 'appr-task-2',
          titleMs: 'Pengesahan Lokasi Had Pelabuhan: Permit Aktiviti Menyelam',
          titleEn: 'Port Limits Location Verification: Diving Activity Permit',
          type: 'urgent',
          time: '2 jam lalu',
          referenceNo: 'LPK/PAP/2026/0088',
          link: '/permohonan',
        },
        {
          id: 'appr-task-3',
          titleMs: 'Ulasan Sokongan PDA2: Kontraktor Luar Pesisir Kemaman',
          titleEn: 'PDA2 Support Remarks: Offshore Contractor',
          type: 'info',
          time: '1 hari lalu',
          referenceNo: 'LPK/PDA2/2026/0019',
          link: '/permohonan',
        },
      ]
    }

    // Default: Super Admin
    return [
      {
        id: 'admin-task-1',
        titleMs: 'Pendaftaran Syarikat Baru Menunggu Pengesahan Urus Setia (3 Syarikat)',
        titleEn: 'New Company Registrations Pending Verification (3 Companies)',
        type: 'urgent',
        time: '15 min lalu',
        link: '/dashboard',
      },
      {
        id: 'admin-task-2',
        titleMs: 'Permohonan Tukar Nilai Rujukan / Dropdown (GP-20 Change Request)',
        titleEn: 'Lookup Value Change Request (GP-20)',
        type: 'info',
        time: '4 jam lalu',
        link: '/tetapan',
      },
      {
        id: 'admin-task-3',
        titleMs: 'Audit Retention Purge Berjaya Dilaksanakan (GP-18)',
        titleEn: 'Audit Retention Purge Executed Successfully (GP-18)',
        type: 'success',
        time: 'Semalam',
        link: '/audit',
      },
    ]
  }

  const quickLinks: QuickLinkItem[] = [
    {
      id: 'ql-1',
      labelMs: 'Permohonan Baru',
      labelEn: 'New Application',
      href: '/permohonan/baru',
      icon: 'file',
    },
    {
      id: 'ql-2',
      labelMs: 'Semakan Status & Senarai',
      labelEn: 'Status Tracking & List',
      href: '/permohonan',
      icon: 'ship',
    },
    {
      id: 'ql-3',
      labelMs: 'Semakan QR Awam',
      labelEn: 'Public QR Check',
      href: '/',
      icon: 'qr',
    },
    {
      id: 'ql-4',
      labelMs: 'Repositori Pekeliling',
      labelEn: 'Circular Repository',
      href: '/pekeliling',
      icon: 'audit',
    },
  ]

  const tasks = getTasksForRole()

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${className}`}>
      {/* Work Tasks / Notifications (GP-15) */}
      <Card variant="default" className="lg:col-span-8">
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">
              Tugasan Menunggu Tindakan (Work Queue)
            </CardTitle>
            <Badge variant="danger" size="sm">
              {tasks.length} Tindakan
            </Badge>
          </div>
          <Link
            href="/permohonan"
            className="text-xs font-semibold text-[#0b2545] hover:underline flex items-center gap-1"
          >
            <span>Buka Semua</span>
            <IconArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-slate-100">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {task.type === 'urgent' ? (
                    <IconAlertTriangle className="h-4 w-4 text-red-600" />
                  ) : task.type === 'success' ? (
                    <IconCheckCircle className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <IconFileText className="h-4 w-4 text-blue-600" />
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-900 leading-snug">
                    {task.titleMs}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    {task.referenceNo ? (
                      <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-1 rounded">
                        {task.referenceNo}
                      </span>
                    ) : null}
                    <span>&bull;</span>
                    <span>{task.time}</span>
                  </div>
                </div>
              </div>

              <Link
                href={task.link}
                className="shrink-0 px-2.5 py-1 text-xs font-semibold text-[#0b2545] bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
              >
                Tindakan
              </Link>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Links / Pautan Pantas (GP-15) */}
      <Card variant="default" className="lg:col-span-4 flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base font-bold">Pautan Pantas (Quick Links)</CardTitle>
        </CardHeader>

        <CardContent className="p-4 space-y-2">
          {quickLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-xs font-bold text-slate-800 group"
            >
              <span className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-md bg-[#0b2545]/10 text-[#0b2545] group-hover:bg-[#0b2545] group-hover:text-white transition-colors">
                  {link.icon === 'file' ? (
                    <IconFileText className="h-4 w-4" />
                  ) : link.icon === 'ship' ? (
                    <IconShip className="h-4 w-4" />
                  ) : (
                    <IconQrCode className="h-4 w-4" />
                  )}
                </span>
                <span>{link.labelMs}</span>
              </span>
              <IconArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0b2545] group-hover:translate-x-0.5 transition-transform" />
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
