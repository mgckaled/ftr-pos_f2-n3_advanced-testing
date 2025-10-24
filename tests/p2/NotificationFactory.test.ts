import { expect } from "chai"
import { describe, it } from "mocha"
import { NotificationFactory } from "../../src/p2/NotificationFactory.js"

describe("NotificationFactory - Factory Pattern", () => {
  describe("Criação de notificadores", () => {
    it("deve criar notificador de email", () => {
      const notifier = NotificationFactory.create("email")
      expect(notifier).to.exist
      expect(notifier.send).to.be.a("function")
    })

    it("deve criar notificador de SMS", () => {
      const notifier = NotificationFactory.create("sms")
      expect(notifier).to.exist
      expect(notifier.send).to.be.a("function")
    })

    it("deve lançar erro para tipo inválido", () => {
      expect(() => NotificationFactory.create("push" as any)).to.throw("Tipo inválido")
    })
  })

  describe("Envio de notificações - Email", () => {
    it("deve enviar email com mensagem padrão", () => {
      const notifier = NotificationFactory.create("email")
      const result = notifier.send()

      expect(result).to.equal("Enviando Email: Olá, usuário!")
    })

    it("deve enviar email com mensagem personalizada", () => {
      const notifier = NotificationFactory.create("email", "Bem-vindo ao sistema!")
      const result = notifier.send()

      expect(result).to.equal("Enviando Email: Bem-vindo ao sistema!")
    })

    it("deve enviar email de confirmação de pedido", () => {
      const orderNumber = "ORD-12345"
      const notifier = NotificationFactory.create(
        "email",
        `Seu pedido ${orderNumber} foi confirmado`
      )
      const result = notifier.send()

      expect(result).to.include("Seu pedido ORD-12345 foi confirmado")
    })
  })

  describe("Envio de notificações - SMS", () => {
    it("deve enviar SMS com mensagem padrão", () => {
      const notifier = NotificationFactory.create("sms")
      const result = notifier.send()

      expect(result).to.equal("Enviando SMS: Olá, usuário!")
    })

    it("deve enviar SMS com mensagem personalizada", () => {
      const notifier = NotificationFactory.create("sms", "Código de verificação: 123456")
      const result = notifier.send()

      expect(result).to.equal("Enviando SMS: Código de verificação: 123456")
    })

    it("deve enviar SMS de notificação de entrega", () => {
      const notifier = NotificationFactory.create("sms", "Seu pedido está a caminho!")
      const result = notifier.send()

      expect(result).to.include("Seu pedido está a caminho!")
    })
  })

  describe("Cenários do mundo real", () => {
    it("deve notificar novo usuário por email", () => {
      const userName = "João Silva"
      const notifier = NotificationFactory.create("email", `Olá ${userName}, seja bem-vindo!`)
      const result = notifier.send()

      expect(result).to.equal("Enviando Email: Olá João Silva, seja bem-vindo!")
    })

    it("deve enviar código 2FA por SMS", () => {
      const code = Math.floor(100000 + Math.random() * 900000)
      const notifier = NotificationFactory.create("sms", `Seu código é: ${code}`)
      const result = notifier.send()

      expect(result).to.match(/Enviando SMS: Seu código é: \d{6}/)
    })

    it("deve enviar confirmação de pagamento por email", () => {
      const notifier = NotificationFactory.create("email", "Pagamento aprovado! Valor: R$ 299,90")
      const result = notifier.send()

      expect(result).to.include("Pagamento aprovado")
      expect(result).to.include("R$ 299,90")
    })

    it("deve notificar entrega iminente por SMS", () => {
      const notifier = NotificationFactory.create("sms", "Seu pedido chegará em 30 minutos")
      const result = notifier.send()

      expect(result).to.include("30 minutos")
    })
  })

  describe("Validação de tipos", () => {
    it("deve aceitar apenas tipos válidos", () => {
      const validTypes = ["email", "sms"]

      validTypes.forEach((type) => {
        expect(() => NotificationFactory.create(type as any)).to.not.throw()
      })
    })

    it("deve rejeitar tipos inválidos", () => {
      const invalidTypes = ["whatsapp", "telegram", "push", ""]

      invalidTypes.forEach((type) => {
        expect(() => NotificationFactory.create(type as any)).to.throw("Tipo inválido")
      })
    })
  })

  describe("Mensagens vazias e especiais", () => {
    it("deve aceitar mensagem vazia", () => {
      const notifier = NotificationFactory.create("email", "")
      const result = notifier.send()

      expect(result).to.equal("Enviando Email: ")
    })

    it("deve aceitar mensagem com caracteres especiais", () => {
      const notifier = NotificationFactory.create("sms", "Olá! @#$%&*()[]")
      const result = notifier.send()

      expect(result).to.include("@#$%&*()")
    })

    it("deve aceitar mensagem com quebras de linha", () => {
      const message = "Linha 1\nLinha 2\nLinha 3"
      const notifier = NotificationFactory.create("email", message)
      const result = notifier.send()

      expect(result).to.include("Linha 1")
      expect(result).to.include("Linha 2")
    })
  })
})
