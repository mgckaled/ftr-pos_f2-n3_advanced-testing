
<!-- markdownlint-disable MD024 -->

# Design Patterns em DDD e Estratégias de Teste

## 1. Repository Pattern

### Descrição

Abstrai a camada de persistência, fornecendo uma interface para acesso aos agregados.

### Exemplo Prático

```typescript
// Domain
interface User {
  id: string;
  email: string;
  name: string;
}

// Repository Interface
interface UserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
}

// Implementation
class PostgresUserRepository implements UserRepository {
  constructor(private db: DatabaseConnection) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, email, name) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET email = $2, name = $3',
      [user.id, user.email, user.name]
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }
}
```

### Estratégias de Teste

**Testes Unitários com Mocks**:

```typescript
describe('UserService', () => {
  it('deve criar um novo usuário', async () => {
    const mockRepository: UserRepository = {
      findById: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
      findByEmail: jest.fn().mockResolvedValue(null)
    };

    const service = new UserService(mockRepository);
    const user = { id: '123', email: 'test@example.com', name: 'Test' };

    await service.createUser(user);

    expect(mockRepository.save).toHaveBeenCalledWith(user);
  });
});
```

**Testes de Integração**:

```typescript
describe('PostgresUserRepository Integration', () => {
  let repository: PostgresUserRepository;
  let db: DatabaseConnection;

  beforeAll(async () => {
    db = await createTestDatabase();
    repository = new PostgresUserRepository(db);
  });

  it('deve persistir e recuperar um usuário', async () => {
    const user = { id: '456', email: 'integration@test.com', name: 'Integration' };
    
    await repository.save(user);
    const retrieved = await repository.findById('456');

    expect(retrieved).toEqual(user);
  });

  afterAll(async () => {
    await db.close();
  });
});
```

## 2. Aggregate Pattern

### Descrição

Define limites de consistência transacional, agrupando entidades e objetos de valor relacionados.

### Exemplo Prático

```typescript
// Value Object
class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative');
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }
}

// Entity
class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly unitPrice: Money
  ) {}

  getTotalPrice(): Money {
    return new Money(
      this.unitPrice.amount * this.quantity,
      this.unitPrice.currency
    );
  }
}

// Aggregate Root
class Order {
  private items: OrderItem[] = [];
  private _status: 'pending' | 'confirmed' | 'shipped' = 'pending';

  constructor(public readonly id: string) {}

  addItem(productId: string, quantity: number, unitPrice: Money): void {
    if (this._status !== 'pending') {
      throw new Error('Cannot modify confirmed order');
    }
    this.items.push(new OrderItem(productId, quantity, unitPrice));
  }

  getTotalAmount(): Money {
    return this.items.reduce(
      (total, item) => total.add(item.getTotalPrice()),
      new Money(0, 'BRL')
    );
  }

  confirm(): void {
    if (this.items.length === 0) {
      throw new Error('Cannot confirm empty order');
    }
    this._status = 'confirmed';
  }

  get status() {
    return this._status;
  }
}
```

### Estratégias de Teste

**Testes Unitários de Regras de Negócio**:

```typescript
describe('Order Aggregate', () => {
  it('deve calcular o total do pedido corretamente', () => {
    const order = new Order('order-123');
    order.addItem('prod-1', 2, new Money(50, 'BRL'));
    order.addItem('prod-2', 1, new Money(100, 'BRL'));

    const total = order.getTotalAmount();

    expect(total.amount).toBe(200);
    expect(total.currency).toBe('BRL');
  });

  it('não deve permitir adicionar itens em pedido confirmado', () => {
    const order = new Order('order-123');
    order.addItem('prod-1', 1, new Money(50, 'BRL'));
    order.confirm();

    expect(() => {
      order.addItem('prod-2', 1, new Money(100, 'BRL'));
    }).toThrow('Cannot modify confirmed order');
  });

  it('não deve confirmar pedido vazio', () => {
    const order = new Order('order-123');

    expect(() => order.confirm()).toThrow('Cannot confirm empty order');
  });
});
```

**Testes de Invariantes**:

