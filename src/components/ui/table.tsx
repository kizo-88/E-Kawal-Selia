import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export function Table({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="relative w-full overflow-auto rounded-lg border border-slate-200 bg-white">
      <table
        className={`w-full caption-bottom text-sm text-left ${className}`}
        {...props}
      />
    </div>
  )
}

export function TableHeader({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={`border-b border-slate-200 bg-slate-50 text-xs uppercase font-semibold text-slate-700 ${className}`}
      {...props}
    />
  )
}

export function TableBody({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tbody
      className={`divide-y divide-slate-200 bg-white text-slate-800 ${className}`}
      {...props}
    />
  )
}

export function TableFooter({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={`border-t border-slate-200 bg-slate-50 font-medium text-slate-900 ${className}`}
      {...props}
    />
  )
}

export function TableRow({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100 ${className}`}
      {...props}
    />
  )
}

export function TableHead({
  className = '',
  ...props
}: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`h-10 px-4 text-left align-middle font-semibold text-slate-700 select-none ${className}`}
      {...props}
    />
  )
}

export function TableCell({
  className = '',
  ...props
}: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`p-4 align-middle text-sm text-slate-700 ${className}`}
      {...props}
    />
  )
}

export function TableCaption({
  className = '',
  ...props
}: HTMLAttributes<HTMLTableCaptionElement>) {
  return (
    <caption
      className={`mt-4 text-xs text-slate-500 italic ${className}`}
      {...props}
    />
  )
}

export function TableEmpty({
  children,
  colSpan = 1,
  className = '',
}: {
  children?: React.ReactNode
  colSpan?: number
  className?: string
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`h-24 text-center text-sm text-slate-500 ${className}`}
      >
        {children || 'Tiada rekod dijumpai.'}
      </td>
    </tr>
  )
}
