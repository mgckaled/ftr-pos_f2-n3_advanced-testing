export class EmergencyContact {
  readonly #name: string
  readonly #phone: string

  constructor(name: string, phone: string) {
    if (!name || !phone) {
      throw new Error("Emergency contact must have a name and phone number")
    }
    this.#name = name
    this.#phone = phone
  }

  get name(): string {
    return this.#name
  }

  get phone(): string {
    return this.#phone
  }

  equals(other: EmergencyContact): boolean {
    return (
      other instanceof EmergencyContact && this.#name === other.name && this.#phone === other.phone
    )
  }
}
