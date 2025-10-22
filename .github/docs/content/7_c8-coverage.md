# Cobertura de Testes com C8

## Introdução

A cobertura de testes é uma métrica fundamental no desenvolvimento de software que mede o percentual do código que é executado durante a execução dos testes automatizados. Esta métrica nos ajuda a identificar quais partes do código estão sendo validadas e quais ainda carecem de testes, funcionando como um mapa que revela áreas potencialmente vulneráveis da aplicação.

O C8 é uma ferramenta moderna de análise de cobertura de código para Node.js que utiliza a API nativa de cobertura V8 integrada ao motor JavaScript. Diferentemente de ferramentas tradicionais como o Istanbul/NYC que instrumentam o código antes da execução, o C8 aproveita a capacidade nativa do V8 de rastrear a execução do código, tornando-o mais rápido e preciso, especialmente ao trabalhar com código TypeScript transpilado ou módulos ES6.

A importância da cobertura de testes vai além de simplesmente atingir números altos. Uma cobertura adequada proporciona confiança ao refatorar código, reduz a probabilidade de bugs em produção e serve como documentação viva do comportamento esperado do sistema. Contudo, é crucial entender que 100% de cobertura não garante ausência de bugs, pois a qualidade dos testes importa tanto quanto a quantidade de código coberto.

## Configuração Básica

Para começar a utilizar o C8 em seu projeto, primeiro precisamos instalá-lo como dependência de desenvolvimento. A instalação é simples e direta através do npm ou yarn. Junto com o C8, você precisará de um framework de testes, como o Mocha que você mencionou estar utilizando.

```typescript
npm install --save-dev c8 mocha @types/mocha
```

Após a instalação, o próximo passo é configurar os scripts no arquivo `package.json`. A estrutura dos scripts define como os testes serão executados e como a cobertura será medida. Vamos entender cada parte dessa configuração.

```json
{
  "scripts": {
    "test": "mocha",
    "coverage": "c8 mocha",
    "coverage:report": "c8 report --reporter=html",
    "coverage:check": "c8 check-coverage --lines 80 --functions 80 --branches 80"
  }
}
```

O script `"coverage": "c8 mocha"` é o ponto central da configuração. Quando você executa `npm run coverage`, o C8 inicia o Mocha e monitora toda a execução do código, registrando quais linhas, funções, branches e declarações foram executadas. O C8 age como uma camada envolvente que observa silenciosamente enquanto seus testes rodam.

## Personalização da Saída

O C8 oferece diversas opções de configuração que podem ser definidas no `package.json` ou em um arquivo separado `.c8rc.json`. A personalização permite adaptar a ferramenta às necessidades específicas do seu projeto.

```json
{
  "scripts": {
    "coverage": "c8 --reporter=lcov --reporter=text --reporter=html mocha"
  },
  "c8": {
    "all": true,
    "include": ["src/**/*.ts"],
    "exclude": [
      "**/*.spec.ts",
      "**/*.test.ts",
      "**/node_modules/**",
      "**/dist/**",
      "**/*.d.ts"
    ],
    "reporter": ["text", "lcov", "html"],
    "report-dir": "./coverage",
    "lines": 80,
    "functions": 80,
    "branches": 80,
    "statements": 80
  }
}
```

A opção `"all": true` instrui o C8 a incluir todos os arquivos do projeto na análise de cobertura, mesmo aqueles que não foram importados durante a execução dos testes. Isso é crucial para identificar arquivos completamente não testados. As propriedades `include` e `exclude` funcionam como filtros que determinam quais arquivos devem ser considerados na análise. Normalmente, excluímos arquivos de teste, dependências externas e arquivos de definição de tipos.

Os reporters definem o formato da saída. O reporter `text` exibe a tabela no terminal, `lcov` gera arquivos para integração com serviços de CI/CD, e `html` cria uma visualização interativa em formato web. Você pode especificar múltiplos reporters simultaneamente.

## Interpretação da Tabela no Terminal

Quando você executa os testes com cobertura, o C8 apresenta uma tabela detalhada no terminal. Esta tabela é dividida em colunas que representam diferentes aspectos da cobertura de código. Compreender cada coluna é essencial para tomar decisões informadas sobre onde concentrar esforços de teste.

