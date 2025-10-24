export class Diagnosis {
  readonly #description: string
  readonly #date: Date

  constructor(description: string, date: Date) {
    if (!description) {
      throw new Error("Diagnosis description is required")
    }
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error("Invalid diagnosis date")
    }
    this.#description = description
    this.#date = date
  }

  get description(): string {
    return this.#description
  }

  get date(): Date {
    return new Date(this.#date)
  }
}
