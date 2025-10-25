import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { AppointmentForm } from "./AppointmentForm"

describe("AppointmentForm", () => {
  describe("Rendering", () => {
    it("should render form with all fields", () => {
      render(<AppointmentForm />)

      expect(screen.getByText("Agendamento de Consulta")).toBeInTheDocument()
      expect(screen.getByLabelText("Nome do Paciente")).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Telefone")).toBeInTheDocument()
      expect(screen.getByLabelText("Data da Consulta")).toBeInTheDocument()
      expect(screen.getByLabelText("Horário")).toBeInTheDocument()
      expect(screen.getByLabelText("Tipo de Consulta")).toBeInTheDocument()
      expect(screen.getByLabelText("Observações")).toBeInTheDocument()
    })

    it("should render submit and clear buttons", () => {
      render(<AppointmentForm />)

      expect(screen.getByRole("button", { name: /agendar consulta/i })).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /limpar/i })).toBeInTheDocument()
    })

    it("should render with initial data", () => {
      const initialData = {
        patientName: "João Silva",
        email: "joao@example.com",
        phone: "(11) 98765-4321",
        date: "2025-12-01",
        time: "10:00",
        appointmentType: "checkup",
        notes: "Primeira consulta",
      }

      render(<AppointmentForm initialData={initialData} />)

      expect(screen.getByDisplayValue("João Silva")).toBeInTheDocument()
      expect(screen.getByDisplayValue("joao@example.com")).toBeInTheDocument()
      expect(screen.getByDisplayValue("(11) 98765-4321")).toBeInTheDocument()
      expect(screen.getByDisplayValue("2025-12-01")).toBeInTheDocument()
      expect(screen.getByDisplayValue("10:00")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Consulta de Rotina")).toBeInTheDocument()
      expect(screen.getByDisplayValue("Primeira consulta")).toBeInTheDocument()
    })

    it("should apply custom className", () => {
      const { container } = render(<AppointmentForm className="custom-class" />)

      const form = container.querySelector("form")
      expect(form).toHaveClass("custom-class")
    })
  })

  describe("Validation - Patient Name", () => {
    it("should show error when patient name is empty", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Nome do paciente é obrigatório")).toBeInTheDocument()
    })

    it("should show error when patient name is too short", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const nameInput = screen.getByLabelText("Nome do Paciente")
      await user.type(nameInput, "Jo")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Nome deve ter pelo menos 3 caracteres")).toBeInTheDocument()
    })

    it("should clear error when user starts typing", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Nome do paciente é obrigatório")).toBeInTheDocument()

      const nameInput = screen.getByLabelText("Nome do Paciente")
      await user.type(nameInput, "João")

      expect(screen.queryByText("Nome do paciente é obrigatório")).not.toBeInTheDocument()
    })
  })

  describe("Validation - Email", () => {
    it("should show error when email is empty", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Email é obrigatório")).toBeInTheDocument()
    })

    it("should show error when email is invalid", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const emailInput = screen.getByLabelText("Email")
      await user.type(emailInput, "invalid-email")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Email inválido")).toBeInTheDocument()
    })

    it("should accept valid email", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      // Get tomorrow's date
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(screen.queryByText("Email inválido")).not.toBeInTheDocument()
    })
  })

  describe("Validation - Phone", () => {
    it("should show error when phone is empty", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Telefone é obrigatório")).toBeInTheDocument()
    })

    it("should show error when phone is invalid", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const phoneInput = screen.getByLabelText("Telefone")
      await user.type(phoneInput, "123")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText(/Telefone inválido/)).toBeInTheDocument()
    })

    it("should accept valid phone formats", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "11987654321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(screen.queryByText(/Telefone inválido/)).not.toBeInTheDocument()
    })
  })

  describe("Validation - Date", () => {
    it("should show error when date is empty", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Data é obrigatória")).toBeInTheDocument()
    })

    it("should show error when date is in the past", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const dateInput = screen.getByLabelText("Data da Consulta")
      await user.type(dateInput, "2020-01-01")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Data não pode ser no passado")).toBeInTheDocument()
    })
  })

  describe("Validation - Time", () => {
    it("should show error when time is empty", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Horário é obrigatório")).toBeInTheDocument()
    })

    it("should show error when time is outside business hours (before 08:00)", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const timeInput = screen.getByLabelText("Horário")
      await user.type(timeInput, "07:00")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Horário deve ser entre 08:00 e 18:00")).toBeInTheDocument()
    })

    it("should show error when time is outside business hours (after 18:00)", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const timeInput = screen.getByLabelText("Horário")
      await user.type(timeInput, "19:00")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Horário deve ser entre 08:00 e 18:00")).toBeInTheDocument()
    })

    it("should accept time at 08:00", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "08:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(screen.queryByText("Horário deve ser entre 08:00 e 18:00")).not.toBeInTheDocument()
    })

    it("should accept time at 17:59", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "17:59")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(screen.queryByText("Horário deve ser entre 08:00 e 18:00")).not.toBeInTheDocument()
    })
  })

  describe("Validation - Appointment Type", () => {
    it("should show error when appointment type is not selected", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Tipo de consulta é obrigatório")).toBeInTheDocument()
    })

    it("should render all appointment type options", () => {
      render(<AppointmentForm />)

      expect(
        screen.getByRole("option", { name: "Selecione o tipo de consulta" })
      ).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Consulta de Rotina" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Retorno" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Emergência" })).toBeInTheDocument()
      expect(screen.getByRole("option", { name: "Especialista" })).toBeInTheDocument()
    })
  })

  describe("Form Submission", () => {
    it("should call onSubmit with form data when valid", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")
      await user.type(screen.getByLabelText("Observações"), "Primeira consulta")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          patientName: "João Silva",
          email: "joao@example.com",
          phone: "(11) 98765-4321",
          date: dateString,
          time: "10:00",
          appointmentType: "checkup",
          notes: "Primeira consulta",
        })
      })
    })

    it("should not call onSubmit when form is invalid", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it("should show loading state during submission", async () => {
      const user = userEvent.setup()
      let resolveSubmit: () => void
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve
      })
      const onSubmit = vi.fn(() => submitPromise)
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      const clearButton = screen.getByRole("button", { name: /limpar/i })

      await user.click(submitButton)

      // Verify buttons are disabled during loading
      await waitFor(() => {
        expect(clearButton).toBeDisabled()
      })

      // Resolve the promise
      resolveSubmit!()

      // Wait for buttons to be enabled again
      await waitFor(() => {
        expect(clearButton).not.toBeDisabled()
      })
    })

    it("should show confirmation modal after successful submission", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Consulta Agendada!")).toBeInTheDocument()
      })

      expect(screen.getByText("Sua consulta foi agendada com sucesso!")).toBeInTheDocument()
    })

    it("should reset form after successful submission", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText("Nome do Paciente")).toHaveValue("")
      })

      expect(screen.getByLabelText("Email")).toHaveValue("")
      expect(screen.getByLabelText("Telefone")).toHaveValue("")
    })
  })

  describe("Clear Button", () => {
    it("should reset all fields when clear button is clicked", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Observações"), "Test notes")

      const clearButton = screen.getByRole("button", { name: /limpar/i })
      await user.click(clearButton)

      expect(screen.getByLabelText("Nome do Paciente")).toHaveValue("")
      expect(screen.getByLabelText("Email")).toHaveValue("")
      expect(screen.getByLabelText("Telefone")).toHaveValue("")
      expect(screen.getByLabelText("Observações")).toHaveValue("")
    })

    it("should clear validation errors", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      expect(await screen.findByText("Nome do paciente é obrigatório")).toBeInTheDocument()

      const clearButton = screen.getByRole("button", { name: /limpar/i })
      await user.click(clearButton)

      expect(screen.queryByText("Nome do paciente é obrigatório")).not.toBeInTheDocument()
    })
  })

  describe("Confirmation Modal", () => {
    it("should close modal when close button is clicked", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("Consulta Agendada!")).toBeInTheDocument()
      })

      const closeButton = screen.getByLabelText("Close modal")
      await user.click(closeButton)

      expect(screen.queryByText("Consulta Agendada!")).not.toBeInTheDocument()
    })
  })

  describe("Accessibility", () => {
    it("should have proper form attributes", () => {
      const { container } = render(<AppointmentForm />)

      const form = container.querySelector("form")
      expect(form).toHaveAttribute("novalidate")
    })

    it("should have required attributes on required fields", () => {
      render(<AppointmentForm />)

      expect(screen.getByLabelText("Nome do Paciente")).toBeRequired()
      expect(screen.getByLabelText("Email")).toBeRequired()
      expect(screen.getByLabelText("Telefone")).toBeRequired()
      expect(screen.getByLabelText("Data da Consulta")).toBeRequired()
      expect(screen.getByLabelText("Horário")).toBeRequired()
      expect(screen.getByLabelText("Tipo de Consulta")).toBeRequired()
    })

    it("should have aria-invalid when field has error", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByLabelText("Nome do Paciente")).toHaveAttribute("aria-invalid", "true")
      })
    })

    it("should have aria-describedby linking to error messages", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        const typeSelect = screen.getByLabelText("Tipo de Consulta")
        expect(typeSelect).toHaveAttribute("aria-describedby", "appointmentType-error")
      })
    })

    it("should have role=alert on error messages", async () => {
      const user = userEvent.setup()
      render(<AppointmentForm />)

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      const errorMessages = await screen.findAllByRole("alert")
      expect(errorMessages.length).toBeGreaterThan(0)
    })
  })

  describe("Notes Field (Optional)", () => {
    it("should allow form submission without notes", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: "",
          })
        )
      })
    })

    it("should accept and submit notes when provided", async () => {
      const user = userEvent.setup()
      const onSubmit = vi.fn()
      render(<AppointmentForm onSubmit={onSubmit} />)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dateString = tomorrow.toISOString().split("T")[0]

      await user.type(screen.getByLabelText("Nome do Paciente"), "João Silva")
      await user.type(screen.getByLabelText("Email"), "joao@example.com")
      await user.type(screen.getByLabelText("Telefone"), "(11) 98765-4321")
      await user.type(screen.getByLabelText("Data da Consulta"), dateString)
      await user.type(screen.getByLabelText("Horário"), "10:00")
      await user.selectOptions(screen.getByLabelText("Tipo de Consulta"), "checkup")
      await user.type(screen.getByLabelText("Observações"), "Paciente alérgico a penicilina")

      const submitButton = screen.getByRole("button", { name: /agendar consulta/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: "Paciente alérgico a penicilina",
          })
        )
      })
    })
  })
})
