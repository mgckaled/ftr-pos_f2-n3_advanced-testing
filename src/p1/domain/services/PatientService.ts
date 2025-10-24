import { PatientRepository } from "../../infrastructure/persistence/PatientRepository.js"
import { Patient, PatientData } from "../entities/Patient.js"
import { Address } from "../value-objects/Address.js"
import { EmergencyContact } from "../value-objects/EmergencyContact.js"

export class PatientService {
  private patientRepository: PatientRepository

  constructor(patientRepository: PatientRepository) {
    if (!patientRepository) {
      throw new Error("PatientRepository is required")
    }

    this.patientRepository = patientRepository
  }

  addPatient(patientData: PatientData): Patient {
    const patient = new Patient(patientData)
    const id = this.patientRepository.addPatient(patient) // MUDANÇA AQUI
    const savedPatient = this.patientRepository.findById(id)

    if (!savedPatient) {
      throw new Error("Failed to save patient")
    }

    return savedPatient
  }

  findAllPatients(): Patient[] {
    return this.patientRepository.findAll()
  }

  findPatientById(id: number): Patient | null {
    return this.patientRepository.findById(id)
  }

  updatePatient(
    id: number,
    updatedData: {
      name?: string
      phone?: string
      email?: string
      emergencyContact?: EmergencyContact
      address?: Address
    }
  ): Patient {
    const patient = this.patientRepository.findById(id)

    if (!patient) {
      throw new Error("Patient not Found!")
    }

    if (updatedData.name) patient.name = updatedData.name
    if (updatedData.phone) patient.phone = updatedData.phone
    if (updatedData.email) patient.email = updatedData.email
    if (updatedData.emergencyContact) patient.emergencyContact = updatedData.emergencyContact
    if (updatedData.address) patient.address = updatedData.address

    this.patientRepository.update(id, patient)

    return patient
  }

  deletePatient(id: number): Patient {
    const patient = this.patientRepository.findById(id)

    if (!patient) {
      throw new Error("Patient not Found!")
    }

    this.patientRepository.delete(id)

    return patient
  }

  findPatientByName(name: string): Patient[] {
    return this.patientRepository.findByName(name)
  }

  findPatientByBloodType(bloodType: string): Patient[] {
    return this.patientRepository.findByBloodType(bloodType)
  }
}
