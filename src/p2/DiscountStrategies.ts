export abstract class DiscountStrategy {
  abstract calculateDiscount(amount: number): number
}

export class BlackFridayStrategy extends DiscountStrategy {
  calculateDiscount(amount: number): number {
    return amount * 0.3
  }
}

export class CouponStrategy extends DiscountStrategy {
  constructor(private couponValue: number) {
    super()
  }

  calculateDiscount(amount: number): number {
    return Math.min(this.couponValue, amount * 0.2)
  }
}

export class LoyaltyStrategy extends DiscountStrategy {
  constructor(private userLoyaltyYears: number) {
    super()
  }

  calculateDiscount(amount: number): number {
    return amount * (0.02 * Math.min(this.userLoyaltyYears, 10))
  }
}
