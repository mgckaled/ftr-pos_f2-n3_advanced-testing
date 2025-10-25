import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Card } from "./Card"

describe("Card", () => {
  describe("Rendering", () => {
    it("should render card with title", () => {
      render(<Card title="Cardiology" />)
      expect(screen.getByText("Cardiology")).toBeInTheDocument()
    })

    it("should render card with description", () => {
      render(<Card title="Cardiology" description="Heart health specialists" />)
      expect(screen.getByText("Heart health specialists")).toBeInTheDocument()
    })

    it("should render without description", () => {
      render(<Card title="Cardiology" />)
      expect(screen.queryByText(/health/i)).not.toBeInTheDocument()
    })

    it("should render with icon", () => {
      const icon = (
        <svg data-testid="card-icon" aria-label="Card icon">
          <title>Card icon</title>
          Icon
        </svg>
      )
      render(<Card title="Cardiology" icon={icon} />)
      expect(screen.getByTestId("card-icon")).toBeInTheDocument()
    })

    it("should render without icon", () => {
      render(<Card title="Cardiology" />)
      expect(screen.queryByTestId("card-icon")).not.toBeInTheDocument()
    })
  })

  describe("Clickable behavior", () => {
    it("should be clickable when onClick is provided", () => {
      const handleClick = vi.fn()
      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button", { name: "Cardiology" })
      expect(card).toBeInTheDocument()
    })

    it("should not be a button when onClick is not provided", () => {
      render(<Card title="Cardiology" />)
      expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("should have cursor-pointer class when clickable", () => {
      const handleClick = vi.fn()
      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button")
      expect(card).toHaveClass("cursor-pointer")
    })

    it("should not have cursor-pointer class when not clickable", () => {
      render(<Card title="Cardiology" />)
      const card = screen.getByText("Cardiology").parentElement as HTMLElement
      expect(card).not.toHaveClass("cursor-pointer")
    })

    it("should be keyboard accessible when clickable", () => {
      const handleClick = vi.fn()
      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button")
      expect(card).toHaveAttribute("tabIndex", "0")
    })

    it("should not have tabIndex when not clickable", () => {
      render(<Card title="Cardiology" />)
      const card = screen.getByText("Cardiology").parentElement as HTMLElement
      expect(card).not.toHaveAttribute("tabIndex")
    })
  })

  describe("Interactions", () => {
    it("should call onClick when clicked", async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Card title="Cardiology" onClick={handleClick} />)

      await user.click(screen.getByRole("button"))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("should call onClick when Enter key is pressed", async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button")
      card.focus()
      await user.keyboard("{Enter}")

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("should call onClick when Space key is pressed", async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button")
      card.focus()
      await user.keyboard(" ")

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("should not call onClick when other keys are pressed", async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button")
      card.focus()
      await user.keyboard("a")
      await user.keyboard("{Escape}")

      expect(handleClick).not.toHaveBeenCalled()
    })

    it("should not trigger onClick when not clickable", async () => {
      const user = userEvent.setup()
      render(<Card title="Cardiology" />)

      const card = screen.getByText("Cardiology").parentElement as HTMLElement
      await user.click(card)

      // Should not throw or cause issues
      expect(card).toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have aria-label when clickable", () => {
      const handleClick = vi.fn()
      render(<Card title="Cardiology" onClick={handleClick} />)

      const card = screen.getByRole("button")
      expect(card).toHaveAttribute("aria-label", "Cardiology")
    })

    it("should not have aria-label when not clickable", () => {
      render(<Card title="Cardiology" />)
      const card = screen.getByText("Cardiology").parentElement as HTMLElement
      expect(card).not.toHaveAttribute("aria-label")
    })

    it("should have role button when clickable", () => {
      const handleClick = vi.fn()
      render(<Card title="Cardiology" onClick={handleClick} />)

      expect(screen.getByRole("button")).toBeInTheDocument()
    })
  })

  describe("Custom styling", () => {
    it("should accept custom className", () => {
      render(<Card title="Cardiology" className="custom-class" />)
      const card = screen.getByText("Cardiology").parentElement as HTMLElement
      expect(card).toHaveClass("custom-class")
    })

    it("should maintain base classes with custom className", () => {
      render(<Card title="Cardiology" className="custom-class" />)
      const card = screen.getByText("Cardiology").parentElement as HTMLElement
      expect(card).toHaveClass("p-6", "bg-white", "custom-class")
    })
  })

  describe("Integration", () => {
    it("should render complete card with all props", () => {
      const handleClick = vi.fn()
      const icon = (
        <svg data-testid="icon" aria-label="Icon">
          <title>Icon</title>
          Icon
        </svg>
      )

      render(
        <Card
          title="Cardiology"
          description="Heart specialists"
          icon={icon}
          onClick={handleClick}
          className="custom"
        />
      )

      expect(screen.getByRole("button", { name: "Cardiology" })).toBeInTheDocument()
      expect(screen.getByText("Heart specialists")).toBeInTheDocument()
      expect(screen.getByTestId("icon")).toBeInTheDocument()
      expect(screen.getByRole("button")).toHaveClass("custom")
    })
  })
})
