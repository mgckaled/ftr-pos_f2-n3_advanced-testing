import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Input } from "./Input"

describe("Input", () => {
  describe("Rendering", () => {
    it("should render input field", () => {
      render(<Input />)
      expect(screen.getByRole("textbox")).toBeInTheDocument()
    })

    it("should render with label", () => {
      render(<Input label="Email" />)
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
    })

    it("should associate label with input using htmlFor", () => {
      render(<Input label="Full Name" />)
      const input = screen.getByLabelText("Full Name")
      expect(input).toHaveAttribute("id", "full-name")
    })

    it("should use custom id when provided", () => {
      render(<Input label="Email" id="custom-id" />)
      const input = screen.getByLabelText("Email")
      expect(input).toHaveAttribute("id", "custom-id")
    })

    it("should render without label", () => {
      render(<Input placeholder="Enter text" />)
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument()
    })
  })

  describe("Helper text", () => {
    it("should display helper text", () => {
      render(<Input label="Email" helperText="Enter your email address" />)
      expect(screen.getByText("Enter your email address")).toBeInTheDocument()
    })

    it("should associate helper text with input using aria-describedby", () => {
      render(<Input label="Email" helperText="Enter your email" />)
      const input = screen.getByLabelText("Email")
      expect(input).toHaveAttribute("aria-describedby", "email-helper")
    })
  })

  describe("Error state", () => {
    it("should display error message", () => {
      render(<Input label="Email" error="Email is required" />)
      expect(screen.getByText("Email is required")).toBeInTheDocument()
    })

    it("should have role alert on error message", () => {
      render(<Input label="Email" error="Invalid email" />)
      const error = screen.getByRole("alert")
      expect(error).toHaveTextContent("Invalid email")
    })

    it("should have aria-invalid when error exists", () => {
      render(<Input label="Email" error="Invalid" />)
      expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true")
    })

    it("should not have aria-invalid when no error", () => {
      render(<Input label="Email" />)
      expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false")
    })

    it("should show error with border-red-500 class", () => {
      render(<Input label="Email" error="Invalid" />)
      expect(screen.getByLabelText("Email")).toHaveClass("border-red-500")
    })

    it("should hide helper text when error is present", () => {
      render(<Input label="Email" error="Error message" helperText="Helper text" />)
      expect(screen.queryByText("Helper text")).not.toBeInTheDocument()
      expect(screen.getByText("Error message")).toBeInTheDocument()
    })

    it("should associate error with input using aria-describedby", () => {
      render(<Input label="Email" error="Invalid email" />)
      const input = screen.getByLabelText("Email")
      expect(input).toHaveAttribute("aria-describedby", "email-error")
    })
  })

  describe("Input types", () => {
    it("should render as email type", () => {
      render(<Input type="email" label="Email" />)
      expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email")
    })

    it("should render as password type", () => {
      render(<Input type="password" label="Password" />)
      expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
    })

    it("should render as number type", () => {
      render(<Input type="number" label="Age" />)
      expect(screen.getByLabelText("Age")).toHaveAttribute("type", "number")
    })
  })

  describe("Interactions", () => {
    it("should allow user to type text", async () => {
      const user = userEvent.setup()
      render(<Input label="Name" />)

      const input = screen.getByLabelText("Name")
      await user.type(input, "John Doe")

      expect(input).toHaveValue("John Doe")
    })

    it("should call onChange when value changes", async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input label="Name" onChange={handleChange} />)

      await user.type(screen.getByLabelText("Name"), "A")

      expect(handleChange).toHaveBeenCalled()
    })

    it("should call onFocus when input is focused", async () => {
      const handleFocus = vi.fn()
      const user = userEvent.setup()

      render(<Input label="Name" onFocus={handleFocus} />)

      await user.click(screen.getByLabelText("Name"))

      expect(handleFocus).toHaveBeenCalledTimes(1)
    })

    it("should call onBlur when input loses focus", async () => {
      const handleBlur = vi.fn()
      const user = userEvent.setup()

      render(<Input label="Name" onBlur={handleBlur} />)

      const input = screen.getByLabelText("Name")
      await user.click(input)
      await user.tab()

      expect(handleBlur).toHaveBeenCalledTimes(1)
    })
  })

  describe("Disabled state", () => {
    it("should be disabled when disabled prop is true", () => {
      render(<Input label="Name" disabled />)
      expect(screen.getByLabelText("Name")).toBeDisabled()
    })

    it("should not allow typing when disabled", async () => {
      const user = userEvent.setup()
      render(<Input label="Name" disabled />)

      const input = screen.getByLabelText("Name")
      await user.type(input, "text")

      expect(input).toHaveValue("")
    })
  })

  describe("Custom props", () => {
    it("should accept custom className", () => {
      render(<Input label="Name" className="custom-class" />)
      expect(screen.getByLabelText("Name")).toHaveClass("custom-class")
    })

    it("should accept placeholder", () => {
      render(<Input placeholder="Enter your name" />)
      expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument()
    })

    it("should accept required attribute", () => {
      render(<Input label="Name" required />)
      expect(screen.getByLabelText("Name")).toBeRequired()
    })

    it("should accept maxLength attribute", () => {
      render(<Input label="Name" maxLength={50} />)
      expect(screen.getByLabelText("Name")).toHaveAttribute("maxLength", "50")
    })
  })
})
