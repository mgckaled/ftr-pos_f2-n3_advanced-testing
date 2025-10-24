import { Diagnosis } from "./Diagnosis.js"
import { Medication } from "./Medication.js"
import { Treatment } from "./Treatment.js"

export class MedicalRecord {
  readonly #diagnoses: Diagnosis[]
  readonly #medications: Medication[]
  readonly #treatments: Treatment[]

  constructor(
    diagnoses: Diagnosis[] = [],
    medications: Medication[] = [],
    treatments: Treatment[] = []
  ) {
    this.#diagnoses = diagnoses
    this.#medications = medications
    this.#treatments = treatments
  }

  get diagnoses(): Diagnosis[] {
    return [...this.#diagnoses]
  }

  get medications(): Medication[] {
    return [...this.#medications]
  }

  get treatments(): Treatment[] {
    return [...this.#treatments]
  }

  addDiagnosis(diagnosis: Diagnosis): void {
    if (!(diagnosis instanceof Diagnosis)) {
      throw new Error("Invalid diagnosis object.")
    }
    this.#diagnoses.push(diagnosis)
  }

  addMedication(medication: Medication): void {
    if (!(medication instanceof Medication)) {
      throw new Error("Invalid medication object.")
    }
    this.#medications.push(medication)
  }

  addTreatment(treatment: Treatment): void {
    if (!(treatment instanceof Treatment)) {
      throw new Error("Invalid treatment object.")
    }
    this.#treatments.push(treatment)
  }

  getActiveTreatments(): Treatment[] {
    return this.#treatments.filter((treatment) => treatment.isActive())
  }
}
