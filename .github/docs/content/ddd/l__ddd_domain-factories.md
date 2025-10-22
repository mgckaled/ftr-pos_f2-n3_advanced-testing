# Testes para Factories (DDD)

## Introdução

Factories são responsáveis por encapsular a lógica complexa de criação de objetos de domínio, especialmente quando a construção envolve múltiplos passos, validações complexas, ou a coordenação de vários objetos. Elas garantem que objetos sejam sempre criados em estado válido e consistente. Os testes de Factories devem validar que os objetos são criados corretamente, que validações são aplicadas durante a construção, e que a factory lida adequadamente com dados inválidos. A estratégia principal são testes unitários que verificam a lógica de construção.

## Estratégias de Teste

Para Factories, deve-se testar que objetos complexos são criados em estado válido, validar que a factory aplica todas as regras de negócio durante a construção, verificar que dados inválidos resultam em exceções apropriadas, testar a criação a partir de diferentes fontes (dados brutos, DTOs, entidades persistidas), e garantir que aggregates são reconstruídos corretamente com todas as suas entidades internas. Factories são especialmente importantes para reconstruir objetos de domínio a partir de dados persistidos.

## Exemplo Prático: Factory de Pedido Completo

```typescript
// src/domain/factories/OrderFactory.ts
export class OrderFactory {
  constructor(
    private productRepository: IProductRepository,
    private customerRepository: ICustomerRepository
  ) {}

  async createFromRequest(request: CreateOrderRequest): Promise<Order> {
    const customer = await this.customerRepository.findById(request.customerId);
    
    if (!customer) {
      throw new CustomerNotFoundException(request.customerId);
    }

    if (!customer.isActive()) {
      throw new InactiveCustomerException();
    }

    const order = new Order(
      this.generateOrderId(),
      request.customerId
    );

    for (const itemRequest of request.items) {
      const product = await this.productRepository.findById(itemRequest.productId);
      
      if (!product) {
        throw new ProductNotFoundException(itemRequest.productId);
      }

      if (!product.isAvailable()) {
        throw new ProductUnavailableException(product.name);
      }

      if (!product.hasStock(itemRequest.quantity)) {
        throw new InsufficientStockException(product.name, product.stock);
      }

      const orderItem = new OrderItem(
        product.id,
        product.name,
        itemRequest.quantity,
        product.price
      );

      order.addItem(orderItem);
    }

    if (request.shippingAddress) {
      order.setShippingAddress(
        new Address(
          request.shippingAddress.street,
          request.shippingAddress.city,
          request.shippingAddress.state,
          request.shippingAddress.zipCode
        )
      );
    }

    if (request.couponCode) {
      const coupon = await this.validateAndGetCoupon(request.couponCode);
      if (coupon) {
        order.applyCoupon(coupon);
      }
    }

    return order;
  }

  reconstructFromPersistence(data: OrderPersistenceData): Order {
    const order = new Order(data.id, data.customerId);

    for (const itemData of data.items) {
      const item = new OrderItem(
        itemData.productId,
        itemData.productName,
        itemData.quantity,
        itemData.price
      );
      order.addItem(item);
    }

    if (data.shippingAddress) {
      order.setShippingAddress(
        new Address(
          data.shippingAddress.street,
          data.shippingAddress.city,
          data.shippingAddress.state,
          data.shippingAddress.zipCode
        )
      );
    }

    if (data.status) {
      order.setStatus(data.status);
    }

    if (data.createdAt) {
      order.setCreatedAt(new Date(data.createdAt));
    }

    return order;
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async validateAndGetCoupon(code: string): Promise<Coupon | null> {
    // Lógica de validação de cupom
    return null;
  }
}

// src/domain/factories/CustomerFactory.ts
export class CustomerFactory {
  
  createNew(data: CreateCustomerData): Customer {
    this.validateEmail(data.email);
    this.validateName(data.name);
    
    const customer = new Customer(
      this.generateCustomerId(),
      data.name,
      new Email(data.email)
    );

    if (data.phone) {
      customer.setPhone(new Phone(data.phone));
    }

    if (data.address) {
      customer.setAddress(new Address(
        data.address.street,
        data.address.city,
        data.address.state,
        data.address.zipCode
      ));
    }

    return customer;
  }

  createPremium(data: CreateCustomerData, membershipLevel: string): Customer {
    const customer = this.createNew(data);
    customer.upgradeToPremium(membershipLevel);
    return customer;
  }

  reconstructFromPersistence(data: CustomerPersistenceData): Customer {
    const customer = new Customer(
      data.id,
      data.name,
      new Email(data.email)
    );

    if (data.phone) {
      customer.setPhone(new Phone(data.phone));
    }

    if (data.address) {
      customer.setAddress(new Address(
        data.address.street,
        data.address.city,
        data.address.state,
        data.address.zipCode
      ));
    }

    if (data.isPremium) {
      customer.upgradeToPremium(data.membershipLevel || 'BASIC');
    }

    if (data.createdAt) {
      customer.setCreatedAt(new Date(data.createdAt));
    }

    if (!data.isActive) {
      customer.deactivate();
    }

    return customer;
  }

  private validateEmail(email: string): void {
    if (!email || !email.includes('@')) {
      throw new InvalidEmailException(email);
    }
  }

  private validateName(name: string): void {
    if (!name || name.trim().length < 3) {
      throw new InvalidNameException('Name must have at least 3 characters');
    }
  }

  private generateCustomerId(): string {
    return `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

