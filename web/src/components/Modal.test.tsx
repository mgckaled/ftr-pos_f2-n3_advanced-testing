import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Modal } from "./Modal"

describe("Modal", () => {
  describe("Rendering", () => {
    it("should render modal when isOpen is true", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          Modal content
        </Modal>
      )

      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("should not render modal when isOpen is false", () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
          Modal content
        </Modal>
      )

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("should render modal title", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Confirm Action">
          Content
        </Modal>
      )

      expect(screen.getByText("Confirm Action")).toBeInTheDocument()
    })

    it("should render modal children", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          <p>This is the modal content</p>
        </Modal>
      )

      expect(screen.getByText("This is the modal content")).toBeInTheDocument()
    })

    it("should render footer when provided", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Modal"
          footer={<button type="button">OK</button>}
        >
          Content
        </Modal>
      )

      expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument()
    })

    it("should not render footer when not provided", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      // Only close button should exist
      expect(screen.getAllByRole("button")).toHaveLength(1)
    })
  })

  describe("Accessibility", () => {
    it("should have role dialog", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(screen.getByRole("dialog")).toHaveAttribute("role", "dialog")
    })

    it("should have aria-modal attribute", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true")
    })

    it("should have aria-labelledby pointing to title", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(screen.getByRole("dialog")).toHaveAttribute("aria-labelledby", "modal-title")
      expect(screen.getByText("Modal")).toHaveAttribute("id", "modal-title")
    })

    it("should have close button with aria-label", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(screen.getByLabelText("Close modal")).toBeInTheDocument()
    })
  })

  describe("Close interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal">
          Content
        </Modal>
      )

      await user.click(screen.getByLabelText("Close modal"))

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it("should call onClose when Escape key is pressed", async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal">
          Content
        </Modal>
      )

      await user.keyboard("{Escape}")

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it("should call onClose when backdrop is clicked", async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal">
          Content
        </Modal>
      )

      await user.click(screen.getByRole("dialog"))

      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it("should not call onClose when modal content is clicked", async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={true} onClose={handleClose} title="Modal">
          <div data-testid="modal-content">Content</div>
        </Modal>
      )

      await user.click(screen.getByTestId("modal-content"))

      expect(handleClose).not.toHaveBeenCalled()
    })

    it("should not call onClose when Escape is pressed and modal is closed", async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal isOpen={false} onClose={handleClose} title="Modal">
          Content
        </Modal>
      )

      await user.keyboard("{Escape}")

      expect(handleClose).not.toHaveBeenCalled()
    })
  })

  describe("Body overflow", () => {
    it("should set body overflow to hidden when modal is open", () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(document.body.style.overflow).toBe("hidden")
    })

    it("should restore body overflow when modal is closed", () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(document.body.style.overflow).toBe("hidden")

      rerender(
        <Modal isOpen={false} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(document.body.style.overflow).toBe("unset")
    })

    it("should restore body overflow when component unmounts", () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={vi.fn()} title="Modal">
          Content
        </Modal>
      )

      expect(document.body.style.overflow).toBe("hidden")

      unmount()

      expect(document.body.style.overflow).toBe("unset")
    })
  })

  describe("Integration", () => {
    it("should render complete modal with all features", async () => {
      const handleClose = vi.fn()
      const user = userEvent.setup()

      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Delete Account"
          footer={
            <>
              <button type="button" onClick={handleClose}>
                Cancel
              </button>
              <button type="button">Confirm</button>
            </>
          }
        >
          <p>Are you sure you want to delete your account?</p>
        </Modal>
      )

      expect(screen.getByText("Delete Account")).toBeInTheDocument()
      expect(screen.getByText("Are you sure you want to delete your account?")).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "Cancel" }))
      expect(handleClose).toHaveBeenCalled()
    })
  })
})
