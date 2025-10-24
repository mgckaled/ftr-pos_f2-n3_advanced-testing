import express, { Request, Response, Router } from "express"
import { PatientData } from "../../domain/entities/Patient.js"
import { PatientService } from "../../domain/services/PatientService.js"
import { Address } from "../../domain/value-objects/Address.js"
import { EmergencyContact } from "../../domain/value-objects/EmergencyContact.js"

export class PatientController {
  public router: Router
  private patientService: PatientService

  constructor(patientService: PatientService) {
    this.router = express.Router()
    this.patientService = patientService
    this.initializeRoutes()
  }

  private initializeRoutes(): void {
    this.router.post("/", this.createPatient.bind(this))
    this.router.get("/", this.getAllPatients.bind(this))
    this.router.get("/:id", this.getPatientById.bind(this))
    this.router.put("/:id", this.updatePatient.bind(this))
    this.router.delete("/:id", this.deletePatient.bind(this))
    this.router.get("/search/name/:name", this.getPatientByName.bind(this))
    this.router.get("/search/bloodType/:bloodType", this.getPatientByBloodType.bind(this))
  }

  async createPatient(req: Request, res: Response): Promise<void> {
    try {
      const patientData = req.body as PatientData
      const createdPatient = this.patientService.addPatient(patientData)
      res.status(201).json(createdPatient)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(400).json({ error: errorMessage })
    }
  }

  async getAllPatients(_req: Request, res: Response): Promise<void> {
    try {
      const patients = this.patientService.findAllPatients()
      res.status(200).json(patients)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(500).json({ error: errorMessage })
    }
  }

  async getPatientById(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      const patient = this.patientService.findPatientById(id)

      if (!patient) {
        res.status(404).json({ error: "Patient not found" })
        return
      }

      res.status(200).json(patient)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(500).json({ error: errorMessage })
    }
  }

  async updatePatient(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      const updatedData = req.body as {
        name?: string
        phone?: string
        email?: string
        emergencyContact?: EmergencyContact
        address?: Address
      }

      const updatedPatient = this.patientService.updatePatient(id, updatedData)
      res.status(200).json(updatedPatient)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(400).json({ error: errorMessage })
    }
  }

  async deletePatient(req: Request, res: Response): Promise<void> {
    try {
      const id = Number(req.params.id)
      const deletedPatient = this.patientService.deletePatient(id)
      res.status(200).json(deletedPatient)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(404).json({ error: errorMessage })
    }
  }

  async getPatientByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.params
      const patients = this.patientService.findPatientByName(name)

      if (!patients.length) {
        res.status(404).json({ error: "No patients found with the given name" })
        return
      }

      res.status(200).json(patients)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(500).json({ error: errorMessage })
    }
  }

  async getPatientByBloodType(req: Request, res: Response): Promise<void> {
    try {
      const { bloodType } = req.params
      const patients = this.patientService.findPatientByBloodType(bloodType)

      if (!patients.length) {
        res.status(404).json({ error: "No patients found with the given blood type" })
        return
      }

      res.status(200).json(patients)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      res.status(500).json({ error: errorMessage })
    }
  }
}
