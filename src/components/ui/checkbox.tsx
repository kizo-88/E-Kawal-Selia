import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: ReactNode
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, id, className = '', disabled, ...props }, ref) => {
    const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const descId = checkboxId ? `${checkboxId}-desc` : undefined
    const errorId = checkboxId ? `${checkboxId}-error` : undefined

    return (
      <div className="flex items-start gap-2.5">
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            disabled={disabled}
            aria-describedby={error ? errorId : description ? descId : undefined}
            className={`h-4 w-4 rounded border-slate-300 text-[#0b2545] focus:ring-[#0b2545] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
          />
        </div>
        {(label || description || error) ? (
          <div className="text-sm">
            {label ? (
              <label
                htmlFor={checkboxId}
                className="font-medium text-slate-800 cursor-pointer select-none"
              >
                {label}
              </label>
            ) : null}
            {description ? (
              <p id={descId} className="text-xs text-slate-500">
                {description}
              </p>
            ) : null}
            {error ? (
              <p id={errorId} className="mt-1 text-xs text-red-600 font-medium">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
