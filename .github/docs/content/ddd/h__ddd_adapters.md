# Testes para Adapters (DDD)

## Introdução

Adapters fazem a tradução entre a camada de domínio e sistemas externos (APIs, banco de dados, serviços de mensageria, etc.). Eles implementam interfaces definidas pelo domínio (Ports) e adaptam chamadas externas para o formato esperado internamente. Os testes de Adapters devem focar na correta tradução de dados, tratamento de erros de sistemas externos, e garantir que a comunicação com serviços externos funciona adequadamente. A estratégia inclui testes de integração com sistemas reais ou simulados e testes unitários para validar a lógica de transformação.

## Estratégias de Teste

Para Adapters, deve-se testar a tradução bidirecional de dados (domínio para sistema externo e vice-versa), validar o tratamento de erros e timeouts, garantir que retries e circuit breakers funcionam corretamente quando aplicável, e realizar testes de integração com sistemas externos (usando ambientes de teste ou mocks). Testes de contrato podem validar que o adapter respeita a interface esperada.

## Exemplo Prático: Adapter de Serviço de Pagamento

```typescript
// src/domain/ports/IPaymentGateway.ts
export interface IPaymentGateway {
  processPayment(payment: PaymentRequest): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount: number): Promise<RefundResult>;
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>;
}

// src/infrastructure/adapters/StripePaymentAdapter.ts
export class StripePaymentAdapter implements IPaymentGateway {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT_MS = 5000;

  constructor(
    private stripeClient: StripeClient,
    private logger: ILogger
  ) {}

  async processPayment(payment: PaymentRequest): Promise<PaymentResult> {
    try {
      const stripePaymentIntent = {
        amount: Math.round(payment.amount * 100), // Stripe usa centavos
        currency: 'brl',
        payment_method: payment.paymentMethodId,
        confirm: true,
        metadata: {
          orderId: payment.orderId,
          customerId: payment.customerId
        }
      };

      this.logger.info('Processing payment', { orderId: payment.orderId });

      const result = await this.withRetry(async () => {
        return await this.stripeClient.paymentIntents.create(
          stripePaymentIntent,
          { timeout: this.TIMEOUT_MS }
        );
      });

      if (result.status === 'succeeded') {
        return {
          success: true,
          transactionId: result.id,
          amount: payment.amount,
          processedAt: new Date()
        };
      }

      return {
        success: false,
        error: 'Payment failed',
        errorCode: result.status
      };

    } catch (error: any) {
      this.logger.error('Payment processing failed', {
        error: error.message,
        orderId: payment.orderId
      });

      return {
        success: false,
        error: this.translateError(error),
        errorCode: error.code
      };
    }
  }

  async refundPayment(transactionId: string, amount: number): Promise<RefundResult> {
    try {
      const refund = await this.stripeClient.refunds.create({
        payment_intent: transactionId,
        amount: Math.round(amount * 100)
      });

      return {
        success: true,
        refundId: refund.id,
        amount: amount,
        refundedAt: new Date()
      };

    } catch (error: any) {
      this.logger.error('Refund failed', {
        error: error.message,
        transactionId
      });

      return {
        success: false,
        error: this.translateError(error)
      };
    }
  }

  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const paymentIntent = await this.stripeClient.paymentIntents.retrieve(
        transactionId
      );

      return this.mapStripeStatus(paymentIntent.status);

    } catch (error: any) {
      throw new Error(`Failed to retrieve payment status: ${error.message}`);
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.MAX_RETRIES
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retries > 0 && this.isRetryableError(error)) {
        await this.delay(1000);
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = ['rate_limit', 'connection_error', 'timeout'];
    return retryableCodes.includes(error.code);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private translateError(error: any): string {
    const errorMap: Record<string, string> = {
      'card_declined': 'Cartão recusado',
      'insufficient_funds': 'Fundos insuficientes',
      'expired_card': 'Cartão expirado',
      'invalid_card': 'Cartão inválido'
    };

    return errorMap[error.code] || 'Erro ao processar pagamento';
  }

  private mapStripeStatus(status: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      'succeeded': PaymentStatus.APPROVED,
      'processing': PaymentStatus.PROCESSING,
      'requires_payment_method': PaymentStatus.PENDING,
      'requires_confirmation': PaymentStatus.PENDING,
      'canceled': PaymentStatus.CANCELED,
      'failed': PaymentStatus.FAILED
    };

    return statusMap[status] || PaymentStatus.UNKNOWN;
  }
}
```

## Testes Unitários

