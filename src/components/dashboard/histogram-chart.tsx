'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { IconCheckCircle } from '../ui/icons'

export interface HistogramMonthData {
  monthMs: string
  monthEn: string
  approved: number
  inReview: number
  rejected: number
  total: number
}

export const HISTOGRAM_DATA_2026: HistogramMonthData[] = [
  { monthMs: 'Jan', monthEn: 'Jan', approved: 85, inReview: 12, rejected: 3, total: 100 },
  { monthMs: 'Feb', monthEn: 'Feb', approved: 92, inReview: 15, rejected: 4, total: 111 },
  { monthMs: 'Mac', monthEn: 'Mar', approved: 110, inReview: 20, rejected: 6, total: 136 },
  { monthMs: 'Apr', monthEn: 'Apr', approved: 125, inReview: 18, rejected: 5, total: 148 },
  { monthMs: 'Mei', monthEn: 'May', approved: 130, inReview: 22, rejected: 7, total: 159 },
  { monthMs: 'Jun', monthEn: 'Jun', approved: 140, inReview: 25, rejected: 5, total: 170 },
  { monthMs: 'Jul', monthEn: 'Jul', approved: 135, inReview: 20, rejected: 4, total: 159 },
  { monthMs: 'Ogo', monthEn: 'Aug', approved: 145, inReview: 28, rejected: 6, total: 179 },
  { monthMs: 'Sep', monthEn: 'Sep', approved: 0, inReview: 0, rejected: 0, total: 0 },
  { monthMs: 'Okt', monthEn: 'Oct', approved: 0, inReview: 0, rejected: 0, total: 0 },
  { monthMs: 'Nov', monthEn: 'Nov', approved: 0, inReview: 0, rejected: 0, total: 0 },
  { monthMs: 'Dis', monthEn: 'Dec', approved: 0, inReview: 0, rejected: 0, total: 0 },
]

export function HistogramChart({ className = '' }: { className?: string }) {
  const [hoveredMonth, setHoveredMonth] = useState<HistogramMonthData | null>(null)

  const maxTotal = Math.max(...HISTOGRAM_DATA_2026.map((d) => d.total), 200)

  return (
    <Card variant="default" className={`w-full overflow-hidden ${className}`}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Statistik GP-15
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Tahun 2026</span>
          </div>
          <CardTitle className="text-base sm:text-lg mt-1">
            Histogram Permohonan Pelesenan &amp; Permit Bulanan
          </CardTitle>
          <CardDescription>
            Taburan statistik permohonan diluluskan berbanding dalam semakan mengikut bulan
          </CardDescription>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-[#0b2545]" />
            <span>Diluluskan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-amber-500" />
            <span>Dalam Semakan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-xs bg-red-500" />
            <span>Ditolak</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* SVG / CSS Histogram Bars */}
        <div className="h-64 sm:h-72 w-full flex items-end justify-between gap-1.5 sm:gap-3 pt-6 pb-2 border-b border-slate-200">
          {HISTOGRAM_DATA_2026.map((item) => {
            const hasData = item.total > 0
            const heightPercent = hasData ? (item.total / maxTotal) * 100 : 4
            const approvedPercent = hasData ? (item.approved / item.total) * 100 : 0
            const inReviewPercent = hasData ? (item.inReview / item.total) * 100 : 0
            const rejectedPercent = hasData ? (item.rejected / item.total) * 100 : 0

            return (
              <div
                key={item.monthMs}
                onMouseEnter={() => setHoveredMonth(item)}
                onMouseLeave={() => setHoveredMonth(null)}
                className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
              >
                {/* Tooltip on Hover */}
                {hoveredMonth?.monthMs === item.monthMs && hasData ? (
                  <div className="absolute -top-16 z-20 bg-slate-900 text-white p-2 rounded-lg text-[11px] shadow-lg whitespace-nowrap pointer-events-none">
                    <p className="font-bold text-amber-400">Bulan {item.monthMs} 2026</p>
                    <p>Diluluskan: {item.approved}</p>
                    <p>Dalam Semakan: {item.inReview}</p>
                    <p>Ditolak: {item.rejected}</p>
                  </div>
                ) : null}

                {/* Bar Stack */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[36px] rounded-t-md overflow-hidden flex flex-col-reverse transition-all duration-300 group-hover:opacity-90 group-hover:scale-y-105"
                >
                  {hasData ? (
                    <>
                      <div
                        style={{ height: `${approvedPercent}%` }}
                        className="w-full bg-[#0b2545]"
                        title={`Diluluskan: ${item.approved}`}
                      />
                      <div
                        style={{ height: `${inReviewPercent}%` }}
                        className="w-full bg-amber-500"
                        title={`Dalam Semakan: ${item.inReview}`}
                      />
                      <div
                        style={{ height: `${rejectedPercent}%` }}
                        className="w-full bg-red-500"
                        title={`Ditolak: ${item.rejected}`}
                      />
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-100 border-t border-slate-200" />
                  )}
                </div>

                {/* X-Axis Label */}
                <span className="text-[11px] font-bold text-slate-600 mt-2 block group-hover:text-[#0b2545]">
                  {item.monthMs}
                </span>
              </div>
            )
          })}
        </div>

        {/* Bottom Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Kadar Kelulusan Keseluruhan</span>
            <span className="text-lg font-bold text-emerald-700 block">94.8%</span>
            <span className="text-[10px] text-slate-400">Pematuhan Piagam Pelanggan LPKmn</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block">Purata Masa Kelulusan</span>
            <span className="text-lg font-bold text-[#0b2545] block">4.2 Hari Bekerja</span>
            <span className="text-[10px] text-slate-400">SLA Standard: 14 Hari Bekerja</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <IconCheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Pengesahan SLA Aktif</span>
              <span className="text-[11px] text-slate-500">
                Data dikemas kini automatik setiap 15 minit.
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
