# Testes para Domain Events (DDD)

## Introdução

Domain Events são objetos que capturam algo significativo que aconteceu no domínio. Eles são essenciais para comunicação entre agregados, implementação de arquitetura orientada a eventos e manutenção de consistência eventual. Os testes de Domain Events devem validar que os eventos são disparados nos momentos corretos, contêm as informações necessárias, e que os handlers processam os eventos adequadamente. A estratégia inclui testes unitários para criação e validação de eventos, e testes de integração para validar o fluxo completo de publicação e consumo.

## Estratégias de Teste

Para Domain Events, deve-se testar que eventos são criados com dados corretos e completos, validar que eventos são imutáveis após criação, verificar que o dispatcher publica eventos para os handlers corretos, garantir que handlers são executados na ordem apropriada, testar cenários de falha e compensação, e validar que eventos podem ser serializados para persistência ou mensageria. Testes devem cobrir tanto a criação quanto o processamento de eventos.

## Exemplo Prático: Domain Events de Pedido

```typescript
// src/domain/events/OrderPlacedEvent.ts
export class OrderPlacedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: number,
    public readonly items: OrderItemData[]
  ) {
    this.occurredAt = new Date();
    Object.freeze(this); // Torna o evento imutável
  }

  toJSON(): object {
    return {
      eventType: 'OrderPlaced',
      orderId: this.orderId,
      customerId: this.customerId,
      total: this.total,
      items: this.items,
      occurredAt: this.occurredAt.toISOString()
    };
  }
}

// src/domain/events/PaymentProcessedEvent.ts
export class PaymentProcessedEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly orderId: string,
    public readonly paymentId: string,
    public readonly amount: number,
    public readonly status: PaymentStatus
  ) {
    this.occurredAt = new Date();
    Object.freeze(this);
  }

  isSuccessful(): boolean {
    return this.status === PaymentStatus.APPROVED;
  }

  toJSON(): object {
    return {
      eventType: 'PaymentProcessed',
      orderId: this.orderId,
      paymentId: this.paymentId,
      amount: this.amount,
      status: this.status,
      occurredAt: this.occurredAt.toISOString()
    };
  }
}

// src/domain/events/DomainEventDispatcher.ts
export class DomainEventDispatcher {
  private handlers: Map<string, Array<(event: any) => Promise<void>>>;

  constructor() {
    this.handlers = new Map();
  }

  register(eventType: string, handler: (event: any) => Promise<void>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  async dispatch(event: any): Promise<void> {
    const eventType = event.constructor.name;
    const handlers = this.handlers.get(eventType) || [];

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Error handling ${eventType}:`, error);
        throw error;
      }
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

// src/application/handlers/SendOrderConfirmationEmailHandler.ts
export class SendOrderConfirmationEmailHandler {
  constructor(
    private emailService: IEmailService,
    private customerRepository: ICustomerRepository
  ) {}

  async handle(event: OrderPlacedEvent): Promise<void> {
    const customer = await this.customerRepository.findById(event.customerId);
    
    if (!customer) {
      throw new Error(`Customer ${event.customerId} not found`);
    }

    await this.emailService.send({
      to: customer.email,
      subject: `Pedido ${event.orderId} confirmado`,
      body: this.buildEmailBody(event)
    });
  }

  private buildEmailBody(event: OrderPlacedEvent): string {
    return `
      <h1>Pedido Confirmado!</h1>
      <p>Seu pedido #${event.orderId} foi confirmado.</p>
      <p>Total: R$ ${event.total.toFixed(2)}</p>
    `;
  }
}
```

## Testes Unitários de Domain Events

```typescript
// tests/unit/domain/events/OrderPlacedEvent.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { OrderPlacedEvent } from '../../../../src/domain/events/OrderPlacedEvent';

