import { NextRequest, NextResponse } from 'next/server'
import { queryApplications, type ApplicationListFilter } from '../query'
import { toMatrix } from '../../../../lib/exports/shapes'
import { rowsToExcelBuffer } from '../../../../lib/exports/excel'
import { rowsToWordBuffer } from '../../../../lib/exports/word'
import { buildReportHtml } from '../../../../lib/exports/pdf'

const PERMOHONAN_COLUMNS = [
  { key: 'referenceNo', labelMs: 'No. Rujukan', labelEn: 'Reference No.' },
  { key: 'applicantName', labelMs: 'Pemohon / Syarikat', labelEn: 'Applicant / Company' },
  { key: 'serviceTypeMs', labelMs: 'Jenis Permohonan', labelEn: 'Application Type' },
  { key: 'submittedDate', labelMs: 'Tarikh Hantar', labelEn: 'Submission Date' },
  { key: 'statusLabelMs', labelMs: 'Status', labelEn: 'Status' },
]

export async function POST(req: NextRequest): Promise<NextResponse> {
  const form = await req.formData()
  const filter: ApplicationListFilter = {}

  const year = form.get('year')
  const quarter = form.get('quarter')
  const search = form.get('search')
  const status = form.get('status')

  if (year) filter.year = String(year)
  if (quarter) filter.quarter = String(quarter)
  if (search) filter.search = String(search)
  if (status) filter.status = String(status)

  const rows = (await queryApplications(1n, filter)) as unknown as Record<string, unknown>[]
  const stamp = new Date().toISOString().slice(0, 10)
  const titleMs = 'Senarai Permohonan Pelesenan'
  const titleEn = 'Licensing Applications List'

  const format = (form.get('format') ?? 'xlsx') as 'xlsx' | 'docx' | 'html'

  if (format === 'docx') {
    const data = await rowsToWordBuffer(PERMOHONAN_COLUMNS, rows, 'ms')
    return file(
      data,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      `permohonan-${stamp}.docx`,
    )
  }

  if (format === 'html') {
    const matrix = toMatrix(PERMOHONAN_COLUMNS, rows, 'ms')
    const html = buildReportHtml({ titleMs, titleEn, locale: 'ms', matrix })
    return file(Buffer.from(html, 'utf-8'), 'text/html', `permohonan-${stamp}.html`)
  }

  const data = await rowsToExcelBuffer(PERMOHONAN_COLUMNS, rows, 'ms')

  return file(
    data,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    `permohonan-${stamp}.xlsx`,
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
