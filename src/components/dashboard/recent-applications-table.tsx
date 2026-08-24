'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DataTable } from '../table/data-table'
import type { TableColumnDef, TableFilterState, TableSortState } from '../table/types'
import { Badge } from '../ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { IconArrowRight } from '../ui/icons'

export interface ApplicationRow {
  id: string
  referenceNo: string
  applicantName: string
  serviceTypeMs: string
  serviceTypeEn: string
  submittedDate: string
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  year: string
  status: 'approved' | 'in_review' | 'submitted' | 'rejected' | 'expiring'
  statusLabelMs: string
  statusLabelEn: string
}

export const FIXTURE_APPLICATIONS: ApplicationRow[] = [
  {
    id: 'app-1',
    referenceNo: 'LPK/LPS/2026/00142',
    applicantName: 'Kemaman Supply Base Marine Services Sdn Bhd',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-08-20',
    quarter: 'Q3',
    year: '2026',
    status: 'approved',
    statusLabelMs: 'Diluluskan',
    statusLabelEn: 'Approved',
  },
  {
    id: 'app-2',
    referenceNo: 'LPK/PAP/2026/00088',
    applicantName: 'East Coast Marine Logistics Consortium',
    serviceTypeMs: 'Permit Aktiviti Pelabuhan',
    serviceTypeEn: 'Port Activity Permit',
    submittedDate: '2026-08-18',
    quarter: 'Q3',
    year: '2026',
    status: 'in_review',
    statusLabelMs: 'Dalam Semakan Teknikal',
    statusLabelEn: 'Technical Review',
  },
  {
    id: 'app-3',
    referenceNo: 'LPK/PDA2/2026/00019',
    applicantName: 'Offshore Energy Resources Sdn Bhd',
    serviceTypeMs: 'Surat Sokongan PDA2',
    serviceTypeEn: 'PDA2 Support Letter',
    submittedDate: '2026-08-15',
    quarter: 'Q3',
    year: '2026',
    status: 'submitted',
    statusLabelMs: 'Dihantar',
    statusLabelEn: 'Submitted',
  },
  {
    id: 'app-4',
    referenceNo: 'LPK/LPS/2026/00139',
    applicantName: 'Bintulu-Kemaman Bunker Suppliers Ltd',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-07-28',
    quarter: 'Q3',
    year: '2026',
    status: 'expiring',
    statusLabelMs: 'Tamat Tempoh < 30 Hari',
    statusLabelEn: 'Expiring Soon',
  },
  {
    id: 'app-5',
    referenceNo: 'LPK/PAP/2026/00065',
    applicantName: 'Segamat Maritime Engineering Works',
    serviceTypeMs: 'Permit Aktiviti Pelabuhan',
    serviceTypeEn: 'Port Activity Permit',
    submittedDate: '2026-06-12',
    quarter: 'Q2',
    year: '2026',
    status: 'approved',
    statusLabelMs: 'Diluluskan',
    statusLabelEn: 'Approved',
  },
  {
    id: 'app-6',
    referenceNo: 'LPK/LPS/2026/00091',
    applicantName: 'Perintis Malim & Navigasi Terengganu',
    serviceTypeMs: 'Lesen Perkhidmatan Sokongan',
    serviceTypeEn: 'Support Service Licence',
    submittedDate: '2026-05-04',
    quarter: 'Q2',
    year: '2026',
    status: 'rejected',
    statusLabelMs: 'Ditolak',
    statusLabelEn: 'Rejected',
  },
]

export const STATUS_OPTIONS = [
  { value: 'approved', labelMs: 'Diluluskan', labelEn: 'Approved' },
  { value: 'in_review', labelMs: 'Dalam Semakan', labelEn: 'In Review' },
  { value: 'submitted', labelMs: 'Dihantar', labelEn: 'Submitted' },
  { value: 'rejected', labelMs: 'Ditolak', labelEn: 'Rejected' },
  { value: 'expiring', labelMs: 'Hampir Tamat', labelEn: 'Expiring Soon' },
]

export function RecentApplicationsTable({ className = '' }: { className?: string }) {
  const [filterState, setFilterState] = useState<TableFilterState>({})
  const [sortState, setSortState] = useState<TableSortState>({
    column: 'submittedDate',
    direction: 'desc',
  })

  const columns: TableColumnDef<ApplicationRow>[] = [
    {
      id: 'referenceNo',
      headerMs: 'No. Rujukan',
      headerEn: 'Reference No.',
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold text-slate-900 text-xs">{row.referenceNo}</span>
      ),
    },
    {
      id: 'applicantName',
      headerMs: 'Pemohon / Syarikat',
      headerEn: 'Applicant / Company',
      sortable: true,
      cell: (row) => (
        <div className="font-semibold text-slate-800 text-xs">{row.applicantName}</div>
      ),
    },
    {
      id: 'serviceTypeMs',
      headerMs: 'Jenis Permohonan',
      headerEn: 'Application Type',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-700">{row.serviceTypeMs}</span>,
    },
    {
      id: 'submittedDate',
      headerMs: 'Tarikh Hantar',
      headerEn: 'Submission Date',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-600">{row.submittedDate}</span>,
    },
    {
      id: 'status',
      headerMs: 'Status',
      headerEn: 'Status',
      sortable: true,
      cell: (row) => (
        <Badge variant={row.status} size="sm">
          {row.statusLabelMs}
        </Badge>
      ),
    },
    {
      id: 'action',
      headerMs: 'Tindakan',
      headerEn: 'Action',
      cell: () => (
        <Link
          href="/permohonan"
          className="text-xs font-bold text-[#0b2545] hover:text-[#133e87] hover:underline"
        >
          Lihat
        </Link>
      ),
    },
  ]

  const filteredData = useMemo(() => {
    return FIXTURE_APPLICATIONS.filter((row) => {
      if (filterState.search) {
        const query = filterState.search.toLowerCase()
        const matchRef = row.referenceNo.toLowerCase().includes(query)
        const matchName = row.applicantName.toLowerCase().includes(query)
        if (!matchRef && !matchName) return false
      }
      if (filterState.year && filterState.year !== 'all' && row.year !== filterState.year) {
        return false
      }
      if (filterState.quarter && filterState.quarter !== 'all' && row.quarter !== filterState.quarter) {
        return false
      }
      if (filterState.status && filterState.status !== 'all' && row.status !== filterState.status) {
        return false
      }
      return true
    }).sort((a, b) => {
      if (!sortState.column || !sortState.direction) return 0
      const fieldA = a[sortState.column as keyof ApplicationRow] ?? ''
      const fieldB = b[sortState.column as keyof ApplicationRow] ?? ''
      const result = String(fieldA).localeCompare(String(fieldB))
      return sortState.direction === 'asc' ? result : -result
    })
  }, [filterState, sortState])

  return (
    <Card variant="default" className={className}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base font-bold">
            Senarai Permohonan Terkini (GP-12 &amp; GP-15)
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Paparan rekod bersepadu dengan carian, tapisan suku tahun, dan susunan lajur.
          </p>
        </div>
        <Link
          href="/permohonan"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2545] hover:text-[#133e87]"
        >
          <span>Pusat Permohonan Lengkap</span>
          <IconArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <DataTable
          data={filteredData}
          columns={columns}
          keyExtractor={(row) => row.id}
          filterState={filterState}
          onFilterChange={setFilterState}
          sortState={sortState}
          onSortChange={setSortState}
          statusOptions={STATUS_OPTIONS}
          showFilters={true}
        />
      </CardContent>
    </Card>
  )
}
