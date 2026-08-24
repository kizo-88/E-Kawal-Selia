'use client'

import { useState } from 'react'
import { DashboardSummaryCards } from '../../../components/dashboard/dashboard-summary-cards'
import { HistogramChart } from '../../../components/dashboard/histogram-chart'
import { WorkNotificationsPanel } from '../../../components/dashboard/work-notifications-panel'
import { LoginSummaryCard } from '../../../components/dashboard/login-summary-card'
import { RecentApplicationsTable } from '../../../components/dashboard/recent-applications-table'
import { HelpNote } from '../../../components/ui/help-note'
import { Badge } from '../../../components/ui/badge'

const DASHBOARD_HELP_ITEMS = [
  {
    id: 'dash-help-1',
    textMs: 'Paparan statistik dan giliran tugasan dikemas kini secara automatik berdasarkan tahap akses peranan semasa (GP-15).',
    textEn: 'Statistics display and work queue update automatically based on current role access level (GP-15).',
  },
  {
    id: 'dash-help-2',
    textMs: 'Klik pada mana-mana lajur pada senarai permohonan untuk menyusun rekod (ASC/DESC), atau gunakan penapis suku tahun (GP-12).',
    textEn: 'Click any column header on the application list to sort records (ASC/DESC), or use quarter filters (GP-12).',
  },
  {
    id: 'dash-help-3',
    textMs: 'Laporan statistik dan histogram boleh dieksport dalam format dokumen rasmi melalui toolbar eksport.',
    textEn: 'Statistical reports and histograms can be exported into official document formats via the export toolbar.',
  },
]

export default function DashboardPage() {
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'approver' | 'applicant'>('superadmin')

  const roleTitles = {
    superadmin: 'Panel Eksekutif & Kawalselia Portal (Super Admin)',
    approver: 'Panel Penilaian & Kelulusan (Unit Marin & Trafik)',
    applicant: 'Portal Pemohon & Pengurusan Lesen Syarikat',
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Top Heading & Role Previewer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="gold" size="sm">
              Sistem e-Kawalselia
            </Badge>
            <span className="text-xs text-slate-500 font-medium">LPKmn 02/2026</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight">
            {roleTitles[selectedRole]}
          </h1>
          <p className="text-xs text-slate-500">
            Ringkasan operasi, pemantauan piagam pelanggan, dan status pelesenan pelabuhan semasa.
          </p>
        </div>

        {/* Access Level Selector (GP-15 Demonstration) */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl text-xs">
          <span className="font-bold text-slate-700 whitespace-nowrap">Simulasi Peranan:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSelectedRole('superadmin')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                selectedRole === 'superadmin'
                  ? 'bg-[#0b2545] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('approver')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                selectedRole === 'approver'
                  ? 'bg-[#0b2545] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pelulus M/T
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('applicant')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                selectedRole === 'applicant'
                  ? 'bg-[#0b2545] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pemohon Syarikat
            </button>
          </div>
        </div>
      </div>

      {/* 1. Summary Metric Cards (GP-15) */}
      <DashboardSummaryCards role={selectedRole} />

      {/* 2. Graphical Summary & Histogram (GP-15 Priority) */}
      <HistogramChart />

      {/* 3. Work Notifications & Quick Links (GP-15) */}
      <WorkNotificationsPanel role={selectedRole} />

      {/* 4. Recent Applications Integrated Table (GP-12 & GP-15) */}
      <RecentApplicationsTable />

      {/* 5. Login Summary Card (GP-15) */}
      <LoginSummaryCard />

      {/* 6. Help Note Component (GP-22) */}
      <HelpNote
        titleMs="Panduan Navigasi Dashboard &amp; Pengurusan Sesi"
        titleEn="Dashboard Navigation &amp; Session Management Guide"
        descriptionMs="Peringatan keselamatan dan panduan penggunaan modul kawalselia Lembaga Pelabuhan Kemaman."
        descriptionEn="Security reminders and usage guidelines for the Kemaman Port Authority regulatory module."
        items={DASHBOARD_HELP_ITEMS}
        collapsible={true}
        defaultOpen={false}
      />
    </div>
  )
}
