'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { MenuNode } from '../../lib/menu/menu-pure'
import {
  IconAnchor,
  IconBuilding,
  IconChevronDown,
  IconChevronUp,
  IconFileText,
  IconLock,
  IconShield,
  IconShip,
  IconUser,
} from '../ui/icons'

export interface AdminSidebarProps {
  menuTree: MenuNode[]
  userRoleNameMs: string
  userRoleNameEn: string
  isOpenMobile: boolean
  onCloseMobile: () => void
}

export function AdminSidebar({
  menuTree,
  userRoleNameMs,
  userRoleNameEn,
  isOpenMobile,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname()

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    permohonan: true,
    pengurusan: true,
  })

  const toggleNode = (code: string) => {
    setExpandedNodes((prev) => ({ ...prev, [code]: !prev[code] }))
  }

  const renderIcon = (iconName: string | null) => {
    switch (iconName) {
      case 'dashboard':
        return <IconAnchor className="h-4 w-4" />
      case 'application':
      case 'permohonan':
        return <IconFileText className="h-4 w-4" />
      case 'ship':
      case 'licence':
        return <IconShip className="h-4 w-4" />
      case 'audit':
      case 'shield':
        return <IconShield className="h-4 w-4" />
      case 'users':
      case 'org':
        return <IconBuilding className="h-4 w-4" />
      case 'settings':
      case 'lock':
        return <IconLock className="h-4 w-4" />
      default:
        return <IconFileText className="h-4 w-4" />
    }
  }

  const renderMenuItems = (nodes: MenuNode[], depth = 0) => {
    return (
      <ul className={`space-y-1 ${depth > 0 ? 'pl-4 border-l border-slate-700/60 ml-2 mt-1' : ''}`}>
        {nodes.map((node) => {
          const hasChildren = node.children && node.children.length > 0
          const isExpanded = expandedNodes[node.code] !== false
          const isActive = node.route ? pathname === node.route || (node.route !== '/dashboard' && pathname.startsWith(node.route)) : false

          return (
            <li key={String(node.id)}>
              {hasChildren ? (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleNode(node.code)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="text-amber-400">{renderIcon(node.icon)}</span>
                      <span>{node.labelMs}</span>
                    </span>
                    <span className="text-slate-400">
                      {isExpanded ? (
                        <IconChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <IconChevronDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>
                  {isExpanded ? renderMenuItems(node.children, depth + 1) : null}
                </div>
              ) : (
                <Link
                  href={node.route || '#'}
                  onClick={onCloseMobile}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                    {renderIcon(node.icon)}
                  </span>
                  <span>{node.labelMs}</span>
                </Link>
              )}
            </li>
          )
        })}
      </ul>
    )
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile ? (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#07192f] text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Portal Header */}
        <div className="h-16 px-5 bg-[#0b2545] border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-xs">
              <IconAnchor className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight">
                e-Kawalselia
              </span>
              <span className="block text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                LPKmn Portal
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden text-slate-400 hover:text-white p-1"
            aria-label="Tutup menu navigasi"
          >
            <IconChevronDown className="h-5 w-5 rotate-90" />
          </button>
        </div>

        {/* Current Active Role Badge (GP-01, GP-15) */}
        <div
          data-role-en={userRoleNameEn}
          className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2"
        >

          <div className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Tahap Akses Semasa
            </span>
            <span className="text-xs font-bold text-slate-100 truncate">
              {userRoleNameMs}
            </span>
          </div>
        </div>

        {/* Menu Navigation Items (GP-01) */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Menu Utama
            </span>
            {renderMenuItems(menuTree)}
          </div>
        </nav>

        {/* User Info & Quick Signout (GP-15) */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0">
              <IconUser className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">
                Pengguna Sistem
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Lembaga Pelabuhan Kemaman
              </span>
            </div>
          </div>

          <Link
            href="/login"
            title="Log Keluar"
            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800/80 transition-colors"
          >
            <IconLock className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </>
  )
}
