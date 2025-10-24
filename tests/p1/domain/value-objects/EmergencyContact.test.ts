import { expect } from "chai"
import { EmergencyContact } from "../../../../src/p1/domain/value-objects/EmergencyContact.js"

describe("EmergencyContact Value Object", () => {
  describe("Constructor", () => {
    it("deve criar um contato de emergência válido", () => {
      const contact = new EmergencyContact("Maria Silva", "+55 11 98765-4321")

      expect(contact.name).to.equal("Maria Silva")
      expect(contact.phone).to.equal("+55 11 98765-4321")
    })

    it("deve lançar erro quando nome estiver vazio", () => {
      expect(() => new EmergencyContact("", "+55 11 98765-4321")).to.throw(
        "Emergency contact must have a name and phone number"
      )
    })

    it("deve lançar erro quando telefone estiver vazio", () => {
      expect(() => new EmergencyContact("Maria Silva", "")).to.throw(
        "Emergency contact must have a name and phone number"
      )
    })

    it("deve lançar erro quando ambos estiverem vazios", () => {
      expect(() => new EmergencyContact("", "")).to.throw(
        "Emergency contact must have a name and phone number"
      )
    })
  })

  describe("Método equals", () => {
    it("deve retornar true para contatos idênticos", () => {
      const contact1 = new EmergencyContact("Maria Silva", "+55 11 98765-4321")
      const contact2 = new EmergencyContact("Maria Silva", "+55 11 98765-4321")

      expect(contact1.equals(contact2)).to.be.true
    })

    it("deve retornar false para contatos com nomes diferentes", () => {
      const contact1 = new EmergencyContact("Maria Silva", "+55 11 98765-4321")
      const contact2 = new EmergencyContact("João Santos", "+55 11 98765-4321")

      expect(contact1.equals(contact2)).to.be.false
    })

    it("deve retornar false para contatos com telefones diferentes", () => {
      const contact1 = new EmergencyContact("Maria Silva", "+55 11 98765-4321")
      const contact2 = new EmergencyContact("Maria Silva", "+55 11 99999-9999")

      expect(contact1.equals(contact2)).to.be.false
    })

    it("deve retornar false quando comparado com objeto que não é EmergencyContact", () => {
      const contact = new EmergencyContact("Maria Silva", "+55 11 98765-4321")
      const notAContact = { name: "Maria Silva" } as any

      expect(contact.equals(notAContact)).to.be.false
    })
  })
})
