import { expect } from "chai"
import { afterEach, beforeEach, describe, it } from "mocha"
import sinon from "sinon"
import { DatabaseConnection } from "../../src/p2/DatabaseConnection.js"

describe("DatabaseConnection - Singleton Pattern", () => {
  const defaultConfig = {
    host: "localhost",
    port: 5432,
    database: "testdb",
  }

  beforeEach(() => {
    DatabaseConnection.clearInstance()
  })

  afterEach(() => {
    DatabaseConnection.clearInstance()
    sinon.restore()
  })

  describe("Padrão Singleton", () => {
    it("deve criar apenas uma instância", () => {
      const instance1 = DatabaseConnection.getInstance(defaultConfig)
      const instance2 = DatabaseConnection.getInstance({
        host: "other",
        port: 3306,
        database: "other",
      })

      expect(instance1).to.equal(instance2)
    })

    it("deve retornar mesma instância via getInstance", () => {
      const instance1 = DatabaseConnection.getInstance(defaultConfig)
      const instance2 = DatabaseConnection.getInstance({
        host: "different",
        port: 3306,
        database: "different",
      })

      expect(instance1).to.equal(instance2)
    })

    it("deve manter consistência com múltiplas chamadas", () => {
      const instance1 = DatabaseConnection.getInstance(defaultConfig)
      const instance2 = DatabaseConnection.getInstance(defaultConfig)
      const instance3 = DatabaseConnection.getInstance(defaultConfig)

      expect(instance1).to.equal(instance2)
      expect(instance2).to.equal(instance3)
    })
  })

  describe("Configuração inicial", () => {
    it("deve usar primeira configuração fornecida", () => {
      const config = {
        host: "production.db.com",
        port: 5432,
        database: "prod_db",
      }

      const instance = DatabaseConnection.getInstance(config)
      expect(instance.getConfig()).to.deep.equal(config)
    })

    it("deve ignorar configurações subsequentes", () => {
      const firstConfig = {
        host: "first.db.com",
        port: 5432,
        database: "first_db",
      }
      const secondConfig = {
        host: "second.db.com",
        port: 3306,
        database: "second_db",
      }

      const instance1 = DatabaseConnection.getInstance(firstConfig)
      const instance2 = DatabaseConnection.getInstance(secondConfig)

      expect(instance1.getConfig()).to.deep.equal(firstConfig)
      expect(instance2.getConfig()).to.deep.equal(firstConfig)
    })
  })

  describe("Método connect", () => {
    it("deve conectar ao banco de dados", async () => {
      const instance = DatabaseConnection.getInstance(defaultConfig)
      expect(instance.isConnected).to.be.false

      await instance.connect()

      expect(instance.isConnected).to.be.true
    })

    it("deve ser assíncrono e resolver após delay", async () => {
      const instance = DatabaseConnection.getInstance(defaultConfig)
      const startTime = Date.now()

      await instance.connect()

      const endTime = Date.now()
      const elapsed = endTime - startTime

      expect(elapsed).to.be.at.least(90) // 100ms - margem
    })

    it("deve permitir múltiplas chamadas de connect", async () => {
      const instance = DatabaseConnection.getInstance(defaultConfig)

      await instance.connect()
      expect(instance.isConnected).to.be.true

      await instance.connect()
      expect(instance.isConnected).to.be.true
    })
  })

  describe("Método clearInstance", () => {
    it("deve limpar instância singleton", () => {
      const instance1 = DatabaseConnection.getInstance(defaultConfig)
      expect(instance1).to.exist

      DatabaseConnection.clearInstance()

      const instance2 = DatabaseConnection.getInstance({
        host: "new.db.com",
        port: 3306,
        database: "new_db",
      })

      expect(instance2).to.not.equal(instance1)
      expect(instance2.getConfig().host).to.equal("new.db.com")
    })

    it("deve permitir nova instância após clear", () => {
      DatabaseConnection.getInstance(defaultConfig)
      DatabaseConnection.clearInstance()

      const newInstance = DatabaseConnection.getInstance({
        host: "fresh.db.com",
        port: 5432,
        database: "fresh_db",
      })

      expect(newInstance).to.exist
      expect(newInstance.getConfig().host).to.equal("fresh.db.com")
    })
  })

  describe("Cenários do mundo real - Aplicação", () => {
    it("deve garantir mesma conexão em toda aplicação", () => {
      // Módulo de usuários
      const userModuleDB = DatabaseConnection.getInstance({
        host: "app.db.com",
        port: 5432,
        database: "users",
      })

      // Módulo de produtos
      const productModuleDB = DatabaseConnection.getInstance({
        host: "different.db.com",
        port: 5432,
        database: "products",
      })

      // Módulo de pedidos
      const orderModuleDB = DatabaseConnection.getInstance({
        host: "another.db.com",
        port: 5432,
        database: "orders",
      })

      expect(userModuleDB).to.equal(productModuleDB)
      expect(productModuleDB).to.equal(orderModuleDB)
    })

    it("deve inicializar conexão uma única vez no startup", async () => {
      const config = {
        host: "startup.db.com",
        port: 5432,
        database: "main",
      }

      const db = DatabaseConnection.getInstance(config)
      await db.connect()

      expect(db.isConnected).to.be.true

      // Outros módulos obtêm a mesma conexão
      const db2 = DatabaseConnection.getInstance(config)
      expect(db2.isConnected).to.be.true
    })
  })

  describe("Cenários do mundo real - Testes", () => {
    it("deve permitir reinicialização entre testes", async () => {
      // Teste 1
      const testDB1 = DatabaseConnection.getInstance({
        host: "test1.db.com",
        port: 5432,
        database: "test1",
      })
      await testDB1.connect()
      expect(testDB1.isConnected).to.be.true

      // Cleanup
      DatabaseConnection.clearInstance()

      // Teste 2
      const testDB2 = DatabaseConnection.getInstance({
        host: "test2.db.com",
        port: 5432,
        database: "test2",
      })
      expect(testDB2.isConnected).to.be.false
      expect(testDB2.getConfig().host).to.equal("test2.db.com")
    })

    it("deve isolar ambientes de teste", () => {
      const testConfig = {
        host: "test.db.com",
        port: 5432,
        database: "test_db",
      }

      const testInstance = DatabaseConnection.getInstance(testConfig)
      expect(testInstance.getConfig().database).to.equal("test_db")

      DatabaseConnection.clearInstance()

      const prodConfig = {
        host: "prod.db.com",
        port: 5432,
        database: "prod_db",
      }

      const prodInstance = DatabaseConnection.getInstance(prodConfig)
      expect(prodInstance.getConfig().database).to.equal("prod_db")
    })
  })

  describe("Integração com timers", () => {
    it("deve completar conexão dentro do timeout", async () => {
      const clock = sinon.useFakeTimers()

      const instance = DatabaseConnection.getInstance(defaultConfig)
      const connectPromise = instance.connect()

      expect(instance.isConnected).to.be.false

      clock.tick(100)
      await connectPromise

      expect(instance.isConnected).to.be.true

      clock.restore()
    })

    it("deve simular delay de conexão realista", async () => {
      const clock = sinon.useFakeTimers()

      const instance = DatabaseConnection.getInstance(defaultConfig)
      const connectPromise = instance.connect()

      // Antes do timeout
      clock.tick(50)
      expect(instance.isConnected).to.be.false

      // Após timeout
      clock.tick(50)
      await connectPromise
      expect(instance.isConnected).to.be.true

      clock.restore()
    })
  })

  describe("Edge cases", () => {
    it("deve aceitar configurações mínimas", () => {
      const minConfig = {
        host: "localhost",
        port: 5432,
        database: "db",
      }

      const instance = DatabaseConnection.getInstance(minConfig)
      expect(instance).to.exist
    })

    it("deve manter estado de conexão por instância", async () => {
      const instance = DatabaseConnection.getInstance(defaultConfig)
      expect(instance.isConnected).to.be.false

      await instance.connect()
      expect(instance.isConnected).to.be.true

      // Obter mesma instância
      const sameInstance = DatabaseConnection.getInstance(defaultConfig)
      expect(sameInstance.isConnected).to.be.true
    })

    it("deve resetar estado após clearInstance", async () => {
      const instance1 = DatabaseConnection.getInstance(defaultConfig)
      await instance1.connect()
      expect(instance1.isConnected).to.be.true

      DatabaseConnection.clearInstance()

      const instance2 = DatabaseConnection.getInstance(defaultConfig)
      expect(instance2.isConnected).to.be.false
    })
  })

  describe("Cenários de ambiente", () => {
    it("deve suportar diferentes configurações por ambiente", () => {
      const environments = [
        { host: "dev.db.com", port: 5432, database: "dev" },
        { host: "staging.db.com", port: 5432, database: "staging" },
        { host: "prod.db.com", port: 5432, database: "production" },
      ]

      environments.forEach((envConfig) => {
        DatabaseConnection.clearInstance()
        const instance = DatabaseConnection.getInstance(envConfig)
        expect(instance.getConfig().database).to.equal(envConfig.database)
      })
    })

    it("deve manter configuração em ambiente de produção", () => {
      const prodConfig = {
        host: "prod-cluster.db.com",
        port: 5432,
        database: "production",
      }

      const instance1 = DatabaseConnection.getInstance(prodConfig)
      const instance2 = DatabaseConnection.getInstance(prodConfig)
      const instance3 = DatabaseConnection.getInstance(prodConfig)

      expect(instance1).to.equal(instance2)
      expect(instance2).to.equal(instance3)
      expect(instance1.getConfig()).to.deep.equal(prodConfig)
    })
  })
})
