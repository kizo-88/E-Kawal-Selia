import type { ReactNode } from 'react'

export type SortDirection = 'asc' | 'desc' | null

export type MalaysianQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

export interface TableSortState {
  column: string | null
  direction: SortDirection
}

export interface TableFilterState {
  search?: string
  year?: string
  quarter?: MalaysianQuarter | 'all'
  startDate?: string
  endDate?: string
  status?: string
}

export interface TablePaginationState {
  pageIndex: number
  pageSize: number
  totalRows?: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface TableColumnDef<T> {
  id: string
  headerMs: string
  headerEn: string
  sortable?: boolean
  width?: string
  className?: string
  cell: (row: T) => ReactNode
}

export interface TableExportAction {
  format: 'excel' | 'word' | 'pdf'
  labelMs: string
  labelEn: string
  onExport: () => void
  disabled?: boolean
}
