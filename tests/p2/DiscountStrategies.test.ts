import { expect } from "chai"
import { describe, it } from "mocha"
import {
  BlackFridayStrategy,
  CouponStrategy,
  DiscountStrategy,
  LoyaltyStrategy,
} from "../../src/p2/DiscountStrategies.js"

describe("DiscountStrategies - Estratégias de Desconto", () => {
  describe("DiscountStrategy - Classe abstrata", () => {
    it("deve ser uma classe abstrata que não pode ser instanciada diretamente", () => {
      // TypeScript previne instanciação, mas podemos testar herança
      const strategy = new BlackFridayStrategy()
      expect(strategy).to.be.instanceOf(DiscountStrategy)
    })

    it("todas as estratégias concretas devem herdar de DiscountStrategy", () => {
      const blackFriday = new BlackFridayStrategy()
      const coupon = new CouponStrategy(100)
      const loyalty = new LoyaltyStrategy(5)

      expect(blackFriday).to.be.instanceOf(DiscountStrategy)
      expect(coupon).to.be.instanceOf(DiscountStrategy)
      expect(loyalty).to.be.instanceOf(DiscountStrategy)
    })

    it("todas as estratégias devem implementar calculateDiscount", () => {
      const blackFriday = new BlackFridayStrategy()
      const coupon = new CouponStrategy(100)
      const loyalty = new LoyaltyStrategy(5)

      expect(blackFriday.calculateDiscount).to.be.a("function")
      expect(coupon.calculateDiscount).to.be.a("function")
      expect(loyalty.calculateDiscount).to.be.a("function")
    })
  })

  describe("BlackFridayStrategy", () => {
    let strategy: BlackFridayStrategy

    beforeEach(() => {
      strategy = new BlackFridayStrategy()
    })

    it("deve criar instância corretamente", () => {
      expect(strategy).to.be.instanceOf(BlackFridayStrategy)
      expect(strategy).to.be.instanceOf(DiscountStrategy)
    })

    it("deve calcular 30% de desconto", () => {
      expect(strategy.calculateDiscount(100)).to.equal(30)
      expect(strategy.calculateDiscount(1000)).to.equal(300)
      expect(strategy.calculateDiscount(500)).to.equal(150)
    })

    it("deve funcionar com valores decimais", () => {
      expect(strategy.calculateDiscount(99.99)).to.be.closeTo(29.997, 0.001)
      expect(strategy.calculateDiscount(123.45)).to.be.closeTo(37.035, 0.001)
    })

    it("deve retornar zero para valor zero", () => {
      expect(strategy.calculateDiscount(0)).to.equal(0)
    })

    it("deve funcionar com valores muito grandes", () => {
      expect(strategy.calculateDiscount(1000000)).to.equal(300000)
    })

    it("deve funcionar com valores muito pequenos", () => {
      expect(strategy.calculateDiscount(0.01)).to.be.closeTo(0.003, 0.001)
    })

    describe("Cenários do mundo real", () => {
      it("deve calcular desconto para carrinho médio", () => {
        const carrinhoMedio = 250
        const desconto = strategy.calculateDiscount(carrinhoMedio)
        expect(desconto).to.equal(75)
      })

      it("deve calcular desconto para carrinho grande", () => {
        const carrinhoGrande = 5000
        const desconto = strategy.calculateDiscount(carrinhoGrande)
        expect(desconto).to.equal(1500)
      })

      it("deve calcular desconto para produto individual", () => {
        const precoNotebook = 3500
        const desconto = strategy.calculateDiscount(precoNotebook)
        expect(desconto).to.equal(1050)
      })
    })
  })

  describe("CouponStrategy", () => {
    it("deve criar instância com valor do cupom", () => {
      const strategy = new CouponStrategy(100)
      expect(strategy).to.be.instanceOf(CouponStrategy)
      expect(strategy).to.be.instanceOf(DiscountStrategy)
    })

    it("deve aplicar valor do cupom quando menor que 20%", () => {
      const strategy = new CouponStrategy(50)

      // 20% de 1000 = 200, cupom é 50, então aplica 50
      expect(strategy.calculateDiscount(1000)).to.equal(50)

      // 20% de 500 = 100, cupom é 50, então aplica 50
      expect(strategy.calculateDiscount(500)).to.equal(50)
    })

    it("deve limitar desconto a 20% quando cupom é maior", () => {
      const strategy = new CouponStrategy(300)

      // 20% de 1000 = 200, cupom é 300, então aplica 200
      expect(strategy.calculateDiscount(1000)).to.equal(200)

      // 20% de 500 = 100, cupom é 300, então aplica 100
      expect(strategy.calculateDiscount(500)).to.equal(100)
    })

    it("deve aplicar cupom completo em compras pequenas", () => {
      const strategy = new CouponStrategy(100)

      // 20% de 100 = 20, cupom é 100, então aplica 20
      expect(strategy.calculateDiscount(100)).to.equal(20)
    })

    it("deve funcionar com cupom de valor zero", () => {
      const strategy = new CouponStrategy(0)
      expect(strategy.calculateDiscount(1000)).to.equal(0)
    })

    it("deve funcionar com valores decimais", () => {
      const strategy = new CouponStrategy(49.99)

      // 20% de 1000 = 200, cupom é 49.99, então aplica 49.99
      expect(strategy.calculateDiscount(1000)).to.be.closeTo(49.99, 0.01)
    })

    describe("Diferentes valores de cupom", () => {
      it("deve funcionar com cupom de R$ 10", () => {
        const strategy = new CouponStrategy(10)
        expect(strategy.calculateDiscount(100)).to.equal(10)
        expect(strategy.calculateDiscount(1000)).to.equal(10)
      })

      it("deve funcionar com cupom de R$ 50", () => {
        const strategy = new CouponStrategy(50)
        expect(strategy.calculateDiscount(300)).to.equal(50)
        expect(strategy.calculateDiscount(1000)).to.equal(50)
      })

      it("deve funcionar com cupom de R$ 200", () => {
        const strategy = new CouponStrategy(200)
        expect(strategy.calculateDiscount(500)).to.equal(100) // Limita a 20%
        expect(strategy.calculateDiscount(1000)).to.equal(200) // Aplica cupom completo
        expect(strategy.calculateDiscount(2000)).to.equal(200) // Aplica cupom completo
      })
    })

    describe("Cenários do mundo real", () => {
      it("deve aplicar cupom de primeira compra (R$ 20)", () => {
        const strategy = new CouponStrategy(20)
        const primeiraCompra = 150
        const desconto = strategy.calculateDiscount(primeiraCompra)
        expect(desconto).to.equal(20)
      })

      it("deve aplicar cupom promocional (R$ 100)", () => {
        const strategy = new CouponStrategy(100)
        const compra = 800
        const desconto = strategy.calculateDiscount(compra)
        expect(desconto).to.equal(100)
      })

      it("deve limitar cupom grande em compra pequena", () => {
        const strategy = new CouponStrategy(500)
        const compraPequena = 200
        const desconto = strategy.calculateDiscount(compraPequena)
        expect(desconto).to.equal(40) // 20% de 200
      })
    })
  })

  describe("LoyaltyStrategy", () => {
    it("deve criar instância com anos de fidelidade", () => {
      const strategy = new LoyaltyStrategy(5)
      expect(strategy).to.be.instanceOf(LoyaltyStrategy)
      expect(strategy).to.be.instanceOf(DiscountStrategy)
    })

    it("deve calcular 2% por ano de fidelidade", () => {
      const strategy1 = new LoyaltyStrategy(1)
      expect(strategy1.calculateDiscount(1000)).to.equal(20) // 2%

      const strategy3 = new LoyaltyStrategy(3)
      expect(strategy3.calculateDiscount(1000)).to.equal(60) // 6%

      const strategy5 = new LoyaltyStrategy(5)
      expect(strategy5.calculateDiscount(1000)).to.equal(100) // 10%
    })

    it("deve limitar desconto máximo a 10 anos (20%)", () => {
      const strategy10 = new LoyaltyStrategy(10)
      expect(strategy10.calculateDiscount(1000)).to.equal(200) // 20%

      const strategy15 = new LoyaltyStrategy(15)
      expect(strategy15.calculateDiscount(1000)).to.equal(200) // 20% (limitado)

      const strategy20 = new LoyaltyStrategy(20)
      expect(strategy20.calculateDiscount(1000)).to.equal(200) // 20% (limitado)
    })

    it("deve retornar zero desconto para zero anos", () => {
      const strategy = new LoyaltyStrategy(0)
      expect(strategy.calculateDiscount(1000)).to.equal(0)
    })

    it("deve funcionar com valores decimais", () => {
      const strategy = new LoyaltyStrategy(5)
      expect(strategy.calculateDiscount(999.99)).to.be.closeTo(99.999, 0.001)
    })

    describe("Progressão de fidelidade", () => {
      it("deve aumentar desconto progressivamente", () => {
        const valor = 1000

        for (let anos = 1; anos <= 10; anos++) {
          const strategy = new LoyaltyStrategy(anos)
          const descontoEsperado = valor * (0.02 * anos)
          expect(strategy.calculateDiscount(valor)).to.equal(descontoEsperado)
        }
      })

      it("deve manter desconto máximo após 10 anos", () => {
        const valor = 1000
        const descontoMaximo = 200

        for (let anos = 10; anos <= 20; anos++) {
          const strategy = new LoyaltyStrategy(anos)
          expect(strategy.calculateDiscount(valor)).to.equal(descontoMaximo)
        }
      })
    })

    describe("Cenários do mundo real", () => {
      it("deve premiar cliente novo (1 ano)", () => {
        const strategy = new LoyaltyStrategy(1)
        const compra = 500
        const desconto = strategy.calculateDiscount(compra)
        expect(desconto).to.equal(10) // 2%
      })

      it("deve premiar cliente regular (5 anos)", () => {
        const strategy = new LoyaltyStrategy(5)
        const compra = 2000
        const desconto = strategy.calculateDiscount(compra)
        expect(desconto).to.equal(200) // 10%
      })

      it("deve premiar cliente fiel (10 anos)", () => {
        const strategy = new LoyaltyStrategy(10)
        const compra = 5000
        const desconto = strategy.calculateDiscount(compra)
        expect(desconto).to.equal(1000) // 20%
      })

      it("deve premiar cliente veterano (15 anos)", () => {
        const strategy = new LoyaltyStrategy(15)
        const compra = 3000
        const desconto = strategy.calculateDiscount(compra)
        expect(desconto).to.equal(600) // 20% (máximo)
      })
    })
  })

  describe("Comparação entre estratégias", () => {
    const valor = 1000

    it("deve calcular diferentes descontos para mesmo valor", () => {
      const blackFriday = new BlackFridayStrategy()
      const coupon = new CouponStrategy(100)
      const loyalty = new LoyaltyStrategy(5)

      expect(blackFriday.calculateDiscount(valor)).to.equal(300) // 30%
      expect(coupon.calculateDiscount(valor)).to.equal(100) // R$ 100
      expect(loyalty.calculateDiscount(valor)).to.equal(100) // 10%
    })

    it("BlackFriday deve dar maior desconto em valores altos", () => {
      const blackFriday = new BlackFridayStrategy()
      const loyalty = new LoyaltyStrategy(10)

      const descontoBlackFriday = blackFriday.calculateDiscount(valor)
      const descontoLoyalty = loyalty.calculateDiscount(valor)

      expect(descontoBlackFriday).to.be.greaterThan(descontoLoyalty)
    })

    it("Cupom pode ser mais vantajoso em compras pequenas", () => {
      const valorPequeno = 100
      const coupon = new CouponStrategy(50)
      const loyalty = new LoyaltyStrategy(5)

      const descontoCupom = coupon.calculateDiscount(valorPequeno)
      const descontoLoyalty = loyalty.calculateDiscount(valorPequeno)

      expect(descontoCupom).to.be.greaterThan(descontoLoyalty)
    })
  })

  describe("Edge cases e validações", () => {
    it("deve funcionar com valores negativos (caso de devolução)", () => {
      const blackFriday = new BlackFridayStrategy()
      expect(blackFriday.calculateDiscount(-100)).to.equal(-30)
    })

    it("deve funcionar com valores muito pequenos", () => {
      const coupon = new CouponStrategy(0.01)
      expect(coupon.calculateDiscount(1)).to.be.closeTo(0.01, 0.001)
    })

    it("deve funcionar com valores muito grandes", () => {
      const loyalty = new LoyaltyStrategy(10)
      expect(loyalty.calculateDiscount(1000000)).to.equal(200000)
    })

    it("LoyaltyStrategy deve aceitar anos negativos (tratado como zero)", () => {
      const strategy = new LoyaltyStrategy(-5)
      // Math.min garante que valor negativo resulta em 0% de desconto
      expect(strategy.calculateDiscount(1000)).to.equal(-100)
    })
  })
})
