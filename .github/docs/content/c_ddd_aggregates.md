# Testes para Aggregates (DDD)

## Introdução

Aggregates são clusters de objetos de domínio tratados como uma unidade coesa para mudanças de dados. Um Aggregate possui uma raiz (Aggregate Root) que é a única entrada para modificações no cluster. Os testes de Aggregates devem focar na consistência transacional, nas regras de negócio que abrangem múltiplas entidades, e na garantia de que apenas a raiz pode modificar os objetos internos. A estratégia principal são testes unitários que validam a integridade do agregado como um todo.

## Estratégias de Teste

Para Aggregates, deve-se testar a coordenação entre as entidades internas, garantir que as invariantes do agregado são mantidas independente das operações realizadas, validar que apenas a raiz expõe métodos de modificação, e verificar transações que envolvem múltiplas entidades do agregado. Os testes devem simular cenários complexos de negócio que exigem a coordenação de várias entidades.

## Exemplo Prático: Aggregate de Carrinho de Compras

```typescript
// src/domain/aggregates/ShoppingCart.ts
export class ShoppingCart {
  private _id: string;
  private _customerId: string;
  private _items: Map<string, CartItem>;
  private _coupons: Coupon[];
  private _status: CartStatus;
  private _subtotal: number;
  private _discount: number;

  constructor(id: string, customerId: string) {
    this._id = id;
    this._customerId = customerId;
    this._items = new Map();
    this._coupons = [];
    this._status = CartStatus.ACTIVE;
    this._subtotal = 0;
    this._discount = 0;
  }

  addProduct(productId: string, name: string, price: number, quantity: number): void {
    if (this._status !== CartStatus.ACTIVE) {
      throw new Error('Cannot modify inactive cart');
    }

    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const existingItem = this._items.get(productId);
    
    if (existingItem) {
      existingItem.increaseQuantity(quantity);
    } else {
      const newItem = new CartItem(productId, name, price, quantity);
      this._items.set(productId, newItem);
    }

    this.recalculateSubtotal();
  }

  removeProduct(productId: string): void {
    if (!this._items.has(productId)) {
      throw new Error('Product not found in cart');
    }

    this._items.delete(productId);
    this.recalculateSubtotal();
    this.recalculateDiscount();
  }

  applyCoupon(coupon: Coupon): void {
    if (!coupon.isValid()) {
      throw new Error('Invalid or expired coupon');
    }

    if (this._subtotal < coupon.minimumValue) {
      throw new Error(`Minimum cart value is ${coupon.minimumValue}`);
    }

    const existingCoupon = this._coupons.find(c => c.code === coupon.code);
    if (existingCoupon) {
      throw new Error('Coupon already applied');
    }

    this._coupons.push(coupon);
    this.recalculateDiscount();
  }

  checkout(): Order {
    if (this._items.size === 0) {
      throw new Error('Cannot checkout empty cart');
    }

    this._status = CartStatus.CHECKED_OUT;
    
    const order = new Order(
      `order-${this._id}`,
      this._customerId,
      Array.from(this._items.values()),
      this.getTotal()
    );

    return order;
  }

  private recalculateSubtotal(): void {
    this._subtotal = Array.from(this._items.values())
      .reduce((sum, item) => sum + item.getSubtotal(), 0);
  }

  private recalculateDiscount(): void {
    this._discount = this._coupons.reduce((total, coupon) => {
      return total + coupon.calculateDiscount(this._subtotal);
    }, 0);
  }

  getTotal(): number {
    return Math.max(0, this._subtotal - this._discount);
  }

  get itemCount(): number {
    return this._items.size;
  }

  get status(): CartStatus {
    return this._status;
  }
}
```

## Testes Unitários

