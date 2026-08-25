import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { IconSpinner } from './icons'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leadingIcon,
  trailingIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer select-none'

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  }[size]

  const variantClasses = {
    primary:
      'bg-[#0b2545] text-white hover:bg-[#133e87] active:bg-[#07192f] focus-visible:outline-[#0b2545] shadow-xs',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 focus-visible:outline-slate-700',
    outline:
      'bg-transparent text-[#0b2545] border border-[#0b2545] hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-[#0b2545]',
    gold:
      'bg-[#b45309] text-white hover:bg-[#92400e] active:bg-[#78350f] focus-visible:outline-[#b45309] shadow-xs',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:outline-red-600 shadow-xs',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:outline-slate-600',
  }[variant]

  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="h-4 w-4 shrink-0" />
      ) : leadingIcon ? (
        <span className="shrink-0">{leadingIcon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && trailingIcon ? (
        <span className="shrink-0">{trailingIcon}</span>
      ) : null}
    </button>
  )
}
