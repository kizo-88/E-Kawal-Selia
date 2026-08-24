'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconAnchor, IconLock, IconShieldCheck, IconUser } from '../ui/icons'


export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-slate-200">
      {/* Top Government Bar */}
      <div className="bg-[#0b2545] text-slate-100 text-xs py-1.5 px-4 sm:px-8 border-b border-[#133e87]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" aria-hidden="true" />
            <span className="font-medium tracking-wide">
              Portal Rasmi Lembaga Pelabuhan Kemaman (LPKmn)
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="hidden sm:inline">Kementerian Pengangkutan Malaysia</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline">Zon Bebas Cukai Pelabuhan Kemaman</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand & Crest */}
        <Link
          href="/"
          className="flex items-center gap-3.5 group focus-visible:outline-2 focus-visible:outline-[#0b2545] rounded-lg p-1"
        >
          {/* LPKmn Logo Emblem */}
          <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-[#0b2545] to-[#133e87] flex items-center justify-center text-amber-400 shadow-sm border border-amber-400/30 group-hover:scale-105 transition-transform shrink-0">
            <IconAnchor className="h-6 w-6" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#0b2545]">
                e-Kawalselia
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-300">
                LPKmn
              </span>
            </div>
            <span className="text-[11px] sm:text-xs text-slate-600 font-medium tracking-tight line-clamp-1">
              Sistem Pelesenan, Permit &amp; Kawal Selia Pelabuhan
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link
            href="/"
            className="hover:text-[#0b2545] transition-colors py-1 border-b-2 border-transparent hover:border-[#0b2545]"
          >
            Laman Utama
          </Link>
          <Link
            href="#perkhidmatan"
            className="hover:text-[#0b2545] transition-colors py-1 border-b-2 border-transparent hover:border-[#0b2545]"
          >
            Perkhidmatan
          </Link>
          <Link
            href="#pengumuman"
            className="hover:text-[#0b2545] transition-colors py-1 border-b-2 border-transparent hover:border-[#0b2545]"
          >
            Pekeliling &amp; FAQ
          </Link>
          <Link
            href="/bantuan"
            className="hover:text-[#0b2545] transition-colors py-1 border-b-2 border-transparent hover:border-[#0b2545]"
          >
            Bantuan
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0b2545] hover:bg-[#133e87] rounded-md shadow-xs transition-colors"
          >
            <IconLock className="h-4 w-4" />
            <span>Log Masuk</span>
          </Link>
          <Link
            href="/bantuan"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-[#0b2545] hover:bg-slate-100 rounded-md transition-colors"
          >
            <IconUser className="h-4 w-4 text-slate-500" />
            <span>Daftar</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#0b2545] rounded-md"
          >
            <IconLock className="h-3.5 w-3.5" />
            <span>Log Masuk</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            className="p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-hidden"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen ? (
        <div className="md:hidden border-t border-slate-200 bg-slate-50 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-200"
            >
              Laman Utama
            </Link>
            <Link
              href="#perkhidmatan"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-200"
            >
              Perkhidmatan Pelesenan
            </Link>
            <Link
              href="#pengumuman"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-200"
            >
              Pekeliling &amp; Soalan Lazim
            </Link>
            <Link
              href="/dasar-privasi"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-200"
            >
              Dasar Privasi &amp; Keselamatan
            </Link>
            <Link
              href="/bantuan"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-200"
            >
              Meja Bantuan &amp; Panduan
            </Link>
          </nav>
          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0b2545] rounded-md shadow-xs"
            >
              <IconLock className="h-4 w-4" />
              <span>Log Masuk Sistem</span>
            </Link>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 py-1">
              <IconShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Dilindungi Penyulitan SSL / TLS LPKmn</span>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  )
}
