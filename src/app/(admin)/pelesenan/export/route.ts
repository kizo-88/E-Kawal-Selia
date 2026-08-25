import { NextRequest, NextResponse } from 'next/server'
import { queryIssuedLicences } from '../query'
import { toMatrix } from '../../../../lib/exports/shapes'
import { rowsToExcelBuffer } from '../../../../lib/exports/excel'
import { rowsToWordBuffer } from '../../../../lib/exports/word'
import { buildReportHtml } from '../../../../lib/exports/pdf'

const LICENCE_COLUMNS = [
  { key: 'licenceNo', labelMs: 'No. Lesen', labelEn: 'Licence No.' },
  { key: 'holderName', labelMs: 'Pemegang Lesen / Syarikat', labelEn: 'Licence Holder / Company' },
  { key: 'categoryMs', labelMs: 'Kategori Pelesenan', labelEn: 'Licensing Category' },
  { key: 'issueDate', labelMs: 'Tarikh Dikeluarkan', labelEn: 'Issue Date' },
  { key: 'expiryDate', labelMs: 'Tarikh Tamat', labelEn: 'Expiry Date' },
  { key: 'statusLabelMs', labelMs: 'Status', labelEn: 'Status' },
]

export async function POST(req: NextRequest): Promise<NextResponse> {
  const form = await req.formData()
  const search = form.get('search') ? String(form.get('search')) : undefined

  const rows = (await queryIssuedLicences(1n, search)) as unknown as Record<string, unknown>[]
  const stamp = new Date().toISOString().slice(0, 10)
  const titleMs = 'Senarai Sijil Lesen & Permit Aktif'
  const titleEn = 'Active Licences & Permits List'

  const format = (form.get('format') ?? 'xlsx') as 'xlsx' | 'docx' | 'html'

  if (format === 'docx') {
    const data = await rowsToWordBuffer(LICENCE_COLUMNS, rows, 'ms')
    return file(
      data,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      `lesen-${stamp}.docx`,
    )
  }

  if (format === 'html') {
    const matrix = toMatrix(LICENCE_COLUMNS, rows, 'ms')
    const html = buildReportHtml({ titleMs, titleEn, locale: 'ms', matrix })
    return file(Buffer.from(html, 'utf-8'), 'text/html', `lesen-${stamp}.html`)
  }

  const data = await rowsToExcelBuffer(LICENCE_COLUMNS, rows, 'ms')

  return file(
    data,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    `lesen-${stamp}.xlsx`,
  )
}

function file(data: Uint8Array, mime: string, filename: string): NextResponse {
  return new NextResponse(data as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': mime,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