```typescript
describe('Money Value Object', () => {
  it('não deve permitir valores negativos', () => {
    expect(() => new Money(-10, 'BRL')).toThrow('Amount cannot be negative');
  });

  it('não deve somar moedas de diferentes tipos', () => {
    const brl = new Money(100, 'BRL');
    const usd = new Money(50, 'USD');

    expect(() => brl.add(usd)).toThrow('Cannot add different currencies');
  });
});
```

## 3. Domain Service Pattern

### Descrição

Implementa lógica de domínio que não pertence naturalmente a uma entidade ou objeto de valor.

### Exemplo Prático

```typescript
// Domain Service
class TransferService {
  constructor(private accountRepository: AccountRepository) {}

  async transfer(
    fromAccountId: string,
    toAccountId: string,
    amount: Money
  ): Promise<void> {
    const fromAccount = await this.accountRepository.findById(fromAccountId);
    const toAccount = await this.accountRepository.findById(toAccountId);

    if (!fromAccount || !toAccount) {
      throw new Error('Account not found');
    }

    // Regra de negócio: validar saldo
    if (fromAccount.balance.amount < amount.amount) {
      throw new Error('Insufficient balance');
    }

    // Regra de negócio: mesmo tipo de moeda
    if (fromAccount.balance.currency !== amount.currency) {
      throw new Error('Currency mismatch');
    }

    fromAccount.debit(amount);
    toAccount.credit(amount);

    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
  }
}

class Account {
  constructor(
    public readonly id: string,
    public balance: Money
  ) {}

  debit(amount: Money): void {
    this.balance = new Money(
      this.balance.amount - amount.amount,
      this.balance.currency
    );
  }

  credit(amount: Money): void {
    this.balance = this.balance.add(amount);
  }
}
```

### Estratégias de Teste

**Testes Unitários com Mocks**:

```typescript
describe('TransferService', () => {
  it('deve transferir valores entre contas', async () => {
    const fromAccount = new Account('acc-1', new Money(1000, 'BRL'));
    const toAccount = new Account('acc-2', new Money(500, 'BRL'));

    const mockRepository: AccountRepository = {
      findById: jest.fn((id: string) => {
        if (id === 'acc-1') return Promise.resolve(fromAccount);
        if (id === 'acc-2') return Promise.resolve(toAccount);
        return Promise.resolve(null);
      }),
      save: jest.fn().mockResolvedValue(undefined)
    };

    const service = new TransferService(mockRepository);
    await service.transfer('acc-1', 'acc-2', new Money(300, 'BRL'));

    expect(fromAccount.balance.amount).toBe(700);
    expect(toAccount.balance.amount).toBe(800);
    expect(mockRepository.save).toHaveBeenCalledTimes(2);
  });

  it('deve falhar ao transferir com saldo insuficiente', async () => {
    const fromAccount = new Account('acc-1', new Money(100, 'BRL'));
    const toAccount = new Account('acc-2', new Money(500, 'BRL'));

    const mockRepository: AccountRepository = {
      findById: jest.fn((id: string) => {
        if (id === 'acc-1') return Promise.resolve(fromAccount);
        if (id === 'acc-2') return Promise.resolve(toAccount);
        return Promise.resolve(null);
      }),
      save: jest.fn()
    };

    const service = new TransferService(mockRepository);

    await expect(
      service.transfer('acc-1', 'acc-2', new Money(300, 'BRL'))
    ).rejects.toThrow('Insufficient balance');

    expect(mockRepository.save).not.toHaveBeenCalled();
  });
});
```

## 4. Factory Pattern

### Descrição

Encapsula a lógica complexa de criação de agregados e entidades.

### Exemplo Prático

```typescript
// Factory
class OrderFactory {
  constructor(
    private productRepository: ProductRepository,
    private customerRepository: CustomerRepository
  ) {}

  async createFromCart(
    customerId: string,
    cartItems: Array<{ productId: string; quantity: number }>
  ): Promise<Order> {
    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const order = new Order(this.generateOrderId());

    for (const item of cartItems) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      order.addItem(
        product.id,
        item.quantity,
        new Money(product.price, 'BRL')
      );
    }

    return order;
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}
```

