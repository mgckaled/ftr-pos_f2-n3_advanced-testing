import { expect } from "chai";
import { Diagnosis } from "../../../../../src/p1/domain/value-objects/medical-record/Diagnosis.js";
import { MedicalRecord } from "../../../../../src/p1/domain/value-objects/medical-record/MedicalRecord.js";
import { Medication } from "../../../../../src/p1/domain/value-objects/medical-record/Medication.js";
import { Treatment } from "../../../../../src/p1/domain/value-objects/medical-record/Treatment.js";


describe("MedicalRecord Value Object", () => {
  describe("Constructor", () => {
    it("deve criar um prontuário vazio por padrão", () => {
      const record = new MedicalRecord();

      expect(record.diagnoses).to.be.an("array").that.is.empty;
      expect(record.medications).to.be.an("array").that.is.empty;
      expect(record.treatments).to.be.an("array").that.is.empty;
    });

    it("deve criar um prontuário com dados iniciais", () => {
      const diagnoses = [new Diagnosis("Diabetes", new Date())];
      const medications = [new Medication("Insulina", "10UI", "Aplicar SC")];
      const treatments = [new Treatment("Dieta", new Date())];

      const record = new MedicalRecord(diagnoses, medications, treatments);

      expect(record.diagnoses).to.have.lengthOf(1);
      expect(record.medications).to.have.lengthOf(1);
      expect(record.treatments).to.have.lengthOf(1);
    });
  });

  describe("Método addDiagnosis", () => {
    it("deve adicionar um diagnóstico válido", () => {
      const record = new MedicalRecord();
      const diagnosis = new Diagnosis("Hipertensão", new Date());

      record.addDiagnosis(diagnosis);

      expect(record.diagnoses).to.have.lengthOf(1);
      expect(record.diagnoses[0].description).to.equal("Hipertensão");
    });

    it("deve adicionar múltiplos diagnósticos", () => {
      const record = new MedicalRecord();
      const diagnosis1 = new Diagnosis("Hipertensão", new Date());
      const diagnosis2 = new Diagnosis("Diabetes", new Date());

      record.addDiagnosis(diagnosis1);
      record.addDiagnosis(diagnosis2);

      expect(record.diagnoses).to.have.lengthOf(2);
    });

    it("deve lançar erro ao adicionar objeto inválido", () => {
      const record = new MedicalRecord();
      const invalidDiagnosis = { description: "Invalid" } as any;

      expect(() => record.addDiagnosis(invalidDiagnosis)).to.throw(
        "Invalid diagnosis object."
      );
    });
  });

  describe("Método addMedication", () => {
    it("deve adicionar uma medicação válida", () => {
      const record = new MedicalRecord();
      const medication = new Medication("Losartana", "50mg", "1x ao dia");

      record.addMedication(medication);

      expect(record.medications).to.have.lengthOf(1);
      expect(record.medications[0].name).to.equal("Losartana");
    });

    it("deve adicionar múltiplas medicações", () => {
      const record = new MedicalRecord();
      const med1 = new Medication("Losartana", "50mg", "1x ao dia");
      const med2 = new Medication("Metformina", "850mg", "2x ao dia");

      record.addMedication(med1);
      record.addMedication(med2);

      expect(record.medications).to.have.lengthOf(2);
    });

    it("deve lançar erro ao adicionar objeto inválido", () => {
      const record = new MedicalRecord();
      const invalidMedication = { name: "Invalid" } as any;

      expect(() => record.addMedication(invalidMedication)).to.throw(
        "Invalid medication object."
      );
    });
  });

  describe("Método addTreatment", () => {
    it("deve adicionar um tratamento válido", () => {
      const record = new MedicalRecord();
      const treatment = new Treatment("Fisioterapia", new Date());

      record.addTreatment(treatment);

      expect(record.treatments).to.have.lengthOf(1);
      expect(record.treatments[0].description).to.equal("Fisioterapia");
    });

    it("deve adicionar múltiplos tratamentos", () => {
      const record = new MedicalRecord();
      const treat1 = new Treatment("Fisioterapia", new Date());
      const treat2 = new Treatment("Psicoterapia", new Date());

      record.addTreatment(treat1);
      record.addTreatment(treat2);

      expect(record.treatments).to.have.lengthOf(2);
    });

    it("deve lançar erro ao adicionar objeto inválido", () => {
      const record = new MedicalRecord();
      const invalidTreatment = { description: "Invalid" } as any;

      expect(() => record.addTreatment(invalidTreatment)).to.throw(
        "Invalid treatment object."
      );
    });
  });

  describe("Método getActiveTreatments", () => {
    it("deve retornar apenas tratamentos ativos", () => {
      const record = new MedicalRecord();

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const activeTreatment = new Treatment(
        "Fisioterapia",
        new Date(),
        futureDate
      );
      const inactiveTreatment = new Treatment(
        "Quimioterapia",
        new Date("2023-01-01"),
        pastDate
      );
      const ongoingTreatment = new Treatment("Psicoterapia", new Date());

      record.addTreatment(activeTreatment);
      record.addTreatment(inactiveTreatment);
      record.addTreatment(ongoingTreatment);

      const activeTreatments = record.getActiveTreatments();

      expect(activeTreatments).to.have.lengthOf(2);
      expect(activeTreatments[0].description).to.equal("Fisioterapia");
      expect(activeTreatments[1].description).to.equal("Psicoterapia");
    });

    it("deve retornar array vazio quando não há tratamentos ativos", () => {
      const record = new MedicalRecord();

      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      const inactiveTreatment = new Treatment(
        "Quimioterapia",
        new Date("2023-01-01"),
        pastDate
      );

      record.addTreatment(inactiveTreatment);

      expect(record.getActiveTreatments()).to.be.an("array").that.is.empty;
    });
  });

  describe("Imutabilidade dos arrays", () => {
    it("deve retornar cópia do array de diagnósticos", () => {
      const record = new MedicalRecord();
      const diagnosis = new Diagnosis("Diabetes", new Date());

      record.addDiagnosis(diagnosis);
      const retrievedDiagnoses = record.diagnoses;
      retrievedDiagnoses.push(new Diagnosis("Hipertensão", new Date()));

      expect(record.diagnoses).to.have.lengthOf(1);
    });

    it("deve retornar cópia do array de medicações", () => {
      const record = new MedicalRecord();
      const medication = new Medication("Insulina", "10UI", "SC");

      record.addMedication(medication);
      const retrievedMedications = record.medications;
      retrievedMedications.push(new Medication("Metformina", "850mg", "VO"));

      expect(record.medications).to.have.lengthOf(1);
    });

    it("deve retornar cópia do array de tratamentos", () => {
      const record = new MedicalRecord();
      const treatment = new Treatment("Fisioterapia", new Date());

      record.addTreatment(treatment);
      const retrievedTreatments = record.treatments;
      retrievedTreatments.push(new Treatment("Psicoterapia", new Date()));

      expect(record.treatments).to.have.lengthOf(1);
    });
  });
});