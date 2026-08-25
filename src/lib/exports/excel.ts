/**
 * Export engine — Excel writer (GP-12, GP-14) via `exceljs`.
 *
 * `exceljs` is an approved dependency; the lead adds it to package.json. This
 * module is NOT imported by the tests, so its absence here does not break
 * `npm run test`. The pure shaping it relies on lives in shapes.ts and IS
 * tested.
 *
 * The rows/aggregate are passed in already filtered by the caller (which set
 * the RLS scope). This writer never queries the database.
 */

import ExcelJS from 'exceljs'

import { toMatrix } from './shapes'
import type { AggregateTable, ExportHeader, ExportLocale } from './types'

const sheetTitle = (locale: ExportLocale) => (locale === 'en' ? 'Report' : 'Laporan')

/** Full-detail list export to an .xlsx buffer. */
export async function rowsToExcelBuffer(
  headers: ExportHeader[],
  rows: Record<string, unknown>[],
  locale: ExportLocale,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetTitle(locale))

  for (const line of toMatrix(headers, rows, locale)) {
    sheet.addRow(line)
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

/** Aggregate ("table" form) export to an .xlsx buffer. */
export async function aggregateToExcelBuffer(
  aggregate: AggregateTable,
  locale: ExportLocale,
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet(sheetTitle(locale))

  const category = locale === 'en' ? 'Category' : 'Kategori'
  const count = locale === 'en' ? 'Count' : 'Bilangan'

  sheet.addRow([category, count])
  sheet.addRow([locale === 'en' ? 'Transactions' : 'Transaksi', aggregate.transactions])
  for (const bucket of aggregate.buckets) {
    sheet.addRow([locale === 'en' ? bucket.labelEn : bucket.labelMs, bucket.count])
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return Buffer.from(buffer)
}
