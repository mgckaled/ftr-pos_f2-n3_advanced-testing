import { useState } from "react"
import { Button } from "./Button"
import { Input } from "./Input"
import { Modal } from "./Modal"

export interface AppointmentFormData {
  patientName: string
  email: string
  phone: string
  date: string
  time: string
  appointmentType: string
  notes: string
}

export interface AppointmentFormErrors {
  patientName?: string
  email?: string
  phone?: string
  date?: string
  time?: string
  appointmentType?: string
}

export interface AppointmentFormProps {
  onSubmit?: (data: AppointmentFormData) => void | Promise<void>
  initialData?: Partial<AppointmentFormData>
  className?: string
}

const APPOINTMENT_TYPES = [
  { value: "", label: "Selecione o tipo de consulta" },
  { value: "checkup", label: "Consulta de Rotina" },
  { value: "followup", label: "Retorno" },
  { value: "emergency", label: "Emergência" },
  { value: "specialist", label: "Especialista" },
]

export function AppointmentForm({ onSubmit, initialData, className = "" }: AppointmentFormProps) {
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: initialData?.patientName || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    date: initialData?.date || "",
    time: initialData?.time || "",
    appointmentType: initialData?.appointmentType || "",
    notes: initialData?.notes || "",
  })

  const [errors, setErrors] = useState<AppointmentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: AppointmentFormErrors = {}

    // Validate patient name
    if (!formData.patientName.trim()) {
      newErrors.patientName = "Nome do paciente é obrigatório"
    } else if (formData.patientName.trim().length < 3) {
      newErrors.patientName = "Nome deve ter pelo menos 3 caracteres"
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    // Validate phone
    const phoneRegex = /^\(?[0-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/
    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório"
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Telefone inválido (formato: (11) 98765-4321)"
    }

    // Validate date
    if (!formData.date) {
      newErrors.date = "Data é obrigatória"
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        newErrors.date = "Data não pode ser no passado"
      }
    }

    // Validate time
    if (!formData.time) {
      newErrors.time = "Horário é obrigatório"
    } else {
      const [hours] = formData.time.split(":").map(Number)
      if (hours < 8 || hours >= 18) {
        newErrors.time = "Horário deve ser entre 08:00 e 18:00"
      }
    }

    // Validate appointment type
    if (!formData.appointmentType) {
      newErrors.appointmentType = "Tipo de consulta é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      if (onSubmit) {
        await onSubmit(formData)
      }
      setShowConfirmation(true)
      resetForm()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      patientName: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      appointmentType: "",
      notes: "",
    })
    setErrors({})
  }

  const handleChange =
    (field: keyof AppointmentFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }))

      // Clear error when user starts typing
      if (errors[field as keyof AppointmentFormErrors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }))
      }
    }

  return (
    <>
      <form onSubmit={handleSubmit} className={`space-y-4 ${className}`} noValidate>
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Agendamento de Consulta</h2>

          <div className="space-y-4">
            <Input
              label="Nome do Paciente"
              type="text"
              value={formData.patientName}
              onChange={handleChange("patientName")}
              error={errors.patientName}
              placeholder="Digite o nome completo"
              required
              aria-label="Nome do Paciente"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                error={errors.email}
                placeholder="exemplo@email.com"
                required
                aria-label="Email"
              />

              <Input
                label="Telefone"
                type="tel"
                value={formData.phone}
                onChange={handleChange("phone")}
                error={errors.phone}
                placeholder="(11) 98765-4321"
                required
                aria-label="Telefone"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Data da Consulta"
                type="date"
                value={formData.date}
                onChange={handleChange("date")}
                error={errors.date}
                required
                aria-label="Data da Consulta"
              />

              <Input
                label="Horário"
                type="time"
                value={formData.time}
                onChange={handleChange("time")}
                error={errors.time}
                required
                aria-label="Horário"
              />
            </div>

            <div>
              <label
                htmlFor="appointmentType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tipo de Consulta
              </label>
              <select
                id="appointmentType"
                value={formData.appointmentType}
                onChange={handleChange("appointmentType")}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 transition-colors ${
                  errors.appointmentType
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                aria-invalid={!!errors.appointmentType}
                aria-describedby={errors.appointmentType ? "appointmentType-error" : undefined}
                required
                aria-label="Tipo de Consulta"
              >
                {APPOINTMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.appointmentType && (
                <p id="appointmentType-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.appointmentType}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={handleChange("notes")}
                placeholder="Informações adicionais sobre a consulta (opcional)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
                aria-label="Observações"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1">
                {isSubmitting ? "Agendando..." : "Agendar Consulta"}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm} disabled={isSubmitting}>
                Limpar
              </Button>
            </div>
          </div>
        </div>
      </form>

      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Consulta Agendada!"
      >
        <div className="space-y-2">
          <p className="text-gray-700">Sua consulta foi agendada com sucesso!</p>
          <div className="bg-blue-50 p-4 rounded mt-4">
            <p className="text-sm text-gray-700">
              <strong>Paciente:</strong> {formData.patientName}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {formData.email}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Data:</strong>{" "}
              {formData.date && new Date(`${formData.date}T00:00:00`).toLocaleDateString("pt-BR")}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Horário:</strong> {formData.time}
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
