export class Medication {
  readonly #name: string
  readonly #dosage: string
  readonly #instructions: string

  constructor(name: string, dosage: string, instructions: string) {
    if (!name) {
      throw new Error("Medication name is required")
    }
    if (!dosage) {
      throw new Error("Medication dosage is required")
    }
    this.#name = name
    this.#dosage = dosage
    this.#instructions = instructions
  }

  get name(): string {
    return this.#name
  }

  get dosage(): string {
    return this.#dosage
  }

  get instructions(): string {
    return this.#instructions
  }
}