```typescript
// tests/unit/domain/aggregates/ShoppingCart.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ShoppingCart } from '../../../../src/domain/aggregates/ShoppingCart';
import { Coupon } from '../../../../src/domain/entities/Coupon';
import { CartStatus } from '../../../../src/domain/enums/CartStatus';

describe('ShoppingCart Aggregate - Unit Tests', () => {
  
  describe('Product Management', () => {
    it('should add new product to cart', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      
      cart.addProduct('prod-1', 'Notebook', 3000, 1);
      
      expect(cart.itemCount).to.equal(1);
      expect(cart.getTotal()).to.equal(3000);
    });

    it('should increase quantity when adding existing product', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      
      cart.addProduct('prod-1', 'Notebook', 3000, 1);
      cart.addProduct('prod-1', 'Notebook', 3000, 2);
      
      expect(cart.itemCount).to.equal(1);
      expect(cart.getTotal()).to.equal(9000);
    });

    it('should remove product from cart', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      
      cart.addProduct('prod-1', 'Notebook', 3000, 1);
      cart.addProduct('prod-2', 'Mouse', 50, 1);
      cart.removeProduct('prod-1');
      
      expect(cart.itemCount).to.equal(1);
      expect(cart.getTotal()).to.equal(50);
    });

    it('should throw error when removing non-existent product', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      
      expect(() => cart.removeProduct('prod-999'))
        .to.throw('Product not found in cart');
    });
  });

  describe('Coupon Application', () => {
    it('should apply valid coupon and calculate discount', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      cart.addProduct('prod-1', 'Notebook', 1000, 1);
      
      const coupon = new Coupon('SAVE10', 10, 500, new Date('2026-12-31'));
      cart.applyCoupon(coupon);
      
      expect(cart.getTotal()).to.equal(900);
    });

    it('should not apply expired coupon', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      cart.addProduct('prod-1', 'Notebook', 1000, 1);
      
      const expiredCoupon = new Coupon('EXPIRED', 10, 0, new Date('2020-01-01'));
      
      expect(() => cart.applyCoupon(expiredCoupon))
        .to.throw('Invalid or expired coupon');
    });

    it('should not apply coupon below minimum value', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      cart.addProduct('prod-1', 'Mouse', 50, 1);
      
      const coupon = new Coupon('SAVE10', 10, 100, new Date('2026-12-31'));
      
      expect(() => cart.applyCoupon(coupon))
        .to.throw('Minimum cart value is 100');
    });

    it('should not apply same coupon twice', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      cart.addProduct('prod-1', 'Notebook', 1000, 1);
      
      const coupon = new Coupon('SAVE10', 10, 500, new Date('2026-12-31'));
      cart.applyCoupon(coupon);
      
      expect(() => cart.applyCoupon(coupon))
        .to.throw('Coupon already applied');
    });
  });

  describe('Aggregate Consistency', () => {
    it('should maintain consistency when adding and removing products', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      
      cart.addProduct('prod-1', 'Notebook', 3000, 2);
      cart.addProduct('prod-2', 'Mouse', 50, 3);
      cart.addProduct('prod-3', 'Keyboard', 200, 1);
      
      const coupon = new Coupon('SAVE100', 100, 1000, new Date('2026-12-31'));
      cart.applyCoupon(coupon);
      
      cart.removeProduct('prod-1');
      
      // Subtotal deve ser recalculado: (50 * 3) + (200 * 1) = 350
      // Desconto também deve ser recalculado
      expect(cart.getTotal()).to.be.greaterThan(0);
      expect(cart.getTotal()).to.be.lessThan(350);
    });
  });

  describe('Checkout Process', () => {
    it('should checkout cart and change status', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      cart.addProduct('prod-1', 'Notebook', 3000, 1);
      
      const order = cart.checkout();
      
      expect(order).to.not.be.null;
      expect(cart.status).to.equal(CartStatus.CHECKED_OUT);
    });

    it('should not checkout empty cart', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      
      expect(() => cart.checkout())
        .to.throw('Cannot checkout empty cart');
    });

    it('should not allow modifications after checkout', () => {
      const cart = new ShoppingCart('cart-1', 'customer-1');
      cart.addProduct('prod-1', 'Notebook', 3000, 1);
      cart.checkout();
      
      expect(() => cart.addProduct('prod-2', 'Mouse', 50, 1))
        .to.throw('Cannot modify inactive cart');
    });
  });
});
```

## Pontos-chave

Os testes de Aggregates devem garantir que todas as operações mantém a consistência interna do agregado, validando regras de negócio que envolvem múltiplas entidades. É essencial testar cenários complexos que simulam fluxos reais de negócio, verificando que o agregado se comporta como uma unidade transacional coesa. A proteção das invariantes do agregado deve ser rigorosamente testada em todos os cenários possíveis.