### Estratégias de Teste

**Testes Unitários**:

```typescript
describe('OrderFactory', () => {
  it('deve criar pedido a partir do carrinho', async () => {
    const mockProductRepo: ProductRepository = {
      findById: jest.fn((id: string) => {
        const products: Record<string, Product> = {
          'prod-1': { id: 'prod-1', name: 'Produto 1', price: 100, stock: 10 },
          'prod-2': { id: 'prod-2', name: 'Produto 2', price: 50, stock: 5 }
        };
        return Promise.resolve(products[id] || null);
      })
    };

    const mockCustomerRepo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'cust-1', name: 'Customer' })
    };

    const factory = new OrderFactory(mockProductRepo, mockCustomerRepo);
    
    const order = await factory.createFromCart('cust-1', [
      { productId: 'prod-1', quantity: 2 },
      { productId: 'prod-2', quantity: 1 }
    ]);

    expect(order.getTotalAmount().amount).toBe(250);
  });

  it('deve falhar ao criar pedido com estoque insuficiente', async () => {
    const mockProductRepo: ProductRepository = {
      findById: jest.fn().mockResolvedValue({
        id: 'prod-1',
        name: 'Produto 1',
        price: 100,
        stock: 1
      })
    };

    const mockCustomerRepo: CustomerRepository = {
      findById: jest.fn().mockResolvedValue({ id: 'cust-1', name: 'Customer' })
    };

    const factory = new OrderFactory(mockProductRepo, mockCustomerRepo);

    await expect(
      factory.createFromCart('cust-1', [{ productId: 'prod-1', quantity: 5 }])
    ).rejects.toThrow('Insufficient stock');
  });
});
```

## 5. Specification Pattern

### Descrição

Encapsula regras de negócio complexas em objetos reutilizáveis e combináveis.

### Exemplo Prático

```typescript
// Specification Interface
interface Specification<T> {
  isSatisfiedBy(candidate: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

// Base Specification
abstract class CompositeSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(candidate: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) && this.right.isSatisfiedBy(candidate);
  }
}

class OrSpecification<T> extends CompositeSpecification<T> {
  constructor(
    private left: Specification<T>,
    private right: Specification<T>
  ) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return this.left.isSatisfiedBy(candidate) || this.right.isSatisfiedBy(candidate);
  }
}

class NotSpecification<T> extends CompositeSpecification<T> {
  constructor(private spec: Specification<T>) {
    super();
  }

  isSatisfiedBy(candidate: T): boolean {
    return !this.spec.isSatisfiedBy(candidate);
  }
}

// Concrete Specifications
class Customer {
  constructor(
    public readonly id: string,
    public readonly age: number,
    public readonly totalPurchases: number,
    public readonly isPremium: boolean
  ) {}
}

class IsAdultSpecification extends CompositeSpecification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return customer.age >= 18;
  }
}

class IsVIPSpecification extends CompositeSpecification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return customer.totalPurchases > 10000;
  }
}

class IsPremiumSpecification extends CompositeSpecification<Customer> {
  isSatisfiedBy(customer: Customer): boolean {
    return customer.isPremium;
  }
}

// Uso prático
class DiscountService {
  private eligibleForSpecialDiscount: Specification<Customer>;

  constructor() {
    // Cliente adulto E (VIP OU Premium)
    this.eligibleForSpecialDiscount = new IsAdultSpecification()
      .and(
        new IsVIPSpecification().or(new IsPremiumSpecification())
      );
  }

  calculateDiscount(customer: Customer): number {
    if (this.eligibleForSpecialDiscount.isSatisfiedBy(customer)) {
      return 0.20; // 20% de desconto
    }
    return 0.05; // 5% de desconto padrão
  }
}
```

### Estratégias de Teste

**Testes Unitários de Especificações**:

