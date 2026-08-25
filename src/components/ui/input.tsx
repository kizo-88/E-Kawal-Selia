'use client'

import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { IconEye, IconEyeOff } from './icons'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon,
      trailingIcon,
      type = 'text',
      id,
      className = '',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errorId = inputId ? `${inputId}-error` : undefined
    const helperId = inputId ? `${inputId}-helper` : undefined

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5"
          >
            {label}
            {required ? <span className="text-red-600 ml-1" aria-hidden="true">*</span> : null}
          </label>
        ) : null}

        <div className="relative rounded-md shadow-xs">
          {leadingIcon ? (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              {leadingIcon}
            </div>
          ) : null}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors
              ${leadingIcon ? 'pl-9' : ''}
              ${trailingIcon || isPassword ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                  : 'border-slate-300 hover:border-slate-400 focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]'
              }
              disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Tunjukkan kata laluan'}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
            >
              {showPassword ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </button>
          ) : trailingIcon ? (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
              {trailingIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p id={errorId} className="mt-1 text-xs text-red-600 font-medium">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
