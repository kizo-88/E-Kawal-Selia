'use client'

import { useState, type ChangeEvent } from 'react'
import { Button } from '../ui/button'
import { Select } from '../ui/select'
import {
  IconCalendar,
  IconFileText,
  IconSearch,
  IconXCircle,
} from '../ui/icons'
import type { TableExportAction, TableFilterState } from './types'

export interface TableFiltersProps {
  filters: TableFilterState
  onFiltersChange: (filters: TableFilterState) => void
  statusOptions?: Array<{ value: string; labelMs: string; labelEn: string }>
  exportActions?: TableExportAction[]
  showDateRange?: boolean
  availableYears?: Array<{ value: string; label: string }>
  className?: string
}

export const DEFAULT_YEAR_OPTIONS = [
  { value: 'all', label: 'Semua Tahun' },
  { value: '2026', label: 'Tahun 2026' },
  { value: '2025', label: 'Tahun 2025' },
  { value: '2024', label: 'Tahun 2024' },
]

export const QUARTER_OPTIONS = [
  { value: 'all', labelMs: 'Semua Suku Tahun', labelEn: 'All Quarters' },
  { value: 'Q1', labelMs: 'Suku 1 (Jan – Mac)', labelEn: 'Quarter 1 (Jan – Mar)' },
  { value: 'Q2', labelMs: 'Suku 2 (Apr – Jun)', labelEn: 'Quarter 2 (Apr – Jun)' },
  { value: 'Q3', labelMs: 'Suku 3 (Jul – Sep)', labelEn: 'Quarter 3 (Jul – Sep)' },
  { value: 'Q4', labelMs: 'Suku 4 (Okt – Dis)', labelEn: 'Quarter 4 (Oct – Dec)' },
]

export function TableFilters({
  filters,
  onFiltersChange,
  statusOptions,
  exportActions,
  showDateRange = false,
  availableYears = DEFAULT_YEAR_OPTIONS,
  className = '',
}: TableFiltersProps) {
  const [showAdvancedDates, setShowAdvancedDates] = useState(showDateRange)

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value })
  }

  const handleYearChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, year: e.target.value === 'all' ? undefined : e.target.value })
  }

  const handleQuarterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    onFiltersChange({ ...filters, quarter: val === 'all' ? undefined : (val as 'Q1' | 'Q2' | 'Q3' | 'Q4') })
  }

  const handleStatusChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onFiltersChange({ ...filters, status: e.target.value === 'all' ? undefined : e.target.value })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      year: undefined,
      quarter: undefined,
      startDate: undefined,
      endDate: undefined,
      status: undefined,
    })
  }

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.year ||
      filters.quarter ||
      filters.status ||
      filters.startDate ||
      filters.endDate
  )

  return (
    <div className={`space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs ${className}`}>
      {/* Top Filter Bar: Search + Fast Filters + Exports */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Keyword Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <IconSearch className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Carian kata kunci, no. rujukan, syarikat..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="block w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545] transition-colors"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              aria-label="Kosongkan carian"
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <IconXCircle className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Filter */}
          <div className="w-36">
            <Select
              id="filter-year"
              value={filters.year || 'all'}
              onChange={handleYearChange}
              className="py-1.5 text-xs font-medium"
            >
              {availableYears.map((yr) => (
                <option key={yr.value} value={yr.value}>
                  {yr.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Quarter Filter (GP-12) */}
          <div className="w-44">
            <Select
              id="filter-quarter"
              value={filters.quarter || 'all'}
              onChange={handleQuarterChange}
              className="py-1.5 text-xs font-medium"
            >
              {QUARTER_OPTIONS.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.labelMs}
                </option>
              ))}
            </Select>
          </div>

          {/* Status Filter */}
          {statusOptions && statusOptions.length > 0 ? (
            <div className="w-36">
              <Select
                id="filter-status"
                value={filters.status || 'all'}
                onChange={handleStatusChange}
                className="py-1.5 text-xs font-medium"
              >
                <option value="all">Semua Status</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.labelMs}
                  </option>
                ))}
              </Select>
            </div>
          ) : null}

          {/* Date Range Toggle Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedDates((prev) => !prev)}
            leadingIcon={<IconCalendar className="h-3.5 w-3.5 text-slate-500" />}
            className="text-xs font-medium"
          >
            {showAdvancedDates ? 'Tutup Julat Tarikh' : 'Julat Tarikh'}
          </Button>

          {/* Clear Filters Button */}
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Set Semula
            </Button>
          ) : null}
        </div>

        {/* GP-12 / GP-14 Export Actions Toolbar */}
        {exportActions && exportActions.length > 0 ? (
          <div className="flex items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">
              Eksport:
            </span>
            {exportActions.map((action) => (
              <Button
                key={action.format}
                type="button"
                variant="secondary"
                size="sm"
                onClick={action.onExport}
                disabled={action.disabled}
                leadingIcon={<IconFileText className="h-3.5 w-3.5 text-[#0b2545]" />}
                className="text-xs uppercase font-bold"
              >
                {action.format}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Advanced Date Range Filter Bar (GP-12) */}
      {showAdvancedDates ? (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label
              htmlFor="filter-start-date"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Tarikh Mula (Dari)
            </label>
            <input
              id="filter-start-date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, startDate: e.target.value || undefined })}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]"
            />
          </div>

          <div>
            <label
              htmlFor="filter-end-date"
              className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1"
            >
              Tarikh Akhir (Hingga)
            </label>
            <input
              id="filter-end-date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFiltersChange({ ...filters, endDate: e.target.value || undefined })}
              className="block w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 text-xs text-slate-500 pb-1">
            <IconCalendar className="h-4 w-4 text-slate-400 shrink-0" />
            <span>
              Menapis rekod berdasarkan julat tarikh permohonan atau tarikh kuat kuasa lesen.
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
