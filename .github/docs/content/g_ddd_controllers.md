# Testes para Controllers (DDD)

## Introdução

Controllers são responsáveis por receber requisições HTTP, validar entradas, chamar os Use Cases apropriados e retornar respostas formatadas. Eles fazem parte da camada de apresentação e não devem conter lógica de negócio. Os testes de Controllers devem focar na validação de entrada, tratamento de erros HTTP, e garantir que os Use Cases são invocados corretamente. A estratégia inclui testes unitários com mocks e testes E2E para validar o comportamento end-to-end.

## Estratégias de Teste

Para Controllers, deve-se testar a validação de entrada e formatação de resposta, verificar códigos de status HTTP corretos, garantir que Use Cases são chamados com parâmetros adequados, validar tratamento de exceções e erros, e realizar testes E2E para verificar o fluxo completo da requisição. Testes unitários isolam o controller, enquanto testes E2E validam a integração real.

## Exemplo Prático: Controller de Pedidos

```typescript
// src/presentation/controllers/OrderController.ts
export class OrderController {
  constructor(
    private createOrderUseCase: CreateOrderUseCase,
    private getOrderUseCase: GetOrderUseCase
  ) {}

  async create(request: Request, response: Response): Promise<Response> {
    try {
      const { customerId, items } = request.body;

      if (!customerId) {
        return response.status(400).json({
          error: 'Customer ID is required'
        });
      }

      if (!items || items.length === 0) {
        return response.status(400).json({
          error: 'At least one item is required'
        });
      }

      for (const item of items) {
        if (!item.productId || !item.quantity) {
          return response.status(400).json({
            error: 'Invalid item format'
          });
        }

        if (item.quantity <= 0) {
          return response.status(400).json({
            error: 'Quantity must be greater than zero'
          });
        }
      }

      const result = await this.createOrderUseCase.execute({
        customerId,
        items
      });

      return response.status(201).json({
        orderId: result.orderId,
        total: result.total,
        status: result.status
      });

    } catch (error: any) {
      if (error.name === 'CustomerNotFoundException') {
        return response.status(404).json({
          error: 'Customer not found'
        });
      }

      if (error.name === 'ProductNotFoundException') {
        return response.status(404).json({
          error: error.message
        });
      }

      if (error.name === 'InsufficientStockException') {
        return response.status(422).json({
          error: error.message
        });
      }

      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }

  async getById(request: Request, response: Response): Promise<Response> {
    try {
      const { id } = request.params;

      if (!id) {
        return response.status(400).json({
          error: 'Order ID is required'
        });
      }

      const order = await this.getOrderUseCase.execute(id);

      if (!order) {
        return response.status(404).json({
          error: 'Order not found'
        });
      }

      return response.status(200).json(order);

    } catch (error) {
      return response.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}
```

## Testes Unitários

