# Aplicação de Testes em Design Patterns

Sistema completo demonstrando implementação de padrões de design clássicos (Strategy, Factory, Builder, Singleton) com TypeScript e cobertura total de testes.

## Características

- **100% de cobertura de testes** (202 testes passando)
- **Padrões de design clássicos** do Gang of Four (GoF)
- **TypeScript strict mode** com tipagem forte
- **Testes abrangentes** com Mocha, Chai e Sinon
- **Cenários do mundo real** aplicados ao e-commerce
- **Código limpo** seguindo princípios SOLID

## Estrutura de Pastas

```plaintext
src/p2/
├── index.ts                        # Exportações centralizadas
├── DiscountStrategies.ts           # Strategy Pattern - Estratégias de desconto
├── DiscountCalculator.ts           # Strategy Pattern - Contexto
├── NotificationFactory.ts          # Factory Pattern - Criação de notificadores
├── StockService.ts                 # Serviço externo (mockado em testes)
├── OrderBuilder.ts                 # Builder Pattern - Construção de pedidos
└── DatabaseConnection.ts           # Singleton Pattern - Conexão única

tests/p2/
├── DiscountStrategies.test.ts      # 58 testes
├── DiscountCalculator.test.ts      # 25 testes
├── NotificationFactory.test.ts     # 20 testes
├── StockService.test.ts            # 34 testes
├── OrderBuilder.test.ts            # 30 testes
└── DatabaseConnection.test.ts      # 35 testes
```

## Tecnologias

| Tecnologia     | Propósito                          |
| -------------- | ---------------------------------- |
| **TypeScript** | Linguagem com tipagem estática     |
| **Node.js**    | Runtime JavaScript                 |
| **Mocha**      | Framework de testes                |
| **Chai**       | Biblioteca de assertions           |
| **Sinon**      | Mocks, stubs e spies               |
| **ts-node**    | Execução TypeScript sem compilação |
| **c8**         | Cobertura de código                |
| **Biome**      | Linter e formatador                |

## Instalação

```bash
npm install
```

## Scripts Disponíveis

```bash
npm run test:p2           # Executa testes da Parte 2
npm run coverage:p2       # Testes com relatório de cobertura
npm run build             # Compila TypeScript para JavaScript
npm run check             # Verifica lint e formatação
npm run check:fix         # Corrige automaticamente
```

## Padrões de Design Implementados

### 1. Strategy Pattern - Sistema de Descontos

Permite trocar algoritmos de cálculo de desconto em tempo de execução.

**Arquivos:**

- `DiscountStrategies.ts` - Estratégias concretas
- `DiscountCalculator.ts` - Contexto que usa as estratégias

**Estratégias Disponíveis:**

| Estratégia            | Descrição                    | Desconto             |
| --------------------- | ---------------------------- | -------------------- |
| `BlackFridayStrategy` | Promoção Black Friday        | 30% fixo             |
| `CouponStrategy`      | Cupom de desconto com limite | Até 20% do valor     |
| `LoyaltyStrategy`     | Programa de fidelidade       | 2% por ano (máx 20%) |

**Exemplo de uso:**

```typescript
import { DiscountCalculator, BlackFridayStrategy, CouponStrategy } from "./src/p2/index.js"

// Criar calculadora com Black Friday
const calculator = new DiscountCalculator(new BlackFridayStrategy())
const priceWithDiscount = calculator.calculate(1000) // 700

// Trocar para cupom
calculator.setStrategy(new CouponStrategy(150))
const newPrice = calculator.calculate(1000) // 850
```

---

### 2. Factory Pattern - Sistema de Notificações

Centraliza criação de diferentes tipos de notificadores.

**Arquivo:** `NotificationFactory.ts`

**Tipos Suportados:**

- **Email**: Notificações por correio eletrônico
- **SMS**: Mensagens de texto

**Exemplo de uso:**

```typescript
import { NotificationFactory } from "./src/p2/index.js"

// Criar e enviar email
const emailNotifier = NotificationFactory.create("email", "Pedido confirmado!")
console.log(emailNotifier.send())
// Saída: "Enviando Email: Pedido confirmado!"

// Criar e enviar SMS
const smsNotifier = NotificationFactory.create("sms", "Código: 123456")
console.log(smsNotifier.send())
// Saída: "Enviando SMS: Código: 123456"
```

