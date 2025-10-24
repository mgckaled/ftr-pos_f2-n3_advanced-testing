export class Allergy {
  readonly #name: string

  constructor(name: string) {
    if (!name) {
      throw new Error("Allergy name is required")
    }
    this.#name = name
  }

  get name(): string {
    return this.#name
  }

  equals(other: Allergy): boolean {
    return other instanceof Allergy && this.#name === other.name
  }
}
