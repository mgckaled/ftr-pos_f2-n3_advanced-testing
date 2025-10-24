import { expect } from "chai"
import { Allergy } from "../../../../src/p1/domain/value-objects/Allergy.js"

describe("Allergy Value Object", () => {
  describe("Constructor", () => {
    it("deve criar uma alergia válida", () => {
      const allergy = new Allergy("Penicilina")

      expect(allergy.name).to.equal("Penicilina")
    })

    it("deve lançar erro quando nome estiver vazio", () => {
      expect(() => new Allergy("")).to.throw("Allergy name is required")
    })

    it("deve lançar erro quando nome for null ou undefined", () => {
      expect(() => new Allergy(null as any)).to.throw("Allergy name is required")
      expect(() => new Allergy(undefined as any)).to.throw("Allergy name is required")
    })
  })

  describe("Método equals", () => {
    it("deve retornar true para alergias com mesmo nome", () => {
      const allergy1 = new Allergy("Penicilina")
      const allergy2 = new Allergy("Penicilina")

      expect(allergy1.equals(allergy2)).to.be.true
    })

    it("deve retornar false para alergias com nomes diferentes", () => {
      const allergy1 = new Allergy("Penicilina")
      const allergy2 = new Allergy("Dipirona")

      expect(allergy1.equals(allergy2)).to.be.false
    })

    it("deve retornar false quando comparado com objeto que não é Allergy", () => {
      const allergy = new Allergy("Penicilina")
      const notAnAllergy = { name: "Penicilina" } as any

      expect(allergy.equals(notAnAllergy)).to.be.false
    })
  })
})
