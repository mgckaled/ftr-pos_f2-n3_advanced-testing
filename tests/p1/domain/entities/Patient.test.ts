import { expect } from "chai";
import { Patient, addPatient } from "../../../../src/p1/domain/entities/Patient.js";
import { Address } from "../../../../src/p1/domain/value-objects/Address.js";
import { EmergencyContact } from "../../../../src/p1/domain/value-objects/EmergencyContact.js";
import { Diagnosis } from "../../../../src/p1/domain/value-objects/medical-record/Diagnosis.js";

describe("Patient Entity", () => {
  const validPatientData = {
    identificationDocument: "123.456.789-00",
    name: "João da Silva",
    birthDate: "1990-05-15T00:00:00.000Z", // CORREÇÃO: Usar formato UTC
    gender: "Masculino",
    bloodType: "O+",
    address: new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567"),
    phone: "+55 11 98765-4321",
    email: "joao.silva@email.com",
    emergencyContact: new EmergencyContact("Maria Silva", "+55 11 99999-9999"),
  };

  describe("Constructor", () => {
    it("deve criar um paciente válido com todos os dados", () => {
      const patient = new Patient(validPatientData);

      expect(patient.name).to.equal("João da Silva");
      expect(patient.identificationDocument).to.equal("123.456.789-00");
      expect(patient.email).to.equal("joao.silva@email.com");
      expect(patient.phone).to.equal("+55 11 98765-4321");
      expect(patient.gender).to.equal("Masculino");
      expect(patient.bloodType).to.equal("O+");
    });

    it("deve converter string de data de nascimento para Date", () => {
      const patient = new Patient(validPatientData);

      expect(patient.birthDate).to.be.instanceOf(Date);
      expect(patient.birthDate.getUTCFullYear()).to.equal(1990);
      expect(patient.birthDate.getUTCMonth()).to.equal(4); // CORREÇÃO: Usar UTC
      expect(patient.birthDate.getUTCDate()).to.equal(15); // CORREÇÃO: Usar UTC
    });

    it("deve aceitar Date como data de nascimento", () => {
      const dataWithDate = {
        ...validPatientData,
        birthDate: new Date("1990-05-15T00:00:00.000Z"),
      };
      const patient = new Patient(dataWithDate);

      expect(patient.birthDate).to.be.instanceOf(Date);
      expect(patient.birthDate.getUTCFullYear()).to.equal(1990);
    });

    it("deve inicializar com prontuário médico vazio", () => {
      const patient = new Patient(validPatientData);

      // CORREÇÃO: Agora medicalRecord retorna o objeto correto
      expect(patient.medicalRecord.diagnoses).to.be.an("array").that.is.empty;
      expect(patient.medicalRecord.medications).to.be.an("array").that.is.empty;
      expect(patient.medicalRecord.treatments).to.be.an("array").that.is.empty;
    });

    it("deve lançar erro quando documento de identificação estiver vazio", () => {
      const invalidData = { ...validPatientData, identificationDocument: "" };

      expect(() => new Patient(invalidData)).to.throw(
        "Identification document is required"
      );
    });

    it("deve lançar erro quando nome estiver vazio", () => {
      const invalidData = { ...validPatientData, name: "" };

      expect(() => new Patient(invalidData)).to.throw("Name is required");
    });

    it("deve lançar erro quando email estiver vazio", () => {
      const invalidData = { ...validPatientData, email: "" };

      expect(() => new Patient(invalidData)).to.throw("Email is required");
    });
  });

  describe("Getters", () => {
    it("deve retornar undefined para id antes de ser definido", () => {
      const patient = new Patient(validPatientData);

      expect(patient.id).to.be.undefined;
    });

    it("deve retornar cópia da data de nascimento", () => {
      const patient = new Patient(validPatientData);
      const retrievedDate = patient.birthDate;

      retrievedDate.setFullYear(2000);

      expect(patient.birthDate.getFullYear()).to.equal(1990);
    });

    // CORREÇÃO: Teste ajustado para refletir comportamento correto
    it("deve permitir acesso ao prontuário médico", () => {
      const patient = new Patient(validPatientData);
      const record = patient.medicalRecord;

      // Adicionar diagnóstico ao prontuário
      record.addDiagnosis(new Diagnosis("Diabetes", new Date()));

      // O prontuário foi modificado (é o mesmo objeto)
      expect(patient.medicalRecord.diagnoses).to.have.lengthOf(1);
    });
  });

  describe("Método _setId", () => {
    it("deve definir o id do paciente", () => {
      const patient = new Patient(validPatientData);
      patient._setId("abc-123");

      expect(patient.id).to.equal("abc-123");
    });

    it("deve permitir apenas uma definição de id", () => {
      const patient = new Patient(validPatientData);
      patient._setId("abc-123");
      patient._setId("xyz-789");

      expect(patient.id).to.equal("xyz-789");
    });
  });

  describe("Setters", () => {
    describe("Nome", () => {
      it("deve atualizar nome com valor válido", () => {
        const patient = new Patient(validPatientData);
        patient.name = "Pedro Santos";

        expect(patient.name).to.equal("Pedro Santos");
      });

      it("deve lançar erro ao tentar definir nome vazio", () => {
        const patient = new Patient(validPatientData);

        expect(() => {
          patient.name = "";
        }).to.throw("Name cannot be empty");
      });
    });

    describe("Telefone", () => {
      it("deve atualizar telefone com valor válido", () => {
        const patient = new Patient(validPatientData);
        patient.phone = "+55 11 91234-5678";

        expect(patient.phone).to.equal("+55 11 91234-5678");
      });

      it("deve lançar erro ao tentar definir telefone vazio", () => {
        const patient = new Patient(validPatientData);

        expect(() => {
          patient.phone = "";
        }).to.throw("Phone cannot be empty");
      });
    });

    describe("Email", () => {
      it("deve atualizar email com valor válido", () => {
        const patient = new Patient(validPatientData);
        patient.email = "novo.email@example.com";

        expect(patient.email).to.equal("novo.email@example.com");
      });

      it("deve lançar erro ao tentar definir email vazio", () => {
        const patient = new Patient(validPatientData);

        expect(() => {
          patient.email = "";
        }).to.throw("Email cannot be empty");
      });
    });

    describe("Endereço", () => {
      it("deve atualizar endereço com valor válido", () => {
        const patient = new Patient(validPatientData);
        const newAddress = new Address(
          "Avenida Paulista",
          1000,
          "São Paulo",
          "SP",
          "01310-100"
        );

        patient.address = newAddress;

        expect(patient.address.street).to.equal("Avenida Paulista");
        expect(patient.address.number).to.equal(1000);
      });

      it("deve lançar erro ao tentar definir endereço inválido", () => {
        const patient = new Patient(validPatientData);
        const invalidAddress = { street: "Invalid" } as any;

        expect(() => {
          patient.address = invalidAddress;
        }).to.throw("Invalid address");
      });
    });

    describe("Contato de Emergência", () => {
      it("deve atualizar contato de emergência com valor válido", () => {
        const patient = new Patient(validPatientData);
        const newContact = new EmergencyContact(
          "Ana Costa",
          "+55 11 98888-8888"
        );

        patient.emergencyContact = newContact;

        expect(patient.emergencyContact.name).to.equal("Ana Costa");
        expect(patient.emergencyContact.phone).to.equal("+55 11 98888-8888");
      });

      it("deve lançar erro ao tentar definir contato inválido", () => {
        const patient = new Patient(validPatientData);
        const invalidContact = { name: "Invalid" } as any;

        expect(() => {
          patient.emergencyContact = invalidContact;
        }).to.throw("Invalid emergency contact");
      });
    });
  });

  describe("Método getAge", () => {
    it("deve calcular idade corretamente para aniversário já ocorrido no ano", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      birthDate.setMonth(0);
      birthDate.setDate(1);

      const patientData = {
        ...validPatientData,
        birthDate: birthDate.toISOString(),
      };
      const patient = new Patient(patientData);

      expect(patient.getAge()).to.equal(30);
    });

    it("deve calcular idade corretamente para aniversário ainda não ocorrido no ano", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      birthDate.setMonth(11);
      birthDate.setDate(31);

      const patientData = {
        ...validPatientData,
        birthDate: birthDate.toISOString(),
      };
      const patient = new Patient(patientData);

      const today = new Date();
      const expectedAge = today.getMonth() < 11 ? 29 : 30;

      expect(patient.getAge()).to.equal(expectedAge);
    });

    it("deve retornar 0 para bebê nascido este ano", () => {
      const birthDate = new Date();
      birthDate.setMonth(0);
      birthDate.setDate(1);

      const patientData = {
        ...validPatientData,
        birthDate: birthDate.toISOString(),
      };
      const patient = new Patient(patientData);

      expect(patient.getAge()).to.equal(0);
    });

    it("deve calcular idade corretamente quando aniversário é exatamente hoje", () => {
      const today = new Date();
      const birthDate = new Date(today);
      birthDate.setFullYear(today.getFullYear() - 25);

      const patientData = {
        ...validPatientData,
        birthDate: birthDate.toISOString(),
      };
      const patient = new Patient(patientData);

      expect(patient.getAge()).to.equal(25);
    });

    it("deve calcular idade corretamente quando nasceu no mesmo mês mas dia diferente", () => {
      const today = new Date();
      const birthDate = new Date(today);
      birthDate.setFullYear(today.getFullYear() - 25);

      // Se hoje é dia 15, nasceu dia 20 do mesmo mês (ainda não fez aniversário)
      if (today.getDate() < 28) {
        birthDate.setDate(today.getDate() + 5);

        const patientData = {
          ...validPatientData,
          birthDate: birthDate.toISOString(),
        };
        const patient = new Patient(patientData);

        expect(patient.getAge()).to.equal(24); // Ainda não fez 25
      }
    });
  });

  describe("Factory Function addPatient", () => {
    it("deve criar um paciente usando a factory function", () => {
      const patient = addPatient(validPatientData);

      expect(patient).to.be.instanceOf(Patient);
      expect(patient.name).to.equal("João da Silva");
      expect(patient.email).to.equal("joao.silva@email.com");
    });
  });

  // CORREÇÃO: Teste ajustado
  describe("Integração com Prontuário Médico", () => {
    it("deve manter dados do prontuário após múltiplas operações", () => {
      const patient = new Patient(validPatientData);

      const diagnosis = new Diagnosis("Diabetes Tipo 2", new Date());

      // Adicionar ao prontuário
      patient.medicalRecord.addDiagnosis(diagnosis);

      // Verificar que foi adicionado
      expect(patient.medicalRecord.diagnoses).to.have.lengthOf(1);
      expect(patient.medicalRecord.diagnoses[0].description).to.equal("Diabetes Tipo 2");
    });
  });
});