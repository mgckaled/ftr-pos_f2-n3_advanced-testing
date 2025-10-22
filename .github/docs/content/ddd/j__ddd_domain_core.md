# Testes para Domain Core (DDD)

## Introdução

O Domain Core (ou Camada de Domínio) é o coração da aplicação DDD, contendo toda a lógica de negócio, regras, políticas e conhecimento do domínio. Esta camada deve ser completamente independente de frameworks, infraestrutura e detalhes de implementação. Os testes do Domain Core focam em validar que as regras de negócio estão implementadas corretamente e que o modelo de domínio reflete fielmente os conceitos do negócio. A estratégia principal são testes unitários puros que validam a lógica de negócio isoladamente.

## Estratégias de Teste

Para o Domain Core, deve-se priorizar testes unitários que não dependem de nada externo (sem mocks de infraestrutura), testar todas as regras de negócio e invariantes do domínio, validar que o domínio é rico e não anêmico (possui comportamento, não apenas getters/setters), verificar que políticas e estratégias de negócio funcionam corretamente, e garantir que o domínio é a única fonte de verdade para regras de negócio. Testes devem usar linguagem ubíqua do domínio.

## Exemplo Prático: Domain Core de Sistema de Reservas

```typescript
// src/domain/core/booking/BookingPolicy.ts
export class BookingPolicy {
  
  canBookRoom(
    room: Room,
    startDate: Date,
    endDate: Date,
    guest: Guest,
    existingBookings: Booking[]
  ): BookingValidationResult {
    const errors: string[] = [];

    // Regra 1: Datas válidas
    if (startDate >= endDate) {
      errors.push('Data de checkout deve ser posterior à data de checkin');
    }

    if (startDate < new Date()) {
      errors.push('Não é possível fazer reserva para datas passadas');
    }

    // Regra 2: Período mínimo e máximo
    const nights = this.calculateNights(startDate, endDate);
    if (nights < room.minimumNights) {
      errors.push(`Reserva mínima de ${room.minimumNights} noites`);
    }

    if (nights > 30) {
      errors.push('Reserva máxima de 30 noites');
    }

    // Regra 3: Disponibilidade
    const hasConflict = existingBookings.some(booking => 
      this.hasDateConflict(booking, startDate, endDate) && 
      booking.status !== BookingStatus.CANCELLED
    );

    if (hasConflict) {
      errors.push('Quarto não disponível para as datas selecionadas');
    }

    // Regra 4: Capacidade do quarto
    if (guest.numberOfGuests > room.capacity) {
      errors.push(`Quarto comporta no máximo ${room.capacity} hóspedes`);
    }

    // Regra 5: Antecedência mínima
    const daysUntilCheckin = this.daysBetween(new Date(), startDate);
    if (daysUntilCheckin < 1) {
      errors.push('Reserva deve ser feita com pelo menos 1 dia de antecedência');
    }

    // Regra 6: Guest válido
    if (!guest.isVerified()) {
      errors.push('Hóspede precisa verificar o email antes de reservar');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  calculateTotalPrice(
    room: Room,
    startDate: Date,
    endDate: Date,
    appliedCoupons: Coupon[]
  ): PriceCalculation {
    const nights = this.calculateNights(startDate, endDate);
    let subtotal = room.pricePerNight * nights;

    // Aplica taxa de fim de semana (sexta e sábado)
    const weekendNights = this.countWeekendNights(startDate, endDate);
    const weekendSurcharge = weekendNights * (room.pricePerNight * 0.2);
    subtotal += weekendSurcharge;

    // Aplica desconto por estadia longa
    if (nights >= 7) {
      subtotal *= 0.9; // 10% de desconto
    } else if (nights >= 14) {
      subtotal *= 0.85; // 15% de desconto
    }

    // Aplica cupons
    let totalDiscount = 0;
    for (const coupon of appliedCoupons) {
      if (coupon.isValid() && subtotal >= coupon.minimumValue) {
        totalDiscount += coupon.calculateDiscount(subtotal);
      }
    }

    const cleaningFee = 50;
    const serviceFee = subtotal * 0.1;
    const total = Math.max(0, subtotal - totalDiscount + cleaningFee + serviceFee);

    return {
      subtotal,
      weekendSurcharge,
      longStayDiscount: subtotal < (room.pricePerNight * nights) ? 
        (room.pricePerNight * nights) - subtotal : 0,
      couponDiscount: totalDiscount,
      cleaningFee,
      serviceFee,
      total,
      nights
    };
  }

  private calculateNights(startDate: Date, endDate: Date): number {
    return this.daysBetween(startDate, endDate);
  }

  private daysBetween(date1: Date, date2: Date): number {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const diff = date2.getTime() - date1.getTime();
    return Math.floor(diff / millisecondsPerDay);
  }

  private hasDateConflict(
    booking: Booking,
    startDate: Date,
    endDate: Date
  ): boolean {
    return startDate < booking.endDate && endDate > booking.startDate;
  }

  private countWeekendNights(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current < endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 5 || dayOfWeek === 6) { // Sexta ou Sábado
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}
```

