export class Treatment {
  readonly #description: string
  readonly #startDate: Date
  readonly #endDate: Date | null

  constructor(description: string, startDate: Date, endDate?: Date) {
    if (!description) {
      throw new Error("Treatment description is required")
    }
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error("Invalid treatment start date")
    }
    if (endDate && (!(endDate instanceof Date) || isNaN(endDate.getTime()))) {
      throw new Error("Invalid treatment end date")
    }

    const startDateCopy = new Date(startDate.getTime())
    const endDateCopy = endDate ? new Date(endDate.getTime()) : null

    if (endDateCopy && endDateCopy < startDateCopy) {
      throw new Error("End date cannot be before start date")
    }

    this.#description = description
    this.#startDate = startDateCopy
    this.#endDate = endDateCopy
  }

  get description(): string {
    return this.#description
  }

  get startDate(): Date {
    return new Date(this.#startDate.getTime())
  }

  get endDate(): Date | null {
    return this.#endDate ? new Date(this.#endDate.getTime()) : null
  }

  isActive(): boolean {
    if (!this.#endDate) {
      return true
    }
    return new Date() <= this.#endDate
  }
}
