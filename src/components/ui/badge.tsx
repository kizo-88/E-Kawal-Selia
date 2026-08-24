import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold'
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expiring'
  | 'expired'
  | 'active'
  | 'inactive'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  icon?: ReactNode
  dot?: boolean
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  dot,
  className = '',
  ...props
}: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }[size]

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-100 text-slate-800 border border-slate-200',
    primary: 'bg-[#0b2545]/10 text-[#0b2545] border border-[#0b2545]/20 font-semibold',
    secondary: 'bg-slate-200/70 text-slate-700 border border-slate-300',
    outline: 'bg-transparent text-slate-700 border border-slate-300',
    gold: 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
    danger: 'bg-red-50 text-red-700 border border-red-200 font-medium',
    info: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium',

    // Status mapping (M1-R12)
    draft: 'bg-slate-100 text-slate-700 border border-slate-200',
    submitted: 'bg-blue-50 text-blue-700 border border-blue-200 font-medium',
    in_review: 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium',
    approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
    rejected: 'bg-red-50 text-red-700 border border-red-200 font-semibold',
    expiring: 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold',
    expired: 'bg-rose-100 text-rose-800 border border-rose-300 font-semibold',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
    inactive: 'bg-slate-100 text-slate-600 border border-slate-300',
  }

  const dotClasses: Record<BadgeVariant, string> = {
    default: 'bg-slate-500',
    primary: 'bg-[#0b2545]',
    secondary: 'bg-slate-500',
    outline: 'bg-slate-500',
    gold: 'bg-amber-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    danger: 'bg-red-600',
    info: 'bg-blue-600',
    draft: 'bg-slate-400',
    submitted: 'bg-blue-500',
    in_review: 'bg-indigo-500',
    approved: 'bg-emerald-600',
    rejected: 'bg-red-600',
    expiring: 'bg-amber-600',
    expired: 'bg-rose-600',
    active: 'bg-emerald-600',
    inactive: 'bg-slate-400',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-wide ${sizeClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot ? (
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotClasses[variant]}`} aria-hidden="true" />
      ) : null}
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span>{children}</span>
    </span>
  )
}
