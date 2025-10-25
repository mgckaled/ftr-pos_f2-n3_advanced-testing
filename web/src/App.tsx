import { AppointmentForm, type AppointmentFormData } from "./components/AppointmentForm"

function App() {
  const handleAppointmentSubmit = async (data: AppointmentFormData) => {
    console.log("Appointment submitted:", data)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Clínica Médica FTR</h1>
          <p className="text-lg text-gray-600">Cuidando da sua saúde com excelência</p>
        </header>

        <main className="max-w-2xl mx-auto">
          <AppointmentForm onSubmit={handleAppointmentSubmit} />
        </main>

        <footer className="text-center mt-12 text-gray-600">
          <p className="text-sm">Horário de funcionamento: Segunda a Sexta, das 08:00 às 18:00</p>
        </footer>
      </div>
    </div>
  )
}

export default App
