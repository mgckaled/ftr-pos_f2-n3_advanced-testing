# Testes para Value Objects (DDD)

## Introdução

Value Objects são objetos imutáveis que representam conceitos do domínio sem identidade própria. Sua igualdade é baseada em seus valores, não em uma identidade única. Os testes devem focar na validação de regras de negócio, imutabilidade e comparação por valor. A estratégia principal são testes unitários que garantam que o objeto mantém suas invariantes e que operações não alteram o estado original.

## Estratégias de Teste

Para Value Objects, deve-se testar rigorosamente a validação na criação, garantir que sejam imutáveis, verificar a igualdade por valor e validar operações que retornam novos Value Objects. Como não possuem identidade, dois Value Objects com os mesmos valores devem ser considerados iguais.

## Exemplo Prático: Value Object de CPF

```typescript
// src/domain/value-objects/CPF.ts
export class CPF {
  private readonly _value: string;

  constructor(value: string) {
    const cleanValue = this.clean(value);
    
    if (!this.validate(cleanValue)) {
      throw new Error('Invalid CPF format');
    }
    
    this._value = cleanValue;
  }

  private clean(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  private validate(cpf: string): boolean {
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder: number;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  equals(other: CPF): boolean {
    return this._value === other._value;
  }

  get value(): string {
    return this._value;
  }

  formatted(): string {
    return this._value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}
```

## Testes Unitários

```typescript
// tests/unit/domain/value-objects/CPF.spec.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { CPF } from '../../../../src/domain/value-objects/CPF';

describe('CPF Value Object - Unit Tests', () => {
  
  describe('Creation and Validation', () => {
    it('should create valid CPF', () => {
      const cpf = new CPF('123.456.789-09');
      
      expect(cpf.value).to.equal('12345678909');
    });

    it('should accept CPF without formatting', () => {
      const cpf = new CPF('12345678909');
      
      expect(cpf.value).to.equal('12345678909');
    });

    it('should throw error for invalid CPF', () => {
      expect(() => new CPF('123.456.789-00'))
        .to.throw('Invalid CPF format');
    });

    it('should reject CPF with all same digits', () => {
      expect(() => new CPF('111.111.111-11'))
        .to.throw('Invalid CPF format');
    });

    it('should reject CPF with incorrect length', () => {
      expect(() => new CPF('123.456.789'))
        .to.throw('Invalid CPF format');
    });
  });

  describe('Immutability', () => {
    it('should not allow value modification', () => {
      const cpf = new CPF('123.456.789-09');
      const originalValue = cpf.value;
      
      // Tentativa de modificação não deve afetar o objeto
      const anotherCpf = new CPF('987.654.321-00');
      
      expect(cpf.value).to.equal(originalValue);
    });
  });

  describe('Equality by Value', () => {
    it('should be equal when values are the same', () => {
      const cpf1 = new CPF('123.456.789-09');
      const cpf2 = new CPF('12345678909');
      
      expect(cpf1.equals(cpf2)).to.be.true;
    });

    it('should not be equal when values differ', () => {
      const cpf1 = new CPF('123.456.789-09');
      const cpf2 = new CPF('987.654.321-00');
      
      expect(cpf1.equals(cpf2)).to.be.false;
    });
  });

  describe('Formatting', () => {
    it('should format CPF correctly', () => {
      const cpf = new CPF('12345678909');
      
      expect(cpf.formatted()).to.equal('123.456.789-09');
    });

    it('should maintain original value after formatting', () => {
      const cpf = new CPF('12345678909');
      const formatted = cpf.formatted();
      
      expect(cpf.value).to.equal('12345678909');
    });
  });

  describe('Real World Scenarios', () => {
    const validCPFs = [
      '123.456.789-09',
      '987.654.321-00',
      '111.444.777-35'
    ];

    validCPFs.forEach((cpfValue) => {
      it(`should validate CPF: ${cpfValue}`, () => {
        expect(() => new CPF(cpfValue)).to.not.throw();
      });
    });
  });
});
```

## Pontos-chave

Value Objects devem ser completamente testados em sua validação, pois uma vez criados, garantem que sempre terão valores válidos. A imutabilidade é crucial e deve ser verificada nos testes. A comparação por valor ao invés de referência é um aspecto fundamental que diferencia Value Objects de Entities.