A coluna **Statements** (declarações) indica o percentual de declarações executadas. Uma declaração é qualquer linha de código que executa uma ação, como atribuições, chamadas de função ou retornos. A coluna **Branches** mede a cobertura de caminhos condicionais, como blocos `if/else`, operadores ternários e expressões lógicas. Uma branch coverage de 100% significa que todos os caminhos possíveis foram testados.

A coluna **Functions** mostra quantas funções foram invocadas durante os testes. Uma função pode ter 100% de cobertura de linhas mas nunca ter sido chamada nos testes, o que esta métrica captura. Por fim, **Lines** representa a porcentagem de linhas executadas, sendo uma das métricas mais intuitivas.

Veja um exemplo de saída típica:

```plaintext
--------------------------|---------|----------|---------|---------|-------------------
| File                       | % Stmts   | % Branch   | % Funcs   | % Lines   | Uncovered Line #s   |
| -------------------------- | --------- | ---------- | --------- | --------- | ------------------- |
| All files                  | 87.50     | 75.00      | 83.33     | 87.50     |
| src                        | 87.50     | 75.00      | 83.33     | 87.50     |
| userService.ts             | 90.00     | 80.00      | 100.00    | 90.00     | 45-47               |
| productService.ts          | 85.00     | 70.00      | 66.66     | 85.00     | 23,78-82            |
| -------------------------- | --------- | ---------- | --------- | --------- | ------------------- |
```

A coluna **Uncovered Line #s** é particularmente valiosa, pois aponta exatamente quais linhas não foram executadas. No exemplo acima, as linhas 45-47 do `userService.ts` não foram cobertas pelos testes, indicando onde adicionar casos de teste.

## Relatórios na Pasta Coverage

A pasta `coverage` gerada automaticamente após a execução dos testes não deve ser ignorada. Ela contém informações valiosas que complementam a tabela exibida no terminal. Esta pasta tipicamente contém múltiplos formatos de relatório que servem diferentes propósitos.

O arquivo `lcov.info` é um formato padronizado de cobertura que pode ser consumido por serviços de integração contínua como Codecov, Coveralls ou SonarQube. Se você utiliza estes serviços, este arquivo será automaticamente enviado e processado para gerar análises históricas de cobertura.

A subpasta `html` contém uma visualização interativa completa da cobertura. Esta visualização permite navegar pelos arquivos do projeto, ver exatamente quais linhas foram cobertas (geralmente em verde), quais não foram (em vermelho) e quais branches foram parcialmente cobertas (em amarelo). Esta é a ferramenta mais útil para desenvolvedores identificarem rapidamente o que precisa ser testado.

É recomendado adicionar a pasta `coverage` ao `.gitignore`, pois ela é gerada dinamicamente e contém artefatos de build que não devem ser versionados. Entretanto, durante o desenvolvimento local, esta pasta é extremamente útil para análise detalhada.

## Visualização HTML

A visualização HTML gerada pelo C8 é uma ferramenta poderosa para análise de cobertura. Para acessá-la, primeiro execute os testes com cobertura e depois abra o arquivo `coverage/index.html` em um navegador.

```bash
npm run coverage
# Abrir coverage/index.html no navegador
```

A interface HTML apresenta uma estrutura de navegação que espelha a estrutura de pastas do projeto. Ao clicar em um arquivo, você vê o código fonte completo com colorização indicando a cobertura. Linhas verdes foram executadas, linhas vermelhas não foram executadas, e linhas amarelas indicam branches parcialmente cobertas.

Esta visualização é particularmente útil em cenários do dia a dia. Por exemplo, ao revisar um pull request, você pode verificar rapidamente se as novas funcionalidades possuem testes adequados. Durante refatorações, a visualização ajuda a garantir que todos os caminhos críticos permanecem testados.

Para facilitar o acesso, você pode criar um script que gera o relatório e abre automaticamente no navegador:

```json
{
  "scripts": {
    "coverage:open": "c8 mocha && open coverage/index.html"
  }
}
```

Note que o comando `open` funciona no macOS. No Linux, use `xdg-open`, e no Windows, use `start`.

## Maximização e Otimização da Cobertura

Alcançar 100% de cobertura requer uma abordagem sistemática e estratégica. Não se trata apenas de escrever mais testes, mas de escrever testes que exercitem todos os caminhos lógicos do código. Vamos explorar estratégias práticas para maximizar a cobertura de forma eficiente.

