'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { DataTable } from '../../../components/table/data-table'
import type {
  TableColumnDef,
  TableExportAction,
  TableFilterState,
  TablePaginationState,
  TableSortState,
} from '../../../components/table/types'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { HelpNote } from '../../../components/ui/help-note'
import { IconFileText } from '../../../components/ui/icons'
import { STATUS_OPTIONS } from '../../../components/dashboard/recent-applications-table'
import { BASELINE_APPLICATIONS, type ApplicationRowData } from './baseline'

const PERMOHONAN_HELP_ITEMS = [
  {
    id: 'p-help-1',
    textMs: 'Semua senarai permohonan dilengkapi penapis seragam: carian kata kunci, tahun, suku tahun (Q1–Q4), dan julat tarikh (GP-12).',
    textEn: 'All application lists feature uniform filters: keyword search, year, quarter (Q1-Q4), and date range (GP-12).',
  },
  {
    id: 'p-help-2',
    textMs: 'Butang eksport (Excel, Word, PDF) menjana fail berdasarkan rekod paparan semasa (hasil tapisan).',
    textEn: 'Export buttons (Excel, Word, PDF) generate files reflecting the current filtered view.',
  },
  {
    id: 'p-help-3',
    textMs: 'Permohonan berstatus "Dalam Semakan" memerlukan ulasan sebelum tarikh SLA yang ditetapkan.',
    textEn: 'Applications under "In Review" status require feedback prior to the specified SLA deadline.',
  },
]

export default function PermohonanListPage() {
  const [filterState, setFilterState] = useState<TableFilterState>({})
  const [sortState, setSortState] = useState<TableSortState>({
    column: 'submittedDate',
    direction: 'desc',
  })
  const [paginationState, setPaginationState] = useState<TablePaginationState>({
    pageIndex: 0,
    pageSize: 10,
    totalRows: BASELINE_APPLICATIONS.length,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [exportMessage, setExportMessage] = useState<string | null>(null)

  const handleExport = async (format: 'excel' | 'word' | 'pdf') => {
    const formatMap = { excel: 'xlsx', word: 'docx', pdf: 'html' }
    try {
      const formData = new FormData()
      formData.set('format', formatMap[format])
      if (filterState.search) formData.set('search', filterState.search)
      if (filterState.year) formData.set('year', filterState.year)
      if (filterState.quarter) formData.set('quarter', filterState.quarter)
      if (filterState.status) formData.set('status', filterState.status)

      const res = await fetch('/permohonan/export', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        setExportMessage(`Fail ${format.toUpperCase()} berjaya dijana dan dimuat turun.`)
      }
    } catch {
      setExportMessage(`Memproses eksport ${format.toUpperCase()} bagi paparan semasa...`)
    }
  }

  const columns: TableColumnDef<ApplicationRowData>[] = [

    {
      id: 'referenceNo',
      headerMs: 'No. Rujukan',
      headerEn: 'Reference No.',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono font-bold text-slate-900 text-xs block">{row.referenceNo}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{row.quarter} {row.year}</span>
        </div>
      ),
    },
    {
      id: 'applicantName',
      headerMs: 'Pemohon / Nama Syarikat',
      headerEn: 'Applicant / Company Name',
      sortable: true,
      cell: (row) => (
        <div className="font-semibold text-slate-800 text-xs">{row.applicantName}</div>
      ),
    },
    {
      id: 'serviceTypeMs',
      headerMs: 'Kategori Pelesenan',
      headerEn: 'Licensing Category',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-700 font-medium">{row.serviceTypeMs}</span>
      ),
    },
    {
      id: 'submittedDate',
      headerMs: 'Tarikh Permohonan',
      headerEn: 'Submission Date',
      sortable: true,
      cell: (row) => <span className="text-xs text-slate-600 font-mono">{row.submittedDate}</span>,
    },
    {
      id: 'status',
      headerMs: 'Status Semasa',
      headerEn: 'Current Status',
      sortable: true,
      cell: (row) => (
        <Badge variant={row.status} size="sm" dot={true}>
          {row.statusLabelMs}
        </Badge>
      ),
    },
    {
      id: 'actions',
      headerMs: 'Tindakan',
      headerEn: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/permohonan/${row.id}`}
            className="text-xs font-bold text-[#0b2545] hover:text-[#133e87] hover:underline"
          >
            Semak
          </Link>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={() => setExportMessage(`Mencetak dokumen rujukan ${row.referenceNo}`)}
            className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Cetak
          </button>
        </div>
      ),
    },
  ]

  const exportActions: TableExportAction[] = [
    {
      format: 'excel',
      labelMs: 'Eksport Excel',
      labelEn: 'Export Excel',
      onExport: () => handleExport('excel'),
    },
    {
      format: 'word',
      labelMs: 'Eksport Word',
      labelEn: 'Export Word',
      onExport: () => handleExport('word'),
    },
    {
      format: 'pdf',
      labelMs: 'Eksport PDF',
      labelEn: 'Export PDF',
      onExport: () => handleExport('pdf'),
    },
  ]

  const filteredData = useMemo(() => {
    return BASELINE_APPLICATIONS.filter((row) => {
      if (filterState.search) {
        const q = filterState.search.toLowerCase()
        if (!row.referenceNo.toLowerCase().includes(q) && !row.applicantName.toLowerCase().includes(q)) {
          return false
        }
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
      if (filterState.startDate && row.submittedDate < filterState.startDate) {
        return false
      }
      if (filterState.endDate && row.submittedDate > filterState.endDate) {
        return false
      }
      return true
    }).sort((a, b) => {
      if (!sortState.column || !sortState.direction) return 0
      const valA = a[sortState.column as keyof ApplicationRowData] ?? ''
      const valB = b[sortState.column as keyof ApplicationRowData] ?? ''
      const cmp = String(valA).localeCompare(String(valB))
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
              Modul Permohonan M1
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Standard GP-12</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            Senarai Permohonan Pelesenan &amp; Permit
          </h1>
          <p className="text-xs text-slate-500">
            Pengurusan rekod permohonan pelabuhan dengan kemudahan tapisan pelbagai kriteria dan eksport bersepadu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/permohonan/baru">
            <Button variant="primary" size="md" leadingIcon={<IconFileText className="h-4 w-4" />}>
              Permohonan Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Export Notification Toast if triggered */}
      {exportMessage ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
          <span>{exportMessage}</span>
          <button
            type="button"
            onClick={() => setExportMessage(null)}
            className="font-bold text-emerald-900 hover:underline cursor-pointer"
          >
            Tutup
          </button>
        </div>
      ) : null}

      {/* Universal Data Table (GP-12) */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={(row) => row.id}
        filterState={filterState}
        onFilterChange={setFilterState}
        sortState={sortState}
        onSortChange={setSortState}
        paginationState={paginationState}
        onPaginationChange={setPaginationState}
        statusOptions={STATUS_OPTIONS}
        exportActions={exportActions}
        showFilters={true}
        caption="Senarai permohonan berdaftar dalam sistem e-Kawalselia Lembaga Pelabuhan Kemaman."
      />

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Panduan Carian &amp; Eksport Laporan (GP-12)"
        titleEn="Search &amp; Report Export Guide (GP-12)"
        descriptionMs="Piawaian paparan senarai universal LPKmn mengikut Keperluan GP-12."
        descriptionEn="LPKmn universal list display standard per GP-12 requirement."
        items={PERMOHONAN_HELP_ITEMS}
        collapsible={true}
        defaultOpen={true}
      />
    </div>
  )
}
