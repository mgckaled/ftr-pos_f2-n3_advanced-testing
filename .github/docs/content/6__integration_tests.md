# Testes de Integração - Aplicação no Nível Intermediário

## Índice

- [Testes de Integração - Aplicação no Nível Intermediário](#testes-de-integração---aplicação-no-nível-intermediário)
  - [Índice](#índice)
  - [Introdução](#introdução)
  - [Fundamentos e Conceitos](#fundamentos-e-conceitos)
  - [Configuração do Ambiente com Mocha](#configuração-do-ambiente-com-mocha)
  - [Exemplo Prático 1: Testando Integração com Banco de Dados](#exemplo-prático-1-testando-integração-com-banco-de-dados)
  - [Exemplo Prático 2: Testando Integração com API Externa](#exemplo-prático-2-testando-integração-com-api-externa)
  - [Exemplo Prático 3: Testando Fluxo Completo entre Múltiplos Componentes](#exemplo-prático-3-testando-fluxo-completo-entre-múltiplos-componentes)
  - [Boas Práticas e Considerações](#boas-práticas-e-considerações)
  - [Conclusão](#conclusão)

## Introdução

Testes de integração representam uma camada fundamental na pirâmide de testes de software, posicionando-se estrategicamente entre os testes unitários e os testes end-to-end. Enquanto os testes unitários verificam componentes isolados, os testes de integração validam a comunicação e o comportamento conjunto de múltiplos módulos ou serviços trabalhando em conjunto.

No contexto do desenvolvimento moderno, esses testes garantem que diferentes partes da aplicação consigam interagir corretamente, incluindo bancos de dados, APIs externas, sistemas de mensageria e outros serviços. O objetivo principal é identificar problemas que surgem na interface entre componentes, como incompatibilidades de contrato, erros de serialização ou falhas de comunicação.

## Fundamentos e Conceitos

A diferença essencial entre testes unitários e de integração reside no escopo. Um teste unitário isola completamente uma função ou classe, substituindo todas as dependências por mocks ou stubs. Já o teste de integração permite que pelo menos algumas dessas dependências sejam reais, verificando se a orquestração entre componentes funciona conforme esperado.

Existem diferentes abordagens para testes de integração. A abordagem "big bang" testa todos os componentes de uma vez, mas pode dificultar a identificação de problemas. A abordagem incremental, mais recomendada, integra e testa componentes progressivamente, seja de cima para baixo (top-down) ou de baixo para cima (bottom-up).

No nível intermediário, é importante compreender quando usar cada tipo de teste. Testes de integração são especialmente valiosos para validar fluxos de dados complexos, interações com bancos de dados, chamadas a APIs externas e processamento assíncrono.

## Configuração do Ambiente com Mocha

Para implementar testes de integração eficazes, utilizaremos o Mocha como framework principal, complementado pelo Chai para asserções expressivas e pelo Sinon quando necessário para criar stubs de serviços externos.

```typescript
// package.json (dependências relevantes)
{
  "devDependencies": {
    "@types/mocha": "^10.0.6",
    "@types/chai": "^4.3.11",
    "@types/sinon": "^17.0.2",
    "mocha": "^10.2.0",
    "chai": "^4.3.10",
    "sinon": "^17.0.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

A configuração do Mocha para TypeScript requer um arquivo de configuração adequado que permita a execução direta de arquivos TypeScript durante os testes.

```typescript
// .mocharc.json
{
  "require": ["ts-node/register"],
  "extensions": ["ts"],
  "spec": ["test/**/*.test.ts"],
  "timeout": 5000
}
```

## Exemplo Prático 1: Testando Integração com Banco de Dados

Um cenário comum no dia a dia do desenvolvedor envolve testar se a camada de serviço interage corretamente com o repositório de dados. Considere um sistema de gerenciamento de pedidos onde precisamos validar que a criação de um pedido persiste os dados corretamente e retorna o objeto esperado.

```typescript
// src/services/OrderService.ts
import { OrderRepository } from '../repositories/OrderRepository';

export interface Order {
  id?: string;
  customerId: string;
  items: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped';
  createdAt?: Date;
}

export class OrderService {
  constructor(private orderRepository: OrderRepository) {}

  async createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    // Validação de negócio
    if (orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    if (orderData.totalAmount <= 0) {
      throw new Error('Total amount must be greater than zero');
    }

    // Persiste o pedido através do repositório
    const savedOrder = await this.orderRepository.save({
      ...orderData,
      createdAt: new Date()
    });

    return savedOrder;
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orderRepository.findById(orderId);
  }
}
```

O teste de integração verifica se o serviço e o repositório funcionam harmoniosamente, sem mockar completamente o repositório. Em ambientes de teste, podemos usar um banco de dados em memória ou uma instância de teste isolada.

```typescript
// test/integration/OrderService.test.ts
import { expect } from 'chai';
import { OrderService } from '../../src/services/OrderService';
import { OrderRepository } from '../../src/repositories/OrderRepository';
import { DatabaseConnection } from '../../src/database/DatabaseConnection';

describe('OrderService Integration Tests', () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;
  let dbConnection: DatabaseConnection;

  // Configuração antes de todos os testes
  before(async () => {
    // Conecta ao banco de teste
    dbConnection = new DatabaseConnection('test-database');
    await dbConnection.connect();
    
    orderRepository = new OrderRepository(dbConnection);
    orderService = new OrderService(orderRepository);
  });

  // Limpeza após cada teste para garantir isolamento
  afterEach(async () => {
    await dbConnection.clearAllData();
  });

  // Desconecta após todos os testes
  after(async () => {
    await dbConnection.disconnect();
  });

  it('deve criar um pedido e persistir corretamente no banco', async () => {
    const orderData = {
      customerId: 'customer-123',
      items: ['item-1', 'item-2'],
      totalAmount: 150.00,
      status: 'pending' as const
    };

    // Executa a operação
    const createdOrder = await orderService.createOrder(orderData);

    // Verifica se o pedido foi criado com ID
    expect(createdOrder.id).to.exist;
    expect(createdOrder.customerId).to.equal('customer-123');
    expect(createdOrder.items).to.have.lengthOf(2);
    expect(createdOrder.totalAmount).to.equal(150.00);
    expect(createdOrder.createdAt).to.be.instanceOf(Date);

    // Verifica se o pedido realmente foi persistido
    const retrievedOrder = await orderService.getOrderById(createdOrder.id!);
    expect(retrievedOrder).to.not.be.null;
    expect(retrievedOrder?.customerId).to.equal('customer-123');
  });

  it('deve lançar erro ao tentar criar pedido sem itens', async () => {
    const invalidOrder = {
      customerId: 'customer-456',
      items: [],
      totalAmount: 100.00,
      status: 'pending' as const
    };

    try {
      await orderService.createOrder(invalidOrder);
      expect.fail('Deveria ter lançado um erro');
    } catch (error) {
      expect((error as Error).message).to.equal('Order must contain at least one item');
    }
  });
});
```

## Exemplo Prático 2: Testando Integração com API Externa

Outro desafio comum envolve testar serviços que dependem de APIs externas. Aqui, o teste de integração verifica se o serviço consome corretamente a API, trata erros apropriadamente e transforma os dados conforme necessário. Para APIs externas reais, usamos o Sinon para criar stubs controlados.

```typescript
// src/services/PaymentService.ts
import axios, { AxiosInstance } from 'axios';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'approved' | 'declined' | 'pending';
  processedAt: Date;
}

export class PaymentService {
  private httpClient: AxiosInstance;

  constructor(baseURL: string) {
    this.httpClient = axios.create({
      baseURL,
      timeout: 5000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async processPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await this.httpClient.post('/payments', paymentRequest);
      
      return {
        transactionId: response.data.transaction_id,
        status: response.data.status,
        processedAt: new Date(response.data.processed_at)
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        throw new Error('Invalid payment request');
      }
      throw new Error('Payment processing failed');
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<string> {
    const response = await this.httpClient.get(`/payments/${transactionId}`);
    return response.data.status;
  }
}
```

O teste de integração para este serviço verifica a comunicação HTTP completa, incluindo serialização de requisições, deserialização de respostas e tratamento de erros.

```typescript
// test/integration/PaymentService.test.ts
import { expect } from 'chai';
import sinon from 'sinon';
import axios from 'axios';
import { PaymentService } from '../../src/services/PaymentService';

describe('PaymentService Integration Tests', () => {
  let paymentService: PaymentService;
  let axiosStub: sinon.SinonStub;

  beforeEach(() => {
    paymentService = new PaymentService('https://api-payment.example.com');
    // Cria stub para interceptar chamadas HTTP
    axiosStub = sinon.stub(axios, 'create').returns({
      post: sinon.stub(),
      get: sinon.stub()
    } as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deve processar pagamento e retornar resposta formatada', async () => {
    const mockResponse = {
      data: {
        transaction_id: 'txn-789',
        status: 'approved',
        processed_at: '2025-10-22T10:30:00Z'
      }
    };

    // Configura o comportamento do stub
    const postStub = axiosStub().post as sinon.SinonStub;
    postStub.resolves(mockResponse);

    const paymentRequest = {
      orderId: 'order-123',
      amount: 250.00,
      currency: 'BRL',
      paymentMethod: 'credit_card'
    };

    const result = await paymentService.processPayment(paymentRequest);

    // Verifica se a requisição foi feita corretamente
    expect(postStub.calledOnce).to.be.true;
    expect(postStub.firstCall.args[0]).to.equal('/payments');
    expect(postStub.firstCall.args[1]).to.deep.equal(paymentRequest);

    // Verifica se a resposta foi transformada corretamente
    expect(result.transactionId).to.equal('txn-789');
    expect(result.status).to.equal('approved');
    expect(result.processedAt).to.be.instanceOf(Date);
  });

  it('deve tratar erro 400 da API apropriadamente', async () => {
    const postStub = axiosStub().post as sinon.SinonStub;
    const axiosError = {
      isAxiosError: true,
      response: { status: 400 }
    };
    postStub.rejects(axiosError);

    const invalidRequest = {
      orderId: 'order-456',
      amount: -10,
      currency: 'BRL',
      paymentMethod: 'invalid'
    };

    try {
      await paymentService.processPayment(invalidRequest);
      expect.fail('Deveria ter lançado erro');
    } catch (error) {
      expect((error as Error).message).to.equal('Invalid payment request');
    }
  });
});
```

## Exemplo Prático 3: Testando Fluxo Completo entre Múltiplos Componentes

No cenário mais realista, testamos um fluxo completo que envolve múltiplos serviços trabalhando juntos. Este exemplo demonstra como um controlador orquestra a criação de pedido e o processamento de pagamento.

```typescript
// src/controllers/CheckoutController.ts
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';

export interface CheckoutRequest {
  customerId: string;
  items: string[];
  totalAmount: number;
  paymentMethod: string;
}

export interface CheckoutResponse {
  orderId: string;
  transactionId: string;
  status: string;
}

export class CheckoutController {
  constructor(
    private orderService: OrderService,
    private paymentService: PaymentService
  ) {}

  async processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    // Etapa 1: Criar o pedido
    const order = await this.orderService.createOrder({
      customerId: request.customerId,
      items: request.items,
      totalAmount: request.totalAmount,
      status: 'pending'
    });

    try {
      // Etapa 2: Processar o pagamento
      const payment = await this.paymentService.processPayment({
        orderId: order.id!,
        amount: request.totalAmount,
        currency: 'BRL',
        paymentMethod: request.paymentMethod
      });

      // Etapa 3: Retornar resultado consolidado
      return {
        orderId: order.id!,
        transactionId: payment.transactionId,
        status: payment.status
      };
    } catch (error) {
      // Em caso de falha no pagamento, o pedido permanece com status pending
      throw new Error(`Checkout failed: ${(error as Error).message}`);
    }
  }
}
```

O teste de integração para este controlador verifica todo o fluxo, desde a criação do pedido até o processamento do pagamento, garantindo que os componentes trabalham harmoniosamente.

```typescript
// test/integration/CheckoutController.test.ts
import { expect } from 'chai';
import sinon from 'sinon';
import { CheckoutController } from '../../src/controllers/CheckoutController';
import { OrderService } from '../../src/services/OrderService';
import { PaymentService } from '../../src/services/PaymentService';
import { OrderRepository } from '../../src/repositories/OrderRepository';
import { DatabaseConnection } from '../../src/database/DatabaseConnection';

describe('CheckoutController Integration Tests', () => {
  let checkoutController: CheckoutController;
  let orderService: OrderService;
  let paymentService: PaymentService;
  let dbConnection: DatabaseConnection;
  let paymentStub: sinon.SinonStub;

  before(async () => {
    // Configura componentes reais para ordem
    dbConnection = new DatabaseConnection('test-database');
    await dbConnection.connect();
    
    const orderRepository = new OrderRepository(dbConnection);
    orderService = new OrderService(orderRepository);

    // Configura stub para pagamento (serviço externo)
    paymentService = new PaymentService('https://api-payment.example.com');
    paymentStub = sinon.stub(paymentService, 'processPayment');

    checkoutController = new CheckoutController(orderService, paymentService);
  });

  afterEach(async () => {
    await dbConnection.clearAllData();
    paymentStub.reset();
  });

  after(async () => {
    await dbConnection.disconnect();
    sinon.restore();
  });

  it('deve completar checkout com sucesso criando pedido e processando pagamento', async () => {
    // Configura resposta do serviço de pagamento
    paymentStub.resolves({
      transactionId: 'txn-success-123',
      status: 'approved',
      processedAt: new Date()
    });

    const checkoutRequest = {
      customerId: 'customer-999',
      items: ['product-A', 'product-B'],
      totalAmount: 300.00,
      paymentMethod: 'credit_card'
    };

    // Executa o fluxo completo
    const result = await checkoutController.processCheckout(checkoutRequest);

    // Verifica resultado consolidado
    expect(result.orderId).to.exist;
    expect(result.transactionId).to.equal('txn-success-123');
    expect(result.status).to.equal('approved');

    // Verifica que o pedido foi realmente criado no banco
    const savedOrder = await orderService.getOrderById(result.orderId);
    expect(savedOrder).to.not.be.null;
    expect(savedOrder?.customerId).to.equal('customer-999');
    expect(savedOrder?.items).to.have.lengthOf(2);

    // Verifica que o pagamento foi chamado com os dados corretos
    expect(paymentStub.calledOnce).to.be.true;
    const paymentCall = paymentStub.firstCall.args[0];
    expect(paymentCall.orderId).to.equal(result.orderId);
    expect(paymentCall.amount).to.equal(300.00);
  });

  it('deve tratar falha no pagamento mantendo pedido em pending', async () => {
    // Simula falha no pagamento
    paymentStub.rejects(new Error('Payment gateway timeout'));

    const checkoutRequest = {
      customerId: 'customer-888',
      items: ['product-C'],
      totalAmount: 150.00,
      paymentMethod: 'debit_card'
    };

    try {
      await checkoutController.processCheckout(checkoutRequest);
      expect.fail('Deveria ter lançado erro');
    } catch (error) {
      expect((error as Error).message).to.include('Checkout failed');
    }

    // Verifica que o pedido foi criado mas ficou pendente
    // Nota: Em produção, você precisaria de um mecanismo para recuperar pedidos pendentes
  });
});
```

## Boas Práticas e Considerações

Ao implementar testes de integração no nível intermediário, algumas práticas fundamentais devem ser seguidas. Primeiro, mantenha os testes isolados uns dos outros, garantindo que a execução de um teste não afete o resultado de outro. Isso geralmente é alcançado através de limpeza adequada de dados entre testes.

Segundo, use bancos de dados de teste separados ou containers Docker para evitar interferência com dados de desenvolvimento ou produção. Ferramentas como Testcontainers podem ser extremamente úteis para criar ambientes de teste isolados e reproduzíveis.

Terceiro, seja estratégico ao decidir o que testar com integração versus testes unitários. Testes de integração são mais lentos e complexos, então devem focar em fluxos críticos e interações entre componentes, enquanto lógica de negócio isolada deve permanecer em testes unitários.

Quarto, utilize fixtures e factories para criar dados de teste consistentes e realistas. Isso torna os testes mais legíveis e manuteníveis ao longo do tempo.

Por fim, monitore o tempo de execução dos testes de integração. Se estiverem ficando muito lentos, considere paralelização ou revisão do escopo dos testes para manter um ciclo de feedback rápido durante o desenvolvimento.

## Conclusão

Testes de integração no nível intermediário representam um equilíbrio crucial entre a confiança proporcionada por testes end-to-end completos e a velocidade dos testes unitários. Ao dominar a arte de testar interações entre componentes de forma eficaz, você garante que sua aplicação não apenas funciona em partes isoladas, mas também como um sistema coeso e funcional.

A combinação de Mocha, Chai e Sinon oferece um conjunto poderoso de ferramentas para implementar esses testes em TypeScript, permitindo validar desde interações simples com bancos de dados até fluxos complexos envolvendo múltiplos serviços. O investimento em testes de integração bem estruturados paga dividendos ao longo do ciclo de vida do software, capturando bugs mais cedo e facilitando refatorações com confiança.
