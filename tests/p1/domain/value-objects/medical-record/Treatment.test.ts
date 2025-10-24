import { expect } from "chai"
import { Treatment } from "../../../../../src/p1/domain/value-objects/medical-record/Treatment.js"

describe("Treatment Value Object", () => {
  describe("Constructor", () => {
    it("deve criar um tratamento válido com data de início e fim", () => {
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-06-01")
      const treatment = new Treatment("Fisioterapia para joelho", startDate, endDate)

      expect(treatment.description).to.equal("Fisioterapia para joelho")
      expect(treatment.startDate.getTime()).to.equal(startDate.getTime())
      expect(treatment.endDate?.getTime()).to.equal(endDate.getTime())
    })

    it("deve criar um tratamento sem data de fim", () => {
      const startDate = new Date("2024-01-01")
      const treatment = new Treatment("Fisioterapia para joelho", startDate)

      expect(treatment.endDate).to.be.null
    })

    it("deve lançar erro quando descrição estiver vazia", () => {
      expect(() => new Treatment("", new Date())).to.throw("Treatment description is required")
    })

    it("deve lançar erro quando data de início for inválida", () => {
      expect(() => new Treatment("Fisioterapia", new Date("invalid"))).to.throw(
        "Invalid treatment start date"
      )
    })

    it("deve lançar erro quando data de fim for inválida", () => {
      expect(
        () => new Treatment("Fisioterapia", new Date("2024-01-01"), new Date("invalid"))
      ).to.throw("Invalid treatment end date")
    })

    it("deve lançar erro quando data de fim for anterior à data de início", () => {
      expect(
        () => new Treatment("Fisioterapia", new Date("2024-06-01"), new Date("2024-01-01"))
      ).to.throw("End date cannot be before start date")
    })
  })

  describe("Método isActive", () => {
    it("deve retornar true para tratamento sem data de fim", () => {
      const treatment = new Treatment("Fisioterapia", new Date("2024-01-01"))

      expect(treatment.isActive()).to.be.true
    })

    it("deve retornar true para tratamento com data de fim futura", () => {
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)

      const treatment = new Treatment("Fisioterapia", new Date("2024-01-01"), futureDate)

      expect(treatment.isActive()).to.be.true
    })

    it("deve retornar false para tratamento com data de fim passada", () => {
      const pastDate = new Date()
      pastDate.setFullYear(pastDate.getFullYear() - 1)

      const treatment = new Treatment("Fisioterapia", new Date("2023-01-01"), pastDate)

      expect(treatment.isActive()).to.be.false
    })
  })

  describe("Imutabilidade de datas", () => {
    it("deve retornar cópia da data de início", () => {
      const originalStart = new Date(Date.UTC(2024, 0, 1, 12, 0, 0))
      const treatment = new Treatment("Fisioterapia", originalStart)

      originalStart.setUTCFullYear(2023)
      expect(treatment.startDate.getUTCFullYear()).to.equal(2024)

      const retrievedStart = treatment.startDate
      retrievedStart.setUTCFullYear(2025)
      expect(treatment.startDate.getUTCFullYear()).to.equal(2024)
    })

    it("deve retornar cópia da data de fim", () => {
      const originalEnd = new Date("2024-06-01")
      const treatment = new Treatment("Fisioterapia", new Date("2024-01-01"), originalEnd)

      const retrievedEnd = treatment.endDate!
      retrievedEnd.setFullYear(2025)

      expect(treatment.endDate!.getFullYear()).to.equal(2024)
    })
  })
})