```typescript
// tests/unit/presentation/controllers/OrderController.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { OrderController } from '../../../../src/presentation/controllers/OrderController';

describe('OrderController - Unit Tests', () => {
  let controller: OrderController;
  let createOrderUseCaseMock: any;
  let getOrderUseCaseMock: any;
  let requestMock: any;
  let responseMock: any;

  beforeEach(() => {
    createOrderUseCaseMock = {
      execute: sinon.stub()
    };

    getOrderUseCaseMock = {
      execute: sinon.stub()
    };

    controller = new OrderController(
      createOrderUseCaseMock,
      getOrderUseCaseMock
    );

    requestMock = {
      body: {},
      params: {}
    };

    responseMock = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
  });

  describe('Create Order', () => {
    it('should create order successfully with valid data', async () => {
      requestMock.body = {
        customerId: 'customer-1',
        items: [
          { productId: 'prod-1', quantity: 2 }
        ]
      };

      createOrderUseCaseMock.execute.resolves({
        orderId: 'order-123',
        total: 6000,
        status: 'PENDING'
      });

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(201)).to.be.true;
      expect(responseMock.json.calledOnce).to.be.true;
      
      const jsonResponse = responseMock.json.firstCall.args[0];
      expect(jsonResponse.orderId).to.equal('order-123');
      expect(jsonResponse.total).to.equal(6000);
    });

    it('should return 400 when customerId is missing', async () => {
      requestMock.body = {
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(400)).to.be.true;
      expect(responseMock.json.calledWith(
        sinon.match({ error: 'Customer ID is required' })
      )).to.be.true;
    });

    it('should return 400 when items array is empty', async () => {
      requestMock.body = {
        customerId: 'customer-1',
        items: []
      };

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(400)).to.be.true;
      expect(responseMock.json.calledWith(
        sinon.match({ error: 'At least one item is required' })
      )).to.be.true;
    });

    it('should return 400 when item has invalid format', async () => {
      requestMock.body = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1' }] // missing quantity
      };

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(400)).to.be.true;
      expect(responseMock.json.calledWith(
        sinon.match({ error: 'Invalid item format' })
      )).to.be.true;
    });

    it('should return 400 when quantity is zero or negative', async () => {
      requestMock.body = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 0 }]
      };

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(400)).to.be.true;
      expect(responseMock.json.calledWith(
        sinon.match({ error: 'Quantity must be greater than zero' })
      )).to.be.true;
    });

    it('should return 404 when customer not found', async () => {
      requestMock.body = {
        customerId: 'non-existent',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      const error = new Error('Customer not found');
      error.name = 'CustomerNotFoundException';
      createOrderUseCaseMock.execute.rejects(error);

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(404)).to.be.true;
      expect(responseMock.json.calledWith(
        sinon.match({ error: 'Customer not found' })
      )).to.be.true;
    });

    it('should return 422 when insufficient stock', async () => {
      requestMock.body = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 100 }]
      };

      const error = new Error('Insufficient stock for product');
      error.name = 'InsufficientStockException';
      createOrderUseCaseMock.execute.rejects(error);

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(422)).to.be.true;
    });

    it('should return 500 for unexpected errors', async () => {
      requestMock.body = {
        customerId: 'customer-1',
        items: [{ productId: 'prod-1', quantity: 1 }]
      };

      createOrderUseCaseMock.execute.rejects(new Error('Database error'));

      await controller.create(requestMock, responseMock);

      expect(responseMock.status.calledWith(500)).to.be.true;
      expect(responseMock.json.calledWith(
        sinon.match({ error: 'Internal server error' })
      )).to.be.true;
    });
  });

  describe('Get Order By ID', () => {
    it('should return order when found', async () => {
      requestMock.params = { id: 'order-123' };

      getOrderUseCaseMock.execute.resolves({
        id: 'order-123',
        customerId: 'customer-1',
        total: 3000
      });

      await controller.getById(requestMock, responseMock);

      expect(responseMock.status.calledWith(200)).to.be.true;
      expect(getOrderUseCaseMock.execute.calledWith('order-123')).to.be.true;
    });

    it('should return 404 when order not found', async () => {
      requestMock.params = { id: 'non-existent' };

      getOrderUseCaseMock.execute.resolves(null);

      await controller.getById(requestMock, responseMock);

      expect(responseMock.status.calledWith(404)).to.be.true;
    });
  });
});
```

## Testes E2E

```typescript
// tests/e2e/OrderController.e2e.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import request from 'supertest';
import { app } from '../../../src/app';
import { TestDatabase } from '../../helpers/TestDatabase';

describe('OrderController - E2E Tests', () => {
  let database: TestDatabase;

  beforeEach(async () => {
    database = new TestDatabase();
    await database.connect();
    await database.migrate();
    await database.seed();
  });

  afterEach(async () => {
    await database.clean();
    await database.disconnect();
  });

  describe('POST /orders', () => {
    it('should create order successfully', async () => {
      const response = await request(app)
        .post('/orders')
        .send({
          customerId: 'customer-1',
          items: [
            { productId: 'prod-1', quantity: 2 }
          ]
        })
        .expect(201);

      expect(response.body).to.have.property('orderId');
      expect(response.body).to.have.property('total');
      expect(response.body.status).to.equal('PENDING');
    });

    it('should return 400 for invalid payload', async () => {
      await request(app)
        .post('/orders')
        .send({
          items: []
        })
        .expect(400);
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app)
        .post('/orders')
        .send({
          customerId: 'non-existent',
          items: [{ productId: 'prod-1', quantity: 1 }]
        })
        .expect(404);
    });
  });

  describe('GET /orders/:id', () => {
    it('should return order details', async () => {
      const createResponse = await request(app)
        .post('/orders')
        .send({
          customerId: 'customer-1',
          items: [{ productId: 'prod-1', quantity: 1 }]
        });

      const orderId = createResponse.body.orderId;

      const response = await request(app)
        .get(`/orders/${orderId}`)
        .expect(200);

      expect(response.body.id).to.equal(orderId);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app)
        .get('/orders/non-existent')
        .expect(404);
    });
  });
});
```

## Pontos-chave

Controllers devem ser testados para garantir que validam corretamente as entradas, retornam códigos HTTP apropriados, e tratam exceções adequadamente. Testes unitários com mocks isolam o controller, enquanto testes E2E validam o comportamento real da API, incluindo serialização, deserialização e integração completa do fluxo de requisição-resposta.
