import { expect } from "chai"
import { Address } from "../../../../src/p1/domain/value-objects/Address.js"

describe("Address Value Object", () => {
  describe("Constructor", () => {
    it("deve criar um endereço válido com todos os campos preenchidos", () => {
      const address = new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567")

      expect(address.street).to.equal("Rua das Flores")
      expect(address.number).to.equal(123)
      expect(address.city).to.equal("São Paulo")
      expect(address.state).to.equal("SP")
      expect(address.zipCode).to.equal("01234-567")
    })

    it("deve lançar erro quando rua estiver vazia", () => {
      expect(() => new Address("", 123, "São Paulo", "SP", "01234-567")).to.throw(
        "Address fields cannot be empty"
      )
    })

    it("deve lançar erro quando cidade estiver vazia", () => {
      expect(() => new Address("Rua das Flores", 123, "", "SP", "01234-567")).to.throw(
        "Address fields cannot be empty"
      )
    })

    it("deve lançar erro quando estado estiver vazio", () => {
      expect(() => new Address("Rua das Flores", 123, "São Paulo", "", "01234-567")).to.throw(
        "Address fields cannot be empty"
      )
    })

    it("deve lançar erro quando CEP estiver vazio", () => {
      expect(() => new Address("Rua das Flores", 123, "São Paulo", "SP", "")).to.throw(
        "Address fields cannot be empty"
      )
    })

    it("deve lançar erro quando número for negativo", () => {
      expect(() => new Address("Rua das Flores", -1, "São Paulo", "SP", "01234-567")).to.throw(
        "Number must be a positive integer"
      )
    })

    it("deve lançar erro quando número for zero", () => {
      expect(() => new Address("Rua das Flores", 0, "São Paulo", "SP", "01234-567")).to.throw(
        "Number must be a positive integer"
      )
    })
  })

  describe("Método equals", () => {
    it("deve retornar true para endereços idênticos", () => {
      const address1 = new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567")
      const address2 = new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567")

      expect(address1.equals(address2)).to.be.true
    })

    it("deve retornar false para endereços com ruas diferentes", () => {
      const address1 = new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567")
      const address2 = new Address("Rua das Árvores", 123, "São Paulo", "SP", "01234-567")

      expect(address1.equals(address2)).to.be.false
    })

    it("deve retornar false para endereços com números diferentes", () => {
      const address1 = new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567")
      const address2 = new Address("Rua das Flores", 456, "São Paulo", "SP", "01234-567")

      expect(address1.equals(address2)).to.be.false
    })

    it("deve retornar false quando comparado com objeto que não é Address", () => {
      const address = new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567")
      const notAnAddress = { street: "Rua das Flores" } as any

      expect(address.equals(notAnAddress)).to.be.false
    })
  })
})