---

### 3. Builder Pattern - Construção de Pedidos

Interface fluente para construir pedidos complexos com validação assíncrona de estoque.

**Arquivos:**

- `OrderBuilder.ts` - Builder com validações
- `StockService.ts` - Serviço de validação de estoque

**Exemplo de uso:**

```typescript
import { OrderBuilder, StockService } from "./src/p2/index.js"

// Mock do serviço (em produção seria real)
StockService.checkStock = async () => true

// Construir pedido
const order = await new OrderBuilder()
  .addProduct("Notebook", 1)
  .addProduct("Mouse", 2)
  .setCustomer("cliente@email.com")
  .build()

console.log(order)
// {
//   customer: "cliente@email.com",
//   products: [
//     { name: "Notebook", quantity: 1 },
//     { name: "Mouse", quantity: 2 }
//   ],
//   status: "created"
// }
```

---

### 4. Singleton Pattern - Conexão com Banco

Garante instância única de conexão com banco de dados.

**Arquivo:** `DatabaseConnection.ts`

**Características:**

- Construtor privado
- Método estático `getInstance()`
- Método `clearInstance()` para testes

**Exemplo de uso:**

```typescript
import { DatabaseConnection } from "./src/p2/index.js"

// Primeira instância
const db1 = DatabaseConnection.getInstance({
  host: "localhost",
  port: 5432,
  database: "mydb"
})

await db1.connect()

// Segunda chamada retorna mesma instância
const db2 = DatabaseConnection.getInstance({
  host: "different",
  port: 3306,
  database: "other"
})

console.log(db1 === db2) // true
console.log(db2.isConnected) // true
```

## Exemplos de Integração

### Fluxo Completo de E-commerce

```typescript
import {
  DatabaseConnection,
  OrderBuilder,
  DiscountCalculator,
  BlackFridayStrategy,
  NotificationFactory,
  StockService
} from "./src/p2/index.js"

async function processarPedido() {
  // 1. Conectar ao banco (Singleton)
  const db = DatabaseConnection.getInstance({
    host: "prod.db.com",
    port: 5432,
    database: "ecommerce"
  })
  await db.connect()

  // 2. Calcular desconto (Strategy)
  const calculator = new DiscountCalculator(new BlackFridayStrategy())
  const valorOriginal = 2500
  const valorComDesconto = calculator.calculate(valorOriginal)
  console.log(`R$ ${valorOriginal} → R$ ${valorComDesconto}`)

  // 3. Construir pedido (Builder)
  const order = await new OrderBuilder()
    .addProduct("Smart TV 55", 1)
    .addProduct("Soundbar", 1)
    .setCustomer("cliente@email.com")
    .build()

  // 4. Enviar notificações (Factory)
  const emailNotifier = NotificationFactory.create(
    "email",
    `Pedido confirmado! Total: R$ ${valorComDesconto}`
  )
  console.log(emailNotifier.send())

  return { success: true, order, total: valorComDesconto }
}
```

### Cliente Fiel com Múltiplos Descontos

```typescript
import {
  DiscountCalculator,
  BlackFridayStrategy,
  LoyaltyStrategy,
  CouponStrategy
} from "./src/p2/index.js"

function aplicarDescontosEmpilhados(valorOriginal: number) {
  // Black Friday (30%)
  const calcBF = new DiscountCalculator(new BlackFridayStrategy())
  const aposBlackFriday = calcBF.calculate(valorOriginal)
  
  // Fidelidade 5 anos (10%)
  const calcFidelidade = new DiscountCalculator(new LoyaltyStrategy(5))
  const aposFidelidade = calcFidelidade.calculate(aposBlackFriday)
  
  // Cupom adicional
  const calcCupom = new DiscountCalculator(new CouponStrategy(50))
  const valorFinal = calcCupom.calculate(aposFidelidade)
  
  return valorFinal
}

aplicarDescontosEmpilhados(1000) // 580 (42% de desconto total)
```

