# Testes para Domain Services (DDD)

## Introdução

Domain Services encapsulam lógica de negócio que não pertence naturalmente a uma única entidade ou value object, mas que envolve múltiplos objetos do domínio. Diferente dos Use Cases (que são Application Services), os Domain Services contêm regras de negócio complexas. Os testes devem focar na validação das regras de negócio e na coordenação entre múltiplos objetos de domínio. A estratégia principal são testes unitários que validam a lógica de negócio sem dependências externas.

## Estratégias de Teste

Para Domain Services, deve-se testar as regras de negócio complexas que envolvem múltiplas entidades ou agregados, validar cálculos e algoritmos do domínio, verificar a coordenação entre objetos, e garantir que as invariantes do domínio sejam mantidas. Os testes devem ser unitários, focando na lógica pura de negócio, usando mocks apenas quando necessário para isolar responsabilidades.

## Exemplo Prático: Domain Service de Cálculo de Frete

```typescript
// src/domain/services/ShippingCalculatorService.ts
export class ShippingCalculatorService {
  private readonly BASE_RATE = 10;
  private readonly WEIGHT_RATE = 0.5;
  private readonly DISTANCE_RATE = 0.02;

  calculateShipping(
    order: Order,
    customer: Customer,
    warehouse: Warehouse
  ): ShippingCost {
    const totalWeight = this.calculateTotalWeight(order);
    const distance = this.calculateDistance(
      customer.address,
      warehouse.address
    );

    let baseCost = this.BASE_RATE;
    let weightCost = totalWeight * this.WEIGHT_RATE;
    let distanceCost = distance * this.DISTANCE_RATE;

    let totalCost = baseCost + weightCost + distanceCost;

    if (customer.isPremium()) {
      totalCost = this.applyPremiumDiscount(totalCost);
    }

    if (order.total > 500) {
      totalCost = this.applyFreeShippingThreshold(totalCost);
    }

    if (this.isRemoteArea(customer.address)) {
      totalCost = this.applyRemoteAreaSurcharge(totalCost);
    }

    const estimatedDays = this.calculateDeliveryDays(distance, customer.isPremium());

    return new ShippingCost(
      Math.max(0, totalCost),
      estimatedDays,
      totalWeight,
      distance
    );
  }

  private calculateTotalWeight(order: Order): number {
    return order.items.reduce((total, item) => {
      return total + (item.product.weight * item.quantity);
    }, 0);
  }

  private calculateDistance(addressFrom: Address, addressTo: Address): number {
    const R = 6371; // Raio da Terra em km
    const lat1 = this.toRadians(addressFrom.latitude);
    const lat2 = this.toRadians(addressTo.latitude);
    const deltaLat = this.toRadians(addressTo.latitude - addressFrom.latitude);
    const deltaLon = this.toRadians(addressTo.longitude - addressFrom.longitude);

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private applyPremiumDiscount(cost: number): number {
    return cost * 0.8; // 20% de desconto
  }

  private applyFreeShippingThreshold(cost: number): number {
    return 0; // Frete grátis para pedidos acima de R$ 500
  }

  private applyRemoteAreaSurcharge(cost: number): number {
    return cost + 25; // Taxa adicional de R$ 25
  }

  private isRemoteArea(address: Address): boolean {
    const remoteStates = ['AC', 'AM', 'RR', 'RO', 'AP'];
    return remoteStates.includes(address.state);
  }

  private calculateDeliveryDays(distance: number, isPremium: boolean): number {
    const baseDays = Math.ceil(distance / 200); // 200km por dia
    return isPremium ? Math.max(1, baseDays - 2) : baseDays;
  }
}
```

## Testes Unitários

