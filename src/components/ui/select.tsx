import { forwardRef, type SelectHTMLAttributes } from 'react'
import { IconChevronDown } from './icons'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options?: SelectOption[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options = [],
      placeholder,
      id,
      className = '',
      required,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const errorId = selectId ? `${selectId}-error` : undefined
    const helperId = selectId ? `${selectId}-helper` : undefined

    return (
      <div className="w-full">
        {label ? (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5"
          >
            {label}
            {required ? <span className="text-red-600 ml-1" aria-hidden="true">*</span> : null}
          </label>
        ) : null}

        <div className="relative rounded-md shadow-xs">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`block w-full appearance-none rounded-md border bg-white px-3 py-2 pr-10 text-sm text-slate-900 transition-colors
              ${
                error
                  ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                  : 'border-slate-300 hover:border-slate-400 focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]'
              }
              disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
              ${className}`}
            {...props}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <IconChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = 'Select'
