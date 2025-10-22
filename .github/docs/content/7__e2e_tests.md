# Testes E2E - Aplicação no Nível Mais Amplo

- [Testes E2E - Aplicação no Nível Mais Amplo](#testes-e2e---aplicação-no-nível-mais-amplo)
  - [Introdução aos Testes End-to-End](#introdução-aos-testes-end-to-end)
  - [Fundamentos e Conceitos Centrais](#fundamentos-e-conceitos-centrais)
  - [Configuração Inicial do Ambiente](#configuração-inicial-do-ambiente)
  - [Exemplo Prático: Sistema de E-commerce](#exemplo-prático-sistema-de-e-commerce)
  - [Padrão Page Object Model](#padrão-page-object-model)
  - [Estratégias de Dados de Teste](#estratégias-de-dados-de-teste)
  - [Testes de API como Complemento](#testes-de-api-como-complemento)
  - [Estratégias para Testes Estáveis](#estratégias-para-testes-estáveis)
  - [Executando Testes em Pipeline CI/CD](#executando-testes-em-pipeline-cicd)
  - [Boas Práticas e Considerações Finais](#boas-práticas-e-considerações-finais)

## Introdução aos Testes End-to-End

Os testes End-to-End, conhecidos pela sigla E2E, representam a camada mais abrangente da pirâmide de testes de software. Enquanto testes unitários verificam funções isoladas e testes de integração examinam a comunicação entre componentes, os testes E2E simulam a jornada completa de um usuário real através da aplicação, validando todo o fluxo desde a interface até o banco de dados.

A filosofia por trás dos testes E2E baseia-se na premissa de que componentes individuais podem funcionar perfeitamente em isolamento, mas ainda assim falhar quando integrados no sistema completo. Esses testes garantem que todas as camadas da aplicação - frontend, backend, banco de dados, serviços externos e infraestrutura - trabalhem harmoniosamente em conjunto.

## Fundamentos e Conceitos Centrais

O conceito fundamental dos testes E2E reside na validação do comportamento do sistema sob a perspectiva do usuário final. Diferentemente de testes que verificam implementações técnicas específicas, os testes E2E focam nos resultados observáveis e nas experiências que realmente importam para quem usa o software.

Esses testes operam no nível mais alto de abstração, o que traz vantagens e desafios distintos. A vantagem principal é a confiança genuína que proporcionam: quando um teste E2E passa, você tem certeza de que aquele fluxo específico funciona completamente na aplicação real. O desafio reside na complexidade de manutenção e no tempo de execução, que tende a ser significativamente maior comparado a outros tipos de teste.

## Configuração Inicial do Ambiente

Para implementar testes E2E com Mocha, precisamos primeiro configurar o ambiente adequado. Utilizaremos Playwright como ferramenta de automação de navegador, que oferece APIs modernas e suporte robusto para TypeScript.

```typescript
// package.json - dependências necessárias
{
  "devDependencies": {
    "@types/mocha": "^10.0.6",
    "@types/chai": "^4.3.11",
    "mocha": "^10.2.0",
    "chai": "^4.4.1",
    "playwright": "^1.40.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
```

```typescript
// mocha.config.ts - configuração do Mocha para TypeScript
export default {
  require: ['ts-node/register'],
  extensions: ['ts'],
  spec: 'tests/e2e/**/*.spec.ts',
  timeout: 60000, // Testes E2E precisam de timeout maior
  slow: 10000
};
```

## Exemplo Prático: Sistema de E-commerce

Vamos construir um teste E2E para um cenário real comum no mercado: um usuário que navega pelo catálogo de produtos, adiciona itens ao carrinho e finaliza uma compra. Este fluxo toca todas as partes críticas do sistema.

```typescript
// tests/e2e/checkout.spec.ts
import { chromium, Browser, Page } from 'playwright';
import { expect } from 'chai';

describe('Fluxo de Checkout Completo', function() {
  let browser: Browser;
  let page: Page;
  const baseUrl = 'https://exemplo-ecommerce.com';

  // Setup: inicializa o navegador antes de todos os testes
  before(async function() {
    browser = await chromium.launch({
      headless: true, // Executa sem interface gráfica em CI/CD
      slowMo: 50 // Adiciona pequeno delay para estabilidade
    });
  });

  // Cria uma nova página para cada teste, garantindo isolamento
  beforeEach(async function() {
    page = await browser.newPage();
    await page.goto(baseUrl);
  });

  // Limpa a página após cada teste
  afterEach(async function() {
    await page.close();
  });

  // Fecha o navegador após todos os testes
  after(async function() {
    await browser.close();
  });

  it('deve permitir que usuário complete uma compra com sucesso', async function() {
    // Passo 1: Login do usuário
    // Este passo valida autenticação e sessão
    await page.click('button[data-testid="login-button"]');
    await page.fill('input[name="email"]', 'usuario@teste.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Aguarda navegação e verifica se login foi bem-sucedido
    await page.waitForSelector('[data-testid="user-profile"]');
    const userName = await page.textContent('[data-testid="user-name"]');
    expect(userName).to.include('Usuario Teste');

    // Passo 2: Busca por produto
    // Valida sistema de busca e exibição de resultados
    await page.fill('input[data-testid="search-input"]', 'notebook');
    await page.click('button[data-testid="search-button"]');
    await page.waitForSelector('[data-testid="product-card"]');

    // Passo 3: Adiciona produto ao carrinho
    // Verifica interação com sistema de inventário
    const primeirosProduto = page.locator('[data-testid="product-card"]').first();
    const nomeProduto = await primeirosProduto.locator('h3').textContent();
    const precoProduto = await primeirosProduto.locator('[data-testid="price"]').textContent();
    
    await primeirosProduto.click();
    await page.waitForSelector('[data-testid="product-details"]');
    await page.click('button[data-testid="add-to-cart"]');

    // Verifica feedback visual de sucesso
    await page.waitForSelector('[data-testid="cart-notification"]');
    const cartCount = await page.textContent('[data-testid="cart-count"]');
    expect(cartCount).to.equal('1');

    // Passo 4: Acessa carrinho e verifica itens
    // Valida persistência de dados e cálculos
    await page.click('[data-testid="cart-icon"]');
    await page.waitForSelector('[data-testid="cart-item"]');
    
    const itemNoCarrinho = await page.textContent('[data-testid="cart-item-name"]');
    expect(itemNoCarrinho).to.equal(nomeProduto);

    // Passo 5: Preenche informações de entrega
    // Testa formulários e validações
    await page.click('button[data-testid="proceed-checkout"]');
    await page.waitForSelector('form[data-testid="shipping-form"]');
    
    await page.fill('input[name="address"]', 'Rua Exemplo, 123');
    await page.fill('input[name="city"]', 'São Paulo');
    await page.fill('input[name="zipcode"]', '01234-567');
    await page.selectOption('select[name="state"]', 'SP');

    // Passo 6: Seleciona método de pagamento
    // Valida integração com gateway de pagamento (mock)
    await page.click('button[data-testid="continue-payment"]');
    await page.waitForSelector('[data-testid="payment-methods"]');
    await page.click('input[value="credit-card"]');
    
    await page.fill('input[name="cardNumber"]', '4111111111111111');
    await page.fill('input[name="cardName"]', 'Usuario Teste');
    await page.fill('input[name="expiry"]', '12/25');
    await page.fill('input[name="cvv"]', '123');

    // Passo 7: Finaliza compra
    // Verifica processamento completo e geração de pedido
    await page.click('button[data-testid="place-order"]');
    
    // Aguarda processamento (pode levar alguns segundos)
    await page.waitForSelector('[data-testid="order-confirmation"]', {
      timeout: 30000
    });

    // Validações finais
    const confirmationMessage = await page.textContent('[data-testid="success-message"]');
    expect(confirmationMessage).to.include('Pedido realizado com sucesso');
    
    const orderNumber = await page.textContent('[data-testid="order-number"]');
    expect(orderNumber).to.match(/^#\d{6,}$/); // Formato: #123456
    
    // Verifica se carrinho foi esvaziado
    const cartCountFinal = await page.textContent('[data-testid="cart-count"]');
    expect(cartCountFinal).to.equal('0');
  });
});
```

## Padrão Page Object Model

No desenvolvimento real, é fundamental organizar os testes usando o padrão Page Object Model (POM). Este padrão encapsula a lógica de interação com páginas específicas, tornando os testes mais legíveis e manuteníveis.

```typescript
// pages/LoginPage.ts
import { Page } from 'playwright';

export class LoginPage {
  constructor(private page: Page) {}

  async realizarLogin(email: string, senha: string): Promise<void> {
    // Encapsula toda a lógica de login em um método reutilizável
    await this.page.click('button[data-testid="login-button"]');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', senha);
    await this.page.click('button[type="submit"]');
    await this.page.waitForSelector('[data-testid="user-profile"]');
  }

  async obterNomeUsuario(): Promise<string> {
    const nome = await this.page.textContent('[data-testid="user-name"]');
    return nome || '';
  }
}
```

```typescript
// pages/CarrinhoPage.ts
import { Page } from 'playwright';

export class CarrinhoPage {
  constructor(private page: Page) {}

  async abrirCarrinho(): Promise<void> {
    await this.page.click('[data-testid="cart-icon"]');
    await this.page.waitForSelector('[data-testid="cart-item"]');
  }

  async obterQuantidadeItens(): Promise<number> {
    const count = await this.page.textContent('[data-testid="cart-count"]');
    return parseInt(count || '0');
  }

  async prosseguirParaCheckout(): Promise<void> {
    await this.page.click('button[data-testid="proceed-checkout"]');
    await this.page.waitForSelector('form[data-testid="shipping-form"]');
  }
}
```

```typescript
// tests/e2e/checkout-com-pom.spec.ts
import { chromium, Browser, Page } from 'playwright';
import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage';
import { CarrinhoPage } from '../pages/CarrinhoPage';

describe('Checkout usando Page Object Model', function() {
  let browser: Browser;
  let page: Page;
  let loginPage: LoginPage;
  let carrinhoPage: CarrinhoPage;

  before(async function() {
    browser = await chromium.launch({ headless: true });
  });

  beforeEach(async function() {
    page = await browser.newPage();
    await page.goto('https://exemplo-ecommerce.com');
    
    // Inicializa os Page Objects
    loginPage = new LoginPage(page);
    carrinhoPage = new CarrinhoPage(page);
  });

  afterEach(async function() {
    await page.close();
  });

  after(async function() {
    await browser.close();
  });

  it('deve adicionar produto e finalizar compra', async function() {
    // O teste fica mais limpo e expressivo
    await loginPage.realizarLogin('usuario@teste.com', 'senha123');
    
    const nomeUsuario = await loginPage.obterNomeUsuario();
    expect(nomeUsuario).to.include('Usuario Teste');

    // Adiciona produto (simplificado para brevidade)
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button[data-testid="add-to-cart"]');

    // Verifica carrinho usando Page Object
    await carrinhoPage.abrirCarrinho();
    const quantidade = await carrinhoPage.obterQuantidadeItens();
    expect(quantidade).to.equal(1);

    await carrinhoPage.prosseguirParaCheckout();
    // Continuação do fluxo de checkout...
  });
});
```

## Estratégias de Dados de Teste

Um desafio crucial nos testes E2E é gerenciar dados de teste. Em ambientes reais, precisamos garantir que cada execução de teste tenha dados consistentes e isolados.

```typescript
// fixtures/testData.ts
export interface UsuarioTeste {
  email: string;
  senha: string;
  nome: string;
}

export interface ProdutoTeste {
  nome: string;
  preco: number;
  categoria: string;
}

// Gera dados únicos para evitar conflitos entre execuções paralelas
export function gerarUsuarioTeste(): UsuarioTeste {
  const timestamp = Date.now();
  return {
    email: `teste.${timestamp}@exemplo.com`,
    senha: 'SenhaSegura123!',
    nome: `Usuario Teste ${timestamp}`
  };
}

export const produtosTeste: ProdutoTeste[] = [
  { nome: 'Notebook Dell', preco: 3500.00, categoria: 'Informática' },
  { nome: 'Mouse Logitech', preco: 150.00, categoria: 'Periféricos' }
];
```

```typescript
// helpers/databaseHelper.ts
import { Pool } from 'pg';

export class DatabaseHelper {
  private pool: Pool;

  constructor() {
    // Conecta ao banco de teste
    this.pool = new Pool({
      host: process.env.TEST_DB_HOST || 'localhost',
      database: process.env.TEST_DB_NAME || 'ecommerce_test',
      user: process.env.TEST_DB_USER || 'test_user',
      password: process.env.TEST_DB_PASSWORD
    });
  }

  async prepararUsuarioTeste(usuario: UsuarioTeste): Promise<void> {
    // Cria usuário diretamente no banco para acelerar testes
    await this.pool.query(
      'INSERT INTO usuarios (email, senha_hash, nome) VALUES ($1, $2, $3)',
      [usuario.email, this.hashSenha(usuario.senha), usuario.nome]
    );
  }

  async limparDadosTeste(): Promise<void> {
    // Remove dados de teste após execução
    await this.pool.query('DELETE FROM pedidos WHERE email LIKE $1', ['%@exemplo.com']);
    await this.pool.query('DELETE FROM usuarios WHERE email LIKE $1', ['%@exemplo.com']);
  }

  private hashSenha(senha: string): string {
    // Implementação simplificada - usar bcrypt em produção
    return Buffer.from(senha).toString('base64');
  }

  async fecharConexao(): Promise<void> {
    await this.pool.end();
  }
}
```

## Testes de API como Complemento

Frequentemente, combinar testes E2E de interface com validações diretas na API fornece cobertura mais robusta e testes mais rápidos para operações backend.

```typescript
// tests/e2e/api-validation.spec.ts
import { chromium, Browser, Page } from 'playwright';
import { expect } from 'chai';
import axios from 'axios';

describe('Validação de Pedido - UI e API', function() {
  let browser: Browser;
  let page: Page;
  const apiUrl = 'https://api.exemplo-ecommerce.com';
  let authToken: string;

  before(async function() {
    browser = await chromium.launch({ headless: true });
    
    // Obtém token de autenticação via API
    const response = await axios.post(`${apiUrl}/auth/login`, {
      email: 'usuario@teste.com',
      password: 'senha123'
    });
    authToken = response.data.token;
  });

  beforeEach(async function() {
    page = await browser.newPage();
  });

  afterEach(async function() {
    await page.close();
  });

  after(async function() {
    await browser.close();
  });

  it('deve criar pedido via UI e validar dados via API', async function() {
    await page.goto('https://exemplo-ecommerce.com');
    
    // Realiza compra pela interface (simplificado)
    await page.click('[data-testid="product-card"]:first-child');
    await page.click('button[data-testid="quick-buy"]');
    
    await page.waitForSelector('[data-testid="order-confirmation"]');
    const numeroPedidoUI = await page.textContent('[data-testid="order-number"]');
    const pedidoId = numeroPedidoUI?.replace('#', '');

    // Valida via API que o pedido foi realmente criado no backend
    const apiResponse = await axios.get(
      `${apiUrl}/orders/${pedidoId}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    // Verificações detalhadas que seriam difíceis na UI
    expect(apiResponse.status).to.equal(200);
    expect(apiResponse.data.status).to.equal('pending_payment');
    expect(apiResponse.data.total).to.be.a('number');
    expect(apiResponse.data.items).to.have.lengthOf(1);
    expect(apiResponse.data.created_at).to.match(/^\d{4}-\d{2}-\d{2}/);
  });
});
```

## Estratégias para Testes Estáveis

Testes E2E são notoriamente frágeis devido à natureza assíncrona das aplicações web modernas. Implementar estratégias de espera adequadas é fundamental.

```typescript
// helpers/waitHelper.ts
import { Page } from 'playwright';

export class WaitHelper {
  constructor(private page: Page) {}

  // Aguarda elemento estar visível e interagível
  async aguardarElementoClicavel(selector: string, timeout = 10000): Promise<void> {
    await this.page.waitForSelector(selector, { 
      state: 'visible',
      timeout 
    });
    
    // Aguarda também que animações CSS terminem
    await this.page.waitForFunction(
      (sel) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return style.opacity === '1' && style.visibility === 'visible';
      },
      selector,
      { timeout: 5000 }
    );
  }

  // Aguarda requisição específica ser completada
  async aguardarRequisicao(urlPattern: string): Promise<void> {
    await this.page.waitForResponse(
      response => response.url().includes(urlPattern) && response.status() === 200,
      { timeout: 30000 }
    );
  }

  // Aguarda loading desaparecer
  async aguardarCarregamento(): Promise<void> {
    try {
      await this.page.waitForSelector('[data-testid="loading"]', {
        state: 'hidden',
        timeout: 15000
      });
    } catch {
      // Loading pode não aparecer se requisição for muito rápida
    }
  }
}
```

## Executando Testes em Pipeline CI/CD

Para integrar testes E2E em pipelines de integração contínua, precisamos de configurações específicas que garantam execução confiável em ambientes automatizados.

```typescript
// scripts/run-e2e-tests.ts
import Mocha from 'mocha';
import { DatabaseHelper } from '../helpers/databaseHelper';

async function executarTestesE2E() {
  const dbHelper = new DatabaseHelper();
  
  try {
    // Prepara ambiente de teste
    console.log('Preparando ambiente de teste...');
    await dbHelper.limparDadosTeste();

    // Configura Mocha programaticamente
    const mocha = new Mocha({
      timeout: 60000,
      reporter: 'spec', // Use 'json' para CI/CD
      slow: 10000,
      retries: 2 // Reexecuta testes flaky até 2 vezes
    });

    // Adiciona arquivos de teste
    mocha.addFile('tests/e2e/checkout.spec.ts');
    mocha.addFile('tests/e2e/api-validation.spec.ts');

    // Executa testes
    const failures = await new Promise<number>((resolve) => {
      mocha.run(resolve);
    });

    // Limpa ambiente após testes
    console.log('Limpando dados de teste...');
    await dbHelper.limparDadosTeste();
    await dbHelper.fecharConexao();

    // Retorna código de saída apropriado para CI/CD
    process.exit(failures > 0 ? 1 : 0);

  } catch (error) {
    console.error('Erro ao executar testes E2E:', error);
    await dbHelper.fecharConexao();
    process.exit(1);
  }
}

executarTestesE2E();
```

## Boas Práticas e Considerações Finais

Os testes E2E devem seguir princípios que garantam sua eficácia a longo prazo. Primeiro, mantenha os testes focados nos fluxos críticos de negócio. Não é necessário nem recomendável testar cada pequena interação através de testes E2E. Reserve-os para jornadas completas que realmente impactam o usuário final.

Segundo, invista em infraestrutura de dados de teste robusta. Testes que dependem de dados específicos ou compartilham estado entre si são fontes constantes de falhas intermitentes. Cada teste deve ser capaz de executar de forma independente e paralela.

Terceiro, equilibre velocidade com cobertura. Testes E2E são naturalmente lentos. Considere executar suítes completas apenas em momentos críticos do pipeline, enquanto mantém uma suíte de smoke tests mais enxuta para feedback rápido.

Por fim, monitore e mantenha seus testes ativamente. Um teste E2E quebrado que ninguém corrige é pior que não ter o teste, pois erode a confiança na suíte de testes como um todo. Estabeleça responsabilidades claras pela manutenção e trate falhas de teste com a mesma seriedade que bugs em produção.

Os testes E2E, quando bem implementados, fornecem a camada final de confiança necessária para entregas contínuas de software de qualidade. Eles validam que todas as peças do sistema funcionam em harmonia, exatamente como seus usuários experimentarão no mundo real.