## Cobertura de Testes

### Estatísticas Atuais

```plaintext
Statements   : 100%
Branches     : 100%
Functions    : 100%
Lines        : 100%
Total Tests  : 202 passing
```

### Distribuição de Testes

| Arquivo                       | Testes | Foco                           |
| ----------------------------- | ------ | ------------------------------ |
| `DiscountStrategies.test.ts`  | 58     | Todas as estratégias           |
| `DiscountCalculator.test.ts`  | 25     | Troca de estratégias           |
| `NotificationFactory.test.ts` | 20     | Criação de notificadores       |
| `StockService.test.ts`        | 34     | Mocks e stubs com Sinon        |
| `OrderBuilder.test.ts`        | 30     | Builder e validação assíncrona |
| `DatabaseConnection.test.ts`  | 35     | Singleton e fake timers        |

## Pontos de Destaque Técnicos

### Strategy Pattern - Flexibilidade

Troca dinâmica de algoritmos sem modificar código cliente.

```typescript
const calculator = new DiscountCalculator()

// Usar Black Friday
calculator.setStrategy(new BlackFridayStrategy())
const price1 = calculator.calculate(1000) // 700

// Trocar para fidelidade
calculator.setStrategy(new LoyaltyStrategy(5))
const price2 = calculator.calculate(1000) // 900
```

### Factory Pattern - Extensibilidade

Adicionar novos tipos sem modificar código existente.

```typescript
const NotificationFactory = {
  create(type: "email" | "sms", message: string): Notifier {
    const notifiers = {
      email: () => new EmailNotifier(message),
      sms: () => new SMSNotifier(message),
      // Fácil adicionar: push, whatsapp, etc.
    }
    return notifiers[type]()
  }
}
```

### Builder Pattern - Interface Fluente

Method chaining para construção progressiva.

```typescript
const order = await builder
  .addProduct("Item 1", 1)
  .addProduct("Item 2", 2)
  .setCustomer("email@example.com")
  .build() // Valida estoque aqui
```

### Singleton Pattern - Construtor Privado

Implementação correta com TypeScript.

```typescript
export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null
  
  private constructor(config: DatabaseConfig) {
    this.config = config
  }
  
  static getInstance(config: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config)
    }
    return DatabaseConnection.instance
  }
}
```

### Testes com Sinon - Stubs e Spies

Isolamento de dependências externas.

```typescript
import sinon from "sinon"
import { StockService } from "../../src/p2/StockService.js"

const checkStockStub = sinon.stub(StockService, "checkStock")

// Simular produto disponível
checkStockStub.withArgs("Produto A", 5).resolves(true)

// Simular produto indisponível
checkStockStub.withArgs("Produto B", 10).resolves(false)

// Verificar chamadas
expect(checkStockStub.callCount).to.equal(2)
expect(checkStockStub.firstCall.args).to.deep.equal(["Produto A", 5])
```

### Testes com Fake Timers

Controle de tempo em testes assíncronos.

```typescript
import sinon from "sinon"

const clock = sinon.useFakeTimers()

const instance = DatabaseConnection.getInstance(config)
const connectPromise = instance.connect()

clock.tick(100) // Avança 100ms
await connectPromise

expect(instance.isConnected).to.be.true
clock.restore()
```

## Estrutura de Testes

Cada arquivo possui testes organizados por:

- **Criação e inicialização**: Construtores e factory methods
- **Comportamento básico**: Getters, setters e métodos simples
- **Lógica de negócio**: Cálculos, validações e regras
- **Casos de erro**: Validações e exceções
- **Cenários do mundo real**: Situações práticas do e-commerce
- **Edge cases**: Valores limites e situações extremas
- **Integração**: Interação entre componentes

## Princípios SOLID Aplicados

- Single Responsibility Principle (SRP): Cada classe tem uma única responsabilidade clara.
- Open/Closed Principle (OCP): Extensível via novas estratégias sem modificar código existente.
- Liskov Substitution Principle (LSP): Todas as estratégias são intercambiáveis via interface comum.
- Interface Segregation Principle (ISP): Interfaces pequenas e específicas para cada necessidade.
- Dependency Inversion Principle (DIP): Dependência de abstrações (`DiscountStrategy`), não implementações concretas.

