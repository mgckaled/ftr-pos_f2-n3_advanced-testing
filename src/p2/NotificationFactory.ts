interface Notifier {
  send(): string
}

class EmailNotifier implements Notifier {
  constructor(private message: string) {}

  send(): string {
    return `Enviando Email: ${this.message}`
  }
}

class SMSNotifier implements Notifier {
  constructor(private message: string) {}

  send(): string {
    return `Enviando SMS: ${this.message}`
  }
}

type NotificationType = "email" | "sms"

export const NotificationFactory = {
  create(type: NotificationType, message = "Olá, usuário!"): Notifier {
    const notifiers: Record<NotificationType, () => Notifier> = {
      email: () => new EmailNotifier(message),
      sms: () => new SMSNotifier(message),
    }

    if (!notifiers[type]) {
      throw new Error("Tipo inválido")
    }

    return notifiers[type]()
  },
}
