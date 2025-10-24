import { Patient } from "../../domain/entities/Patient.js"
import { Repository } from "../../domain/repositories/Repository.js"

export class PatientRepository extends Repository<Patient> {
  private currentId: number

  constructor() {
    super()
    this.currentId = 1
  }

  override add(id: number, patient: Patient): number {
    if (!(patient instanceof Patient)) {
      throw new Error("Can only add Patient instances")
    }

    return super.add(id, patient)
  }

  addPatient(patient: Patient): number {
    if (!(patient instanceof Patient)) {
      throw new Error("Can only add Patient instances")
    }

    const id = this.currentId++
    patient._setId(String(id))
    super.add(id, patient)

    return id
  }

  findByName(name: string): Patient[] {
    return this.findAll().filter((patient) => patient.name === name)
  }

  findByBloodType(bloodType: string): Patient[] {
    return this.findAll().filter((patient) => patient.bloodType === bloodType)
  }

  resetCurrentId(): void {
    this.currentId = 1
  }
}