## Testes Unitários do Domain Core

```typescript
// tests/unit/domain/core/booking/BookingPolicy.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { BookingPolicy } from '../../../../../src/domain/core/booking/BookingPolicy';
import { Room } from '../../../../../src/domain/entities/Room';
import { Guest } from '../../../../../src/domain/entities/Guest';
import { Booking } from '../../../../../src/domain/entities/Booking';
import { BookingStatus } from '../../../../../src/domain/enums/BookingStatus';

describe('BookingPolicy - Domain Core Tests', () => {
  let policy: BookingPolicy;
  let room: Room;
  let guest: Guest;

  beforeEach(() => {
    policy = new BookingPolicy();
    
    room = new Room('room-1', 'Quarto Deluxe', 200, 2, 1);
    
    guest = new Guest('guest-1', 'John Doe', 'john@example.com', 2);
    guest.verify(); // Hóspede verificado
  });

  describe('Regras de Data e Período', () => {
    it('deve aceitar reserva com datas válidas', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-20');

      const result = policy.canBookRoom(room, startDate, endDate, guest, []);

      expect(result.isValid).to.be.true;
      expect(result.errors).to.be.empty;
    });

    it('deve rejeitar checkout anterior ao checkin', () => {
      const startDate = new Date('2026-01-20');
      const endDate = new Date('2026-01-15');

      const result = policy.canBookRoom(room, startDate, endDate, guest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Data de checkout deve ser posterior à data de checkin');
    });

    it('deve rejeitar reserva para datas passadas', () => {
      const startDate = new Date('2020-01-15');
      const endDate = new Date('2020-01-20');

      const result = policy.canBookRoom(room, startDate, endDate, guest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Não é possível fazer reserva para datas passadas');
    });

    it('deve rejeitar estadia inferior ao mínimo', () => {
      room.minimumNights = 3;
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-16'); // Apenas 1 noite

      const result = policy.canBookRoom(room, startDate, endDate, guest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Reserva mínima de 3 noites');
    });

    it('deve rejeitar estadia superior a 30 noites', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-03-01'); // Mais de 30 noites

      const result = policy.canBookRoom(room, startDate, endDate, guest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Reserva máxima de 30 noites');
    });
  });

  describe('Regras de Disponibilidade', () => {
    it('deve rejeitar quando há conflito de datas', () => {
      const existingBooking = new Booking(
        'booking-1',
        'room-1',
        'guest-2',
        new Date('2026-01-15'),
        new Date('2026-01-20'),
        BookingStatus.CONFIRMED
      );

      const startDate = new Date('2026-01-18');
      const endDate = new Date('2026-01-22');

      const result = policy.canBookRoom(room, startDate, endDate, guest, [existingBooking]);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Quarto não disponível para as datas selecionadas');
    });

    it('deve aceitar quando reserva existente está cancelada', () => {
      const cancelledBooking = new Booking(
        'booking-1',
        'room-1',
        'guest-2',
        new Date('2026-01-15'),
        new Date('2026-01-20'),
        BookingStatus.CANCELLED
      );

      const startDate = new Date('2026-01-18');
      const endDate = new Date('2026-01-22');

      const result = policy.canBookRoom(room, startDate, endDate, guest, [cancelledBooking]);

      expect(result.isValid).to.be.true;
    });

    it('deve aceitar datas consecutivas sem sobreposição', () => {
      const existingBooking = new Booking(
        'booking-1',
        'room-1',
        'guest-2',
        new Date('2026-01-10'),
        new Date('2026-01-15'),
        BookingStatus.CONFIRMED
      );

      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-20');

      const result = policy.canBookRoom(room, startDate, endDate, guest, [existingBooking]);

      expect(result.isValid).to.be.true;
    });
  });

  describe('Regras de Capacidade e Hóspede', () => {
    it('deve rejeitar quando número de hóspedes excede capacidade', () => {
      guest = new Guest('guest-1', 'John Doe', 'john@example.com', 5);
      guest.verify();
      room.capacity = 2;

      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-20');

      const result = policy.canBookRoom(room, startDate, endDate, guest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Quarto comporta no máximo 2 hóspedes');
    });

    it('deve rejeitar quando hóspede não está verificado', () => {
      const unverifiedGuest = new Guest('guest-2', 'Jane Doe', 'jane@example.com', 2);

      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-20');

      const result = policy.canBookRoom(room, startDate, endDate, unverifiedGuest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors).to.include('Hóspede precisa verificar o email antes de reservar');
    });
  });

  describe('Cálculo de Preço', () => {
    it('deve calcular preço base corretamente', () => {
      const startDate = new Date('2026-01-15'); // Quarta
      const endDate = new Date('2026-01-18'); // Sábado (3 noites)

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, []);

      expect(calculation.nights).to.equal(3);
      expect(calculation.subtotal).to.be.greaterThan(0);
    });

    it('deve aplicar taxa de fim de semana', () => {
      const startDate = new Date('2026-01-16'); // Sexta
      const endDate = new Date('2026-01-19'); // Segunda (3 noites, 2 de fim de semana)

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, []);

      expect(calculation.weekendSurcharge).to.be.greaterThan(0);
      expect(calculation.weekendSurcharge).to.equal(room.pricePerNight * 0.2 * 2);
    });

    it('deve aplicar desconto de estadia longa (7+ noites)', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-23'); // 8 noites

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, []);

      expect(calculation.longStayDiscount).to.be.greaterThan(0);
    });

    it('deve aplicar desconto de estadia muito longa (14+ noites)', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-02-01'); // 17 noites

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, []);

      expect(calculation.longStayDiscount).to.be.greaterThan(0);
      // Desconto de 15% deve ser maior que desconto de 10%
    });

    it('deve aplicar taxa de limpeza e serviço', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-18');

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, []);

      expect(calculation.cleaningFee).to.equal(50);
      expect(calculation.serviceFee).to.equal(calculation.subtotal * 0.1);
    });

    it('deve aplicar cupom válido', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-18');
      
      const coupon = {
        code: 'SAVE10',
        minimumValue: 100,
        isValid: () => true,
        calculateDiscount: (subtotal: number) => subtotal * 0.1
      };

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, [coupon as any]);

      expect(calculation.couponDiscount).to.be.greaterThan(0);
      expect(calculation.total).to.be.lessThan(calculation.subtotal + calculation.cleaningFee + calculation.serviceFee);
    });

    it('deve garantir que preço final nunca seja negativo', () => {
      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-16');
      
      const hugeDiscountCoupon = {
        code: 'FREE',
        minimumValue: 0,
        isValid: () => true,
        calculateDiscount: () => 999999
      };

      const calculation = policy.calculateTotalPrice(room, startDate, endDate, [hugeDiscountCoupon as any]);

      expect(calculation.total).to.be.at.least(0);
    });
  });

  describe('Cenários Complexos de Negócio', () => {
    it('deve validar múltiplas regras simultaneamente', () => {
      const unverifiedGuest = new Guest('guest-2', 'Jane Doe', 'jane@example.com', 5);
      room.capacity = 2;
      room.minimumNights = 3;

      const startDate = new Date('2026-01-15');
      const endDate = new Date('2026-01-16'); // Apenas 1 noite

      const result = policy.canBookRoom(room, startDate, endDate, unverifiedGuest, []);

      expect(result.isValid).to.be.false;
      expect(result.errors.length).to.be.greaterThan(1);
      expect(result.errors).to.include('Hóspede precisa verificar o email antes de reservar');
      expect(result.errors).to.include('Quarto comporta no máximo 2 hóspedes');
      expect(result.errors).to.include('Reserva mínima de 3 noites');
    });
  });
});
```

## Pontos-chave

O Domain Core deve ser testado exaustivamente com testes unitários puros que não dependem de infraestrutura. Os testes devem validar todas as regras de negócio, invariantes e políticas do domínio usando a linguagem ubíqua. É essencial testar cenários complexos que combinam múltiplas regras e verificar casos edge. O Domain Core é a camada mais crítica e deve ter a maior cobertura de testes, pois contém o coração da aplicação.
