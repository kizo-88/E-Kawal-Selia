'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { HelpNote } from '../../../components/ui/help-note'
import {
  IconDownload,
  IconQrCode,
  IconShip,
} from '../../../components/ui/icons'


export interface IssuedLicence {
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

const FIXTURE_LICENCES: IssuedLicence[] = [
  {
    id: 'lic-1',
    licenceNo: 'LPK/LPS/2026/00142',
    categoryMs: 'Lesen Perkhidmatan Sokongan (Pembekal Marin)',
    categoryEn: 'Support Service Licence (Marine Chandling)',
    holderName: 'Kemaman Supply Base Marine Services Sdn Bhd',
    issueDate: '01 Jan 2026',
    expiryDate: '31 Dis 2026',
    qrToken: '7e28a9b1c3d4e5f6',
    status: 'active',
    statusLabelMs: 'Aktif & Sah',
    statusLabelEn: 'Active & Valid',
  },
  {
    id: 'lic-2',
    licenceNo: 'LPK/PAP/2026/00065',
    categoryMs: 'Permit Aktiviti Pelabuhan (Kerja Kejuruteraan Laut)',
    categoryEn: 'Port Activity Permit (Marine Engineering)',
    holderName: 'Segamat Maritime Engineering Works',
    issueDate: '15 Jun 2026',
    expiryDate: '14 Sep 2026',
    qrToken: '3f4e5d6c7b8a9012',
    status: 'expiring',
    statusLabelMs: 'Tamat Tempoh < 30 Hari',
    statusLabelEn: 'Expiring Soon',
  },
  {
    id: 'lic-3',
    licenceNo: 'LPK/PDA2/2025/00099',
    categoryMs: 'Surat Sokongan PDA2 (Kontraktor Luar Pesisir)',
    categoryEn: 'PDA2 Support Letter (Offshore Contractor)',
    holderName: 'East Coast Petroleum Offshore Services',
    issueDate: '01 Feb 2025',
    expiryDate: '31 Jan 2026',
    qrToken: '1122334455667788',
    status: 'expired',
    statusLabelMs: 'Tamat Tempoh',
    statusLabelEn: 'Expired',
  },
]

export default function PelesenanPage() {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="sm">
              Modul Pelesenan M1-R11
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Sijil Rasmi Pelabuhan Kemaman</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b2545] tracking-tight mt-1">
            Pengurusan Sijil Lesen &amp; Permit Aktif
          </h1>
          <p className="text-xs text-slate-500">
            Senarai sijil digital yang diluluskan beserta kod keselamatan QR untuk semakan awam maritim.
          </p>
        </div>

        <Link href="/permohonan/baru">
          <Button variant="primary" size="md" leadingIcon={<IconShip className="h-4 w-4" />}>
            Permohonan Baru
          </Button>
        </Link>
      </div>

      {/* Licences Grid (M1-R11) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FIXTURE_LICENCES.map((lic) => (
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
                  onClick={() => alert(`Memuat turun salinan rasmi PDF bagi ${lic.licenceNo}`)}
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
        titleEn="Licence Renewal Reminder &amp; QR Security Codes"
        descriptionMs="Sijil digital rasmi Lembaga Pelabuhan Kemaman dilengkapi kod keselamatan QR anti-pemalsuan."
        descriptionEn="Official Kemaman Port Authority digital certificates feature anti-counterfeit QR security tokens."
      />
    </div>
  )
}
