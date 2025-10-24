import { StockService } from "./StockService.js"

interface Product {
  name: string
  quantity: number
}

interface Order {
  customer: string | null
  products: Product[]
  status: string
}

export class OrderBuilder {
  private products: Product[] = []
  private customer: string | null = null

  addProduct(name: string, quantity: number): this {
    this.products.push({ name, quantity })
    return this
  }

  setCustomer(email: string): this {
    this.customer = email
    return this
  }

  async build(): Promise<Order> {
    for (const product of this.products) {
      const inStock = await StockService.checkStock(product.name, product.quantity)
      if (!inStock) {
        throw new Error(`Insufficient stock for: ${product.name}`)
      }
    }

    return {
      customer: this.customer,
      products: this.products,
      status: "created",
    }
  }
}