## Testes Unitários de Factories

```typescript
// tests/unit/domain/factories/OrderFactory.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { OrderFactory } from '../../../../src/domain/factories/OrderFactory';
import { Customer } from '../../../../src/domain/entities/Customer';
import { Product } from '../../../../src/domain/entities/Product';

describe('OrderFactory - Unit Tests', () => {
  let factory: OrderFactory;
  let productRepositoryMock: any;
  let customerRepositoryMock: any;

  beforeEach(() => {
    productRepositoryMock = {
      findById: sinon.stub()
    };

    customerRepositoryMock = {
      findById: sinon.stub()
    };

    factory = new OrderFactory(productRepositoryMock, customerRepositoryMock);
  });

  describe('Create from Request', () => {
    it('should create valid order with all data', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product = new Product('prod-1', 'Notebook', 3000, 10);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(product);

      const request = {
        customerId: 'customer-1',
        items: [
          { productId: 'prod-1', quantity: 2 }
        ],
        shippingAddress: {
          street: 'Rua A, 100',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000'
        }
      };

      const order = await factory.createFromRequest(request);

      expect(order).to.exist;
      expect(order.customerId).to.equal('customer-1');
      expect(order.items).to.have.lengthOf(1);
      expect(order.total).to.equal(6000);
    });

    it('should throw error when customer not found', async () => {
      customerRepositoryMock.findById.resolves(null);

      const request = {
        customerId: 'non-existent',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      try {
        await factory.createFromRequest(request);
        expect.fail('Should have thrown CustomerNotFoundException');
      } catch (error: any) {
        expect(error.name).to.equal('CustomerNotFoundException');
      }
    });

    it('should throw error when customer is inactive', async () => {
      const inactiveCustomer = new Customer('customer-1', 'John Doe', 'john@example.com');
      inactiveCustomer.deactivate();

      customerRepositoryMock.findById.resolves(inactiveCustomer);

      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      try {
        await factory.createFromRequest(request);
        expect.fail('Should have thrown InactiveCustomerException');
      } catch (error: any) {
        expect(error.name).to.equal('InactiveCustomerException');
      }
    });

    it('should throw error when product not found', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(null);

      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'non-existent', quantity: 1 }]
      };

      try {
        await factory.createFromRequest(request);
        expect.fail('Should have thrown ProductNotFoundException');
      } catch (error: any) {
        expect(error.name).to.equal('ProductNotFoundException');
      }
    });

    it('should throw error when product unavailable', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const unavailableProduct = new Product('prod-1', 'Notebook', 3000, 0);
      unavailableProduct.markAsUnavailable();

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(unavailableProduct);

      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      try {
        await factory.createFromRequest(request);
        expect.fail('Should have thrown ProductUnavailableException');
      } catch (error: any) {
        expect(error.name).to.equal('ProductUnavailableException');
      }
    });

    it('should throw error when insufficient stock', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product = new Product('prod-1', 'Notebook', 3000, 2);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(product);

      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 5 }]
      };

      try {
        await factory.createFromRequest(request);
        expect.fail('Should have thrown InsufficientStockException');
      } catch (error: any) {
        expect(error.name).to.equal('InsufficientStockException');
      }
    });

    it('should create order with multiple items', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product1 = new Product('prod-1', 'Notebook', 3000, 10);
      const product2 = new Product('prod-2', 'Mouse', 50, 20);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById
        .onFirstCall().resolves(product1)
        .onSecondCall().resolves(product2);

      const request = {
        customerId: 'customer-1',
        items: [
          { productId: 'prod-1', quantity: 1 },
          { productId: 'prod-2', quantity: 2 }
        ]
      };

      const order = await factory.createFromRequest(request);

      expect(order.items).to.have.lengthOf(2);
      expect(order.total).to.equal(3100);
    });

    it('should set shipping address when provided', async () => {
      const customer = new Customer('customer-1', 'John Doe', 'john@example.com');
      const product = new Product('prod-1', 'Notebook', 3000, 10);

      customerRepositoryMock.findById.resolves(customer);
      productRepositoryMock.findById.resolves(product);

      const request = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        shippingAddress: {
          street: 'Rua A, 100',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000'
        }
      };

      const order = await factory.createFromRequest(request);

      expect(order.shippingAddress).to.exist;
      expect(order.shippingAddress?.street).to.equal('Rua A, 100');
    });
  });

  describe('Reconstruct from Persistence', () => {
    it('should reconstruct order with all properties', () => {
      const persistenceData = {
        id: 'order-123',
        customerId: 'customer-1',
        items: [
          {
            productId: 'prod-1',
            productName: 'Notebook',
            quantity: 2,
            price: 3000
          }
        ],
        shippingAddress: {
          street: 'Rua A, 100',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000'
        },
        status: 'CONFIRMED',
        createdAt: '2025-01-15T10:00:00Z'
      };

      const order = factory.reconstructFromPersistence(persistenceData);

      expect(order.id).to.equal('order-123');
      expect(order.customerId).to.equal('customer-1');
      expect(order.items).to.have.lengthOf(1);
      expect(order.status).to.equal('CONFIRMED');
    });

    it('should reconstruct order without optional fields', () => {
      const persistenceData = {
        id: 'order-123',
        customerId: 'customer-1',
        items: [
          {
            productId: 'prod-1',
            productName: 'Notebook',
            quantity: 1,
            price: 3000
          }
        ]
      };

      const order = factory.reconstructFromPersistence(persistenceData);

      expect(order.id).to.equal('order-123');
      expect(order.items).to.have.lengthOf(1);
    });
  });
});

// tests/unit/domain/factories/CustomerFactory.spec.ts
import { CustomerFactory } from '../../../../src/domain/factories/CustomerFactory';

describe('CustomerFactory - Unit Tests', () => {
  let factory: CustomerFactory;

  beforeEach(() => {
    factory = new CustomerFactory();
  });

  describe('Create New Customer', () => {
    it('should create customer with valid data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+5511999999999',
        address: {
          street: 'Rua A, 100',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000'
        }
      };

      const customer = factory.createNew(data);

      expect(customer).to.exist;
      expect(customer.name).to.equal('John Doe');
      expect(customer.email.value).to.equal('john@example.com');
    });

    it('should throw error for invalid email', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email'
      };

      expect(() => factory.createNew(data))
        .to.throw('InvalidEmailException');
    });

    it('should throw error for invalid name', () => {
      const data = {
        name: 'Jo',
        email: 'john@example.com'
      };

      expect(() => factory.createNew(data))
        .to.throw('InvalidNameException');
    });

    it('should create customer without optional fields', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const customer = factory.createNew(data);

      expect(customer.name).to.equal('John Doe');
      expect(customer.phone).to.be.undefined;
      expect(customer.address).to.be.undefined;
    });
  });

  describe('Create Premium Customer', () => {
    it('should create premium customer', () => {
      const data = {
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      const customer = factory.createPremium(data, 'GOLD');

      expect(customer.isPremium()).to.be.true;
      expect(customer.membershipLevel).to.equal('GOLD');
    });
  });

  describe('Reconstruct from Persistence', () => {
    it('should reconstruct customer with all properties', () => {
      const persistenceData = {
        id: 'customer-123',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+5511999999999',
        address: {
          street: 'Rua A, 100',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000'
        },
        isPremium: true,
        membershipLevel: 'GOLD',
        createdAt: '2025-01-01T00:00:00Z',
        isActive: true
      };

      const customer = factory.reconstructFromPersistence(persistenceData);

      expect(customer.id).to.equal('customer-123');
      expect(customer.name).to.equal('John Doe');
      expect(customer.isPremium()).to.be.true;
      expect(customer.isActive()).to.be.true;
    });

    it('should reconstruct inactive customer', () => {
      const persistenceData = {
        id: 'customer-123',
        name: 'John Doe',
        email: 'john@example.com',
        isActive: false
      };

      const customer = factory.reconstructFromPersistence(persistenceData);

      expect(customer.isActive()).to.be.false;
    });
  });
});
```

## Pontos-chave

Factories encapsulam a complexidade de criação de objetos de domínio, garantindo que sejam sempre criados em estado válido. Os testes devem validar todas as regras de construção, verificar que dados inválidos resultam em exceções apropriadas, e garantir que objetos são reconstruídos corretamente a partir de dados persistidos. Factories são essenciais para manter a integridade do domínio desde o momento da criação dos objetos.
