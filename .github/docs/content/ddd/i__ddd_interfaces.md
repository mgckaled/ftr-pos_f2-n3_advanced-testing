# Testes para Interfaces (DDD)

## Introdução

Interfaces (ou Ports, no contexto de Arquitetura Hexagonal) definem contratos entre camadas da aplicação, permitindo a inversão de dependências. Elas são especialmente importantes no DDD para definir como o domínio se comunica com a infraestrutura sem depender de implementações concretas. Os testes de Interfaces focam em validar que as implementações respeitam o contrato definido, garantindo substituibilidade e conformidade. A estratégia principal são testes de contrato que verificam que todas as implementações se comportam conforme esperado.

## Estratégias de Teste

Para Interfaces, deve-se criar testes de contrato (contract tests) que validem que qualquer implementação respeita a interface, testar múltiplas implementações com os mesmos testes para garantir consistência, verificar que exceções definidas no contrato são lançadas adequadamente, e usar testes parametrizados para executar os mesmos cenários em diferentes implementações. O princípio de Liskov Substitution deve ser respeitado.

## Exemplo Prático: Interface de Notificação

```typescript
// src/domain/ports/INotificationService.ts
export interface INotificationService {
  sendEmail(recipient: string, subject: string, body: string): Promise<void>;
  sendSMS(phoneNumber: string, message: string): Promise<void>;
  sendPushNotification(userId: string, title: string, message: string): Promise<void>;
}

// src/infrastructure/services/SendGridNotificationService.ts
export class SendGridNotificationService implements INotificationService {
  constructor(private sendGridClient: SendGridClient) {}

  async sendEmail(recipient: string, subject: string, body: string): Promise<void> {
    if (!this.isValidEmail(recipient)) {
      throw new InvalidEmailException(recipient);
    }

    await this.sendGridClient.send({
      to: recipient,
      from: 'noreply@company.com',
      subject: subject,
      html: body
    });
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    throw new Error('SMS not supported by SendGrid implementation');
  }

  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    throw new Error('Push notifications not supported by SendGrid implementation');
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// src/infrastructure/services/TwilioNotificationService.ts
export class TwilioNotificationService implements INotificationService {
  constructor(private twilioClient: TwilioClient) {}

  async sendEmail(recipient: string, subject: string, body: string): Promise<void> {
    throw new Error('Email not supported by Twilio implementation');
  }

  async sendSMS(phoneNumber: string, message: string): Promise<void> {
    if (!this.isValidPhoneNumber(phoneNumber)) {
      throw new InvalidPhoneException(phoneNumber);
    }

    await this.twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE,
      body: message
    });
  }

  async sendPushNotification(userId: string, title: string, message: string): Promise<void> {
    throw new Error('Push notifications not supported by Twilio implementation');
  }

  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }
}
```

## Testes de Contrato

```typescript
// tests/contract/INotificationService.contract.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { INotificationService } from '../../../src/domain/ports/INotificationService';

export function testNotificationServiceContract(
  createService: () => INotificationService,
  supportedMethods: string[]
) {
  describe('INotificationService Contract Tests', () => {
    let service: INotificationService;

    beforeEach(() => {
      service = createService();
    });

    if (supportedMethods.includes('sendEmail')) {
      describe('sendEmail', () => {
        it('should send email successfully with valid data', async () => {
          await service.sendEmail(
            'test@example.com',
            'Test Subject',
            '<p>Test Body</p>'
          );
          // Verifica que não lançou exceção
        });

        it('should throw error for invalid email', async () => {
          try {
            await service.sendEmail(
              'invalid-email',
              'Test Subject',
              'Test Body'
            );
            expect.fail('Should have thrown exception for invalid email');
          } catch (error: any) {
            expect(error.name).to.equal('InvalidEmailException');
          }
        });

        it('should handle empty subject', async () => {
          await service.sendEmail(
            'test@example.com',
            '',
            'Test Body'
          );
          // Verifica que não lançou exceção
        });
      });
    }

    if (supportedMethods.includes('sendSMS')) {
      describe('sendSMS', () => {
        it('should send SMS successfully with valid data', async () => {
          await service.sendSMS('+5511999999999', 'Test message');
        });

        it('should throw error for invalid phone number', async () => {
          try {
            await service.sendSMS('invalid-phone', 'Test message');
            expect.fail('Should have thrown exception for invalid phone');
          } catch (error: any) {
            expect(error.name).to.equal('InvalidPhoneException');
          }
        });

        it('should handle long messages', async () => {
          const longMessage = 'a'.repeat(500);
          await service.sendSMS('+5511999999999', longMessage);
        });
      });
    }

    if (supportedMethods.includes('sendPushNotification')) {
      describe('sendPushNotification', () => {
        it('should send push notification successfully', async () => {
          await service.sendPushNotification(
            'user-123',
            'Test Title',
            'Test Message'
          );
        });

        it('should handle empty userId gracefully', async () => {
          try {
            await service.sendPushNotification('', 'Title', 'Message');
            expect.fail('Should have thrown exception for empty userId');
          } catch (error) {
            expect(error).to.exist;
          }
        });
      });
    }
  });
}
```

## Aplicando Testes de Contrato