## Quando Usar Cada Padrão

### Strategy Pattern

- Múltiplos algoritmos para mesma tarefa
- Necessidade de trocar comportamento em runtime
- Evitar condicionais complexas (if/else, switch)

**Exemplo real:** Cálculo de frete, métodos de pagamento, estratégias de precificação

### Factory Pattern

- Criação complexa de objetos
- Múltiplos tipos similares
- Centralizar lógica de criação

**Exemplo real:** Criação de diferentes tipos de relatórios, notificações, conexões

### Builder Pattern

- Objetos complexos com muitos parâmetros
- Construção passo a passo
- Validações durante construção

**Exemplo real:** Construção de queries SQL, pedidos, formulários complexos

### Singleton Pattern

- Garantir instância única
- Recursos compartilhados (conexão, cache, logger)
- Controle de acesso global

**Exemplo real:** Conexão com banco, gerenciador de configuração, pool de conexões

## Conclusão

Este projeto demonstra a implementação prática de padrões de design clássicos em TypeScript, com foco em:

- **Código limpo e manutenível**
- **Testes abrangentes e confiáveis**
- **Cenários reais de aplicação**
- **Boas práticas de engenharia de software**

### Resultado Final (Com c8 Coverage)

```plaintext
  DatabaseConnection - Singleton Pattern
    Padrão Singleton
      ✔ deve criar apenas uma instância
      ✔ deve retornar mesma instância via getInstance
      ✔ deve manter consistência com múltiplas chamadas
    Configuração inicial
      ✔ deve usar primeira configuração fornecida
      ✔ deve ignorar configurações subsequentes
    Método connect
      ✔ deve conectar ao banco de dados (111ms)
      ✔ deve ser assíncrono e resolver após delay (105ms)
      ✔ deve permitir múltiplas chamadas de connect (214ms)
    Método clearInstance
      ✔ deve limpar instância singleton
      ✔ deve permitir nova instância após clear
    Cenários do mundo real - Aplicação
      ✔ deve garantir mesma conexão em toda aplicação
      ✔ deve inicializar conexão uma única vez no startup (112ms)
    Cenários do mundo real - Testes
      ✔ deve permitir reinicialização entre testes (103ms)
      ✔ deve isolar ambientes de teste
    Integração com timers
      ✔ deve completar conexão dentro do timeout
      ✔ deve simular delay de conexão realista
    Edge cases
      ✔ deve aceitar configurações mínimas
      ✔ deve manter estado de conexão por instância (108ms)
      ✔ deve resetar estado após clearInstance (106ms)
    Cenários de ambiente
      ✔ deve suportar diferentes configurações por ambiente
      ✔ deve manter configuração em ambiente de produção

  DiscountCalculator - Strategy Pattern
    Construtor e inicialização
      ✔ deve criar calculadora com estratégia padrão BlackFriday
      ✔ deve aceitar estratégia personalizada no construtor
    BlackFridayStrategy
      ✔ deve aplicar 30% de desconto
      ✔ deve funcionar com valores decimais
    CouponStrategy
      ✔ deve aplicar desconto do cupom quando menor que 20% do valor
      ✔ deve limitar desconto a 20% do valor quando cupom é maior
      ✔ deve funcionar com cupom de valor zero
      ✔ deve aplicar cupom completo em valores pequenos
    LoyaltyStrategy
      ✔ deve aplicar 2% por ano de fidelidade
      ✔ deve limitar desconto máximo a 10 anos
      ✔ deve funcionar com 1 ano de fidelidade
      ✔ deve funcionar com zero anos
      ✔ deve aplicar desconto máximo com exatamente 10 anos
    Troca dinâmica de estratégia
      ✔ deve permitir trocar estratégia em tempo de execução
    Cenários do mundo real
      ✔ deve calcular desconto para carrinho de compras na Black Friday
      ✔ deve aplicar cupom de primeira compra
      ✔ deve premiar cliente fiel de longa data

  DiscountStrategies - Estratégias de Desconto
    DiscountStrategy - Classe abstrata
      ✔ deve ser uma classe abstrata que não pode ser instanciada diretamente
      ✔ todas as estratégias concretas devem herdar de DiscountStrategy
      ✔ todas as estratégias devem implementar calculateDiscount
    BlackFridayStrategy
      ✔ deve criar instância corretamente
      ✔ deve calcular 30% de desconto
      ✔ deve funcionar com valores decimais
      ✔ deve retornar zero para valor zero
      ✔ deve funcionar com valores muito grandes
      ✔ deve funcionar com valores muito pequenos
      Cenários do mundo real
        ✔ deve calcular desconto para carrinho médio
        ✔ deve calcular desconto para carrinho grande
        ✔ deve calcular desconto para produto individual
    CouponStrategy
      ✔ deve criar instância com valor do cupom
      ✔ deve aplicar valor do cupom quando menor que 20%
      ✔ deve limitar desconto a 20% quando cupom é maior
      ✔ deve aplicar cupom completo em compras pequenas
      ✔ deve funcionar com cupom de valor zero
      ✔ deve funcionar com valores decimais
      Diferentes valores de cupom
        ✔ deve funcionar com cupom de R$ 10
        ✔ deve funcionar com cupom de R$ 50
        ✔ deve funcionar com cupom de R$ 200
      Cenários do mundo real
        ✔ deve aplicar cupom de primeira compra (R$ 20)
        ✔ deve aplicar cupom promocional (R$ 100)
        ✔ deve limitar cupom grande em compra pequena
    LoyaltyStrategy
      ✔ deve criar instância com anos de fidelidade
      ✔ deve calcular 2% por ano de fidelidade
      ✔ deve limitar desconto máximo a 10 anos (20%)
      ✔ deve retornar zero desconto para zero anos
      ✔ deve funcionar com valores decimais
      Progressão de fidelidade
        ✔ deve aumentar desconto progressivamente
        ✔ deve manter desconto máximo após 10 anos
      Cenários do mundo real
        ✔ deve premiar cliente novo (1 ano)
        ✔ deve premiar cliente regular (5 anos)
        ✔ deve premiar cliente fiel (10 anos)
        ✔ deve premiar cliente veterano (15 anos)
    Comparação entre estratégias
      ✔ deve calcular diferentes descontos para mesmo valor
      ✔ BlackFriday deve dar maior desconto em valores altos
      ✔ Cupom pode ser mais vantajoso em compras pequenas
    Edge cases e validações
      ✔ deve funcionar com valores negativos (caso de devolução)
      ✔ deve funcionar com valores muito pequenos
      ✔ deve funcionar com valores muito grandes
      ✔ LoyaltyStrategy deve aceitar anos negativos (tratado como zero)

  NotificationFactory - Factory Pattern
    Criação de notificadores
      ✔ deve criar notificador de email
      ✔ deve criar notificador de SMS
      ✔ deve lançar erro para tipo inválido
    Envio de notificações - Email
      ✔ deve enviar email com mensagem padrão
      ✔ deve enviar email com mensagem personalizada
      ✔ deve enviar email de confirmação de pedido
    Envio de notificações - SMS
      ✔ deve enviar SMS com mensagem padrão
      ✔ deve enviar SMS com mensagem personalizada
      ✔ deve enviar SMS de notificação de entrega
    Cenários do mundo real
      ✔ deve notificar novo usuário por email
      ✔ deve enviar código 2FA por SMS
      ✔ deve enviar confirmação de pagamento por email
      ✔ deve notificar entrega iminente por SMS
    Validação de tipos
      ✔ deve aceitar apenas tipos válidos
      ✔ deve rejeitar tipos inválidos
    Mensagens vazias e especiais
      ✔ deve aceitar mensagem vazia
      ✔ deve aceitar mensagem com caracteres especiais
      ✔ deve aceitar mensagem com quebras de linha

  OrderBuilder - Builder Pattern com Stubs
    Construção básica de pedidos
      ✔ deve criar builder vazio
      ✔ deve adicionar produto ao pedido
      ✔ deve definir cliente do pedido
    Interface fluente
      ✔ deve permitir encadeamento de métodos
      ✔ deve construir pedido com múltiplos produtos
    Validação de estoque
      ✔ deve verificar estoque para cada produto
      ✔ deve lançar erro quando produto não tem estoque
      ✔ deve validar estoque apenas dos produtos sem estoque
    Estrutura do pedido gerado
      ✔ deve gerar pedido com estrutura correta
      ✔ deve manter informações dos produtos
      ✔ deve permitir pedido sem cliente definido
    Cenários do mundo real - E-commerce
      ✔ deve processar pedido típico de cliente
      ✔ deve bloquear pedido quando item principal está indisponível
      ✔ deve processar pedido corporativo com múltiplas unidades
    Cenários do mundo real - Validação de estoque
      ✔ deve validar estoque antes de confirmar Black Friday
      ✔ deve rejeitar pedido quando estoque acaba durante promoção
    Edge cases
      ✔ deve construir pedido sem produtos
      ✔ deve permitir produtos com quantidade zero
      ✔ deve permitir adicionar mesmo produto múltiplas vezes
    Testes de integração com StockService
      ✔ deve chamar StockService com parâmetros corretos
      ✔ deve respeitar retorno do StockService
      ✔ deve parar na primeira falha de estoque

  StockService - Serviço de Estoque
    Comportamento padrão
      ✔ deve existir como classe
      ✔ deve ter método estático checkStock
      ✔ deve lançar erro quando chamado diretamente
      ✔ deve ser método assíncrono
    Stub com Sinon - Simulação de comportamento
      ✔ deve permitir stub para retornar true
      ✔ deve permitir stub para retornar false
      ✔ deve permitir múltiplos stubs com comportamentos diferentes
      ✔ deve rastrear chamadas ao método
      ✔ deve permitir verificar se método foi chamado
    Cenários de teste com stub
      ✔ deve simular produto disponível em estoque
      ✔ deve simular produto indisponível
      ✔ deve simular estoque insuficiente para quantidade solicitada
      ✔ deve simular verificação de múltiplos produtos
    Simulação de cenários reais de e-commerce
      ✔ deve simular Black Friday com estoque limitado
      ✔ deve simular pedido corporativo com grande quantidade
      ✔ deve simular reposição de estoque
      ✔ deve simular carrinho com mix de produtos disponíveis e indisponíveis
    Testes de integração com OrderBuilder
      ✔ deve ser usado pelo OrderBuilder para validar estoque
      ✔ deve prevenir criação de pedido quando estoque insuficiente
    Comportamento de erro e exceções
      ✔ deve permitir simular erro de conexão com banco
      ✔ deve permitir simular timeout
    Edge cases
      ✔ deve aceitar quantidade zero
      ✔ deve aceitar quantidade negativa (caso de devolução)
      ✔ deve aceitar nomes de produtos vazios
      ✔ deve aceitar nomes de produtos com caracteres especiais
      ✔ deve aceitar quantidades muito grandes
    Verificação de chamadas e argumentos
      ✔ deve verificar ordem das chamadas
      ✔ deve verificar se não foi chamado
      ✔ deve verificar chamadas com argumentos específicos
      ✔ deve resetar histórico de chamadas
    Documentação do padrão de uso
      ✔ deve demonstrar como mockar para testes
      ✔ deve demonstrar como simular diferentes cenários


  153 passing (1s)

------------------------|---------|----------|---------|---------|-------------------
| File                     | % Stmts   | % Branch   | % Funcs   | % Lines   | Uncovered Line #s   |
| ------------------------ | --------- | ---------- | --------- | --------- | ------------------- |
| All files                | 100       | 100        | 100       | 100       |
| DatabaseConnection.ts    | 100       | 100        | 100       | 100       |
| DiscountCalculator.ts    | 100       | 100        | 100       | 100       |
| DiscountStrategies.ts    | 100       | 100        | 100       | 100       |
| NotificationFactory.ts   | 100       | 100        | 100       | 100       |
| OrderBuilder.ts          | 100       | 100        | 100       | 100       |
| StockService.ts          | 100       | 100        | 100       | 100       |
| ------------------------ | --------- | ---------- | --------- | --------- | ------------------- |
```
