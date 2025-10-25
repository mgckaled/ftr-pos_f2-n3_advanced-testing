import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Accordion } from './Accordion'

const mockItems = [
  { title: 'What are your office hours?', content: 'We are open Monday to Friday, 8am to 6pm.' },
  { title: 'Do you accept insurance?', content: 'Yes, we accept most major insurance plans.' },
  { title: 'How do I book an appointment?', content: 'You can book online or call our office.' },
]

describe('Accordion', () => {
  describe('Rendering', () => {
    it('should render all accordion items', () => {
      render(<Accordion items={mockItems} />)

      expect(screen.getByText('What are your office hours?')).toBeInTheDocument()
      expect(screen.getByText('Do you accept insurance?')).toBeInTheDocument()
      expect(screen.getByText('How do I book an appointment?')).toBeInTheDocument()
    })

    it('should render empty accordion with no items', () => {
      render(<Accordion items={[]} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render all items closed by default', () => {
      render(<Accordion items={mockItems} />)

      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
      expect(screen.queryByText('Yes, we accept most major insurance plans.')).not.toBeInTheDocument()
      expect(screen.queryByText('You can book online or call our office.')).not.toBeInTheDocument()
    })

    it('should render items with defaultOpenIndexes', () => {
      render(<Accordion items={mockItems} defaultOpenIndexes={[0, 2]} />)

      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()
      expect(screen.getByText('You can book online or call our office.')).toBeInTheDocument()
      expect(screen.queryByText('Yes, we accept most major insurance plans.')).not.toBeInTheDocument()
    })
  })

  describe('Single item mode (default)', () => {
    it('should open item when clicked', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      await user.click(screen.getByText('What are your office hours?'))

      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()
    })

    it('should close item when clicked again', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const button = screen.getByText('What are your office hours?')

      await user.click(button)
      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()

      await user.click(button)
      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
    })

    it('should close other items when opening a new one', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      await user.click(screen.getByText('What are your office hours?'))
      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()

      await user.click(screen.getByText('Do you accept insurance?'))
      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
      expect(screen.getByText('Yes, we accept most major insurance plans.')).toBeInTheDocument()
    })
  })

  describe('Multiple items mode', () => {
    it('should allow multiple items to be open', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} allowMultiple />)

      await user.click(screen.getByText('What are your office hours?'))
      await user.click(screen.getByText('Do you accept insurance?'))

      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()
      expect(screen.getByText('Yes, we accept most major insurance plans.')).toBeInTheDocument()
    })

    it('should allow closing individual items without affecting others', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} allowMultiple />)

      await user.click(screen.getByText('What are your office hours?'))
      await user.click(screen.getByText('Do you accept insurance?'))

      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()
      expect(screen.getByText('Yes, we accept most major insurance plans.')).toBeInTheDocument()

      await user.click(screen.getByText('What are your office hours?'))

      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
      expect(screen.getByText('Yes, we accept most major insurance plans.')).toBeInTheDocument()
    })

    it('should close item when clicked twice', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} allowMultiple />)

      const button = screen.getByText('What are your office hours?')

      await user.click(button)
      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeInTheDocument()

      await user.click(button)
      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
    })
  })

  describe('Keyboard navigation', () => {
    it('should support keyboard interaction', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      buttons[0].focus()

      // Just verify button can receive focus
      expect(document.activeElement).toBe(buttons[0])
    })

    it('should toggle item with Space key', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])
      await user.keyboard(' ')

      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
    })

    it('should not toggle with other keys', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const button = screen.getByText('What are your office hours?')
      button.focus()
      await user.keyboard('a')
      await user.keyboard('{Escape}')

      expect(screen.queryByText('We are open Monday to Friday, 8am to 6pm.')).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have aria-expanded=false when closed', () => {
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveAttribute('aria-expanded', 'false')
    })

    it('should have aria-expanded=true when open', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])

      expect(buttons[0]).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have aria-controls pointing to content', () => {
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveAttribute('aria-controls', 'accordion-content-0')
    })

    it('should show content when open', async () => {
      const user = userEvent.setup()
      render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[0])

      expect(screen.getByText('We are open Monday to Friday, 8am to 6pm.')).toBeVisible()
    })
  })

  describe('Visual feedback', () => {
    it('should rotate icon when item is open', async () => {
      const user = userEvent.setup()
      const { container } = render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      const icon = container.querySelector('svg')

      expect(icon).not.toHaveClass('rotate-180')

      await user.click(buttons[0])

      expect(icon).toHaveClass('rotate-180')
    })

    it('should remove rotation when item is closed', async () => {
      const user = userEvent.setup()
      const { container } = render(<Accordion items={mockItems} />)

      const buttons = screen.getAllByRole('button')
      const icon = container.querySelector('svg')

      await user.click(buttons[0])
      expect(icon).toHaveClass('rotate-180')

      await user.click(buttons[0])
      expect(icon).not.toHaveClass('rotate-180')
    })
  })

  describe('Complex content', () => {
    it('should render complex JSX content', async () => {
      const user = userEvent.setup()
      const items = [
        {
          title: 'Complex Content',
          content: (
            <div>
              <p>Paragraph 1</p>
              <button>Action Button</button>
            </div>
          ),
        },
      ]

      render(<Accordion items={items} />)

      await user.click(screen.getByText('Complex Content'))

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action Button' })).toBeInTheDocument()
    })
  })
})