```typescript
describe('Customer Specifications', () => {
  describe('IsAdultSpecification', () => {
    it('deve retornar true para idade >= 18', () => {
      const spec = new IsAdultSpecification();
      const customer = new Customer('1', 25, 5000, false);

      expect(spec.isSatisfiedBy(customer)).toBe(true);
    });

    it('deve retornar false para idade < 18', () => {
      const spec = new IsAdultSpecification();
      const customer = new Customer('1', 16, 5000, false);

      expect(spec.isSatisfiedBy(customer)).toBe(false);
    });
  });

  describe('Composite Specifications', () => {
    it('deve combinar especificações com AND', () => {
      const adultSpec = new IsAdultSpecification();
      const vipSpec = new IsVIPSpecification();
      const combinedSpec = adultSpec.and(vipSpec);

      const adultVIP = new Customer('1', 25, 15000, false);
      const adultNonVIP = new Customer('2', 25, 5000, false);

      expect(combinedSpec.isSatisfiedBy(adultVIP)).toBe(true);
      expect(combinedSpec.isSatisfiedBy(adultNonVIP)).toBe(false);
    });

    it('deve combinar especificações com OR', () => {
      const vipSpec = new IsVIPSpecification();
      const premiumSpec = new IsPremiumSpecification();
      const combinedSpec = vipSpec.or(premiumSpec);

      const vipCustomer = new Customer('1', 25, 15000, false);
      const premiumCustomer = new Customer('2', 25, 5000, true);
      const regularCustomer = new Customer('3', 25, 5000, false);

      expect(combinedSpec.isSatisfiedBy(vipCustomer)).toBe(true);
      expect(combinedSpec.isSatisfiedBy(premiumCustomer)).toBe(true);
      expect(combinedSpec.isSatisfiedBy(regularCustomer)).toBe(false);
    });

    it('deve negar especificações com NOT', () => {
      const adultSpec = new IsAdultSpecification();
      const notAdultSpec = adultSpec.not();

      const adult = new Customer('1', 25, 5000, false);
      const minor = new Customer('2', 16, 5000, false);

      expect(notAdultSpec.isSatisfiedBy(adult)).toBe(false);
      expect(notAdultSpec.isSatisfiedBy(minor)).toBe(true);
    });
  });
});

describe('DiscountService', () => {
  it('deve aplicar desconto especial para cliente elegível', () => {
    const service = new DiscountService();
    const eligibleCustomer = new Customer('1', 25, 15000, false);

    expect(service.calculateDiscount(eligibleCustomer)).toBe(0.20);
  });

  it('deve aplicar desconto padrão para cliente não elegível', () => {
    const service = new DiscountService();
    const regularCustomer = new Customer('1', 25, 5000, false);

    expect(service.calculateDiscount(regularCustomer)).toBe(0.05);
  });
});
```

## 6. Domain Events Pattern

### Descrição

Representa algo significativo que aconteceu no domínio, permitindo comunicação entre agregados de forma desacoplada.

### Exemplo Prático

```typescript
// Domain Event Base
interface DomainEvent {
  occurredOn: Date;
  eventType: string;
}

// Concrete Events
class OrderConfirmedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventType = 'OrderConfirmed';

  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly totalAmount: Money
  ) {
    this.occurredOn = new Date();
  }
}

class PaymentProcessedEvent implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventType = 'PaymentProcessed';

  constructor(
    public readonly orderId: string,
    public readonly amount: Money,
    public readonly paymentMethod: string
  ) {
    this.occurredOn = new Date();
  }
}

// Event Handler Interface
interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

// Event Dispatcher
class DomainEventDispatcher {
  private handlers: Map<string, DomainEventHandler<any>[]> = new Map();

  register<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  async dispatch<T extends DomainEvent>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    await Promise.all(handlers.map(handler => handler.handle(event)));
  }
}

// Concrete Handlers
class SendConfirmationEmailHandler implements DomainEventHandler<OrderConfirmedEvent> {
  constructor(private emailService: EmailService) {}

  async handle(event: OrderConfirmedEvent): Promise<void> {
    await this.emailService.send({
      to: event.customerId,
      subject: 'Pedido Confirmado',
      body: `Seu pedido ${event.orderId} foi confirmado!`
    });
  }
}

class UpdateInventoryHandler implements DomainEventHandler<OrderConfirmedEvent> {
  constructor(private inventoryService: InventoryService) {}

  async handle(event: OrderConfirmedEvent): Promise<void> {
    await this.inventoryService.reserveStock(event.orderId);
  }
}
```

