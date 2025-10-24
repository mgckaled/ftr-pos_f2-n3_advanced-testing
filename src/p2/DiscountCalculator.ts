import { BlackFridayStrategy, DiscountStrategy } from "./DiscountStrategies.js"

export class DiscountCalculator {
  private strategy: DiscountStrategy

  constructor(strategy: DiscountStrategy = new BlackFridayStrategy()) {
    this.strategy = strategy
  }

  setStrategy(strategy: DiscountStrategy): void {
    this.strategy = strategy
  }

  calculate(amount: number): number {
    return amount - this.strategy.calculateDiscount(amount)
  }
}
