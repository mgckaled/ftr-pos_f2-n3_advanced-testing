# Testes Unitários - Aplicação no Nível Mais Granular

## Índice

- [Testes Unitários - Aplicação no Nível Mais Granular](#testes-unitários---aplicação-no-nível-mais-granular)
  - [Índice](#índice)
  - [Introdução](#introdução)
  - [Conceitos Fundamentais](#conceitos-fundamentais)
    - [Características de um Bom Teste Unitário](#características-de-um-bom-teste-unitário)
    - [Padrão AAA (Arrange-Act-Assert)](#padrão-aaa-arrange-act-assert)
  - [Configuração Inicial](#configuração-inicial)
  - [Exemplos Práticos](#exemplos-práticos)
    - [Exemplo 1: Validação de Email](#exemplo-1-validação-de-email)
    - [Exemplo 2: Cálculo de Desconto com Regras de Negócio](#exemplo-2-cálculo-de-desconto-com-regras-de-negócio)
    - [Exemplo 3: Uso de Mocks e Stubs com Sinon](#exemplo-3-uso-de-mocks-e-stubs-com-sinon)
    - [Exemplo 4: Teste de Classe com Estado Interno](#exemplo-4-teste-de-classe-com-estado-interno)
  - [Boas Práticas](#boas-práticas)
    - [1. Nomenclatura Descritiva](#1-nomenclatura-descritiva)
    - [2. Um Comportamento por Teste](#2-um-comportamento-por-teste)
    - [3. Evitar Lógica nos Testes](#3-evitar-lógica-nos-testes)
    - [4. Isolamento com beforeEach e afterEach](#4-isolamento-com-beforeeach-e-aftereach)
  - [Execução dos Testes](#execução-dos-testes)
  - [Conclusão](#conclusão)

## Introdução

Testes unitários são a base da pirâmide de testes de software, representando a forma mais granular de validação de código. Eles focam em testar unidades individuais de código, geralmente métodos ou funções isoladas, de forma independente de suas dependências externas.

O conceito fundamental é garantir que cada pequena parte do sistema funcione corretamente de forma isolada, antes de integrar com outras partes. Isso permite identificar bugs precocemente, facilita refatorações e serve como documentação viva do comportamento esperado do código.

## Conceitos Fundamentais

### Características de um Bom Teste Unitário

- **Isolamento**: Testa apenas uma unidade de código, sem dependências externas
- **Rapidez**: Executa em milissegundos
- **Repetibilidade**: Sempre produz o mesmo resultado
- **Independência**: Não depende da ordem de execução
- **Clareza**: Deve ser fácil entender o que está sendo testado

### Padrão AAA (Arrange-Act-Assert)

Estrutura recomendada para organizar testes:

1. **Arrange**: Preparar os dados e configurações necessárias
2. **Act**: Executar a ação que está sendo testada
3. **Assert**: Verificar se o resultado é o esperado

## Configuração Inicial

Instalação dos pacotes necessários:

```bash
npm install --save-dev mocha @types/mocha chai @types/chai sinon @types/sinon ts-node
```

Configuração do `mocha` no `package.json`:

```json
{
  "scripts": {
    "test": "mocha -r ts-node/register 'tests/**/*.test.ts'"
  }
}
```

## Exemplos Práticos

### Exemplo 1: Validação de Email

Cenário comum: validar formato de email em um sistema de cadastro.

```typescript
// src/validators/emailValidator.ts
export class EmailValidator {
  validate(email: string): boolean {
    if (!email || email.trim() === '') {
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  getDomain(email: string): string | null {
    if (!this.validate(email)) {
      return null;
    }
    return email.split('@')[1];
  }
}
```

```typescript
// tests/validators/emailValidator.test.ts
import { expect } from 'chai';
import { EmailValidator } from '../../src/validators/emailValidator';

describe('EmailValidator', () => {
  let validator: EmailValidator;

  beforeEach(() => {
    // Arrange: Instancia o validador antes de cada teste
    validator = new EmailValidator();
  });

  describe('validate()', () => {
    it('deve retornar true para email válido', () => {
      // Act
      const result = validator.validate('usuario@exemplo.com.br');
      
      // Assert
      expect(result).to.be.true;
    });

    it('deve retornar false para email sem @', () => {
      const result = validator.validate('usuarioexemplo.com');
      expect(result).to.be.false;
    });

    it('deve retornar false para email vazio', () => {
      const result = validator.validate('');
      expect(result).to.be.false;
    });

    it('deve retornar false para string com apenas espaços', () => {
      const result = validator.validate('   ');
      expect(result).to.be.false;
    });
  });

  describe('getDomain()', () => {
    it('deve retornar o domínio de um email válido', () => {
      const domain = validator.getDomain('usuario@exemplo.com.br');
      expect(domain).to.equal('exemplo.com.br');
    });

    it('deve retornar null para email inválido', () => {
      const domain = validator.getDomain('email-invalido');
      expect(domain).to.be.null;
    });
  });
});
```

### Exemplo 2: Cálculo de Desconto com Regras de Negócio

Cenário real: sistema de e-commerce com diferentes tipos de desconto.

```typescript
// src/services/discountCalculator.ts
export enum CustomerType {
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP'
}

export class DiscountCalculator {
  calculate(amount: number, customerType: CustomerType): number {
    if (amount < 0) {
      throw new Error('Valor não pode ser negativo');
    }

    let discountPercentage = 0;

    switch (customerType) {
      case CustomerType.REGULAR:
        discountPercentage = amount > 1000 ? 5 : 0;
        break;
      case CustomerType.PREMIUM:
        discountPercentage = amount > 500 ? 10 : 5;
        break;
      case CustomerType.VIP:
        discountPercentage = 15;
        break;
    }

    return amount * (1 - discountPercentage / 100);
  }
}
```

```typescript
// tests/services/discountCalculator.test.ts
import { expect } from 'chai';
import { DiscountCalculator, CustomerType } from '../../src/services/discountCalculator';

describe('DiscountCalculator', () => {
  let calculator: DiscountCalculator;

  beforeEach(() => {
    calculator = new DiscountCalculator();
  });

  describe('Cliente REGULAR', () => {
    it('não deve aplicar desconto para compras abaixo de 1000', () => {
      const result = calculator.calculate(999, CustomerType.REGULAR);
      expect(result).to.equal(999);
    });

    it('deve aplicar 5% de desconto para compras acima de 1000', () => {
      const result = calculator.calculate(1000, CustomerType.REGULAR);
      expect(result).to.equal(950);
    });
  });

  describe('Cliente PREMIUM', () => {
    it('deve aplicar 5% de desconto para compras abaixo de 500', () => {
      const result = calculator.calculate(400, CustomerType.PREMIUM);
      expect(result).to.equal(380);
    });

    it('deve aplicar 10% de desconto para compras acima de 500', () => {
      const result = calculator.calculate(600, CustomerType.PREMIUM);
      expect(result).to.equal(540);
    });
  });

  describe('Cliente VIP', () => {
    it('deve aplicar 15% de desconto independente do valor', () => {
      const result = calculator.calculate(100, CustomerType.VIP);
      expect(result).to.equal(85);
    });
  });

  describe('Validações', () => {
    it('deve lançar erro para valores negativos', () => {
      expect(() => calculator.calculate(-10, CustomerType.REGULAR))
        .to.throw('Valor não pode ser negativo');
    });
  });
});
```

### Exemplo 3: Uso de Mocks e Stubs com Sinon

Cenário: serviço que depende de uma API externa para buscar taxa de câmbio.

```typescript
// src/services/currencyConverter.ts
export interface ExchangeRateAPI {
  getRate(from: string, to: string): Promise<number>;
}

export class CurrencyConverter {
  constructor(private api: ExchangeRateAPI) {}

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (amount < 0) {
      throw new Error('Valor deve ser positivo');
    }

    if (from === to) {
      return amount;
    }

    const rate = await this.api.getRate(from, to);
    return amount * rate;
  }
}
```

```typescript
// tests/services/currencyConverter.test.ts
import { expect } from 'chai';
import * as sinon from 'sinon';
import { CurrencyConverter, ExchangeRateAPI } from '../../src/services/currencyConverter';

describe('CurrencyConverter', () => {
  let converter: CurrencyConverter;
  let mockApi: sinon.SinonStubbedInstance<ExchangeRateAPI>;

  beforeEach(() => {
    // Arrange: Cria um mock da API externa
    mockApi = {
      getRate: sinon.stub()
    };
    converter = new CurrencyConverter(mockApi);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deve converter USD para BRL usando taxa da API', async () => {
    // Arrange
    mockApi.getRate.withArgs('USD', 'BRL').resolves(5.0);

    // Act
    const result = await converter.convert(100, 'USD', 'BRL');

    // Assert
    expect(result).to.equal(500);
    expect(mockApi.getRate.calledOnce).to.be.true;
    expect(mockApi.getRate.calledWith('USD', 'BRL')).to.be.true;
  });

  it('deve retornar o mesmo valor quando moedas são iguais', async () => {
    const result = await converter.convert(100, 'USD', 'USD');
    
    expect(result).to.equal(100);
    expect(mockApi.getRate.called).to.be.false;
  });

  it('deve lançar erro para valores negativos', async () => {
    try {
      await converter.convert(-50, 'USD', 'BRL');
      expect.fail('Deveria ter lançado erro');
    } catch (error) {
      expect(error.message).to.equal('Valor deve ser positivo');
    }
  });

  it('deve propagar erro da API', async () => {
    // Arrange
    mockApi.getRate.rejects(new Error('API indisponível'));

    // Act & Assert
    try {
      await converter.convert(100, 'USD', 'BRL');
      expect.fail('Deveria ter lançado erro');
    } catch (error) {
      expect(error.message).to.equal('API indisponível');
    }
  });
});
```

### Exemplo 4: Teste de Classe com Estado Interno

Cenário: carrinho de compras com manipulação de estado.

```typescript
// src/models/shoppingCart.ts
export interface Product {
  id: string;
  name: string;
  price: number;
}

export class ShoppingCart {
  private items: Map<string, { product: Product; quantity: number }> = new Map();

  addItem(product: Product, quantity: number = 1): void {
    if (quantity <= 0) {
      throw new Error('Quantidade deve ser maior que zero');
    }

    const existing = this.items.get(product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.set(product.id, { product, quantity });
    }
  }

  removeItem(productId: string): boolean {
    return this.items.delete(productId);
  }

  getTotal(): number {
    let total = 0;
    for (const { product, quantity } of this.items.values()) {
      total += product.price * quantity;
    }
    return total;
  }

  getItemCount(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }
}
```

```typescript
// tests/models/shoppingCart.test.ts
import { expect } from 'chai';
import { ShoppingCart, Product } from '../../src/models/shoppingCart';

describe('ShoppingCart', () => {
  let cart: ShoppingCart;
  let product1: Product;
  let product2: Product;

  beforeEach(() => {
    cart = new ShoppingCart();
    product1 = { id: '1', name: 'Notebook', price: 3000 };
    product2 = { id: '2', name: 'Mouse', price: 50 };
  });

  describe('addItem()', () => {
    it('deve adicionar produto ao carrinho', () => {
      cart.addItem(product1);
      expect(cart.getItemCount()).to.equal(1);
    });

    it('deve incrementar quantidade de produto existente', () => {
      cart.addItem(product1, 2);
      cart.addItem(product1, 3);
      
      expect(cart.getItemCount()).to.equal(1);
      expect(cart.getTotal()).to.equal(3000 * 5);
    });

    it('deve lançar erro para quantidade inválida', () => {
      expect(() => cart.addItem(product1, 0))
        .to.throw('Quantidade deve ser maior que zero');
    });
  });

  describe('removeItem()', () => {
    it('deve remover produto do carrinho', () => {
      cart.addItem(product1);
      const removed = cart.removeItem(product1.id);
      
      expect(removed).to.be.true;
      expect(cart.getItemCount()).to.equal(0);
    });

    it('deve retornar false ao remover produto inexistente', () => {
      const removed = cart.removeItem('999');
      expect(removed).to.be.false;
    });
  });

  describe('getTotal()', () => {
    it('deve calcular total com múltiplos produtos', () => {
      cart.addItem(product1, 2);
      cart.addItem(product2, 5);
      
      const expected = (3000 * 2) + (50 * 5);
      expect(cart.getTotal()).to.equal(expected);
    });

    it('deve retornar zero para carrinho vazio', () => {
      expect(cart.getTotal()).to.equal(0);
    });
  });

  describe('clear()', () => {
    it('deve limpar todos os itens do carrinho', () => {
      cart.addItem(product1);
      cart.addItem(product2);
      cart.clear();
      
      expect(cart.getItemCount()).to.equal(0);
      expect(cart.getTotal()).to.equal(0);
    });
  });
});
```

## Boas Práticas

### 1. Nomenclatura Descritiva

Use descrições claras do comportamento esperado:

```typescript
// Ruim
it('teste 1', () => { ... });

// Bom
it('deve retornar erro quando email está em formato inválido', () => { ... });
```

### 2. Um Comportamento por Teste

Evite testar múltiplos cenários em um único teste:

```typescript
// Ruim
it('deve validar email', () => {
  expect(validator.validate('teste@exemplo.com')).to.be.true;
  expect(validator.validate('')).to.be.false;
  expect(validator.validate('invalido')).to.be.false;
});

// Bom - separar em testes distintos
it('deve retornar true para email válido', () => { ... });
it('deve retornar false para email vazio', () => { ... });
it('deve retornar false para email sem @', () => { ... });
```

### 3. Evitar Lógica nos Testes

Testes devem ser simples e diretos:

```typescript
// Ruim
it('teste com lógica', () => {
  const results = [];
  for (let i = 0; i < 10; i++) {
    results.push(calculator.calculate(i));
  }
  expect(results.every(r => r >= 0)).to.be.true;
});

// Bom
it('deve retornar valor positivo para entrada zero', () => {
  expect(calculator.calculate(0)).to.be.at.least(0);
});
```

### 4. Isolamento com beforeEach e afterEach

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockDatabase: sinon.SinonStubbedInstance<Database>;

  beforeEach(() => {
    mockDatabase = sinon.createStubInstance(Database);
    service = new UserService(mockDatabase);
  });

  afterEach(() => {
    sinon.restore();
  });

  // ... testes
});
```

## Execução dos Testes

```bash
# Executar todos os testes
npm test

# Executar testes específicos
npm test -- --grep "EmailValidator"

# Executar com cobertura
npm test -- --coverage
```

## Conclusão

Testes unitários são fundamentais para garantir a qualidade do código no nível mais granular. Ao aplicar os conceitos de isolamento, usar ferramentas como Mocha, Chai e Sinon, e seguir boas práticas, você constrói uma base sólida que facilita manutenção, refatoração e evolução do software com confiança.
