'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  IconAnchor,
  IconCheckCircle,
  IconHelpCircle,
  IconInfo,
  IconLock,
  IconUser,
} from '../ui/icons'


export interface AdminHeaderProps {
  currentRole: 'superadmin' | 'approver' | 'applicant'
  onRoleChange: (role: 'superadmin' | 'approver' | 'applicant') => void
  onOpenMobileMenu: () => void
  unreadNotificationsCount?: number
}

export function AdminHeader({
  currentRole,
  onRoleChange,
  onOpenMobileMenu,
  unreadNotificationsCount = 3,
}: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const roleLabels = {
    superadmin: { ms: 'Pentadbir Sistem (Super Admin)', en: 'System Administrator (Super Admin)' },
    approver: { ms: 'Pegawai Penilai / Pelulus (Unit M/T)', en: 'Reviewer / Approver (M/T Unit)' },
    applicant: { ms: 'Pemohon Syarikat Perkapalan', en: 'Shipping Company Applicant' },
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Mobile Hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Buka menu navigasi"
          className="lg:hidden p-2 rounded-md text-slate-700 hover:bg-slate-100 focus:outline-hidden"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
          <Link href="/dashboard" className="hover:text-[#0b2545] font-semibold text-slate-900">
            e-Kawalselia
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-medium">Panel Pengurusan</span>
        </div>
      </div>

      {/* Right: Quick Role Switcher (GP-15 Access Level Testing) + Notifications + User Menu */}
      <div className="flex items-center gap-3">
        {/* Role Switcher for previewing GP-15 adaptivity */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Peranan:
          </span>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value as 'superadmin' | 'approver' | 'applicant')}
            aria-label="Tukar peranan pengguna"
            className="bg-transparent font-bold text-[#0b2545] focus:outline-hidden cursor-pointer text-xs"
          >
            <option value="superadmin">Pentadbir Sistem</option>
            <option value="approver">Pelulus Unit M/T</option>
            <option value="applicant">Pemohon Syarikat</option>
          </select>
        </div>

        {/* Notification Bell (GP-16) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Pemberitahuan sistem"
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadNotificationsCount > 0 ? (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            ) : null}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications ? (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden">
              <div className="p-4 bg-[#0b2545] text-white flex items-center justify-between">
                <span className="font-bold text-sm">Pemberitahuan Sistem (In-App)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                  {unreadNotificationsCount} Baru
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                <div className="p-3 text-xs hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <IconCheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Permohonan Diluluskan</span>
                    </span>
                    <span className="text-[10px] text-slate-400">10 min lalu</span>
                  </div>
                  <p className="text-slate-600">
                    Permohonan Lesen Sokongan LPK/LPS/2026/00142 telah diluluskan oleh Ketua Unit M/T.
                  </p>
                </div>
                <div className="p-3 text-xs hover:bg-slate-50 transition-colors space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <IconInfo className="h-3.5 w-3.5 text-amber-600" />
                      <span>Peringatan SLA Semakan</span>
                    </span>
                    <span className="text-[10px] text-slate-400">1 jam lalu</span>
                  </div>
                  <p className="text-slate-600">
                    Permohonan PAP/2026/0088 memerlukan ulasan teknikal dalam tempoh baki 2 hari.
                  </p>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-[#0b2545] hover:underline"
                >
                  Lihat Semua Pemberitahuan
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu((prev) => !prev)}
            aria-label="Menu profil pengguna"
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-[#0b2545] text-amber-400 flex items-center justify-center font-bold text-xs">
              <IconUser className="h-4 w-4" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                Pegawai LPKmn
              </span>
              <span className="text-[10px] text-slate-500">
                {roleLabels[currentRole].ms}
              </span>
            </div>
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu ? (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200 shadow-xl z-50 py-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Akaun Berdaftar</p>
                <p className="text-[11px] text-slate-500 truncate">
                  pegawai@lpktg.gov.my
                </p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <IconAnchor className="h-4 w-4 text-slate-400" />
                <span>Dashboard Utama</span>
              </Link>
              <Link
                href="/bantuan"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <IconHelpCircle className="h-4 w-4 text-slate-400" />
                <span>Panduan &amp; Bantuan</span>
              </Link>
              <div className="border-t border-slate-100 mt-1 pt-1">
                <Link
                  href="/login"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                >
                  <IconLock className="h-4 w-4" />
                  <span>Log Keluar</span>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}
