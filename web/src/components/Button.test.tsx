import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  describe('Rendering', () => {
    it('should render button with children', () => {
      render(<Button>Click me</Button>)
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
    })

    it('should render with primary variant by default', () => {
      render(<Button>Primary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600')
    })

    it('should render with secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-200')
    })

    it('should render with danger variant', () => {
      render(<Button variant="danger">Delete</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-600')
    })
  })

  describe('Loading state', () => {
    it('should show loading text when loading', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Loading...')
    })

    it('should disable button when loading', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not show children when loading', () => {
      render(<Button loading>Submit</Button>)
      expect(screen.getByRole('button')).not.toHaveTextContent('Submit')
    })
  })

  describe('Disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should have disabled cursor class', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toHaveClass('disabled:cursor-not-allowed')
    })
  })

  describe('Interactions', () => {
    it('should call onClick when clicked', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      await user.click(screen.getByRole('button'))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>,
      )
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(
        <Button onClick={handleClick} loading>
          Loading
        </Button>,
      )
      await user.click(screen.getByRole('button'))

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Custom props', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      expect(screen.getByRole('button')).toHaveClass('custom-class')
    })

    it('should accept type attribute', () => {
      render(<Button type="submit">Submit</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
    })

    it('should forward other HTML button attributes', () => {
      render(<Button data-testid="custom-button">Button</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })
})
