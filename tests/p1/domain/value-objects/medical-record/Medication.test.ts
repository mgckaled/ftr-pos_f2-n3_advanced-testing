import { expect } from "chai";
import { Medication } from "../../../../../src/p1/domain/value-objects/medical-record/Medication.js";

describe("Medication Value Object", () => {
  describe("Constructor", () => {
    it("deve criar uma medicação válida com todas as informações", () => {
      const medication = new Medication(
        "Losartana",
        "50mg",
        "Tomar 1 comprimido pela manhã"
      );

      expect(medication.name).to.equal("Losartana");
      expect(medication.dosage).to.equal("50mg");
      expect(medication.instructions).to.equal(
        "Tomar 1 comprimido pela manhã"
      );
    });

    it("deve lançar erro quando nome estiver vazio", () => {
      expect(
        () => new Medication("", "50mg", "Tomar 1 comprimido pela manhã")
      ).to.throw("Medication name is required");
    });

    it("deve lançar erro quando dosagem estiver vazia", () => {
      expect(
        () => new Medication("Losartana", "", "Tomar 1 comprimido pela manhã")
      ).to.throw("Medication dosage is required");
    });

    it("deve aceitar instruções vazias", () => {
      const medication = new Medication("Losartana", "50mg", "");

      expect(medication.instructions).to.equal("");
    });
  });
});