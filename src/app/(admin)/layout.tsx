'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { AdminSidebar } from '../../components/admin/admin-sidebar'
import { AdminHeader } from '../../components/admin/admin-header'
import { buildMenuTree } from '../../lib/menu/menu-pure'
import { BASELINE_MENU_SOURCE_ITEMS } from '../../lib/menu/menu-items'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<'superadmin' | 'approver' | 'applicant'>('superadmin')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Map UI role to role ID in baseline seed:
  // BigInt(1) = Super Admin, BigInt(4) = Approver/Reviewer (Unit M/T), BigInt(5) = End User / Applicant
  const userRoleIds = useMemo(() => {
    switch (currentRole) {
      case 'superadmin':
        return [BigInt(1)]
      case 'approver':
        return [BigInt(4)]
      case 'applicant':
        return [BigInt(5)]
    }
  }, [currentRole])

  const roleName = useMemo(() => {
    switch (currentRole) {
      case 'superadmin':
        return { ms: 'Pentadbir Sistem (Super Admin)', en: 'System Administrator' }
      case 'approver':
        return { ms: 'Pegawai Penilai / Pelulus (Unit M/T)', en: 'Approving Officer' }
      case 'applicant':
        return { ms: 'Pemohon Syarikat Perkapalan', en: 'Company Applicant' }
    }
  }, [currentRole])

  const menuTree = useMemo(() => {
    return buildMenuTree(BASELINE_MENU_SOURCE_ITEMS, userRoleIds, 'ms')
  }, [userRoleIds])

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar
        menuTree={menuTree}
        userRoleNameMs={roleName.ms}
        userRoleNameEn={roleName.en}
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Lembaga Pelabuhan Kemaman (LPKmn). Hak Cipta Terpelihara.</span>
          <span className="text-[11px] text-slate-400">Modul Pentadbiran e-Kawalselia (GP-15)</span>
        </footer>
      </div>
    </div>
  )
}
