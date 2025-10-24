import { expect } from "chai"
import { beforeEach, describe, it } from "mocha"
import { DiscountCalculator } from "../../src/p2/DiscountCalculator.js"
import {
  BlackFridayStrategy,
  CouponStrategy,
  LoyaltyStrategy,
} from "../../src/p2/DiscountStrategies.js"

describe("DiscountCalculator - Strategy Pattern", () => {
  let calculator: DiscountCalculator

  beforeEach(() => {
    calculator = new DiscountCalculator()
  })

  describe("Construtor e inicialização", () => {
    it("deve criar calculadora com estratégia padrão BlackFriday", () => {
      const amount = 1000
      const result = calculator.calculate(amount)

      // BlackFriday = 30% de desconto
      expect(result).to.equal(700)
    })

    it("deve aceitar estratégia personalizada no construtor", () => {
      const customCalculator = new DiscountCalculator(new CouponStrategy(100))
      const result = customCalculator.calculate(1000)

      // Cupom de 100, mas limitado a 20% do valor (200)
      expect(result).to.equal(900)
    })
  })

  describe("BlackFridayStrategy", () => {
    it("deve aplicar 30% de desconto", () => {
      calculator.setStrategy(new BlackFridayStrategy())

      expect(calculator.calculate(100)).to.equal(70)
      expect(calculator.calculate(500)).to.equal(350)
      expect(calculator.calculate(1000)).to.equal(700)
    })

    it("deve funcionar com valores decimais", () => {
      calculator.setStrategy(new BlackFridayStrategy())

      expect(calculator.calculate(99.99)).to.be.closeTo(69.993, 0.001)
    })
  })

  describe("CouponStrategy", () => {
    it("deve aplicar desconto do cupom quando menor que 20% do valor", () => {
      calculator.setStrategy(new CouponStrategy(50))

      // Cupom de 50, mas 20% de 1000 = 200, então aplica 50
      expect(calculator.calculate(1000)).to.equal(950)
    })

    it("deve limitar desconto a 20% do valor quando cupom é maior", () => {
      calculator.setStrategy(new CouponStrategy(300))

      // Cupom de 300, mas 20% de 1000 = 200, então aplica 200
      expect(calculator.calculate(1000)).to.equal(800)
    })

    it("deve funcionar com cupom de valor zero", () => {
      calculator.setStrategy(new CouponStrategy(0))

      expect(calculator.calculate(1000)).to.equal(1000)
    })

    it("deve aplicar cupom completo em valores pequenos", () => {
      calculator.setStrategy(new CouponStrategy(100))

      // 20% de 100 = 20, cupom é 100, então aplica 20
      expect(calculator.calculate(100)).to.equal(80)
    })
  })

  describe("LoyaltyStrategy", () => {
    it("deve aplicar 2% por ano de fidelidade", () => {
      calculator.setStrategy(new LoyaltyStrategy(5))

      // 5 anos = 10% de desconto
      expect(calculator.calculate(1000)).to.equal(900)
    })

    it("deve limitar desconto máximo a 10 anos", () => {
      calculator.setStrategy(new LoyaltyStrategy(15))

      // 15 anos, mas limite é 10 anos = 20% de desconto
      expect(calculator.calculate(1000)).to.equal(800)
    })

    it("deve funcionar com 1 ano de fidelidade", () => {
      calculator.setStrategy(new LoyaltyStrategy(1))

      // 1 ano = 2% de desconto
      expect(calculator.calculate(1000)).to.equal(980)
    })

    it("deve funcionar com zero anos", () => {
      calculator.setStrategy(new LoyaltyStrategy(0))

      expect(calculator.calculate(1000)).to.equal(1000)
    })

    it("deve aplicar desconto máximo com exatamente 10 anos", () => {
      calculator.setStrategy(new LoyaltyStrategy(10))

      // 10 anos = 20% de desconto
      expect(calculator.calculate(1000)).to.equal(800)
    })
  })

  describe("Troca dinâmica de estratégia", () => {
    it("deve permitir trocar estratégia em tempo de execução", () => {
      const amount = 1000

      // Começa com BlackFriday (padrão)
      let result = calculator.calculate(amount)
      expect(result).to.equal(700)

      // Troca para Cupom
      calculator.setStrategy(new CouponStrategy(150))
      result = calculator.calculate(amount)
      expect(result).to.equal(850)

      // Troca para Fidelidade
      calculator.setStrategy(new LoyaltyStrategy(3))
      result = calculator.calculate(amount)
      expect(result).to.equal(940)
    })
  })

  describe("Cenários do mundo real", () => {
    it("deve calcular desconto para carrinho de compras na Black Friday", () => {
      calculator.setStrategy(new BlackFridayStrategy())

      const cartValue = 2500
      const finalPrice = calculator.calculate(cartValue)

      expect(finalPrice).to.equal(1750)
    })

    it("deve aplicar cupom de primeira compra", () => {
      calculator.setStrategy(new CouponStrategy(50))

      const firstPurchase = 300
      const finalPrice = calculator.calculate(firstPurchase)

      // 20% de 300 = 60, mas cupom é 50, então aplica 50
      expect(finalPrice).to.equal(250)
    })

    it("deve premiar cliente fiel de longa data", () => {
      calculator.setStrategy(new LoyaltyStrategy(8))

      const loyalCustomerPurchase = 5000
      const finalPrice = calculator.calculate(loyalCustomerPurchase)

      // 8 anos = 16% de desconto
      expect(finalPrice).to.equal(4200)
    })
  })
})
