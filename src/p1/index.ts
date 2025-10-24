import express, { Application } from "express"
import { PatientService } from "./domain/services/PatientService.js"
import { PatientRepository } from "./infrastructure/persistence/PatientRepository.js"
import { PatientController } from "./interfaces/controllers/PatientController.js"

const patientRepository = new PatientRepository()
const patientService = new PatientService(patientRepository)
const patientController = new PatientController(patientService)

const app: Application = express()

app.use(express.json())

// Registrar rotas do controller
app.use("/patients", patientController.router)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

export { app }
