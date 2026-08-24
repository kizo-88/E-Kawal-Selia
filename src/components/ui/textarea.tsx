import { forwardRef, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      className = '',
      required,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
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

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-xs transition-colors
            ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-600'
                : 'border-slate-300 hover:border-slate-400 focus:border-[#0b2545] focus:ring-1 focus:ring-[#0b2545]'
            }
            disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}`}
          {...props}
        />

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

Textarea.displayName = 'Textarea'