```typescript
// tests/unit/domain/services/ShippingCalculatorService.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ShippingCalculatorService } from '../../../../src/domain/services/ShippingCalculatorService';
import { Order } from '../../../../src/domain/entities/Order';
import { Customer } from '../../../../src/domain/entities/Customer';
import { Warehouse } from '../../../../src/domain/entities/Warehouse';
import { Address } from '../../../../src/domain/value-objects/Address';

describe('ShippingCalculatorService - Unit Tests', () => {
  let service: ShippingCalculatorService;

  beforeEach(() => {
    service = new ShippingCalculatorService();
  });

  describe('Basic Shipping Calculation', () => {
    it('should calculate shipping for standard order', () => {
      const customer = new Customer('customer-1', 'John Doe', false);
      customer.setAddress(new Address(
        'Rua A, 100',
        'São Paulo',
        'SP',
        '01000-000',
        -23.5505,
        -46.6333
      ));

      const warehouse = new Warehouse('warehouse-1', 'Main Warehouse');
      warehouse.setAddress(new Address(
        'Rua B, 200',
        'São Paulo',
        'SP',
        '02000-000',
        -23.5000,
        -46.6000
      ));

      const order = new Order('order-1', 'customer-1');
      order.addItem({
        product: { id: 'prod-1', name: 'Book', weight: 0.5 },
        quantity: 2
      });

      const shipping = service.calculateShipping(order, customer, warehouse);

      expect(shipping.cost).to.be.greaterThan(0);
      expect(shipping.estimatedDays).to.be.greaterThan(0);
      expect(shipping.weight).to.equal(1); // 0.5 * 2
    });
  });

  describe('Premium Customer Discount', () => {
    it('should apply 20% discount for premium customers', () => {
      const regularCustomer = new Customer('customer-1', 'John Doe', false);
      regularCustomer.setAddress(new Address(
        'Rua A, 100',
        'São Paulo',
        'SP',
        '01000-000',
        -23.5505,
        -46.6333
      ));

      const premiumCustomer = new Customer('customer-2', 'Jane Doe', true);
      premiumCustomer.setAddress(new Address(
        'Rua A, 100',
        'São Paulo',
        'SP',
        '01000-000',
        -23.5505,
        -46.6333
      ));

      const warehouse = new Warehouse('warehouse-1', 'Main Warehouse');
      warehouse.setAddress(new Address(
        'Rua B, 200',
        'São Paulo',
        'SP',
        '02000-000',
        -23.5000,
        -46.6000
      ));

      const order = new Order('order-1', 'customer-1');
      order.addItem({
        product: { id: 'prod-1', name: 'Book', weight: 1 },
        quantity: 1
      });

      const regularShipping = service.calculateShipping(order, regularCustomer, warehouse);
      const premiumShipping = service.calculateShipping(order, premiumCustomer, warehouse);

      expect(premiumShipping.cost).to.be.lessThan(regularShipping.cost);
      expect(premiumShipping.cost).to.equal(regularShipping.cost * 0.8);
    });
  });

  describe('Free Shipping Threshold', () => {
    it('should offer free shipping for orders above 500', () => {
      const customer = new Customer('customer-1', 'John Doe', false);
      customer.setAddress(new Address(
        'Rua A, 100',
        'São Paulo',
        'SP',
        '01000-000',
        -23.5505,
        -46.6333
      ));

      const warehouse = new Warehouse('warehouse-1', 'Main Warehouse');
      warehouse.setAddress(new Address(
        'Rua B, 200',
        'São Paulo',
        'SP',
        '02000-000',
        -23.5000,
        -46.6000
      ));

      const order = new Order('order-1', 'customer-1');
      order.addItem({
        product: { id: 'prod-1', name: 'Notebook', weight: 2, price: 3000 },
        quantity: 1
      });

      const shipping = service.calculateShipping(order, customer, warehouse);

      expect(shipping.cost).to.equal(0);
    });
  });

  describe('Remote Area Surcharge', () => {
    it('should apply surcharge for remote areas', () => {
      const remoteCustomer = new Customer('customer-1', 'John Doe', false);
      remoteCustomer.setAddress(new Address(
        'Rua A, 100',
        'Manaus',
        'AM',
        '69000-000',
        -3.1190,
        -60.0217
      ));

      const warehouse = new Warehouse('warehouse-1', 'Main Warehouse');
      warehouse.setAddress(new Address(
        'Rua B, 200',
        'São Paulo',
        'SP',
        '02000-000',
        -23.5000,
        -46.6000
      ));

      const order = new Order('order-1', 'customer-1');
      order.addItem({
        product: { id: 'prod-1', name: 'Book', weight: 1 },
        quantity: 1
      });

      const shipping = service.calculateShipping(order, remoteCustomer, warehouse);

      expect(shipping.cost).to.be.greaterThan(25); // Base + surcharge
    });
  });

  describe('Delivery Time Calculation', () => {
    it('should reduce delivery days for premium customers', () => {
      const regularCustomer = new Customer('customer-1', 'John Doe', false);
      const premiumCustomer = new Customer('customer-2', 'Jane Doe', true);

      const distantAddress = new Address(
        'Rua A, 100',
        'Florianópolis',
        'SC',
        '88000-000',
        -27.5954,
        -48.5480
      );

      regularCustomer.setAddress(distantAddress);
      premiumCustomer.setAddress(distantAddress);

      const warehouse = new Warehouse('warehouse-1', 'Main Warehouse');
      warehouse.setAddress(new Address(
        'Rua B, 200',
        'São Paulo',
        'SP',
        '02000-000',
        -23.5000,
        -46.6000
      ));

      const order = new Order('order-1', 'customer-1');
      order.addItem({
        product: { id: 'prod-1', name: 'Book', weight: 1 },
        quantity: 1
      });

      const regularShipping = service.calculateShipping(order, regularCustomer, warehouse);
      const premiumShipping = service.calculateShipping(order, premiumCustomer, warehouse);

      expect(premiumShipping.estimatedDays).to.be.lessThan(regularShipping.estimatedDays);
    });
  });

  describe('Complex Business Rules', () => {
    it('should handle all rules together correctly', () => {
      const premiumCustomer = new Customer('customer-1', 'John Doe', true);
      premiumCustomer.setAddress(new Address(
        'Rua A, 100',
        'Manaus',
        'AM',
        '69000-000',
        -3.1190,
        -60.0217
      ));

      const warehouse = new Warehouse('warehouse-1', 'Main Warehouse');
      warehouse.setAddress(new Address(
        'Rua B, 200',
        'São Paulo',
        'SP',
        '02000-000',
        -23.5000,
        -46.6000
      ));

      const order = new Order('order-1', 'customer-1');
      order.addItem({
        product: { id: 'prod-1', name: 'Notebook', weight: 2, price: 600 },
        quantity: 1
      });

      const shipping = service.calculateShipping(order, premiumCustomer, warehouse);

      // Com pedido > 500, frete seria 0, mas área remota adiciona R$ 25
      expect(shipping.cost).to.equal(25);
    });
  });
});
```

## Pontos-chave

Domain Services encapsulam lógica de negócio complexa que não pertence a uma única entidade. Os testes devem validar todas as regras de negócio e suas combinações, garantindo que o serviço coordena corretamente múltiplos objetos de domínio. É fundamental testar cenários edge cases e combinações complexas de regras para assegurar a corretude da lógica de negócio.