describe('OrderPlacedEvent - Unit Tests', () => {
  
  describe('Event Creation', () => {
    it('should create event with all required data', () => {
      const event = new OrderPlacedEvent(
        'order-123',
        'customer-456',
        500.00,
        [
          { productId: 'prod-1', quantity: 2, price: 250 }
        ]
      );

      expect(event.orderId).to.equal('order-123');
      expect(event.customerId).to.equal('customer-456');
      expect(event.total).to.equal(500.00);
      expect(event.items).to.have.lengthOf(1);
      expect(event.occurredAt).to.be.instanceOf(Date);
    });

    it('should set occurredAt to current timestamp', () => {
      const before = new Date();
      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);
      const after = new Date();

      expect(event.occurredAt.getTime()).to.be.at.least(before.getTime());
      expect(event.occurredAt.getTime()).to.be.at.most(after.getTime());
    });
  });

  describe('Event Immutability', () => {
    it('should be immutable after creation', () => {
      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);

      expect(() => {
        (event as any).orderId = 'modified';
      }).to.throw();

      expect(() => {
        (event as any).total = 999;
      }).to.throw();
    });
  });

  describe('Event Serialization', () => {
    it('should serialize to JSON correctly', () => {
      const event = new OrderPlacedEvent(
        'order-123',
        'customer-456',
        500.00,
        [{ productId: 'prod-1', quantity: 2, price: 250 }]
      );

      const json = event.toJSON();

      expect(json).to.have.property('eventType', 'OrderPlaced');
      expect(json).to.have.property('orderId', 'order-123');
      expect(json).to.have.property('customerId', 'customer-456');
      expect(json).to.have.property('total', 500.00);
      expect(json).to.have.property('occurredAt');
    });

    it('should include all items in serialization', () => {
      const items = [
        { productId: 'prod-1', quantity: 2, price: 250 },
        { productId: 'prod-2', quantity: 1, price: 100 }
      ];

      const event = new OrderPlacedEvent('order-123', 'customer-456', 600, items);
      const json = event.toJSON();

      expect(json).to.have.property('items');
      expect((json as any).items).to.have.lengthOf(2);
    });
  });
});

// tests/unit/domain/events/PaymentProcessedEvent.spec.ts
import { PaymentProcessedEvent } from '../../../../src/domain/events/PaymentProcessedEvent';
import { PaymentStatus } from '../../../../src/domain/enums/PaymentStatus';

describe('PaymentProcessedEvent - Unit Tests', () => {
  
  describe('Event Behavior', () => {
    it('should identify successful payment', () => {
      const event = new PaymentProcessedEvent(
        'order-123',
        'payment-789',
        500,
        PaymentStatus.APPROVED
      );

      expect(event.isSuccessful()).to.be.true;
    });

    it('should identify failed payment', () => {
      const event = new PaymentProcessedEvent(
        'order-123',
        'payment-789',
        500,
        PaymentStatus.DECLINED
      );

      expect(event.isSuccessful()).to.be.false;
    });
  });
});
```

## Testes do Event Dispatcher

```typescript
// tests/unit/domain/events/DomainEventDispatcher.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { DomainEventDispatcher } from '../../../../src/domain/events/DomainEventDispatcher';
import { OrderPlacedEvent } from '../../../../src/domain/events/OrderPlacedEvent';

