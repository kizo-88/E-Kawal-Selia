'use client'

import { useState } from 'react'
import { Card, CardContent } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { HelpNote } from '../../../components/ui/help-note'
import {
  IconDownload,
  IconSearch,
} from '../../../components/ui/icons'


export interface CircularItem {
  id: string
  refNo: string
  titleMs: string
  titleEn: string
  categoryMs: string
  categoryEn: string
  publishDate: string
  fileSize: string
}

const FIXTURE_CIRCULARS: CircularItem[] = [
  {
    id: 'circ-1',
    refNo: 'PKMN/PKL/01/2026',
    titleMs: 'Pekeliling Pelabuhan Bil. 1/2026: Garis Panduan Pematuhan Zon Keselamatan Dermaga Had Pelabuhan',
    titleEn: 'Port Circular No. 1/2026: Port Limits Wharf Safety Zone Compliance Guidelines',
    categoryMs: 'Pekeliling Pelabuhan',
    categoryEn: 'Port Circular',
    publishDate: '15 Jan 2026',
    fileSize: '1.4 MB (PDF)',
  },
  {
    id: 'circ-2',
    refNo: 'PKMN/NOTIS/04/2026',
    titleMs: 'Notis Kepada Pelaut: Peringatan Operasi Bunkering & Kebersihan Marin di Teluk Kalong',
    titleEn: 'Notice to Mariners: Bunkering Operation & Marine Cleanliness in Teluk Kalong',
    categoryMs: 'Notis Kepada Pelaut',
    categoryEn: 'Notice to Mariners',
    publishDate: '02 Feb 2026',
    fileSize: '820 KB (PDF)',
  },
  {
    id: 'circ-3',
    refNo: 'PKMN/KADAR/2026',
    titleMs: 'Jadual Fi & Caj Perkhidmatan Sokongan Pelabuhan Kemaman Terkini (M1-R10)',
    titleEn: 'Kemaman Port Support Service Fee & Charge Schedule (M1-R10)',
    categoryMs: 'Jadual Kadar & Fi',
    categoryEn: 'Rates & Fee Schedule',
    publishDate: '01 Jan 2026',
    fileSize: '2.1 MB (PDF)',
  },
  {
    id: 'circ-4',
    refNo: 'PKMN/SOP/ISPS/2025',
    titleMs: 'Prosedur Operasi Standard (SOP) Kawalan Keselamatan Fasiliti Maritim & Kod ISPS',
    titleEn: 'Standard Operating Procedure (SOP) Maritime Facility Security & ISPS Code',
    categoryMs: 'SOP & Peraturan',
    categoryEn: 'SOP & Regulations',
    publishDate: '20 Dis 2025',
    fileSize: '3.5 MB (PDF)',
  },
]

export default function PekelilingPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCirculars = FIXTURE_CIRCULARS.filter((c) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return c.titleMs.toLowerCase().includes(term) || c.refNo.toLowerCase().includes(term)
  })

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Modul Pekeliling M4
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Pangkalan Pengetahuan Rasmi</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            Pekeliling, Notis &amp; Dokumen Rujukan Pelabuhan
          </h1>
          <p className="text-xs text-slate-500">
            Pusat rujukan pekeliling pelabuhan, notis kepada pelaut, jadual kadar fi dan SOP maritim.
          </p>
        </div>

        {/* Search Field */}
        <div className="w-full sm:w-72">
          <Input
            id="search-circulars"
            placeholder="Cari no. rujukan / tajuk pekeliling..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leadingIcon={<IconSearch className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Circulars List */}
      <div className="space-y-3">
        {filteredCirculars.map((item) => (
          <Card key={item.id} variant="default" className="hover:border-slate-300 transition-colors">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.refNo}
                  </span>
                  <Badge variant="primary" size="sm">
                    {item.categoryMs}
                  </Badge>
                  <span className="text-xs text-slate-400">&bull;</span>
                  <span className="text-xs text-slate-500">{item.publishDate}</span>
                </div>

                <h2 className="text-sm font-bold text-slate-900 leading-snug">
                  {item.titleMs}
                </h2>
                <p className="text-xs text-slate-500">Saiz Fail: {item.fileSize}</p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leadingIcon={<IconDownload className="h-4 w-4" />}
                  onClick={() => alert(`Memuat turun dokumen ${item.refNo}`)}
                >
                  Muat Turun PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GP-22 Help Note */}
      <HelpNote
        titleMs="Pemberitahuan Pekeliling Terkini (GP-17)"
        titleEn="Latest Circular Notifications (GP-17)"
        descriptionMs="Pekeliling rasmi yang diterbitkan berkuat kuasa serta-merta bagi semua pengendali pelabuhan."
        descriptionEn="Officially published circulars take effect immediately across all port operators."
      />
    </div>
  )
}
