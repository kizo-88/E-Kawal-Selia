'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FIXTURE_REVIEW_QUEUE, type ReviewQueueItem } from './fixtures'
import { DataTable } from '../../../components/table/data-table'
import type { TableColumnDef, TableFilterState, TableSortState } from '../../../components/table/types'
import { Badge } from '../../../components/ui/badge'
import { HelpNote } from '../../../components/ui/help-note'

export default function OfficerReviewQueuePage() {
  const [filterState, setFilterState] = useState<TableFilterState>({})
  const [sortState, setSortState] = useState<TableSortState>({
    column: 'slaDaysRemaining',
    direction: 'asc',
  })

  const columns: TableColumnDef<ReviewQueueItem>[] = [
    {
      id: 'referenceNo',
      headerMs: 'No. Rujukan',
      headerEn: 'Reference No.',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-900 text-xs block">{row.referenceNo}</span>
          <span className="text-[10px] text-slate-500 font-medium">{row.stageNameMs}</span>
        </div>
      ),
    },
    {
      id: 'companyName',
      headerMs: 'Syarikat Pemohon',
      headerEn: 'Applicant Company',
      sortable: true,
      cell: (row) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{row.companyName}</span>
          <span className="text-[11px] text-slate-500">{row.applicantName}</span>
        </div>
      ),
    },
    {
      id: 'serviceTypeMs',
      headerMs: 'Jenis Permohonan',
      headerEn: 'Application Type',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-700 font-medium">{row.serviceTypeMs}</span>,
    },
    {
      id: 'submittedDate',
      headerMs: 'Tarikh Diterima',
      headerEn: 'Date Received',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-600 font-mono">{row.submittedDate}</span>,
    },
    {
      id: 'slaStatus',
      headerMs: 'Baki Tempoh SLA',
      headerEn: 'SLA Remaining',
      sortable: true,
      cell: (row) => (
        <Badge
          variant={
            row.slaStatus === 'critical' ? 'danger' : row.slaStatus === 'warning' ? 'warning' : 'approved'
          }
          size="sm"
          dot={true}
        >
          {row.slaDaysRemaining} Hari ({row.slaStatusLabelMs})
        </Badge>
      ),
    },
    {
      id: 'action',
      headerMs: 'Tindakan',
      headerEn: 'Action',
      cell: (row) => (
        <Link
          href={`/permohonan/${row.id}`}
          className="inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-[#0b2545] hover:bg-[#133e87] rounded-md transition-colors shadow-2xs"
        >
          Semak &amp; Nilai
        </Link>
      ),
    },
  ]

  const filteredData = useMemo(() => {
    return FIXTURE_REVIEW_QUEUE.filter((item) => {
      if (filterState.search) {
        const q = filterState.search.toLowerCase()
        if (
          !item.referenceNo.toLowerCase().includes(q) &&
          !item.companyName.toLowerCase().includes(q) &&
          !item.applicantName.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    }).sort((a, b) => {
      if (!sortState.column || !sortState.direction) return 0
      const valA = a[sortState.column as keyof ReviewQueueItem] ?? ''
      const valB = b[sortState.column as keyof ReviewQueueItem] ?? ''
      const cmp = typeof valA === 'number' && typeof valB === 'number'
        ? valA - valB
        : String(valA).localeCompare(String(valB))
      return sortState.direction === 'asc' ? cmp : -cmp
    })
  }, [filterState, sortState])

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Giliran Semakan Pegawai
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Unit Marin &amp; Trafik (M/T)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            Senarai Permohonan Menunggu Tindakan Semakan
          </h1>
          <p className="text-xs text-slate-500">
            Pengurusan giliran tugasan penilaian teknikal mengikut pematuhan tempoh Piagam Pelanggan (SLA).
          </p>
        </div>
      </div>

      {/* Universal Review Queue Table (GP-12) */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={(row) => row.id}
        filterState={filterState}
        onFilterChange={setFilterState}
        sortState={sortState}
        onSortChange={setSortState}
        showFilters={true}
        caption="Senarai giliran permohonan yang memerlukan tindakan penilaian oleh Pegawai LPKmn."
      />

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Panduan Pemantauan Piagam Pelanggan &amp; SLA (GP-19, GP-22)"
        titleEn="Client Charter &amp; SLA Monitoring Guide (GP-19, GP-22)"
        descriptionMs="Permohonan dengan baki SLA kritikal (< 3 hari) ditandakan amaran automatik."
        descriptionEn="Applications with critical SLA remaining (< 3 days) are flagged with automatic warnings."
      />
    </div>
  )
}