A primeira etapa é identificar sistematicamente as áreas não cobertas usando o relatório HTML. Priorize a cobertura de código crítico para o negócio, como lógica de pagamento, autenticação e processamento de dados sensíveis. Código utilitário simples pode ter prioridade menor.

Para branches não cobertas, você precisa criar testes que exercitem todos os caminhos condicionais. Considere todas as combinações possíveis de condições `if/else`, casos de `switch`, e operadores lógicos. Cada combinação representa um caminho único que deve ser testado.

Funções não chamadas geralmente indicam código morto que pode ser removido, ou funcionalidades que não estão sendo validadas. Verifique se estas funções são realmente necessárias e, se sim, adicione testes que as invoquem.

Para statements não cobertos, analise se são casos extremos (edge cases) que seus testes atuais não contemplam. Muitas vezes, são cenários de erro, validações de entrada ou caminhos alternativos que só ocorrem em situações específicas.

É importante mencionar que 100% de cobertura não deve ser um objetivo cego. Algumas partes do código, como configurações simples, getters/setters triviais ou código de integração com bibliotecas externas, podem não justificar o esforço de testes complexos. A cobertura deve ser um meio para melhorar a qualidade, não um fim em si mesmo.

## Exemplo Prático em TypeScript

Vamos construir um exemplo realista que ilustra um cenário comum no dia a dia de desenvolvimento: um serviço de processamento de pedidos de e-commerce. Este exemplo demonstra como estruturar testes para maximizar a cobertura enquanto mantemos a qualidade e a legibilidade.

Primeiro, vamos criar o serviço que será testado:

```typescript
// src/services/orderService.ts

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  shippingAddress?: string;
}

export class OrderValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export class OrderService {
  private orders: Map<string, Order> = new Map();

  /**
   * Calcula o valor total do pedido aplicando descontos baseados na quantidade
   */
  calculateOrderTotal(items: OrderItem[]): number {
    if (!items || items.length === 0) {
      throw new OrderValidationError('O pedido deve conter pelo menos um item');
    }

    let total = 0;
    for (const item of items) {
      if (item.quantity <= 0 || item.price < 0) {
        throw new OrderValidationError('Quantidade e preço devem ser positivos');
      }

      const itemTotal = item.quantity * item.price;
      
      // Aplica desconto progressivo baseado na quantidade
      if (item.quantity >= 10) {
        total += itemTotal * 0.85; // 15% de desconto
      } else if (item.quantity >= 5) {
        total += itemTotal * 0.90; // 10% de desconto
      } else {
        total += itemTotal;
      }
    }

    return Number(total.toFixed(2));
  }

  /**
   * Cria um novo pedido com validações
   */
  createOrder(userId: string, items: OrderItem[], shippingAddress?: string): Order {
    if (!userId || userId.trim() === '') {
      throw new OrderValidationError('ID do usuário é obrigatório');
    }

    const totalAmount = this.calculateOrderTotal(items);
    
    // Pedidos acima de 1000 requerem endereço de entrega
    if (totalAmount > 1000 && !shippingAddress) {
      throw new OrderValidationError('Endereço de entrega obrigatório para pedidos acima de R$ 1000');
    }

    const order: Order = {
      id: this.generateOrderId(),
      userId,
      items,
      status: OrderStatus.PENDING,
      totalAmount,
      createdAt: new Date(),
      shippingAddress
    };

    this.orders.set(order.id, order);
    return order;
  }

  /**
   * Atualiza o status de um pedido com validações de transição
   */
  updateOrderStatus(orderId: string, newStatus: OrderStatus): Order {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new OrderValidationError(`Pedido ${orderId} não encontrado`);
    }

    // Validações de transição de status
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      throw new OrderValidationError('Não é possível alterar status de pedidos finalizados');
    }

    if (newStatus === OrderStatus.SHIPPED && !order.shippingAddress) {
      throw new OrderValidationError('Não é possível enviar pedido sem endereço de entrega');
    }

    order.status = newStatus;
    this.orders.set(orderId, order);
    return order;
  }

  /**
   * Obtém pedidos por usuário com filtro opcional de status
   */
  getOrdersByUser(userId: string, status?: OrderStatus): Order[] {
    const userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);

    if (status) {
      return userOrders.filter(order => order.status === status);
    }

    return userOrders;
  }

  /**
   * Cancela um pedido se ainda não foi enviado
   */
  cancelOrder(orderId: string, reason?: string): Order {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new OrderValidationError(`Pedido ${orderId} não encontrado`);
    }

    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      throw new OrderValidationError('Não é possível cancelar pedidos já enviados');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new OrderValidationError('Pedido já foi cancelado');
    }

    order.status = OrderStatus.CANCELLED;
    this.orders.set(orderId, order);
    return order;
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Método auxiliar para testes
  clearOrders(): void {
    this.orders.clear();
  }
}
```

