export class StockService {
  static async checkStock(_product: string, _quantityy: number): Promise<boolean> {
    throw new Error("Real integration should not be called in tests!")
  }
}