```typescript
// tests/unit/infrastructure/services/SendGridNotificationService.spec.ts
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { SendGridNotificationService } from '../../../../src/infrastructure/services/SendGridNotificationService';
import { testNotificationServiceContract } from '../../../contract/INotificationService.contract';

describe('SendGridNotificationService', () => {
  const sendGridClientMock = {
    send: sinon.stub().resolves()
  };

  testNotificationServiceContract(
    () => new SendGridNotificationService(sendGridClientMock as any),
    ['sendEmail'] // SendGrid só suporta email
  );

  describe('SendGrid Specific Tests', () => {
    it('should use correct sender email', async () => {
      const service = new SendGridNotificationService(sendGridClientMock as any);
      
      await service.sendEmail('test@example.com', 'Subject', 'Body');

      const sentEmail = sendGridClientMock.send.firstCall.args[0];
      expect(sentEmail.from).to.equal('noreply@company.com');
    });

    it('should convert plain text to HTML when needed', async () => {
      const service = new SendGridNotificationService(sendGridClientMock as any);
      
      await service.sendEmail('test@example.com', 'Subject', 'Plain text');

      const sentEmail = sendGridClientMock.send.firstCall.args[0];
      expect(sentEmail.html).to.exist;
    });
  });
});

// tests/unit/infrastructure/services/TwilioNotificationService.spec.ts
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { TwilioNotificationService } from '../../../../src/infrastructure/services/TwilioNotificationService';
import { testNotificationServiceContract } from '../../../contract/INotificationService.contract';

describe('TwilioNotificationService', () => {
  const twilioClientMock = {
    messages: {
      create: sinon.stub().resolves({ sid: 'SM123' })
    }
  };

  testNotificationServiceContract(
    () => new TwilioNotificationService(twilioClientMock as any),
    ['sendSMS'] // Twilio só suporta SMS
  );

  describe('Twilio Specific Tests', () => {
    it('should include sender phone number', async () => {
      process.env.TWILIO_PHONE = '+5511888888888';
      const service = new TwilioNotificationService(twilioClientMock as any);
      
      await service.sendSMS('+5511999999999', 'Test');

      const sentMessage = twilioClientMock.messages.create.firstCall.args[0];
      expect(sentMessage.from).to.equal('+5511888888888');
    });

    it('should validate phone number format', async () => {
      const service = new TwilioNotificationService(twilioClientMock as any);
      
      try {
        await service.sendSMS('1234', 'Test');
        expect.fail('Should have thrown exception');
      } catch (error: any) {
        expect(error.name).to.equal('InvalidPhoneException');
      }
    });
  });
});
```

## Testes de Substituibilidade

```typescript
// tests/integration/NotificationService.substitution.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { INotificationService } from '../../../src/domain/ports/INotificationService';
import { CompositeNotificationService } from '../../../src/infrastructure/services/CompositeNotificationService';

describe('Notification Service Substitution Tests', () => {
  
  it('should allow any implementation to be used interchangeably', async () => {
    const implementations: INotificationService[] = [
      new SendGridNotificationService(mockSendGrid),
      new TwilioNotificationService(mockTwilio),
      new FirebaseNotificationService(mockFirebase)
    ];

    for (const service of implementations) {
      // Cada implementação deve respeitar a interface
      expect(service).to.have.property('sendEmail');
      expect(service).to.have.property('sendSMS');
      expect(service).to.have.property('sendPushNotification');
      
      // Cada implementação deve ser uma função válida
      expect(typeof service.sendEmail).to.equal('function');
      expect(typeof service.sendSMS).to.equal('function');
      expect(typeof service.sendPushNotification).to.equal('function');
    }
  });

  it('should work with composite pattern using multiple implementations', async () => {
    const compositeService = new CompositeNotificationService([
      new SendGridNotificationService(mockSendGrid),
      new TwilioNotificationService(mockTwilio)
    ]);

    // O composite também implementa a interface
    await compositeService.sendEmail('test@example.com', 'Subject', 'Body');
    await compositeService.sendSMS('+5511999999999', 'Message');
  });
});
```

## Testes de Interface como Documentação

```typescript
// tests/documentation/INotificationService.behavior.spec.ts
import { describe, it } from 'mocha';

describe('INotificationService - Expected Behavior Documentation', () => {
  
  describe('Contract Expectations', () => {
    it('sendEmail must validate email format', () => {
      // Este teste documenta que todas as implementações
      // DEVEM validar o formato do email
    });

    it('sendEmail must throw InvalidEmailException for invalid emails', () => {
      // Documenta o comportamento esperado de erro
    });

    it('sendSMS must validate phone number format', () => {
      // Documenta a validação obrigatória
    });

    it('sendSMS must accept international format (+55...)', () => {
      // Documenta o formato aceito
    });

    it('all methods must be async and return Promise<void>', () => {
      // Documenta a assinatura esperada
    });

    it('implementations may throw NotSupportedException for unsupported methods', () => {
      // Documenta que nem todas as implementações precisam
      // suportar todos os métodos, mas devem indicar claramente
    });
  });
});
```

## Pontos-chave

Interfaces devem ter testes de contrato que validam que todas as implementações respeitam o comportamento esperado. Testes de contrato permitem substituibilidade e garantem que diferentes implementações sejam intercambiáveis. É essencial documentar o comportamento esperado através dos testes e validar que o princípio de Liskov Substitution é respeitado. Testes de interface servem como documentação viva do contrato esperado.