Agora, vamos criar uma suíte de testes abrangente que maximiza a cobertura:

```typescript
// src/services/orderService.spec.ts

import { describe, it, beforeEach } from 'mocha';
import { expect } from 'chai';
import { OrderService, OrderStatus, OrderValidationError, OrderItem } from './orderService';

describe('OrderService', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  describe('calculateOrderTotal', () => {
    it('deve calcular o total corretamente sem descontos para pequenas quantidades', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 2, price: 50.00 },
        { productId: 'P2', quantity: 1, price: 30.00 }
      ];

      const total = orderService.calculateOrderTotal(items);
      expect(total).to.equal(130.00);
    });

    it('deve aplicar 10% de desconto para quantidades entre 5 e 9', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 7, price: 100.00 }
      ];

      const total = orderService.calculateOrderTotal(items);
      // 7 * 100 = 700, com 10% desconto = 630
      expect(total).to.equal(630.00);
    });

    it('deve aplicar 15% de desconto para quantidades de 10 ou mais', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 10, price: 50.00 }
      ];

      const total = orderService.calculateOrderTotal(items);
      // 10 * 50 = 500, com 15% desconto = 425
      expect(total).to.equal(425.00);
    });

    it('deve calcular corretamente com múltiplos itens e diferentes descontos', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 2, price: 100.00 },  // Sem desconto
        { productId: 'P2', quantity: 6, price: 50.00 },   // 10% desconto
        { productId: 'P3', quantity: 12, price: 25.00 }   // 15% desconto
      ];

      const total = orderService.calculateOrderTotal(items);
      // 200 + (300 * 0.90) + (300 * 0.85) = 200 + 270 + 255 = 725
      expect(total).to.equal(725.00);
    });

    it('deve lançar erro se lista de itens estiver vazia', () => {
      expect(() => orderService.calculateOrderTotal([])).to.throw(
        OrderValidationError,
        'O pedido deve conter pelo menos um item'
      );
    });

    it('deve lançar erro se lista de itens for null', () => {
      expect(() => orderService.calculateOrderTotal(null as any)).to.throw(
        OrderValidationError,
        'O pedido deve conter pelo menos um item'
      );
    });

    it('deve lançar erro se quantidade for zero', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 0, price: 50.00 }
      ];

      expect(() => orderService.calculateOrderTotal(items)).to.throw(
        OrderValidationError,
        'Quantidade e preço devem ser positivos'
      );
    });

    it('deve lançar erro se quantidade for negativa', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: -5, price: 50.00 }
      ];

      expect(() => orderService.calculateOrderTotal(items)).to.throw(
        OrderValidationError,
        'Quantidade e preço devem ser positivos'
      );
    });

    it('deve lançar erro se preço for negativo', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 5, price: -10.00 }
      ];

      expect(() => orderService.calculateOrderTotal(items)).to.throw(
        OrderValidationError,
        'Quantidade e preço devem ser positivos'
      );
    });
  });

  describe('createOrder', () => {
    it('deve criar pedido com sucesso para valores baixos sem endereço', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 2, price: 50.00 }
      ];

      const order = orderService.createOrder('user123', items);

      expect(order).to.have.property('id');
      expect(order.userId).to.equal('user123');
      expect(order.items).to.deep.equal(items);
      expect(order.status).to.equal(OrderStatus.PENDING);
      expect(order.totalAmount).to.equal(100.00);
      expect(order).to.have.property('createdAt');
    });

    it('deve criar pedido com endereço de entrega', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 500.00 }
      ];
      const address = 'Rua Exemplo, 123';

      const order = orderService.createOrder('user123', items, address);

      expect(order.shippingAddress).to.equal(address);
    });

    it('deve exigir endereço para pedidos acima de 1000 reais', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 1500.00 }
      ];

      expect(() => orderService.createOrder('user123', items)).to.throw(
        OrderValidationError,
        'Endereço de entrega obrigatório para pedidos acima de R$ 1000'
      );
    });

    it('deve permitir pedido acima de 1000 reais com endereço', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 1500.00 }
      ];
      const address = 'Rua Exemplo, 123';

      const order = orderService.createOrder('user123', items, address);

      expect(order.totalAmount).to.equal(1500.00);
      expect(order.shippingAddress).to.equal(address);
    });

    it('deve lançar erro se userId estiver vazio', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];

      expect(() => orderService.createOrder('', items)).to.throw(
        OrderValidationError,
        'ID do usuário é obrigatório'
      );
    });

    it('deve lançar erro se userId contiver apenas espaços', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];

      expect(() => orderService.createOrder('   ', items)).to.throw(
        OrderValidationError,
        'ID do usuário é obrigatório'
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('deve atualizar status de PENDING para PROCESSING', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);

      const updatedOrder = orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING);

      expect(updatedOrder.status).to.equal(OrderStatus.PROCESSING);
    });

    it('deve atualizar status de PROCESSING para SHIPPED com endereço', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items, 'Rua Exemplo, 123');
      orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING);

      const updatedOrder = orderService.updateOrderStatus(order.id, OrderStatus.SHIPPED);

      expect(updatedOrder.status).to.equal(OrderStatus.SHIPPED);
    });

    it('deve lançar erro ao tentar enviar pedido sem endereço', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);

      expect(() => orderService.updateOrderStatus(order.id, OrderStatus.SHIPPED)).to.throw(
        OrderValidationError,
        'Não é possível enviar pedido sem endereço de entrega'
      );
    });

    it('deve lançar erro ao tentar alterar status de pedido entregue', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items, 'Rua Exemplo, 123');
      orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING);
      orderService.updateOrderStatus(order.id, OrderStatus.SHIPPED);
      orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED);

      expect(() => orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING)).to.throw(
        OrderValidationError,
        'Não é possível alterar status de pedidos finalizados'
      );
    });

    it('deve lançar erro ao tentar alterar status de pedido cancelado', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);
      orderService.cancelOrder(order.id);

      expect(() => orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING)).to.throw(
        OrderValidationError,
        'Não é possível alterar status de pedidos finalizados'
      );
    });

    it('deve lançar erro se pedido não existir', () => {
      expect(() => orderService.updateOrderStatus('invalid-id', OrderStatus.PROCESSING)).to.throw(
        OrderValidationError,
        'Pedido invalid-id não encontrado'
      );
    });
  });

  describe('getOrdersByUser', () => {
    beforeEach(() => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      
      orderService.createOrder('user123', items);
      orderService.createOrder('user123', items, 'Rua A, 123');
      orderService.createOrder('user456', items);
    });

    it('deve retornar todos os pedidos de um usuário', () => {
      const orders = orderService.getOrdersByUser('user123');

      expect(orders).to.have.lengthOf(2);
      expect(orders.every(o => o.userId === 'user123')).to.be.true;
    });

    it('deve retornar array vazio se usuário não tiver pedidos', () => {
      const orders = orderService.getOrdersByUser('user999');

      expect(orders).to.have.lengthOf(0);
    });

    it('deve filtrar pedidos por status PENDING', () => {
      const orders = orderService.getOrdersByUser('user123', OrderStatus.PENDING);

      expect(orders).to.have.lengthOf(2);
      expect(orders.every(o => o.status === OrderStatus.PENDING)).to.be.true;
    });

    it('deve retornar array vazio ao filtrar por status inexistente', () => {
      const orders = orderService.getOrdersByUser('user123', OrderStatus.DELIVERED);

      expect(orders).to.have.lengthOf(0);
    });
  });

  describe('cancelOrder', () => {
    it('deve cancelar pedido com sucesso em status PENDING', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);

      const cancelledOrder = orderService.cancelOrder(order.id);

      expect(cancelledOrder.status).to.equal(OrderStatus.CANCELLED);
    });

    it('deve cancelar pedido com sucesso em status PROCESSING', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);
      orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING);

      const cancelledOrder = orderService.cancelOrder(order.id);

      expect(cancelledOrder.status).to.equal(OrderStatus.CANCELLED);
    });

    it('deve lançar erro ao tentar cancelar pedido já enviado', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items, 'Rua Exemplo, 123');
      orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING);
      orderService.updateOrderStatus(order.id, OrderStatus.SHIPPED);

      expect(() => orderService.cancelOrder(order.id)).to.throw(
        OrderValidationError,
        'Não é possível cancelar pedidos já enviados'
      );
    });

    it('deve lançar erro ao tentar cancelar pedido já entregue', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items, 'Rua Exemplo, 123');
      orderService.updateOrderStatus(order.id, OrderStatus.PROCESSING);
      orderService.updateOrderStatus(order.id, OrderStatus.SHIPPED);
      orderService.updateOrderStatus(order.id, OrderStatus.DELIVERED);

      expect(() => orderService.cancelOrder(order.id)).to.throw(
        OrderValidationError,
        'Não é possível cancelar pedidos já enviados'
      );
    });

    it('deve lançar erro ao tentar cancelar pedido já cancelado', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);
      orderService.cancelOrder(order.id);

      expect(() => orderService.cancelOrder(order.id)).to.throw(
        OrderValidationError,
        'Pedido já foi cancelado'
      );
    });

    it('deve lançar erro se pedido não existir', () => {
      expect(() => orderService.cancelOrder('invalid-id')).to.throw(
        OrderValidationError,
        'Pedido invalid-id não encontrado'
      );
    });

    it('deve aceitar razão de cancelamento como parâmetro opcional', () => {
      const items: OrderItem[] = [
        { productId: 'P1', quantity: 1, price: 50.00 }
      ];
      const order = orderService.createOrder('user123', items);

      // O parâmetro reason não é armazenado na implementação atual,
      // mas o teste garante que o método aceita o parâmetro
      const cancelledOrder = orderService.cancelOrder(order.id, 'Cliente solicitou');

      expect(cancelledOrder.status).to.equal(OrderStatus.CANCELLED);
    });
  });
});
```