describe('DomainEventDispatcher - Unit Tests', () => {
  let dispatcher: DomainEventDispatcher;

  beforeEach(() => {
    dispatcher = new DomainEventDispatcher();
  });

  describe('Handler Registration', () => {
    it('should register handler for event type', () => {
      const handler = sinon.stub().resolves();

      dispatcher.register('OrderPlacedEvent', handler);

      expect(() => dispatcher.register('OrderPlacedEvent', handler)).to.not.throw();
    });

    it('should allow multiple handlers for same event type', () => {
      const handler1 = sinon.stub().resolves();
      const handler2 = sinon.stub().resolves();

      dispatcher.register('OrderPlacedEvent', handler1);
      dispatcher.register('OrderPlacedEvent', handler2);

      // Ambos devem estar registrados
    });
  });

  describe('Event Dispatching', () => {
    it('should call registered handler when event is dispatched', async () => {
      const handler = sinon.stub().resolves();
      dispatcher.register('OrderPlacedEvent', handler);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);
      await dispatcher.dispatch(event);

      expect(handler.calledOnce).to.be.true;
      expect(handler.calledWith(event)).to.be.true;
    });

    it('should call all registered handlers', async () => {
      const handler1 = sinon.stub().resolves();
      const handler2 = sinon.stub().resolves();
      const handler3 = sinon.stub().resolves();

      dispatcher.register('OrderPlacedEvent', handler1);
      dispatcher.register('OrderPlacedEvent', handler2);
      dispatcher.register('OrderPlacedEvent', handler3);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);
      await dispatcher.dispatch(event);

      expect(handler1.calledOnce).to.be.true;
      expect(handler2.calledOnce).to.be.true;
      expect(handler3.calledOnce).to.be.true;
    });

    it('should call handlers in registration order', async () => {
      const callOrder: number[] = [];
      
      const handler1 = sinon.stub().callsFake(async () => { callOrder.push(1); });
      const handler2 = sinon.stub().callsFake(async () => { callOrder.push(2); });
      const handler3 = sinon.stub().callsFake(async () => { callOrder.push(3); });

      dispatcher.register('OrderPlacedEvent', handler1);
      dispatcher.register('OrderPlacedEvent', handler2);
      dispatcher.register('OrderPlacedEvent', handler3);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);
      await dispatcher.dispatch(event);

      expect(callOrder).to.deep.equal([1, 2, 3]);
    });

    it('should not call handlers for different event types', async () => {
      const orderHandler = sinon.stub().resolves();
      const paymentHandler = sinon.stub().resolves();

      dispatcher.register('OrderPlacedEvent', orderHandler);
      dispatcher.register('PaymentProcessedEvent', paymentHandler);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);
      await dispatcher.dispatch(event);

      expect(orderHandler.calledOnce).to.be.true;
      expect(paymentHandler.called).to.be.false;
    });

    it('should throw error if handler fails', async () => {
      const failingHandler = sinon.stub().rejects(new Error('Handler failed'));
      dispatcher.register('OrderPlacedEvent', failingHandler);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);

      try {
        await dispatcher.dispatch(event);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.equal('Handler failed');
      }
    });
  });

  describe('Dispatcher Management', () => {
    it('should clear all handlers', () => {
      const handler = sinon.stub().resolves();
      dispatcher.register('OrderPlacedEvent', handler);

      dispatcher.clear();

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);
      dispatcher.dispatch(event);

      expect(handler.called).to.be.false;
    });
  });
});
```

## Testes de Event Handlers

```typescript
// tests/unit/application/handlers/SendOrderConfirmationEmailHandler.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { SendOrderConfirmationEmailHandler } from '../../../../src/application/handlers/SendOrderConfirmationEmailHandler';
import { OrderPlacedEvent } from '../../../../src/domain/events/OrderPlacedEvent';
import { Customer } from '../../../../src/domain/entities/Customer';

describe('SendOrderConfirmationEmailHandler - Unit Tests', () => {
  let handler: SendOrderConfirmationEmailHandler;
  let emailServiceMock: any;
  let customerRepositoryMock: any;

  beforeEach(() => {
    emailServiceMock = {
      send: sinon.stub().resolves()
    };

    customerRepositoryMock = {
      findById: sinon.stub()
    };

    handler = new SendOrderConfirmationEmailHandler(
      emailServiceMock,
      customerRepositoryMock
    );
  });

  describe('Event Handling', () => {
    it('should send confirmation email to customer', async () => {
      const customer = new Customer('customer-456', 'John Doe', 'john@example.com');
      customerRepositoryMock.findById.resolves(customer);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 500, []);

      await handler.handle(event);

      expect(emailServiceMock.send.calledOnce).to.be.true;
      const emailCall = emailServiceMock.send.firstCall.args[0];
      expect(emailCall.to).to.equal('john@example.com');
      expect(emailCall.subject).to.include('order-123');
    });

    it('should throw error when customer not found', async () => {
      customerRepositoryMock.findById.resolves(null);

      const event = new OrderPlacedEvent('order-123', 'non-existent', 500, []);

      try {
        await handler.handle(event);
        expect.fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).to.include('Customer');
        expect(error.message).to.include('not found');
      }
    });

    it('should include order details in email', async () => {
      const customer = new Customer('customer-456', 'John Doe', 'john@example.com');
      customerRepositoryMock.findById.resolves(customer);

      const event = new OrderPlacedEvent('order-123', 'customer-456', 750.50, []);

      await handler.handle(event);

      const emailCall = emailServiceMock.send.firstCall.args[0];
      expect(emailCall.body).to.include('order-123');
      expect(emailCall.body).to.include('750.50');
    });
  });
});
```

## Pontos-chave

Domain Events são fundamentais para comunicação desacoplada entre agregados e componentes do sistema. Os testes devem validar que eventos são criados corretamente, são imutáveis, podem ser serializados, e que o dispatcher entrega eventos aos handlers apropriados. É essencial testar que handlers processam eventos corretamente e tratam erros adequadamente. Events promovem arquitetura orientada a eventos e consistência eventual.
