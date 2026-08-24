import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'e-Kawalselia — Lembaga Pelabuhan Kemaman',
  description:
    'Sistem pelesenan, permit dan kawal selia Lembaga Pelabuhan Kemaman. Permohonan, semakan, kelulusan dan pengesahan lesen secara dalam talian.',
}

// GP-07: the interface language is a setting, not a constant. Phase 1 ships
// Malay, so this is the correct default — but it reads from `settings` once the
// config engine lands in Stage 2 (task 2.1).
const DEFAULT_LOCALE = 'ms'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
