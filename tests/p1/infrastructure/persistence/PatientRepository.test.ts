import { expect } from "chai";
import { Patient } from "../../../../src/p1/domain/entities/Patient.js";
import { Address } from "../../../../src/p1/domain/value-objects/Address.js";
import { EmergencyContact } from "../../../../src/p1/domain/value-objects/EmergencyContact.js";
import { PatientRepository } from "../../../../src/p1/infrastructure/persistence/PatientRepository.js";

describe("PatientRepository", () => {
  let repository: PatientRepository;
  const validPatientData = {
    identificationDocument: "123.456.789-00",
    name: "João da Silva",
    birthDate: new Date("1990-05-15"),
    gender: "Masculino",
    bloodType: "O+",
    address: new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567"),
    phone: "+55 11 98765-4321",
    email: "joao.silva@email.com",
    emergencyContact: new EmergencyContact("Maria Silva", "+55 11 99999-9999"),
  };

  beforeEach(() => {
    repository = new PatientRepository();
  });

  describe("Constructor", () => {
    it("deve inicializar com currentId igual a 1", () => {
      const patient = new Patient(validPatientData);
      const id = repository.addPatient(patient);

      expect(id).to.equal(1);
    });
  });

  describe("Método add (herdado)", () => {
    it("deve adicionar paciente usando método base com id manual", () => {
      const patient = new Patient(validPatientData);
      patient._setId("10");

      const id = repository.add(10, patient);

      expect(id).to.equal(10);
      expect(repository.findById(10)).to.equal(patient);
    });

    it("deve lançar erro ao adicionar objeto que não é Patient no método base", () => {
      const notAPatient = { name: "Invalid" } as any;

      expect(() => repository.add(1, notAPatient)).to.throw(
        "Can only add Patient instances"
      );
    });
  });

  describe("Método addPatient", () => {
    it("deve adicionar um paciente e retornar id auto-incrementado", () => {
      const patient = new Patient(validPatientData);
      const id = repository.addPatient(patient);

      expect(id).to.equal(1);
      expect(patient.id).to.equal("1");
    });

    it("deve incrementar id automaticamente", () => {
      const patient1 = new Patient(validPatientData);
      const patient2 = new Patient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "outro@email.com",
      });

      const id1 = repository.addPatient(patient1);
      const id2 = repository.addPatient(patient2);

      expect(id1).to.equal(1);
      expect(id2).to.equal(2);
    });

    it("deve lançar erro ao adicionar objeto que não é Patient", () => {
      const notAPatient = { name: "Invalid" } as any;

      expect(() => repository.addPatient(notAPatient)).to.throw(
        "Can only add Patient instances"
      );
    });

    it("deve definir id no paciente através do método _setId", () => {
      const patient = new Patient(validPatientData);

      expect(patient.id).to.be.undefined;

      repository.addPatient(patient);

      expect(patient.id).to.equal("1");
    });

    it("deve adicionar múltiplos pacientes com ids sequenciais", () => {
      const patient1 = new Patient(validPatientData);
      const patient2 = new Patient({
        ...validPatientData,
        identificationDocument: "111.222.333-44",
        email: "segundo@email.com",
      });
      const patient3 = new Patient({
        ...validPatientData,
        identificationDocument: "555.666.777-88",
        email: "terceiro@email.com",
      });

      repository.addPatient(patient1);
      repository.addPatient(patient2);
      repository.addPatient(patient3);

      expect(patient1.id).to.equal("1");
      expect(patient2.id).to.equal("2");
      expect(patient3.id).to.equal("3");
    });
  });

  describe("Método findByName", () => {
    it("deve retornar array vazio quando não há pacientes", () => {
      const result = repository.findByName("João da Silva");

      expect(result).to.be.an("array").that.is.empty;
    });

    it("deve encontrar paciente por nome exato", () => {
      const patient = new Patient(validPatientData);
      repository.addPatient(patient);

      const result = repository.findByName("João da Silva");

      expect(result).to.have.lengthOf(1);
      expect(result[0].name).to.equal("João da Silva");
    });

    it("deve retornar múltiplos pacientes com mesmo nome", () => {
      const patient1 = new Patient(validPatientData);
      const patient2 = new Patient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "joao2@email.com",
      });

      repository.addPatient(patient1);
      repository.addPatient(patient2);

      const result = repository.findByName("João da Silva");

      expect(result).to.have.lengthOf(2);
    });

    it("deve retornar array vazio para nome inexistente", () => {
      const patient = new Patient(validPatientData);
      repository.addPatient(patient);

      const result = repository.findByName("Nome Inexistente");

      expect(result).to.be.empty;
    });

    it("deve ser case sensitive", () => {
      const patient = new Patient(validPatientData);
      repository.addPatient(patient);

      const result = repository.findByName("joão da silva");

      expect(result).to.be.empty;
    });

    it("deve filtrar apenas por nome completo", () => {
      const patient = new Patient(validPatientData);
      repository.addPatient(patient);

      const result = repository.findByName("João");

      expect(result).to.be.empty;
    });
  });

  describe("Método findByBloodType", () => {
    it("deve retornar array vazio quando não há pacientes", () => {
      const result = repository.findByBloodType("O+");

      expect(result).to.be.an("array").that.is.empty;
    });

    it("deve encontrar paciente por tipo sanguíneo", () => {
      const patient = new Patient(validPatientData);
      repository.addPatient(patient);

      const result = repository.findByBloodType("O+");

      expect(result).to.have.lengthOf(1);
      expect(result[0].bloodType).to.equal("O+");
    });

    it("deve retornar múltiplos pacientes com mesmo tipo sanguíneo", () => {
      const patient1 = new Patient(validPatientData);
      const patient2 = new Patient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "maria@email.com",
        name: "Maria Santos",
      });

      repository.addPatient(patient1);
      repository.addPatient(patient2);

      const result = repository.findByBloodType("O+");

      expect(result).to.have.lengthOf(2);
    });

    it("deve filtrar corretamente tipos sanguíneos diferentes", () => {
      const patient1 = new Patient(validPatientData);
      const patient2 = new Patient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "pedro@email.com",
        name: "Pedro Costa",
        bloodType: "A+",
      });

      repository.addPatient(patient1);
      repository.addPatient(patient2);

      const resultO = repository.findByBloodType("O+");
      const resultA = repository.findByBloodType("A+");

      expect(resultO).to.have.lengthOf(1);
      expect(resultA).to.have.lengthOf(1);
      expect(resultO[0].name).to.equal("João da Silva");
      expect(resultA[0].name).to.equal("Pedro Costa");
    });

    it("deve retornar array vazio para tipo sanguíneo inexistente", () => {
      const patient = new Patient(validPatientData);
      repository.addPatient(patient);

      const result = repository.findByBloodType("AB-");

      expect(result).to.be.empty;
    });

    it("deve encontrar todos os tipos sanguíneos diferentes", () => {
      const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

      bloodTypes.forEach((type, index) => {
        repository.addPatient(
          new Patient({
            ...validPatientData,
            identificationDocument: `${index}.000.000-00`,
            email: `patient${index}@email.com`,
            bloodType: type,
          })
        );
      });

      bloodTypes.forEach((type) => {
        const result = repository.findByBloodType(type);
        expect(result).to.have.lengthOf(1);
        expect(result[0].bloodType).to.equal(type);
      });
    });
  });

  describe("Método resetCurrentId", () => {
    it("deve resetar currentId para 1", () => {
      const patient1 = new Patient(validPatientData);
      const patient2 = new Patient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "outro@email.com",
      });

      repository.addPatient(patient1);
      repository.addPatient(patient2);

      repository.clear();
      repository.resetCurrentId();

      const patient3 = new Patient({
        ...validPatientData,
        identificationDocument: "111.222.333-44",
        email: "novo@email.com",
      });
      const id = repository.addPatient(patient3);

      expect(id).to.equal(1);
    });

    it("deve permitir reutilizar ids após reset", () => {
      repository.addPatient(new Patient(validPatientData));
      repository.addPatient(
        new Patient({
          ...validPatientData,
          identificationDocument: "987.654.321-00",
          email: "outro@email.com",
        })
      );

      expect(repository.findAll()).to.have.lengthOf(2);

      repository.clear();
      repository.resetCurrentId();

      const newPatient = new Patient({
        ...validPatientData,
        identificationDocument: "111.222.333-44",
        email: "novo@email.com",
      });
      const id = repository.addPatient(newPatient);

      expect(id).to.equal(1);
      expect(repository.findAll()).to.have.lengthOf(1);
    });
  });

  describe("Integração com Repository base", () => {
    it("deve herdar método findById", () => {
      const patient = new Patient(validPatientData);
      const id = repository.addPatient(patient);

      const found = repository.findById(id);

      expect(found).to.equal(patient);
      expect(found?.name).to.equal("João da Silva");
    });

    it("deve herdar método findAll", () => {
      repository.addPatient(new Patient(validPatientData));
      repository.addPatient(
        new Patient({
          ...validPatientData,
          identificationDocument: "987.654.321-00",
          email: "maria@email.com",
        })
      );

      const all = repository.findAll();

      expect(all).to.have.lengthOf(2);
    });

    it("deve herdar método update", () => {
      const patient = new Patient(validPatientData);
      const id = repository.addPatient(patient);

      patient.name = "Nome Atualizado";
      repository.update(id, patient);

      const updated = repository.findById(id);
      expect(updated?.name).to.equal("Nome Atualizado");
    });

    it("deve herdar método delete", () => {
      const patient = new Patient(validPatientData);
      const id = repository.addPatient(patient);

      repository.delete(id);

      expect(repository.findById(id)).to.be.null;
      expect(repository.findAll()).to.be.empty;
    });

    it("deve herdar método clear", () => {
      repository.addPatient(new Patient(validPatientData));
      repository.addPatient(
        new Patient({
          ...validPatientData,
          identificationDocument: "987.654.321-00",
          email: "outro@email.com",
        })
      );

      repository.clear();

      expect(repository.findAll()).to.be.empty;
    });
  });
});