export class Address {
  readonly #street: string
  readonly #number: number
  readonly #city: string
  readonly #state: string
  readonly #zipCode: string

  constructor(street: string, number: number, city: string, state: string, zipCode: string) {
    if (!street || !city || !state || !zipCode) {
      throw new Error("Address fields cannot be empty")
    }

    if (typeof number !== "number" || number <= 0) {
      throw new Error("Number must be a positive integer")
    }

    this.#street = street
    this.#number = number
    this.#city = city
    this.#state = state
    this.#zipCode = zipCode
  }

  get street(): string {
    return this.#street
  }

  get number(): number {
    return this.#number
  }

  get city(): string {
    return this.#city
  }

  get state(): string {
    return this.#state
  }

  get zipCode(): string {
    return this.#zipCode
  }

  equals(other: Address): boolean {
    if (!(other instanceof Address)) {
      return false
    }

    return (
      this.#street === other.street &&
      this.#number === other.number &&
      this.#city === other.city &&
      this.#state === other.state &&
      this.#zipCode === other.zipCode
    )
  }
}
