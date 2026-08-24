'use client'

import { useState, useMemo, type ReactNode } from 'react'
import { AdminSidebar } from '../../components/admin/admin-sidebar'
import { AdminHeader } from '../../components/admin/admin-header'
import { buildMenuTree, type MenuSourceItem } from '../../lib/menu/menu-pure'

export const BASELINE_MENU_SOURCE_ITEMS: MenuSourceItem[] = [
  {
    id: BigInt(1),
    parentId: null,
    code: 'dashboard',
    labelMs: 'Dashboard Utama',
    labelEn: 'Main Dashboard',
    route: '/dashboard',
    icon: 'dashboard',
    sortOrder: 1,
    active: true,
    roleIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)],
  },
  {
    id: BigInt(2),
    parentId: null,
    code: 'permohonan',
    labelMs: 'Modul Permohonan',
    labelEn: 'Application Module',
    route: null,
    icon: 'permohonan',
    sortOrder: 2,
    active: true,
    roleIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)],
  },
  {
    id: BigInt(21),
    parentId: BigInt(2),
    code: 'permohonan.senarai',
    labelMs: 'Senarai Permohonan',
    labelEn: 'Application List',
    route: '/permohonan',
    icon: 'permohonan',
    sortOrder: 1,
    active: true,
    roleIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)],
  },
  {
    id: BigInt(22),
    parentId: BigInt(2),
    code: 'permohonan.baru',
    labelMs: 'Borang Permohonan Baru',
    labelEn: 'New Application Form',
    route: '/permohonan/baru',
    icon: 'permohonan',
    sortOrder: 2,
    active: true,
    roleIds: [BigInt(1), BigInt(2), BigInt(5)], // Super Admin, Data Admin, End User
  },
  {
    id: BigInt(3),
    parentId: null,
    code: 'pelesenan',
    labelMs: 'Pelesenan & Permit',
    labelEn: 'Licences & Permits',
    route: '/pelesenan',
    icon: 'licence',
    sortOrder: 3,
    active: true,
    roleIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)],
  },
  {
    id: BigInt(4),
    parentId: null,
    code: 'pekeliling',
    labelMs: 'Pekeliling & Notis',
    labelEn: 'Circulars & Notices',
    route: '/pekeliling',
    icon: 'pekeliling',
    sortOrder: 4,
    active: true,
    roleIds: [BigInt(1), BigInt(2), BigInt(3), BigInt(4), BigInt(5)],
  },
  {
    id: BigInt(5),
    parentId: null,
    code: 'audit',
    labelMs: 'Jejak Audit Sistem',
    labelEn: 'System Audit Trail',
    route: '/audit',
    icon: 'audit',
    sortOrder: 5,
    active: true,
    roleIds: [BigInt(1), BigInt(2)], // Super Admin & Data Admin
  },
  {
    id: BigInt(6),
    parentId: null,
    code: 'tetapan',
    labelMs: 'Tetapan & Konfigurasi',
    labelEn: 'Settings & Configuration',
    route: '/tetapan',
    icon: 'settings',
    sortOrder: 6,
    active: true,
    roleIds: [BigInt(1)], // Super Admin only
  },
]

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
