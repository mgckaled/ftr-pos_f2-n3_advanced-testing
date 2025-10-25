import type { ReactNode } from 'react'

export interface CardProps {
  title: string
  description?: string
  icon?: ReactNode
  onClick?: () => void
  className?: string
}

export function Card({ title, description, icon, onClick, className = '' }: CardProps) {
  const isClickable = !!onClick
  const baseClasses =
    'p-6 bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-200'
  const clickableClasses = isClickable
    ? 'cursor-pointer hover:shadow-lg hover:border-blue-500'
    : ''

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (onClick && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <div
      className={`${baseClasses} ${clickableClasses} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? title : undefined}
    >
      {icon && <div className="mb-4 text-blue-600">{icon}</div>}
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-600">{description}</p>}
    </div>
  )
}
