'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import {
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconSpinner,
} from '../ui/icons'
import { TableFilters } from './table-filters'
import type {
  TableColumnDef,
  TableExportAction,
  TableFilterState,
  TablePaginationState,
  TableSortState,
} from './types'

export interface DataTableProps<T> {
  data: T[]
  columns: TableColumnDef<T>[]
  keyExtractor: (row: T) => string
  isLoading?: boolean
  sortState?: TableSortState
  onSortChange?: (sort: TableSortState) => void
  filterState?: TableFilterState
  onFilterChange?: (filters: TableFilterState) => void
  paginationState?: TablePaginationState
  onPaginationChange?: (pagination: TablePaginationState) => void
  statusOptions?: Array<{ value: string; labelMs: string; labelEn: string }>
  exportActions?: TableExportAction[]
  showFilters?: boolean
  emptyMessageMs?: string
  emptyMessageEn?: string
  caption?: string
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  sortState,
  onSortChange,
  filterState,
  onFilterChange,
  paginationState,
  onPaginationChange,
  statusOptions,
  exportActions,
  showFilters = true,
  emptyMessageMs = 'Tiada rekod dijumpai bagi kriteria carian atau tapisan ini.',
  emptyMessageEn = 'No records found for the selected search or filter criteria.',
  caption,
  className = '',
}: DataTableProps<T>) {

  const handleSortClick = (columnId: string) => {
    if (!onSortChange) return

    if (sortState?.column === columnId) {
      if (sortState.direction === 'asc') {
        onSortChange({ column: columnId, direction: 'desc' })
      } else if (sortState.direction === 'desc') {
        onSortChange({ column: null, direction: null })
      } else {
        onSortChange({ column: columnId, direction: 'asc' })
      }
    } else {
      onSortChange({ column: columnId, direction: 'asc' })
    }
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onPaginationChange || !paginationState) return
    const newSize = Number(e.target.value)
    onPaginationChange({
      ...paginationState,
      pageSize: newSize,
      pageIndex: 0,
    })
  }

  const handlePrevPage = () => {
    if (!onPaginationChange || !paginationState || !paginationState.hasPreviousPage) return
    onPaginationChange({
      ...paginationState,
      pageIndex: Math.max(0, paginationState.pageIndex - 1),
    })
  }

  const handleNextPage = () => {
    if (!onPaginationChange || !paginationState || !paginationState.hasNextPage) return
    onPaginationChange({
      ...paginationState,
      pageIndex: paginationState.pageIndex + 1,
    })
  }

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* Optional Top Filter Bar (GP-12) */}
      {showFilters && filterState && onFilterChange ? (
        <TableFilters
          filters={filterState}
          onFiltersChange={onFilterChange}
          statusOptions={statusOptions}
          exportActions={exportActions}
        />
      ) : null}

      {/* Main Table Shell */}
      <div className="relative rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-2xs">
            <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0b2545] shadow-md border border-slate-200">
              <IconSpinner className="h-5 w-5 text-[#0b2545]" />
              <span>Memuatkan data...</span>
            </div>
          </div>
        ) : null}

        <Table className="min-w-full divide-y divide-slate-200">
          <TableHeader>
            <TableRow>
              {columns.map((col) => {
                const isSorted = sortState?.column === col.id
                const direction = isSorted ? sortState?.direction : null

                return (
                  <TableHead
                    key={col.id}
                    className={`${col.width || ''} ${col.className || ''}`}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSortClick(col.id)}
                        className="group inline-flex items-center gap-1.5 font-bold text-slate-800 hover:text-[#0b2545] cursor-pointer select-none focus:outline-hidden"
                      >
                        <span>{col.headerMs}</span>
                        <span className="flex flex-col text-slate-400 group-hover:text-slate-600">
                          {direction === 'asc' ? (
                            <IconChevronUp className="h-4 w-4 text-[#0b2545]" />
                          ) : direction === 'desc' ? (
                            <IconChevronDown className="h-4 w-4 text-[#0b2545]" />
                          ) : (
                            <div className="flex flex-col -space-y-1 opacity-40 group-hover:opacity-100">
                              <IconChevronUp className="h-3 w-3" />
                              <IconChevronDown className="h-3 w-3" />
                            </div>
                          )}
                        </span>
                      </button>
                    ) : (
                      <span>{col.headerMs}</span>
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length > 0 ? (
              data.map((row) => (
                <TableRow key={keyExtractor(row)}>
                  {columns.map((col) => (
                    <TableCell
                      key={col.id}
                      className={`${col.width || ''} ${col.className || ''}`}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableEmpty colSpan={columns.length}>
                <div data-empty-en={emptyMessageEn} className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
                  <IconFileText className="h-8 w-8 text-slate-300" />
                  <p className="font-medium text-sm">{emptyMessageMs}</p>
                </div>
              </TableEmpty>
            )}

          </TableBody>

          {caption ? (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length} className="text-xs text-slate-500 italic py-2.5">
                  {caption}
                </TableCell>
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {/* Table Pagination Controls (GP-12) */}
      {paginationState ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Papar</span>
            <div className="w-20">
              <Select
                id="pagination-page-size"
                value={String(paginationState.pageSize)}
                onChange={handlePageSizeChange}
                className="py-1 px-2 text-xs font-semibold"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </Select>
            </div>
            <span>rekod per halaman</span>
            {paginationState.totalRows !== undefined ? (
              <span className="text-slate-400 ml-2">
                (Jumlah: <strong className="text-slate-700">{paginationState.totalRows}</strong> rekod)
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">
              Halaman {paginationState.pageIndex + 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!paginationState.hasPreviousPage || isLoading}
                className="px-2.5 py-1 text-xs"
              >
                Sebelumnya
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!paginationState.hasNextPage || isLoading}
                className="px-2.5 py-1 text-xs"
              >
                Seterusnya
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
