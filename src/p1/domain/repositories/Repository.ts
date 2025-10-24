export abstract class Repository<T> {
  protected data: Map<number, T>

  constructor() {
    this.data = new Map<number, T>()
  }

  add(id: number, entity: T): number {
    const numericId = Number(id)

    if (this.data.has(numericId)) {
      throw new Error("Entity already exists.")
    }

    this.data.set(numericId, entity)
    return numericId
  }

  findById(id: number): T | null {
    return this.data.get(Number(id)) || null
  }

  findAll(): T[] {
    return Array.from(this.data.values())
  }

  update(id: number, entity: T): void {
    const numericId = Number(id)

    if (!this.data.has(numericId)) {
      throw new Error("Entity not found.")
    }

    this.data.set(numericId, entity)
  }

  delete(id: number): void {
    const numericId = Number(id)

    if (!this.data.has(numericId)) {
      throw new Error("Entity not found.")
    }

    this.data.delete(numericId)
  }

  clear(): void {
    this.data.clear()
  }
}
