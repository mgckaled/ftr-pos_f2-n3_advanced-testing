# Testes para Entities (DDD)

## Introdução

As Entities são objetos de domínio que possuem identidade única e continuidade ao longo do tempo. Os testes de Entities devem focar na validação de regras de negócio, invariantes do domínio e comportamentos específicos da entidade. A estratégia principal é utilizar testes unitários para garantir que a entidade mantém sua consistência interna.

## Estratégias de Teste

Para Entities, os testes unitários são predominantes pois validam a lógica de negócio isoladamente. Deve-se testar a criação da entidade, suas validações, métodos de comportamento e garantir que as regras de domínio sejam respeitadas.

## Exemplo Prático: Entity de Pedido

```typescript
// src/domain/entities/Order.ts
export class Order {
  private _id: string;
  private _customerId: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _createdAt: Date;
  private _total: number;

  constructor(id: string, customerId: string) {
    this._id = id;
    this._customerId = customerId;
    this._items = [];
    this._status = OrderStatus.PENDING;
    this._createdAt = new Date();
    this._total = 0;
  }

  addItem(item: OrderItem): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new Error('Cannot add items to a non-pending order');
    }
    
    this._items.push(item);
    this.recalculateTotal();
  }

  confirm(): void {
    if (this._items.length === 0) {
      throw new Error('Cannot confirm order without items');
    }
    
    this._status = OrderStatus.CONFIRMED;
  }

  private recalculateTotal(): void {
    this._total = this._items.reduce((sum, item) => sum + item.getSubtotal(), 0);
  }

  get total(): number {
    return this._total;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get id(): string {
    return this._id;
  }
}
```

## Testes Unitários

```typescript
// tests/unit/domain/entities/Order.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Order } from '../../../../src/domain/entities/Order';
import { OrderItem } from '../../../../src/domain/entities/OrderItem';
import { OrderStatus } from '../../../../src/domain/enums/OrderStatus';

describe('Order Entity - Unit Tests', () => {
  
  describe('Creation', () => {
    it('should create a new order with pending status', () => {
      const order = new Order('order-123', 'customer-456');
      
      expect(order.id).to.equal('order-123');
      expect(order.status).to.equal(OrderStatus.PENDING);
      expect(order.total).to.equal(0);
    });
  });

  describe('Adding Items', () => {
    it('should add item and recalculate total', () => {
      const order = new Order('order-123', 'customer-456');
      const item = new OrderItem('product-1', 'Notebook', 2, 3000);
      
      order.addItem(item);
      
      expect(order.total).to.equal(6000);
    });

    it('should throw error when adding item to confirmed order', () => {
      const order = new Order('order-123', 'customer-456');
      const item = new OrderItem('product-1', 'Notebook', 1, 3000);
      
      order.addItem(item);
      order.confirm();
      
      const newItem = new OrderItem('product-2', 'Mouse', 1, 50);
      
      expect(() => order.addItem(newItem))
        .to.throw('Cannot add items to a non-pending order');
    });
  });

  describe('Order Confirmation', () => {
    it('should confirm order with items', () => {
      const order = new Order('order-123', 'customer-456');
      const item = new OrderItem('product-1', 'Notebook', 1, 3000);
      
      order.addItem(item);
      order.confirm();
      
      expect(order.status).to.equal(OrderStatus.CONFIRMED);
    });

    it('should not confirm order without items', () => {
      const order = new Order('order-123', 'customer-456');
      
      expect(() => order.confirm())
        .to.throw('Cannot confirm order without items');
    });
  });

  describe('Business Rules Validation', () => {
    it('should maintain total consistency after multiple item additions', () => {
      const order = new Order('order-123', 'customer-456');
      
      order.addItem(new OrderItem('product-1', 'Notebook', 2, 3000));
      order.addItem(new OrderItem('product-2', 'Mouse', 3, 50));
      order.addItem(new OrderItem('product-3', 'Keyboard', 1, 200));
      
      // Total deve ser: (2 * 3000) + (3 * 50) + (1 * 200) = 6450
      expect(order.total).to.equal(6450);
    });
  });
});
```

## Pontos-chave

Os testes de Entities devem validar que as regras de negócio sejam aplicadas corretamente em todos os cenários possíveis. É fundamental testar estados inválidos e transições de estado para garantir a integridade do domínio. A entidade deve sempre manter sua consistência interna, e os testes são a garantia disso.
