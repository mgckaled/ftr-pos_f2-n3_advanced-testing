import { expect } from "chai";
import { Repository } from "../../../../src/p1/domain/repositories/Repository.js";

// Classe concreta para testar a classe abstrata
class TestEntity {
  constructor(public name: string) { }
}

class TestRepository extends Repository<TestEntity> {
  constructor() {
    super();
  }
}

describe("Repository Base Class", () => {
  let repository: TestRepository;

  beforeEach(() => {
    repository = new TestRepository();
  });

  describe("Constructor", () => {
    it("deve inicializar com Map vazio", () => {
      expect(repository.findAll()).to.be.an("array").that.is.empty;
    });
  });

  describe("Método add", () => {
    it("deve adicionar uma entidade com sucesso", () => {
      const entity = new TestEntity("Test");
      const id = repository.add(1, entity);

      expect(id).to.equal(1);
      expect(repository.findById(1)).to.equal(entity);
    });

    it("deve converter string para número no id", () => {
      const entity = new TestEntity("Test");
      const id = repository.add("2" as any, entity);

      expect(id).to.equal(2);
      expect(repository.findById(2)).to.equal(entity);
    });

    it("deve lançar erro ao adicionar entidade com id existente", () => {
      const entity1 = new TestEntity("Test1");
      const entity2 = new TestEntity("Test2");

      repository.add(1, entity1);

      expect(() => repository.add(1, entity2)).to.throw(
        "Entity already exists."
      );
    });
  });

  describe("Método findById", () => {
    it("deve retornar entidade existente", () => {
      const entity = new TestEntity("Test");
      repository.add(1, entity);

      const found = repository.findById(1);

      expect(found).to.equal(entity);
      expect(found?.name).to.equal("Test");
    });

    it("deve retornar null para id inexistente", () => {
      expect(repository.findById(999)).to.be.null;
    });

    it("deve converter string para número na busca", () => {
      const entity = new TestEntity("Test");
      repository.add(1, entity);

      expect(repository.findById("1" as any)).to.equal(entity);
    });
  });

  describe("Método findAll", () => {
    it("deve retornar array vazio quando não há entidades", () => {
      expect(repository.findAll()).to.be.an("array").that.is.empty;
    });

    it("deve retornar todas as entidades", () => {
      const entity1 = new TestEntity("Test1");
      const entity2 = new TestEntity("Test2");
      const entity3 = new TestEntity("Test3");

      repository.add(1, entity1);
      repository.add(2, entity2);
      repository.add(3, entity3);

      const all = repository.findAll();

      expect(all).to.have.lengthOf(3);
      expect(all).to.include(entity1);
      expect(all).to.include(entity2);
      expect(all).to.include(entity3);
    });

    it("deve retornar array independente do Map interno", () => {
      const entity = new TestEntity("Test");
      repository.add(1, entity);

      const all1 = repository.findAll();
      all1.push(new TestEntity("Extra"));

      const all2 = repository.findAll();

      expect(all2).to.have.lengthOf(1);
    });
  });

  describe("Método update", () => {
    it("deve atualizar entidade existente", () => {
      const entity1 = new TestEntity("Original");
      repository.add(1, entity1);

      const entity2 = new TestEntity("Updated");
      repository.update(1, entity2);

      const found = repository.findById(1);
      expect(found).to.equal(entity2);
      expect(found?.name).to.equal("Updated");
    });

    it("deve lançar erro ao atualizar entidade inexistente", () => {
      const entity = new TestEntity("Test");

      expect(() => repository.update(999, entity)).to.throw(
        "Entity not found."
      );
    });

    it("deve converter string para número no update", () => {
      const entity1 = new TestEntity("Original");
      repository.add(1, entity1);

      const entity2 = new TestEntity("Updated");
      repository.update("1" as any, entity2);

      expect(repository.findById(1)).to.equal(entity2);
    });
  });

  describe("Método delete", () => {
    it("deve deletar entidade existente", () => {
      const entity = new TestEntity("Test");
      repository.add(1, entity);

      repository.delete(1);

      expect(repository.findById(1)).to.be.null;
      expect(repository.findAll()).to.be.empty;
    });

    it("deve lançar erro ao deletar entidade inexistente", () => {
      expect(() => repository.delete(999)).to.throw("Entity not found.");
    });

    it("deve converter string para número no delete", () => {
      const entity = new TestEntity("Test");
      repository.add(1, entity);

      repository.delete("1" as any);

      expect(repository.findById(1)).to.be.null;
    });
  });

  describe("Método clear", () => {
    it("deve limpar todos os dados do repositório", () => {
      repository.add(1, new TestEntity("Test1"));
      repository.add(2, new TestEntity("Test2"));
      repository.add(3, new TestEntity("Test3"));

      repository.clear();

      expect(repository.findAll()).to.be.empty;
      expect(repository.findById(1)).to.be.null;
    });
  });
});