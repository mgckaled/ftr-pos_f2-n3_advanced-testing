import { expect } from "chai";
import { Request, Response } from "express";
import sinon from "sinon";
import { PatientService } from "../../../../src/p1/domain/services/PatientService.js";
import { Address } from "../../../../src/p1/domain/value-objects/Address.js";
import { EmergencyContact } from "../../../../src/p1/domain/value-objects/EmergencyContact.js";
import { PatientRepository } from "../../../../src/p1/infrastructure/persistence/PatientRepository.js";
import { PatientController } from "../../../../src/p1/interfaces/controllers/PatientController.js";

describe("PatientController", () => {
  let controller: PatientController;
  let service: PatientService;
  let repository: PatientRepository;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusStub: sinon.SinonStub;
  let jsonStub: sinon.SinonStub;

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
    service = new PatientService(repository);
    controller = new PatientController(service);

    jsonStub = sinon.stub();
    statusStub = sinon.stub().returns({ json: jsonStub });

    req = {};
    res = {
      status: statusStub,
      json: jsonStub,
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("Constructor e Rotas", () => {
    it("deve criar controller com serviço válido", () => {
      expect(controller).to.be.instanceOf(PatientController);
      expect(controller.router).to.not.be.undefined;
    });

    it("deve inicializar rotas", () => {
      const routes = controller.router.stack.map((layer: any) => ({
        path: layer.route?.path,
        methods: layer.route?.methods,
      }));

      expect(routes.some((r: any) => r.path === "/")).to.be.true;
      expect(routes.some((r: any) => r.path === "/:id")).to.be.true;
      expect(routes.some((r: any) => r.path === "/search/name/:name")).to.be.true;
      expect(routes.some((r: any) => r.path === "/search/bloodType/:bloodType")).to.be.true;
    });
  });

  describe("Método createPatient", () => {
    it("deve criar paciente com sucesso e retornar status 201", async () => {
      req.body = validPatientData;

      await controller.createPatient(req as Request, res as Response);

      expect(statusStub.calledWith(201)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.name).to.equal("João da Silva");
    });

    it("deve retornar status 400 em caso de erro", async () => {
      req.body = { ...validPatientData, name: "" };

      await controller.createPatient(req as Request, res as Response);

      expect(statusStub.calledWith(400)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.exist;
    });

    it("deve retornar mensagem de erro adequada", async () => {
      req.body = { ...validPatientData, email: "" };

      await controller.createPatient(req as Request, res as Response);

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Email is required");
    });
  });

  describe("Método getAllPatients", () => {
    it("deve retornar lista vazia com status 200", async () => {
      await controller.getAllPatients(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;
      expect(jsonStub.calledOnce).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response).to.be.an("array").that.is.empty;
    });

    it("deve retornar todos os pacientes", async () => {
      service.addPatient(validPatientData);
      service.addPatient({
        ...validPatientData,
        identificationDocument: "987.654.321-00",
        email: "maria@email.com",
        name: "Maria Santos",
      });

      await controller.getAllPatients(req as Request, res as Response);

      const response = jsonStub.firstCall.args[0];
      expect(response).to.have.lengthOf(2);
    });

    it("deve retornar status 500 em caso de erro", async () => {
      sinon.stub(service, "findAllPatients").throws(new Error("Database error"));

      await controller.getAllPatients(req as Request, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Database error");
    });
  });

  describe("Método getPatientById", () => {
    it("deve retornar paciente existente com status 200", async () => {
      const patient = service.addPatient(validPatientData);
      req.params = { id: patient.id! };

      await controller.getPatientById(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.name).to.equal("João da Silva");
    });

    it("deve retornar status 404 quando paciente não existe", async () => {
      req.params = { id: "999" };

      await controller.getPatientById(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Patient not found");
    });

    it("deve retornar status 500 em caso de erro", async () => {
      req.params = { id: "1" };
      sinon.stub(service, "findPatientById").throws(new Error("Database error"));

      await controller.getPatientById(req as Request, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Database error");
    });
  });

  describe("Método updatePatient", () => {
    it("deve atualizar paciente com sucesso e retornar status 200", async () => {
      const patient = service.addPatient(validPatientData);
      req.params = { id: patient.id! };
      req.body = { name: "João Pedro Silva" };

      await controller.updatePatient(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.name).to.equal("João Pedro Silva");
    });

    it("deve retornar status 400 quando paciente não existe", async () => {
      req.params = { id: "999" };
      req.body = { name: "Test" };

      await controller.updatePatient(req as Request, res as Response);

      expect(statusStub.calledWith(400)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Patient not Found!");
    });

    it("deve retornar status 400 quando paciente não existe", async () => {
      req.params = { id: "999" };
      req.body = { name: "Novo Nome" };

      await controller.updatePatient(req as Request, res as Response);

      expect(statusStub.callCount).to.be.greaterThan(0);
      expect(statusStub.getCall(0).args[0]).to.equal(400);

      const response = jsonStub.firstCall.args[0];
      expect(response).to.have.property("error");
      expect(response.error).to.equal("Patient not Found!");
    });
  });

  describe("Método deletePatient", () => {
    it("deve deletar paciente com sucesso e retornar status 200", async () => {
      const patient = service.addPatient(validPatientData);
      req.params = { id: patient.id! };

      await controller.deletePatient(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.name).to.equal("João da Silva");
    });

    it("deve retornar status 404 quando paciente não existe", async () => {
      req.params = { id: "999" };

      await controller.deletePatient(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Patient not Found!");
    });
  });

  describe("Método getPatientByName", () => {
    it("deve retornar pacientes por nome com status 200", async () => {
      service.addPatient(validPatientData);
      req.params = { name: "João da Silva" };

      await controller.getPatientByName(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response).to.have.lengthOf(1);
      expect(response[0].name).to.equal("João da Silva");
    });

    it("deve retornar status 404 quando não encontra pacientes", async () => {
      req.params = { name: "Nome Inexistente" };

      await controller.getPatientByName(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("No patients found with the given name");
    });

    it("deve retornar status 500 em caso de erro", async () => {
      req.params = { name: "Test" };
      sinon.stub(service, "findPatientByName").throws(new Error("Database error"));

      await controller.getPatientByName(req as Request, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Database error");
    });
  });

  describe("Método getPatientByBloodType", () => {
    it("deve retornar pacientes por tipo sanguíneo com status 200", async () => {
      service.addPatient(validPatientData);
      req.params = { bloodType: "O+" };

      await controller.getPatientByBloodType(req as Request, res as Response);

      expect(statusStub.calledWith(200)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response).to.have.lengthOf(1);
      expect(response[0].bloodType).to.equal("O+");
    });

    it("deve retornar status 404 quando não encontra pacientes", async () => {
      req.params = { bloodType: "AB-" };

      await controller.getPatientByBloodType(req as Request, res as Response);

      expect(statusStub.calledWith(404)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("No patients found with the given blood type");
    });

    it("deve retornar status 500 em caso de erro", async () => {
      req.params = { bloodType: "O+" };
      sinon.stub(service, "findPatientByBloodType").throws(new Error("Database error"));

      await controller.getPatientByBloodType(req as Request, res as Response);

      expect(statusStub.calledWith(500)).to.be.true;

      const response = jsonStub.firstCall.args[0];
      expect(response.error).to.equal("Database error");
    });
  });
});