### Estratégias de Teste

**Testes Unitários de Handlers**:

```typescript
describe('SendConfirmationEmailHandler', () => {
  it('deve enviar email de confirmação', async () => {
    const mockEmailService: EmailService = {
      send: jest.fn().mockResolvedValue(undefined)
    };

    const handler = new SendConfirmationEmailHandler(mockEmailService);
    const event = new OrderConfirmedEvent(
      'order-123',
      'customer@example.com',
      new Money(500, 'BRL')
    );

    await handler.handle(event);

    expect(mockEmailService.send).toHaveBeenCalledWith({
      to: 'customer@example.com',
      subject: 'Pedido Confirmado',
      body: 'Seu pedido order-123 foi confirmado!'
    });
  });
});

describe('DomainEventDispatcher', () => {
  it('deve disparar todos os handlers registrados', async () => {
    const dispatcher = new DomainEventDispatcher();
    
    const handler1 = { handle: jest.fn().mockResolvedValue(undefined) };
    const handler2 = { handle: jest.fn().mockResolvedValue(undefined) };

    dispatcher.register('OrderConfirmed', handler1);
    dispatcher.register('OrderConfirmed', handler2);

    const event = new OrderConfirmedEvent(
      'order-123',
      'customer@example.com',
      new Money(500, 'BRL')
    );

    await dispatcher.dispatch(event);

    expect(handler1.handle).toHaveBeenCalledWith(event);
    expect(handler2.handle).toHaveBeenCalledWith(event);
  });
});
```

**Testes de Integração**:

```typescript
describe('Order Confirmation Flow Integration', () => {
  it('deve executar toda a cadeia de eventos ao confirmar pedido', async () => {
    const emailService = new InMemoryEmailService();
    const inventoryService = new InMemoryInventoryService();
    const dispatcher = new DomainEventDispatcher();

    dispatcher.register('OrderConfirmed', new SendConfirmationEmailHandler(emailService));
    dispatcher.register('OrderConfirmed', new UpdateInventoryHandler(inventoryService));

    const order = new Order('order-123');
    order.addItem('prod-1', 2, new Money(100, 'BRL'));
    order.confirm();

    const event = new OrderConfirmedEvent(
      order.id,
      'customer@example.com',
      order.getTotalAmount()
    );

    await dispatcher.dispatch(event);

    expect(emailService.sentEmails).toHaveLength(1);
    expect(inventoryService.reservedOrders).toContain('order-123');
  });
});
```

## Resumo: Mapeamento Pattern x Tipo de Teste

| Pattern        | Testes Unitários      | Testes de Integração | Testes E2E         |
| -------------- | --------------------- | -------------------- | ------------------ |
| Repository     | Mocks                 | Banco de dados real  | Fluxo completo     |
| Aggregate      | Regras de negócio     | -                    | Cenários complexos |
| Domain Service | Mocks de dependências | Repositórios reais   | Workflow completo  |
| Factory        | Mocks de repositórios | Validação de criação | -                  |
| Specification  | Lógica booleana       | Queries no banco     | -                  |
| Domain Events  | Handlers isolados     | Cadeia de eventos    | Fluxo assíncrono   |

## Boas Práticas de Teste em DDD

1. **Teste as regras de negócio primeiro**: Agregados e Value Objects devem ter cobertura máxima.
2. **Use mocks para isolar dependências**: Repositories e Services externos devem ser mockados em testes unitários.
3. **Testes de integração para boundaries**: Teste a comunicação entre camadas (Application, Domain, Infrastructure).
4. **Evite testar detalhes de implementação**: Foque no comportamento observável.
5. **Use builders e factories de teste**: Facilite a criação de objetos complexos nos testes.
6. **Teste cenários de erro**: Valide que invariantes e regras de domínio são respeitadas.
7. **Separe testes por camada**: Unitários para Domain, Integração para Infrastructure, E2E para Application.