Agora vamos configurar o ambiente de testes completo. Primeiro, o arquivo de configuração do TypeScript:

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

E o arquivo de configuração do Mocha:

```typescript
// .mocharc.json
{
  "require": ["ts-node/register"],
  "extensions": ["ts"],
  "spec": ["src/**/*.spec.ts"],
  "watch-files": ["src/**/*.ts"]
}
```

Por fim, o `package.json` completo com todos os scripts e configurações:

```json
{
  "name": "order-service-example",
  "version": "1.0.0",
  "description": "Exemplo de cobertura de testes com C8",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "test": "mocha",
    "test:watch": "mocha --watch",
    "coverage": "c8 mocha",
    "coverage:html": "c8 --reporter=html mocha",
    "coverage:open": "npm run coverage:html && open coverage/index.html",
    "coverage:check": "c8 check-coverage --lines 95 --functions 95 --branches 90 --statements 95 mocha",
    "coverage:all": "c8 --all mocha"
  },
  "c8": {
    "all": true,
    "include": ["src/**/*.ts"],
    "exclude": [
      "**/*.spec.ts",
      "**/*.test.ts",
      "**/node_modules/**",
      "**/dist/**",
      "**/*.d.ts",
      "**/coverage/**"
    ],
    "reporter": ["text", "lcov", "html", "text-summary"],
    "report-dir": "./coverage",
    "lines": 95,
    "functions": 95,
    "branches": 90,
    "statements": 95,
    "check-coverage": true,
    "per-file": true,
    "skip-full": false,
    "clean": true
  },
  "devDependencies": {
    "@types/chai": "^4.3.11",
    "@types/mocha": "^10.0.6",
    "@types/node": "^20.10.6",
    "c8": "^9.0.0",
    "chai": "^4.3.10",
    "mocha": "^10.2.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

## Interpretação Detalhada dos Relatórios

Vamos aprofundar na interpretação dos diferentes formatos de relatório gerados pelo C8. Cada formato serve um propósito específico no ciclo de desenvolvimento.

### Relatório de Texto no Terminal

O relatório de texto é a primeira linha de feedback. Quando você executa `npm run coverage`, uma tabela é exibida mostrando métricas agregadas e por arquivo. A interpretação correta dessas métricas é fundamental:

- **Percentuais próximos a 100%**: Indicam boa cobertura, mas não garantem ausência de bugs. Avalie a qualidade dos testes, não apenas a quantidade.

- **Branches abaixo de 80%**: Frequentemente indicam lógica condicional não testada. Branches são críticas porque representam decisões no código que podem levar a bugs se não validadas.

- **Functions não chamadas**: Podem indicar código morto que deve ser removido ou funcionalidades importantes que carecem de testes de integração.

- **Linhas específicas não cobertas**: A coluna "Uncovered Line #s" é seu guia de ação. Comece por essas linhas ao adicionar novos testes.

### Arquivo lcov.info

O arquivo `lcov.info` é um formato padronizado de cobertura amplamente suportado. Sua estrutura é legível por humanos mas otimizada para consumo por ferramentas:

```plaintext
SF:src/services/orderService.ts
FN:35,calculateOrderTotal
FN:58,createOrder
FN:82,updateOrderStatus
FNDA:10,calculateOrderTotal
FNDA:8,createOrder
FNDA:5,updateOrderStatus
FNF:3
FNH:3
DA:36,10
DA:37,10
DA:40,10
BRF:15
BRH:14
LF:85
LH:83
end_of_record
```

Este arquivo registra cada função (FN), quantas vezes foi chamada (FNDA), cada linha executada (DA), e informações sobre branches. Serviços de CI/CD como GitHub Actions podem processar este arquivo automaticamente para gerar badges de cobertura e alertas em pull requests.

### Relatório HTML Interativo

O relatório HTML é a ferramenta mais poderosa para desenvolvedores. Ao abrir `coverage/index.html`, você encontra:

**Página inicial**: Lista todos os arquivos com suas métricas individuais. Arquivos com baixa cobertura aparecem destacados, facilitando a priorização.

**Visualização por arquivo**: Clicando em um arquivo, você vê o código fonte completo com anotações visuais:

- Linhas verdes (cobertas): Foram executadas durante os testes
- Linhas vermelhas (não cobertas): Nunca foram executadas
- Linhas amarelas (parcialmente cobertas): Contêm branches onde alguns caminhos foram testados e outros não
- Números na margem: Indicam quantas vezes cada linha foi executada

**Indicadores de branch**: Quando você passa o mouse sobre linhas amarelas, uma tooltip mostra quais branches foram cobertas (E se "if" foi true) e quais não foram (E se "else" não foi testado).

Esta visualização é inestimável durante code reviews. Você pode rapidamente identificar se novas funcionalidades têm testes adequados e se refatorações mantiveram a cobertura existente.

## Estratégias Avançadas de Otimização

Alcançar e manter alta cobertura requer disciplina e estratégias específicas. Vamos explorar técnicas avançadas aplicáveis ao dia a dia:

### Teste de Casos Extremos (Edge Cases)

Casos extremos são frequentemente negligenciados mas representam fontes comuns de bugs em produção. No exemplo do `OrderService`, identificamos vários:

- Valores limítrofes: Testar exatamente quando descontos começam (quantidade 5, 10)
- Valores monetários limites: Testar pedidos exatamente em R$ 1000
- Strings vazias vs null vs apenas espaços: Cada caso pode ter comportamento diferente
- Arrays vazios: Sempre teste operações em coleções vazias

### Cobertura de Branches Complexas

Branches complexas envolvem múltiplas condições lógicas. Considere este exemplo:

```typescript
if (user.isActive && (user.hasPermission('admin') || user.hasPermission('moderator'))) {
  // código
}
```

Esta linha contém 4 branches que precisam ser testadas:

1. `user.isActive === true` e `hasPermission('admin') === true`
2. `user.isActive === true` e `hasPermission('moderator') === true`
3. `user.isActive === false` (curto-circuito, outras condições não importam)
4. `user.isActive === true` mas nenhuma permissão válida

Cada combinação representa um caminho único que deve ter teste dedicado.

### Testes Parametrizados

Para reduzir duplicação de código de teste, use testes parametrizados quando testar múltiplos cenários similares:

```typescript
describe('calculateOrderTotal - descontos progressivos', () => {
  const testCases = [
    { quantity: 1, price: 100, expected: 100, discount: 'nenhum' },
    { quantity: 4, price: 100, expected: 400, discount: 'nenhum' },
    { quantity: 5, price: 100, expected: 450, discount: '10%' },
    { quantity: 9, price: 100, expected: 810, discount: '10%' },
    { quantity: 10, price: 100, expected: 850, discount: '15%' },
    { quantity: 20, price: 50, expected: 850, discount: '15%' }
  ];

  testCases.forEach(({ quantity, price, expected, discount }) => {
    it(`deve aplicar ${discount} de desconto para quantidade ${quantity}`, () => {
      const items: OrderItem[] = [{ productId: 'P1', quantity, price }];
      const total = orderService.calculateOrderTotal(items);
      expect(total).to.equal(expected);
    });
  });
});
```

Esta abordagem garante cobertura completa de todos os caminhos de desconto mantendo o código de teste conciso e legível.

### Monitoramento Contínuo

Integre verificação de cobertura no seu pipeline de CI/CD. O script `coverage:check` falha se a cobertura cair abaixo dos limites definidos:

```bash
npm run coverage:check
```

Isso previne que código não testado seja merged inadvertidamente. Configure seu repositório para bloquear merges se os testes de cobertura falharem.

### Relatórios de Cobertura Diferencial

Em ambientes de equipe, é útil focar em cobertura diferencial: apenas o código adicionado ou modificado em um pull request deve ter cobertura adequada. Ferramentas como Codecov e Coveralls fornecem esta funcionalidade automaticamente ao processar o arquivo `lcov.info`.

## Práticas Recomendadas

Com base na experiência prática, algumas práticas se destacam como essenciais para manter qualidade e cobertura:

**Escreva testes antes de verificar cobertura**: Não deixe métricas de cobertura guiarem completamente seus testes. Primeiro, escreva testes que validem comportamentos importantes. Depois, use cobertura para identificar lacunas.

**Priorize qualidade sobre quantidade**: Um teste bem escrito que valida comportamento crítico é mais valioso que dez testes triviais que apenas aumentam percentuais.

**Teste comportamentos, não implementação**: Seus testes devem validar o que o código faz, não como ele faz. Isso permite refatorações sem quebrar testes.

**Mantenha testes independentes**: Cada teste deve poder rodar isoladamente. Use `beforeEach` para garantir estado limpo entre testes.

**Documente casos complexos**: Quando um teste cobre um caso extremo ou comportamento não óbvio, adicione comentários explicando o porquê daquele teste.

**Revise cobertura em code reviews**: Inclua análise de cobertura como parte do processo de revisão. Questione código novo sem testes adequados.

**Trate warnings de cobertura como erros**: Configure seu CI para falhar se a cobertura cair abaixo de limites estabelecidos.

## Limitações e Considerações

Embora o C8 seja uma ferramenta poderosa, é importante entender suas limitações:

**Cobertura não mede qualidade**: 100% de cobertura não significa código livre de bugs. Um teste pode executar uma linha mas não validar seu resultado corretamente.

**Código assíncrono requer atenção**: Certifique-se de que seus testes aguardam operações assíncronas completarem antes de finalizar. Promessas não aguardadas podem resultar em falsos positivos de cobertura.

**Performance em projetos grandes**: Em projetos muito grandes, a coleta de cobertura pode tornar os testes mais lentos. Considere executar cobertura completa apenas em CI, mantendo testes rápidos localmente.

**Mocking e stubs**: Código que utiliza mocks extensivamente pode ter alta cobertura mas baixa validação de integração real. Balance testes unitários com testes de integração.

**TypeScript e transpilação**: O C8 analisa o código JavaScript resultante da transpilação. Certifique-se de que source maps estão habilitados para mapear corretamente para o código TypeScript original.

## Conclusão

A cobertura de testes com C8 é uma ferramenta essencial no arsenal do desenvolvedor moderno. Ela fornece visibilidade clara sobre quais partes do código estão protegidas por testes e quais representam riscos potenciais. O exemplo prático demonstrado do `OrderService` ilustra como aplicar sistematicamente testes abrangentes que cobrem não apenas o caminho feliz, mas também cenários de erro, casos extremos e todas as variações de lógica condicional.

A chave para o sucesso não está em perseguir cegamente 100% de cobertura, mas em usar as métricas como ferramenta de qualidade. A visualização HTML permite identificar rapidamente áreas não testadas, enquanto os relatórios automatizados em CI/CD garantem que a cobertura não regrida ao longo do tempo.

Lembre-se que testes são investimento: o tempo gasto escrevendo testes hoje economiza horas de debugging e reduz o custo de manutenção no futuro. Com o C8 e as práticas descritas neste guia, você tem todas as ferramentas necessárias para construir aplicações robustas e confiáveis.
