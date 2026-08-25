/**
 * Export engine — Word writer (GP-12, GP-14) via `docx`.
 *
 * `docx` is an approved dependency; the lead adds it to package.json. This
 * module is NOT imported by the tests, so its absence here does not break
 * `npm run test`. The pure shaping it relies on lives in shapes.ts and IS
 * tested.
 *
 * Word is the format teams usually skip — GP-12 / GP-14 require it explicitly,
 * so it is implemented, not omitted. Rows/aggregate are passed in already
 * filtered by the caller; this writer never queries the database.
 */

import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx'

import { toMatrix } from './shapes'
import type { AggregateTable, ExportHeader, ExportLocale } from './types'

const heading = (locale: ExportLocale) =>
  new Paragraph({
    children: [new TextRun({ text: locale === 'en' ? 'Report' : 'Laporan', bold: true, size: 28 })],
  })

/** Full-detail list export to a .docx buffer. */
export async function rowsToWordBuffer(
  headers: ExportHeader[],
  rows: Record<string, unknown>[],
  locale: ExportLocale,
): Promise<Buffer> {
  const matrix = toMatrix(headers, rows, locale)

  const table = new Table({
    rows: matrix.map(
      (row) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                children: [new Paragraph(cell === null || cell === undefined ? '' : String(cell))],
              }),
          ),
        }),
    ),
  })

  const doc = new Document({ sections: [{ children: [heading(locale), table] }] })
  return Packer.toBuffer(doc)
}

/** Aggregate ("table" form) export to a .docx buffer. */
export async function aggregateToWordBuffer(
  aggregate: AggregateTable,
  locale: ExportLocale,
): Promise<Buffer> {
  const category = locale === 'en' ? 'Category' : 'Kategori'
  const count = locale === 'en' ? 'Count' : 'Bilangan'

  const rows: [string, number][] = [
    [locale === 'en' ? 'Transactions' : 'Transaksi', aggregate.transactions],
    ...aggregate.buckets.map(
      (bucket): [string, number] => [locale === 'en' ? bucket.labelEn : bucket.labelMs, bucket.count],
    ),
  ]

  const table = new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph(category)] }),
          new TableCell({ children: [new Paragraph(count)] }),
        ],
      }),
      ...rows.map(
        (row) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(String(row[0]))] }),
              new TableCell({ children: [new Paragraph(String(row[1]))] }),
            ],
          }),
      ),
    ],
  })

  const doc = new Document({ sections: [{ children: [heading(locale), table] }] })
  return Packer.toBuffer(doc)
}
