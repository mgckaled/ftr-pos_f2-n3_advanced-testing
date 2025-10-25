import type { ComponentProps } from "react"

export interface InputProps extends ComponentProps<"input"> {
  label?: string
  error?: string
  helperText?: string
}

export function Input({ label, error, helperText, id, className = "", ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

  const baseClasses =
    "w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 transition-colors"
  const errorClasses = error
    ? "border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:ring-blue-500"

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`${baseClasses} ${errorClasses} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  )
}
