import { expect } from "chai";
import { Diagnosis } from "../../../../../src/p1/domain/value-objects/medical-record/Diagnosis.js";

describe("Diagnosis Value Object", () => {
  describe("Constructor", () => {
    it("deve criar um diagnóstico válido", () => {
      const date = new Date("2024-01-15");
      const diagnosis = new Diagnosis("Diabetes Tipo 2", date);

      expect(diagnosis.description).to.equal("Diabetes Tipo 2");
      expect(diagnosis.date.getTime()).to.equal(date.getTime());
    });

    it("deve lançar erro quando descrição estiver vazia", () => {
      expect(() => new Diagnosis("", new Date())).to.throw(
        "Diagnosis description is required"
      );
    });

    it("deve lançar erro quando data for inválida", () => {
      expect(() => new Diagnosis("Diabetes", new Date("invalid"))).to.throw(
        "Invalid diagnosis date"
      );
    });

    it("deve retornar cópia da data ao acessar getter", () => {
      const originalDate = new Date("2024-01-15");
      const diagnosis = new Diagnosis("Hipertensão", originalDate);

      const retrievedDate = diagnosis.date;
      retrievedDate.setFullYear(2025);

      expect(diagnosis.date.getFullYear()).to.equal(2024);
    });
  });
});