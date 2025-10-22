# Testes para Use Cases (DDD)

## Introdução

Use Cases (Casos de Uso) representam a lógica de aplicação que orquestra o fluxo de dados entre as camadas externas e o domínio. Eles coordenam as operações do domínio sem conter regras de negócio complexas. Os testes de Use Cases devem validar a orquestração correta das operações, a interação com repositories e serviços, e o tratamento adequado de erros. A estratégia principal são testes unitários com mocks das dependências, complementados por testes de integração para validar o fluxo completo.

## Estratégias de Teste

Para Use Cases, deve-se testar a orquestração das operações usando mocks para isolar o caso de uso, validar que as dependências são chamadas na ordem correta com os parâmetros adequados, verificar o tratamento de erros e exceções do domínio, e garantir que o resultado retornado está no formato esperado. Testes de integração podem validar o fluxo completo com dependências reais.

## Exemplo Prático: Use Case de Criar Pedido

```typescript
// src/application/use-cases/CreateOrderUseCase.ts
export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private customerRepository: ICustomerRepository,
    private productRepository: IProductRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const customer = await this.customerRepository.findById(input.customerId);
    
    if (!customer) {
      throw new CustomerNotFoundException(input.customerId);
    }

    if (!customer.isActive()) {
      throw new InactiveCustomerException();
    }

    const order = new Order(
      this.generateOrderId(),
      input.customerId
    );

    for (const item of input.items) {
      const product = await this.productRepository.findById(item.productId);
      
      if (!product) {
        throw new ProductNotFoundException(item.productId);
      }

      if (!product.hasStock(item.quantity)) {
        throw new InsufficientStockException(product.name);
      }

      order.addItem(new OrderItem(
        product.id,
        product.name,
        item.quantity,
        product.price
      ));

      product.decreaseStock(item.quantity);
      await this.productRepository.save(product);
    }

    await this.orderRepository.save(order);

    await this.eventPublisher.publish(new OrderCreatedEvent(
      order.id,
      order.customerId,
      order.total
    ));

    return {
      orderId: order.id,
      total: order.total,
      status: order.status
    };
  }

  private generateOrderId(): string {
    return `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Testes Unitários

```typescript
// tests/unit/application/use-cases/CreateOrderUseCase.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { CreateOrderUseCase } from '../../../../src/application/use-cases/CreateOrderUseCase';
import { Customer } from '../../../../src/domain/entities/Customer';
import { Product } from '../../../../src/domain/entities/Product';

describe('CreateOrderUseCase - Unit Tests', () => {
  let useCase: CreateOrderUseCase;
  let orderRepositoryMock: any;
  let customerRepositoryMock: any;
  let productRepositoryMock: any;
  let eventPublisherMock: any;

  beforeEach(() => {
    orderRepositoryMock = {
      save: sinon.stub().resolves()
    };

    customerRepositoryMock = {
      findById: sinon.stub()
    };

    productRepositoryMock = {
      findById: sinon.stub(),
      save: sinon.stub().resolves()
    };

    eventPublisherMock = {
      publish: sinon.stub().resolves()
    };

    useCase = new CreateOrderUseCase(
      orderRepositoryMock,
      customerRepositoryMock,
      productRepositoryMock,
      eventPublisherMock
    );
  });

  describe('Success Scenarios', () => {
    it('should create order with valid data', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product = new Product('prod-1', 'Notebook', 3000, 10);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(product);

      const input = {
        customerId: 'customer-1',
        items: [
          { productId: 'prod-1', quantity: 2 }
        ]
      };

      const result = await useCase.execute(input);

      expect(result.orderId).to.exist;
      expect(result.total).to.equal(6000);
      expect(orderRepositoryMock.save.calledOnce).to.be.true;
      expect(productRepositoryMock.save.calledOnce).to.be.true;
      expect(eventPublisherMock.publish.calledOnce).to.be.true;
    });

    it('should handle multiple products correctly', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product1 = new Product('prod-1', 'Notebook', 3000, 10);
      const product2 = new Product('prod-2', 'Mouse', 50, 20);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById
        .onFirstCall().resolves(product1)
        .onSecondCall().resolves(product2);

      const input = {
        customerId: 'customer-1',
        items: [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-2', quantity: 3 }
        ]
      };

      const result = await useCase.execute(input);

      expect(result.total).to.equal(3150);
      expect(productRepositoryMock.save.calledTwice).to.be.true;
    });
  });

  describe('Validation Scenarios', () => {
    it('should throw error when customer not found', async () => {
      customerRepositoryMock.findById.resolves(null);

      const input = {
        customerId: 'non-existent',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      try {
        await useCase.execute(input);
        expect.fail('Should have thrown CustomerNotFoundException');
      } catch (error: any) {
        expect(error.name).to.equal('CustomerNotFoundException');
      }
    });

    it('should throw error when customer is inactive', async () => {
      const inactiveCustomer = new Customer('customer-1', 'John Doe', 'john@example.com');
      inactiveCustomer.deactivate();

      customerRepositoryMock.findById.resolves(inactiveCustomer);

      const input = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      try {
        await useCase.execute(input);
        expect.fail('Should have thrown InactiveCustomerException');
      } catch (error: any) {
        expect(error.name).to.equal('InactiveCustomerException');
      }
    });

    it('should throw error when product not found', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(null);

      const input = {
        customerId: 'customer-1',
        items: [{ productId: 'non-existent', quantity: 1 }]
      };

      try {
        await useCase.execute(input);
        expect.fail('Should have thrown ProductNotFoundException');
      } catch (error: any) {
        expect(error.name).to.equal('ProductNotFoundException');
      }
    });

    it('should throw error when insufficient stock', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product = new Product('prod-1', 'Notebook', 3000, 1);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(product);

      const input = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 5 }]
      };

      try {
        await useCase.execute(input);
        expect.fail('Should have thrown InsufficientStockException');
      } catch (error: any) {
        expect(error.name).to.equal('InsufficientStockException');
      }
    });
  });

  describe('Event Publishing', () => {
    it('should publish OrderCreatedEvent after successful creation', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product = new Product('prod-1', 'Notebook', 3000, 10);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(product);

      const input = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      await useCase.execute(input);

      expect(eventPublisherMock.publish.calledOnce).to.be.true;
      const publishedEvent = eventPublisherMock.publish.firstCall.args[0];
      expect(publishedEvent.customerId).to.equal('customer-1');
      expect(publishedEvent.total).to.equal(3000);
    });
  });
});
```

## Pontos-chave

Use Cases devem ser testados focando na orquestração e coordenação das operações. O uso de mocks permite testar o caso de uso isoladamente, validando que todas as dependências são chamadas corretamente. É essencial testar todos os caminhos possíveis, incluindo cenários de erro e validações de negócio, garantindo que o caso de uso se comporta adequadamente em todas as situações.
