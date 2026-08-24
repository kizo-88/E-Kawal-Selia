'use client'

import { useState, type ReactNode } from 'react'
import { IconChevronDown, IconChevronUp, IconHelpCircle } from './icons'

export interface HelpNoteProps {
  title?: string
  titleMs?: string
  titleEn?: string
  description?: string
  descriptionMs?: string
  descriptionEn?: string
  items?: Array<{ id: string; textMs: string; textEn: string }>
  children?: ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
  className?: string
}

export function HelpNote({
  title,
  titleMs = 'Nota Bantuan & Panduan Pengguna',
  titleEn = 'Help Notes & User Guide',
  description,
  descriptionMs,
  descriptionEn,
  items,
  children,
  collapsible = false,
  defaultOpen = true,
  className = '',
}: HelpNoteProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const activeTitle = title || titleMs
  const activeDesc = description || descriptionMs


  return (
    <aside
      aria-label={activeTitle}
      data-title-en={titleEn}
      data-description-en={descriptionEn}
      className={`rounded-lg border border-sky-200 bg-sky-50/70 p-4 text-sky-950 transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 rounded-full bg-sky-100 p-1 text-sky-700 shrink-0">
            <IconHelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-sky-900 tracking-tight">
              {activeTitle}
            </h4>
            {activeDesc && (!collapsible || isOpen) ? (
              <p className="mt-1 text-xs leading-relaxed text-sky-800">
                {activeDesc}
              </p>
            ) : null}
          </div>
        </div>

        {collapsible ? (
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            className="rounded p-1 text-sky-700 hover:bg-sky-100 hover:text-sky-900 cursor-pointer focus:outline-hidden"
          >
            {isOpen ? (
              <IconChevronUp className="h-4 w-4" />
            ) : (
              <IconChevronDown className="h-4 w-4" />
            )}
            <span className="sr-only">
              {isOpen ? 'Tutup bantuan' : 'Buka bantuan'}
            </span>
          </button>
        ) : null}
      </div>

      {(!collapsible || isOpen) && (items || children) ? (
        <div className="mt-3 border-t border-sky-200/80 pt-3 text-xs leading-relaxed text-sky-900">
          {items && items.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1.5 marker:text-sky-600">
              {items.map((item) => (
                <li key={item.id}>
                  <span>{item.textMs}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {children}
        </div>
      ) : null}
    </aside>
  )
}