```typescript
// tests/unit/infrastructure/adapters/StripePaymentAdapter.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import * as sinon from 'sinon';
import { StripePaymentAdapter } from '../../../../src/infrastructure/adapters/StripePaymentAdapter';
import { PaymentStatus } from '../../../../src/domain/enums/PaymentStatus';

describe('StripePaymentAdapter - Unit Tests', () => {
  let adapter: StripePaymentAdapter;
  let stripeClientMock: any;
  let loggerMock: any;

  beforeEach(() => {
    stripeClientMock = {
      paymentIntents: {
        create: sinon.stub(),
        retrieve: sinon.stub()
      },
      refunds: {
        create: sinon.stub()
      }
    };

    loggerMock = {
      info: sinon.stub(),
      error: sinon.stub()
    };

    adapter = new StripePaymentAdapter(stripeClientMock, loggerMock);
  });

  describe('Process Payment', () => {
    it('should process payment successfully', async () => {
      const paymentRequest = {
        orderId: 'order-123',
        customerId: 'customer-1',
        amount: 100.00,
        paymentMethodId: 'pm_123'
      };

      stripeClientMock.paymentIntents.create.resolves({
        id: 'pi_123',
        status: 'succeeded',
        amount: 10000
      });

      const result = await adapter.processPayment(paymentRequest);

      expect(result.success).to.be.true;
      expect(result.transactionId).to.equal('pi_123');
      expect(result.amount).to.equal(100);
      expect(stripeClientMock.paymentIntents.create.calledOnce).to.be.true;
    });

    it('should convert amount to cents for Stripe', async () => {
      const paymentRequest = {
        orderId: 'order-123',
        customerId: 'customer-1',
        amount: 250.50,
        paymentMethodId: 'pm_123'
      };

      stripeClientMock.paymentIntents.create.resolves({
        id: 'pi_123',
        status: 'succeeded'
      });

      await adapter.processPayment(paymentRequest);

      const createCall = stripeClientMock.paymentIntents.create.firstCall.args[0];
      expect(createCall.amount).to.equal(25050); // 250.50 * 100
    });

    it('should handle payment failure', async () => {
      const paymentRequest = {
        orderId: 'order-123',
        customerId: 'customer-1',
        amount: 100.00,
        paymentMethodId: 'pm_123'
      };

      stripeClientMock.paymentIntents.create.resolves({
        id: 'pi_123',
        status: 'failed'
      });

      const result = await adapter.processPayment(paymentRequest);

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });

    it('should translate error messages to Portuguese', async () => {
      const paymentRequest = {
        orderId: 'order-123',
        customerId: 'customer-1',
        amount: 100.00,
        paymentMethodId: 'pm_123'
      };

      const error = new Error('Card declined');
      error.code = 'card_declined';
      stripeClientMock.paymentIntents.create.rejects(error);

      const result = await adapter.processPayment(paymentRequest);

      expect(result.success).to.be.false;
      expect(result.error).to.equal('Cartão recusado');
    });

    it('should retry on retryable errors', async () => {
      const paymentRequest = {
        orderId: 'order-123',
        customerId: 'customer-1',
        amount: 100.00,
        paymentMethodId: 'pm_123'
      };

      const retryableError = new Error('Rate limit exceeded');
      retryableError.code = 'rate_limit';

      stripeClientMock.paymentIntents.create
        .onFirstCall().rejects(retryableError)
        .onSecondCall().resolves({
          id: 'pi_123',
          status: 'succeeded'
        });

      const result = await adapter.processPayment(paymentRequest);

      expect(result.success).to.be.true;
      expect(stripeClientMock.paymentIntents.create.calledTwice).to.be.true;
    });
  });

  describe('Refund Payment', () => {
    it('should refund payment successfully', async () => {
      stripeClientMock.refunds.create.resolves({
        id: 'ref_123',
        amount: 10000
      });

      const result = await adapter.refundPayment('pi_123', 100.00);

      expect(result.success).to.be.true;
      expect(result.refundId).to.equal('ref_123');
      expect(result.amount).to.equal(100);
    });

    it('should handle refund errors', async () => {
      stripeClientMock.refunds.create.rejects(new Error('Refund failed'));

      const result = await adapter.refundPayment('pi_123', 100.00);

      expect(result.success).to.be.false;
      expect(result.error).to.exist;
    });
  });

  describe('Get Payment Status', () => {
    it('should map Stripe status correctly', async () => {
      stripeClientMock.paymentIntents.retrieve.resolves({
        id: 'pi_123',
        status: 'succeeded'
      });

      const status = await adapter.getPaymentStatus('pi_123');

      expect(status).to.equal(PaymentStatus.APPROVED);
    });

    it('should handle unknown status', async () => {
      stripeClientMock.paymentIntents.retrieve.resolves({
        id: 'pi_123',
        status: 'unknown_status'
      });

      const status = await adapter.getPaymentStatus('pi_123');

      expect(status).to.equal(PaymentStatus.UNKNOWN);
    });
  });
});
```

## Testes de Integração

```typescript
// tests/integration/infrastructure/adapters/StripePaymentAdapter.integration.spec.ts
import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { StripePaymentAdapter } from '../../../../src/infrastructure/adapters/StripePaymentAdapter';
import { Logger } from '../../../../src/infrastructure/logging/Logger';

describe('StripePaymentAdapter - Integration Tests', () => {
  let adapter: StripePaymentAdapter;

  beforeEach(() => {
    const stripeClient = new StripeClient(process.env.STRIPE_TEST_KEY);
    const logger = new Logger();
    adapter = new StripePaymentAdapter(stripeClient, logger);
  });

  it('should process real payment in test mode', async () => {
    const paymentRequest = {
      orderId: 'order-test-123',
      customerId: 'customer-test-1',
      amount: 10.00,
      paymentMethodId: 'pm_card_visa' // Test payment method
    };

    const result = await adapter.processPayment(paymentRequest);

    expect(result.success).to.be.true;
    expect(result.transactionId).to.exist;
  }).timeout(10000);

  it('should handle declined card in test mode', async () => {
    const paymentRequest = {
      orderId: 'order-test-123',
      customerId: 'customer-test-1',
      amount: 10.00,
      paymentMethodId: 'pm_card_chargeDeclined' // Test card that declines
    };

    const result = await adapter.processPayment(paymentRequest);

    expect(result.success).to.be.false;
    expect(result.errorCode).to.exist;
  }).timeout(10000);
});
```

## Pontos-chave

Adapters devem ser rigorosamente testados para garantir a correta tradução entre domínio e sistemas externos. Testes unitários com mocks validam a lógica de transformação e tratamento de erros, enquanto testes de integração verificam a comunicação real com serviços externos. É essencial testar cenários de erro, timeouts, e mecanismos de retry para garantir resiliência.
