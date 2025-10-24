import { expect } from "chai"
import sinon from "sinon"
import { PatientService } from "../../../../src/p1/domain/services/PatientService.js"
import { Address } from "../../../../src/p1/domain/value-objects/Address.js"
import { EmergencyContact } from "../../../../src/p1/domain/value-objects/EmergencyContact.js"
import { PatientRepository } from "../../../../src/p1/infrastructure/persistence/PatientRepository.js"

describe("PatientService", () => {
  let service: PatientService
  let repository: PatientRepository

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
  }

  beforeEach(() => {
    repository = new PatientRepository()
    service = new PatientService(repository)
  })

  afterEach(() => {
    sinon.restore()
  })

  describe("Constructor", () => {
    it("deve criar serviço com repositório válido", () => {
      expect(service).to.be.instanceOf(PatientService)
    })

    it("deve lançar erro quando repositório não é fornecido", () => {
      expect(() => new PatientService(null as any)).to.throw("PatientRepository is required")
    })

    it("deve lançar erro quando repositório é undefined", () => {
      expect(() => new PatientService(undefined as any)).to.throw("PatientRepository is required")
    })

    it("deve aceitar repositório válido sem erros", () => {
      const newRepository = new PatientRepository()
      const newService = new PatientService(newRepository)

      expect(newService).to.be.instanceOf(PatientService)
      expect(() => newService.findAllPatients()).to.not.throw()
    })
  })

  describe("Método addPatient", () => {
    it("deve adicionar paciente e retornar paciente salvo", () => {
      const patient = service.addPatient(validPatientData)

      expect(patient).to.not.be.null
      expect(patient.name).to.equal("João da Silva")
      expect(patient.id).to.equal("1")
    })

    it("deve criar paciente com dados válidos", () => {
      const patient = service.addPatient(validPatientData)

      expect(patient.email).to.equal("joao.silva@email.com")
      expect(patient.phone).to.equal("+55 11 98765-4321")
      expect(patient.bloodType).to.equal("O+")
    })

    it("deve lançar erro com dados inválidos", () => {
      const invalidData = {
        ...validPatientData,
        name: "",
      }

      expect(() => service.addPatient(invalidData)).to.throw("Name is required")
    })

    it("deve lançar erro se falhar ao salvar paciente", () => {
      // Simular falha silenciosa: addPatient retorna id, mas findById retorna null
      sinon.stub(repository, "addPatient").returns(1)
      sinon.stub(repository, "findById").returns(null)

      expect(() => service.addPatient(validPatientData)).to.throw("Failed to save patient")
    })
  })

  describe("Método findAllPatients", () => {
    it("deve retornar array vazio quando não há pacientes", () => {
      const patients = service.findAllPatients()

      expect(patients).to.be.an("array").that.is.empty
    })

    it("deve retornar todos os pacientes cadastrados", () => {
      service.addPatient(validPatientData)
      service.addPatient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "maria@email.com",
        name: "Maria Santos",
      })

      const patients = service.findAllPatients()

      expect(patients).to.have.lengthOf(2)
    })
  })

  describe("Método findPatientById", () => {
    it("deve retornar null quando paciente não existe", () => {
      const patient = service.findPatientById(999)

      expect(patient).to.be.null
    })

    it("deve retornar paciente quando existe", () => {
      const added = service.addPatient(validPatientData)
      const found = service.findPatientById(Number(added.id))

      expect(found).to.not.be.null
      expect(found?.name).to.equal("João da Silva")
    })
  })

  describe("Método updatePatient", () => {
    it("deve atualizar nome do paciente", () => {
      const patient = service.addPatient(validPatientData)
      const updated = service.updatePatient(Number(patient.id), {
        name: "João Pedro Silva",
      })

      expect(updated.name).to.equal("João Pedro Silva")
    })

    it("deve atualizar telefone do paciente", () => {
      const patient = service.addPatient(validPatientData)
      const updated = service.updatePatient(Number(patient.id), {
        phone: "+55 11 91111-1111",
      })

      expect(updated.phone).to.equal("+55 11 91111-1111")
    })

    it("deve atualizar email do paciente", () => {
      const patient = service.addPatient(validPatientData)
      const updated = service.updatePatient(Number(patient.id), {
        email: "novoemail@email.com",
      })

      expect(updated.email).to.equal("novoemail@email.com")
    })

    it("deve atualizar endereço do paciente", () => {
      const patient = service.addPatient(validPatientData)
      const newAddress = new Address("Avenida Paulista", 1000, "São Paulo", "SP", "01310-100")

      const updated = service.updatePatient(Number(patient.id), {
        address: newAddress,
      })

      expect(updated.address.street).to.equal("Avenida Paulista")
      expect(updated.address.number).to.equal(1000)
    })

    it("deve atualizar contato de emergência do paciente", () => {
      const patient = service.addPatient(validPatientData)
      const newContact = new EmergencyContact("Ana Costa", "+55 11 98888-8888")

      const updated = service.updatePatient(Number(patient.id), {
        emergencyContact: newContact,
      })

      expect(updated.emergencyContact.name).to.equal("Ana Costa")
    })

    it("deve atualizar múltiplos campos simultaneamente", () => {
      const patient = service.addPatient(validPatientData)
      const updated = service.updatePatient(Number(patient.id), {
        name: "João Pedro",
        phone: "+55 11 91111-1111",
        email: "joaopedro@email.com",
      })

      expect(updated.name).to.equal("João Pedro")
      expect(updated.phone).to.equal("+55 11 91111-1111")
      expect(updated.email).to.equal("joaopedro@email.com")
    })

    it("deve lançar erro ao atualizar paciente inexistente", () => {
      expect(() => service.updatePatient(999, { name: "Test" })).to.throw("Patient not Found!")
    })

    it("não deve alterar campos não informados", () => {
      const patient = service.addPatient(validPatientData)
      const originalEmail = patient.email

      const updated = service.updatePatient(Number(patient.id), {
        name: "Novo Nome",
      })

      expect(updated.email).to.equal(originalEmail)
    })
  })

  describe("Método deletePatient", () => {
    it("deve deletar paciente existente e retorná-lo", () => {
      const patient = service.addPatient(validPatientData)
      const deleted = service.deletePatient(Number(patient.id))

      expect(deleted.name).to.equal("João da Silva")
      expect(service.findPatientById(Number(patient.id))).to.be.null
    })

    it("deve lançar erro ao deletar paciente inexistente", () => {
      expect(() => service.deletePatient(999)).to.throw("Patient not Found!")
    })

    it("deve remover paciente da lista", () => {
      const patient = service.addPatient(validPatientData)
      service.deletePatient(Number(patient.id))

      const all = service.findAllPatients()
      expect(all).to.be.empty
    })
  })

  describe("Método findPatientByName", () => {
    it("deve retornar array vazio quando não há pacientes", () => {
      const patients = service.findPatientByName("João")

      expect(patients).to.be.empty
    })

    it("deve encontrar pacientes por nome", () => {
      service.addPatient(validPatientData)
      const patients = service.findPatientByName("João da Silva")

      expect(patients).to.have.lengthOf(1)
      expect(patients[0].name).to.equal("João da Silva")
    })

    it("deve retornar múltiplos pacientes com mesmo nome", () => {
      service.addPatient(validPatientData)
      service.addPatient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "joao2@email.com",
      })

      const patients = service.findPatientByName("João da Silva")

      expect(patients).to.have.lengthOf(2)
    })
  })

  describe("Método findPatientByBloodType", () => {
    it("deve retornar array vazio quando não há pacientes", () => {
      const patients = service.findPatientByBloodType("O+")

      expect(patients).to.be.empty
    })

    it("deve encontrar pacientes por tipo sanguíneo", () => {
      service.addPatient(validPatientData)
      const patients = service.findPatientByBloodType("O+")

      expect(patients).to.have.lengthOf(1)
      expect(patients[0].bloodType).to.equal("O+")
    })

    it("deve retornar múltiplos pacientes com mesmo tipo sanguíneo", () => {
      service.addPatient(validPatientData)
      service.addPatient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "maria@email.com",
        name: "Maria Santos",
      })

      const patients = service.findPatientByBloodType("O+")

      expect(patients).to.have.lengthOf(2)
    })

    it("deve filtrar por tipo sanguíneo específico", () => {
      service.addPatient(validPatientData)
      service.addPatient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "pedro@email.com",
        name: "Pedro Costa",
        bloodType: "A+",
      })

      const patientsO = service.findPatientByBloodType("O+")
      const patientsA = service.findPatientByBloodType("A+")

      expect(patientsO).to.have.lengthOf(1)
      expect(patientsA).to.have.lengthOf(1)
    })
  })
})
