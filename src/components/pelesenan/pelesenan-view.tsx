'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { HelpNote } from '../ui/help-note'
import {
  IconDownload,
  IconQrCode,
  IconShip,
} from '../ui/icons'
import { downloadLicencePdf } from '../../app/(admin)/pelesenan/actions'

export interface IssuedLicenceItem {
  id: string
  licenceNo: string
  categoryMs: string
  categoryEn: string
  holderName: string
  issueDate: string
  expiryDate: string
  qrToken: string
  status: 'active' | 'expiring' | 'expired'
  statusLabelMs: string
  statusLabelEn: string
}

interface PelesenanViewProps {
  initialLicences: IssuedLicenceItem[]
}

export function PelesenanView({ initialLicences }: PelesenanViewProps) {
  const [licences] = useState<IssuedLicenceItem[]>(initialLicences)

  const handleDownload = async (licenceNo: string) => {
    try {
      const res = await downloadLicencePdf('1', licenceNo)
      if (res.ok) {
        window.open(res.downloadUrl, '_blank')
      }
    } catch {
      alert(`Memuat turun salinan rasmi PDF bagi ${licenceNo}`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Modul Pelesenan M1
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Sijil &amp; Permit Aktif</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            Pelesenan, Permit &amp; Surat Sokongan Berdaftar
          </h1>
          <p className="text-xs text-slate-500">
            Senarai permit dan lesen aktif yang telah diluluskan oleh Lembaga Pelabuhan Kemaman.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/permohonan/baru">
            <Button
              type="button"
              variant="primary"
              size="md"
              leadingIcon={<IconShip className="h-4 w-4" />}
            >
              Mohon Lesen Baru
            </Button>
          </Link>
        </div>
      </div>

      {/* Licences Grid (M1-R11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {licences.map((lic) => (
          <Card key={lic.id} variant="default" className="flex flex-col justify-between overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#0b2545] bg-white px-2 py-0.5 rounded border border-slate-200">
                  {lic.licenceNo}
                </span>
                <Badge
                  variant={
                    lic.status === 'active' ? 'approved' : lic.status === 'expiring' ? 'expiring' : 'expired'
                  }
                  size="sm"
                  dot={true}
                >
                  {lic.statusLabelMs}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-slate-900 mt-2 line-clamp-2">
                {lic.categoryMs}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Pemegang Lesen
                  </span>
                  <span className="font-semibold text-slate-800 block">{lic.holderName}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Tarikh Kelulusan:</span>
                    <span className="font-medium text-slate-700">{lic.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tamat Sah Laku:</span>
                    <span className="font-medium text-slate-700">{lic.expiryDate}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Action Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href={`/semak/${lic.qrToken}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0b2545] hover:text-[#133e87] hover:underline"
                >
                  <IconQrCode className="h-4 w-4" />
                  <span>Semak QR Sijil</span>
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leadingIcon={<IconDownload className="h-3.5 w-3.5" />}
                  onClick={() => handleDownload(lic.licenceNo)}
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
        titleMs="Peringatan Pembaharuan Lesen &amp; Kod Keselamatan QR (GP-11, GP-22)"
        titleEn="Licence Renewal Reminder &amp; QR Security Codes (GP-11, GP-22)"
        descriptionMs="Permohonan pembaharuan lesen hendaklah dikemukakan selewat-lewatnya 30 hari sebelum tarikh tamat tempoh."
        descriptionEn="Licence renewal applications must be submitted at least 30 days before the expiration date."
      />
    </div>
  )
}
