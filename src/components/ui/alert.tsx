import type { HTMLAttributes, ReactNode } from 'react'
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheckCircle,
  IconInfo,
} from './icons'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger'
  icon?: ReactNode
  hideIcon?: boolean
}

export function Alert({
  children,
  variant = 'info',
  icon,
  hideIcon = false,
  className = '',
  ...props
}: AlertProps) {
  const variantStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      iconColor: 'text-blue-600',
      defaultIcon: <IconInfo className="h-5 w-5" />,
    },
    success: {
      container: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      iconColor: 'text-emerald-600',
      defaultIcon: <IconCheckCircle className="h-5 w-5" />,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      defaultIcon: <IconAlertTriangle className="h-5 w-5" />,
    },
    danger: {
      container: 'bg-red-50 border-red-200 text-red-900',
      iconColor: 'text-red-600',
      defaultIcon: <IconAlertCircle className="h-5 w-5" />,
    },
  }[variant]

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-lg border p-4 text-sm ${variantStyles.container} ${className}`}
      {...props}
    >
      {!hideIcon ? (
        <div className={`shrink-0 mt-0.5 ${variantStyles.iconColor}`}>
          {icon || variantStyles.defaultIcon}
        </div>
      ) : null}
      <div className="flex-1 space-y-1">{children}</div>
    </div>
  )
}

export function AlertTitle({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={`font-semibold leading-tight tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h5>
  )
}

export function AlertDescription({
  children,
  className = '',
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div className={`text-sm opacity-90 leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  )
}
