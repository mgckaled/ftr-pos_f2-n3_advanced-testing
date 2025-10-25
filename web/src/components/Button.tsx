import type { ComponentProps } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

export interface ButtonProps extends ComponentProps<'button'> {
  variant?: ButtonVariant
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
}
