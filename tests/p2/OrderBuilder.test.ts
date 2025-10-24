import { expect } from "chai"
import { afterEach, beforeEach, describe, it } from "mocha"
import sinon from "sinon"
import { OrderBuilder } from "../../src/p2/OrderBuilder.js"
import { StockService } from "../../src/p2/StockService.js"

describe("OrderBuilder - Builder Pattern com Stubs", () => {
  let builder: OrderBuilder
  let checkStockStub: sinon.SinonStub

  beforeEach(() => {
    builder = new OrderBuilder()
    checkStockStub = sinon.stub(StockService, "checkStock")
  })

  afterEach(() => {
    sinon.restore()
  })

  describe("Construção básica de pedidos", () => {
    it("deve criar builder vazio", () => {
      expect(builder).to.be.instanceOf(OrderBuilder)
    })

    it("deve adicionar produto ao pedido", () => {
      const result = builder.addProduct("Notebook", 1)
      expect(result).to.equal(builder) // Fluent interface
    })

    it("deve definir cliente do pedido", () => {
      const result = builder.setCustomer("cliente@email.com")
      expect(result).to.equal(builder) // Fluent interface
    })
  })

  describe("Interface fluente", () => {
    it("deve permitir encadeamento de métodos", () => {
      checkStockStub.resolves(true)

      const builderChain = builder
        .addProduct("Mouse", 2)
        .addProduct("Teclado", 1)
        .setCustomer("cliente@email.com")

      expect(builderChain).to.equal(builder)
    })

    it("deve construir pedido com múltiplos produtos", async () => {
      checkStockStub.resolves(true)

      const order = await builder
        .addProduct("Monitor", 1)
        .addProduct("Webcam", 1)
        .addProduct("Headset", 1)
        .setCustomer("gamer@email.com")
        .build()

      expect(order.products).to.have.lengthOf(3)
      expect(order.customer).to.equal("gamer@email.com")
      expect(order.status).to.equal("created")
    })
  })

  describe("Validação de estoque", () => {
    it("deve verificar estoque para cada produto", async () => {
      checkStockStub.resolves(true)

      await builder
        .addProduct("Produto A", 2)
        .addProduct("Produto B", 5)
        .setCustomer("cliente@email.com")
        .build()

      expect(checkStockStub.callCount).to.equal(2)
      expect(checkStockStub.firstCall.args).to.deep.equal(["Produto A", 2])
      expect(checkStockStub.secondCall.args).to.deep.equal(["Produto B", 5])
    })

    it("deve lançar erro quando produto não tem estoque", async () => {
      checkStockStub.resolves(false)

      try {
        await builder.addProduct("Produto Indisponível", 10).build()
        expect.fail("Deveria ter lançado erro")
      } catch (error: any) {
        expect(error.message).to.include("Insufficient stock for: Produto Indisponível")
      }
    })

    it("deve validar estoque apenas dos produtos sem estoque", async () => {
      checkStockStub.withArgs("Produto A", 1).resolves(true)
      checkStockStub.withArgs("Produto B", 1).resolves(false)

      try {
        await builder.addProduct("Produto A", 1).addProduct("Produto B", 1).build()
        expect.fail("Deveria ter lançado erro")
      } catch (error: any) {
        expect(error.message).to.include("Insufficient stock for: Produto B")
      }

      expect(checkStockStub.callCount).to.equal(2)
    })
  })

  describe("Estrutura do pedido gerado", () => {
    it("deve gerar pedido com estrutura correta", async () => {
      checkStockStub.resolves(true)

      const order = await builder.addProduct("Laptop", 1).setCustomer("dev@email.com").build()

      expect(order).to.have.property("customer")
      expect(order).to.have.property("products")
      expect(order).to.have.property("status")
      expect(order.status).to.equal("created")
    })

    it("deve manter informações dos produtos", async () => {
      checkStockStub.resolves(true)

      const order = await builder
        .addProduct("SSD 1TB", 2)
        .addProduct("RAM 16GB", 4)
        .setCustomer("tech@email.com")
        .build()

      expect(order.products[0]).to.deep.equal({ name: "SSD 1TB", quantity: 2 })
      expect(order.products[1]).to.deep.equal({ name: "RAM 16GB", quantity: 4 })
    })

    it("deve permitir pedido sem cliente definido", async () => {
      checkStockStub.resolves(true)

      const order = await builder.addProduct("Mouse Pad", 1).build()

      expect(order.customer).to.be.null
      expect(order.products).to.have.lengthOf(1)
    })
  })

  describe("Cenários do mundo real - E-commerce", () => {
    it("deve processar pedido típico de cliente", async () => {
      checkStockStub.resolves(true)

      const order = await builder
        .addProduct("iPhone 15", 1)
        .addProduct("Capa protetora", 1)
        .addProduct("Película de vidro", 2)
        .setCustomer("joao@email.com")
        .build()

      expect(order.customer).to.equal("joao@email.com")
      expect(order.products).to.have.lengthOf(3)
      expect(order.status).to.equal("created")
      expect(checkStockStub.callCount).to.equal(3)
    })

    it("deve bloquear pedido quando item principal está indisponível", async () => {
      checkStockStub.withArgs("PlayStation 5", 1).resolves(false)
      checkStockStub.withArgs("Controle extra", 2).resolves(true)

      try {
        await builder
          .addProduct("PlayStation 5", 1)
          .addProduct("Controle extra", 2)
          .setCustomer("gamer@email.com")
          .build()
        expect.fail("Deveria ter lançado erro")
      } catch (error: any) {
        expect(error.message).to.include("PlayStation 5")
      }
    })

    it("deve processar pedido corporativo com múltiplas unidades", async () => {
      checkStockStub.resolves(true)

      const order = await builder
        .addProduct("Notebook Dell", 50)
        .addProduct("Mouse sem fio", 50)
        .addProduct("Hub USB", 25)
        .setCustomer("compras@empresa.com")
        .build()

      expect(order.products).to.have.lengthOf(3)
      expect(order.products[0].quantity).to.equal(50)
    })
  })

  describe("Cenários do mundo real - Validação de estoque", () => {
    it("deve validar estoque antes de confirmar Black Friday", async () => {
      checkStockStub.withArgs("Smart TV 55", 10).resolves(true)
      checkStockStub.withArgs("Soundbar", 10).resolves(true)

      const order = await builder
        .addProduct("Smart TV 55", 10)
        .addProduct("Soundbar", 10)
        .setCustomer("blackfriday@email.com")
        .build()

      expect(checkStockStub.callCount).to.equal(2)
      expect(order.status).to.equal("created")
    })

    it("deve rejeitar pedido quando estoque acaba durante promoção", async () => {
      checkStockStub.withArgs("Console", 1).resolves(false)

      try {
        await builder.addProduct("Console", 1).setCustomer("rapido@email.com").build()
        expect.fail("Deveria ter lançado erro")
      } catch (error: any) {
        expect(error.message).to.include("Insufficient stock")
      }
    })
  })

  describe("Edge cases", () => {
    it("deve construir pedido sem produtos", async () => {
      const order = await builder.setCustomer("cliente@email.com").build()

      expect(order.products).to.be.empty
      expect(order.customer).to.equal("cliente@email.com")
      expect(checkStockStub.called).to.be.false
    })

    it("deve permitir produtos com quantidade zero", async () => {
      checkStockStub.resolves(true)

      const order = await builder.addProduct("Produto", 0).setCustomer("teste@email.com").build()

      expect(order.products[0].quantity).to.equal(0)
    })

    it("deve permitir adicionar mesmo produto múltiplas vezes", async () => {
      checkStockStub.resolves(true)

      const order = await builder
        .addProduct("Caneta", 10)
        .addProduct("Caneta", 5)
        .setCustomer("papelaria@email.com")
        .build()

      expect(order.products).to.have.lengthOf(2)
      expect(order.products[0].quantity).to.equal(10)
      expect(order.products[1].quantity).to.equal(5)
    })
  })

  describe("Testes de integração com StockService", () => {
    it("deve chamar StockService com parâmetros corretos", async () => {
      checkStockStub.resolves(true)

      await builder.addProduct("Produto Teste", 15).setCustomer("integracao@email.com").build()

      expect(checkStockStub.calledOnce).to.be.true
      expect(checkStockStub.calledWith("Produto Teste", 15)).to.be.true
    })

    it("deve respeitar retorno do StockService", async () => {
      checkStockStub.resolves(true)

      const order = await builder.addProduct("Item Disponível", 1).build()

      expect(order).to.exist
      expect(order.status).to.equal("created")
    })

    it("deve parar na primeira falha de estoque", async () => {
      checkStockStub.onFirstCall().resolves(true)
      checkStockStub.onSecondCall().resolves(false)

      try {
        await builder
          .addProduct("Item 1", 1)
          .addProduct("Item 2", 1)
          .addProduct("Item 3", 1)
          .build()
        expect.fail("Deveria ter lançado erro")
      } catch (error: any) {
        expect(error.message).to.include("Item 2")
        expect(checkStockStub.callCount).to.equal(2)
      }
    })
  })
})
