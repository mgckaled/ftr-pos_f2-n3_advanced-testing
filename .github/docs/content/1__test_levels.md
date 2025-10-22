# Nívéis de Testes

> Voltar a página Antr

## Índice

- [Nívéis de Testes](#nívéis-de-testes)
  - [Índice](#índice)
  - [Introducao](#introducao)
  - [Tipos de Testes e a Piramide de Testes](#tipos-de-testes-e-a-piramide-de-testes)
    - [Testes Unitarios](#testes-unitarios)
    - [Testes de Integração](#testes-de-integração)
    - [Testes End-to-End](#testes-end-to-end)
    - [Testes de Performance](#testes-de-performance)
    - [Testes de Segurança](#testes-de-segurança)
    - [Testes de Acessibilidade](#testes-de-acessibilidade)
    - [Testes de Regressão Visual](#testes-de-regressão-visual)
  - [Melhores Praticas](#melhores-praticas)

## Introducao

Os testes automatizados representam uma pratica fundamental no desenvolvimento de software moderno. Eles funcionam como uma rede de seguranca que nos permite modificar codigo com confianca, sabendo que qualquer quebra de funcionalidade sera detectada rapidamente. Vamos explorar os diferentes tipos de testes, desde os conceitos basicos ate implementacoes avancadas, usando TypeScript para exemplificar.

## Tipos de Testes e a Piramide de Testes

Antes de mergulharmos nos exemplos, e importante entender a piramide de testes. Imagine uma piramide onde a base e larga e o topo e estreito. Na base, temos muitos testes unitarios rapidos e baratos. No meio, temos testes de integracao em quantidade moderada. No topo, temos poucos testes end-to-end que sao mais lentos e custosos.

### Testes Unitarios

Os testes unitarios focam em testar unidades individuais de codigo de forma isolada. Uma unidade pode ser uma funcao, um metodo ou uma classe. O objetivo e verificar se cada peca funciona corretamente por si so, sem depender de outras partes do sistema.

Vamos comecar com um exemplo basico de uma funcao que calcula o preco final de um produto com desconto:

```typescript
// product.ts
export class Product {
  constructor(
    private name: string,
    private price: number
  ) {}

  // Calcula o preco final aplicando um percentual de desconto
  calculateFinalPrice(discountPercentage: number): number {
    if (discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Desconto deve estar entre 0 e 100');
    }
    
    const discountAmount = this.price * (discountPercentage / 100);
    return this.price - discountAmount;
  }

  getPrice(): number {
    return this.price;
  }
}
```

Agora, vamos criar testes unitarios para essa classe usando Jest, um dos frameworks de teste mais populares:

```typescript
// product.test.ts
import { Product } from './product';

describe('Product', () => {
  // Teste basico: verifica se o calculo sem desconto retorna o preco original
  test('deve retornar o preco original quando nao ha desconto', () => {
    const product = new Product('Notebook', 3000);
    const finalPrice = product.calculateFinalPrice(0);
    
    expect(finalPrice).toBe(3000);
  });

  // Teste com desconto simples
  test('deve calcular corretamente o preco com 10% de desconto', () => {
    const product = new Product('Mouse', 100);
    const finalPrice = product.calculateFinalPrice(10);
    
    expect(finalPrice).toBe(90);
  });

  // Teste de validacao: verifica se a funcao lanca erro para valores invalidos
  test('deve lancar erro quando o desconto e negativo', () => {
    const product = new Product('Teclado', 200);
    
    expect(() => {
      product.calculateFinalPrice(-10);
    }).toThrow('Desconto deve estar entre 0 e 100');
  });

  // Teste de borda: verifica o comportamento no limite superior
  test('deve retornar zero quando o desconto e 100%', () => {
    const product = new Product('Cadeira', 500);
    const finalPrice = product.calculateFinalPrice(100);
    
    expect(finalPrice).toBe(0);
  });
});
```

Agora vamos para um exemplo mais avancado, testando uma classe com dependencias. Aqui usaremos mocks para isolar a unidade que estamos testando:

```typescript
// email-service.ts
export interface EmailProvider {
  send(to: string, subject: string, body: string): Promise<boolean>;
}

export class EmailService {
  constructor(private provider: EmailProvider) {}

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const subject = 'Bem-vindo!';
    const body = `Ola ${userName}, seja bem-vindo a nossa plataforma!`;
    
    const success = await this.provider.send(userEmail, subject, body);
    
    if (!success) {
      throw new Error('Falha ao enviar email de boas-vindas');
    }
  }
}
```

```typescript
// email-service.test.ts
import { EmailService, EmailProvider } from './email-service';

describe('EmailService', () => {
  // Criamos um mock do provider para isolar o teste
  test('deve enviar email de boas-vindas com formato correto', async () => {
    const mockProvider: EmailProvider = {
      send: jest.fn().mockResolvedValue(true)
    };
    
    const service = new EmailService(mockProvider);
    await service.sendWelcomeEmail('usuario@example.com', 'Joao');
    
    // Verificamos se o provider foi chamado com os parametros corretos
    expect(mockProvider.send).toHaveBeenCalledWith(
      'usuario@example.com',
      'Bem-vindo!',
      'Ola Joao, seja bem-vindo a nossa plataforma!'
    );
  });

  // Teste de cenario de falha
  test('deve lancar erro quando o provider falha', async () => {
    const mockProvider: EmailProvider = {
      send: jest.fn().mockResolvedValue(false)
    };
    
    const service = new EmailService(mockProvider);
    
    await expect(
      service.sendWelcomeEmail('usuario@example.com', 'Maria')
    ).rejects.toThrow('Falha ao enviar email de boas-vindas');
  });
});
```

### Testes de Integração

Enquanto os testes unitarios verificam pecas isoladas, os testes de integracao verificam como diferentes modulos trabalham juntos. Eles testam a interacao entre componentes, geralmente incluindo acesso a bancos de dados, APIs externas ou sistemas de arquivos.

Vamos criar um exemplo com um repositorio que interage com um banco de dados:

```typescript
// user-repository.ts
import { Database } from './database';

export interface User {
  id: string;
  name: string;
  email: string;
}

export class UserRepository {
  constructor(private db: Database) {}

  async createUser(name: string, email: string): Promise<User> {
    // Verifica se o email ja existe
    const existing = await this.db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      throw new Error('Email ja cadastrado');
    }

    // Insere o novo usuario
    const id = await this.db.insert(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    return { id, name, email };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return result.length > 0 ? result[0] : null;
  }
}
```

No teste de integracao, usamos um banco de dados real, mas geralmente um ambiente de teste separado:

```typescript
// user-repository.integration.test.ts
import { UserRepository } from './user-repository';
import { Database } from './database';

describe('UserRepository Integration Tests', () => {
  let db: Database;
  let repository: UserRepository;

  // Setup: prepara o ambiente antes de cada teste
  beforeEach(async () => {
    db = new Database('test_database');
    await db.connect();
    
    // Limpa a tabela para garantir um estado limpo
    await db.execute('DELETE FROM users');
    
    repository = new UserRepository(db);
  });

  // Cleanup: limpa o ambiente apos cada teste
  afterEach(async () => {
    await db.disconnect();
  });

  test('deve criar usuario e persistir no banco de dados', async () => {
    const user = await repository.createUser('Ana Silva', 'ana@example.com');
    
    // Verifica se o usuario foi criado
    expect(user.name).toBe('Ana Silva');
    expect(user.email).toBe('ana@example.com');
    expect(user.id).toBeDefined();
    
    // Verifica se o usuario realmente esta no banco
    const foundUser = await repository.findUserByEmail('ana@example.com');
    expect(foundUser).toEqual(user);
  });

  test('deve lancar erro ao tentar criar usuario com email duplicado', async () => {
    await repository.createUser('Carlos', 'carlos@example.com');
    
    await expect(
      repository.createUser('Carlos Junior', 'carlos@example.com')
    ).rejects.toThrow('Email ja cadastrado');
  });

  test('deve retornar null quando usuario nao existe', async () => {
    const user = await repository.findUserByEmail('inexistente@example.com');
    expect(user).toBeNull();
  });
});
```

Um exemplo mais avancado seria testar a integracao com uma API externa:

```typescript
// weather-service.ts
export interface WeatherData {
  temperature: number;
  condition: string;
  city: string;
}

export class WeatherService {
  constructor(
    private apiUrl: string,
    private apiKey: string
  ) {}

  async getWeather(city: string): Promise<WeatherData> {
    const url = `${this.apiUrl}/weather?q=${city}&appid=${this.apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar clima: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      condition: data.weather[0].description,
      city: data.name
    };
  }
}
```

```typescript
// weather-service.integration.test.ts
import { WeatherService } from './weather-service';
import fetchMock from 'jest-fetch-mock';

// Habilitamos o mock do fetch para controlar as respostas
fetchMock.enableMocks();

describe('WeatherService Integration Tests', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('deve buscar dados de clima corretamente', async () => {
    // Simulamos a resposta da API externa
    fetchMock.mockResponseOnce(JSON.stringify({
      name: 'Sao Paulo',
      main: { temp: 25 },
      weather: [{ description: 'ensolarado' }]
    }));

    const service = new WeatherService('https://api.weather.com', 'test-key');
    const weather = await service.getWeather('Sao Paulo');

    expect(weather.temperature).toBe(25);
    expect(weather.condition).toBe('ensolarado');
    expect(weather.city).toBe('Sao Paulo');
    
    // Verifica se a URL foi construida corretamente
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.weather.com/weather?q=Sao Paulo&appid=test-key'
    );
  });

  test('deve lancar erro quando a API retorna erro', async () => {
    fetchMock.mockResponseOnce('', { status: 404 });

    const service = new WeatherService('https://api.weather.com', 'test-key');
    
    await expect(
      service.getWeather('CidadeInexistente')
    ).rejects.toThrow('Erro ao buscar clima: 404');
  });
});
```

### Testes End-to-End

Os testes end-to-end simulam o comportamento real do usuario, testando o sistema completo do inicio ao fim. Eles sao os mais lentos mas tambem os que mais se aproximam do uso real da aplicacao. Vamos usar o Playwright como exemplo:

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

describe('Fluxo de Login', () => {
  // Teste basico de login bem-sucedido
  test('deve fazer login com credenciais validas', async ({ page }) => {
    // Navega ate a pagina de login
    await page.goto('http://localhost:3000/login');
    
    // Preenche o formulario
    await page.fill('input[name="email"]', 'usuario@example.com');
    await page.fill('input[name="password"]', 'senha123');
    
    // Clica no botao de login
    await page.click('button[type="submit"]');
    
    // Verifica se foi redirecionado para o dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');
    
    // Verifica se o nome do usuario aparece na tela
    await expect(page.locator('text=Bem-vindo, Usuario')).toBeVisible();
  });

  test('deve exibir mensagem de erro com credenciais invalidas', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[name="email"]', 'invalido@example.com');
    await page.fill('input[name="password"]', 'senhaerrada');
    await page.click('button[type="submit"]');
    
    // Verifica se a mensagem de erro aparece
    await expect(
      page.locator('text=Email ou senha incorretos')
    ).toBeVisible();
    
    // Verifica se ainda esta na pagina de login
    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});
```

Teste end-to-end mais avancado com multiplas interacoes:

```typescript
// e2e/shopping-cart.spec.ts
import { test, expect } from '@playwright/test';

describe('Fluxo de Compra Completo', () => {
  test('deve adicionar produtos ao carrinho e finalizar compra', async ({ page }) => {
    // Login inicial
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'comprador@example.com');
    await page.fill('input[name="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Navega para a lista de produtos
    await page.click('text=Produtos');
    await expect(page).toHaveURL(/.*\/products/);
    
    // Adiciona o primeiro produto ao carrinho
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.locator('button:has-text("Adicionar")').click();
    
    // Verifica se o contador do carrinho foi atualizado
    const cartBadge = page.locator('.cart-badge');
    await expect(cartBadge).toHaveText('1');
    
    // Adiciona mais um produto
    const secondProduct = page.locator('.product-card').nth(1);
    await secondProduct.locator('button:has-text("Adicionar")').click();
    await expect(cartBadge).toHaveText('2');
    
    // Vai para o carrinho
    await page.click('.cart-icon');
    await expect(page).toHaveURL(/.*\/cart/);
    
    // Verifica se os produtos estao listados
    const cartItems = page.locator('.cart-item');
    await expect(cartItems).toHaveCount(2);
    
    // Verifica o total
    const totalElement = page.locator('.cart-total');
    const totalText = await totalElement.textContent();
    expect(totalText).toContain('R$');
    
    // Finaliza a compra
    await page.click('button:has-text("Finalizar Compra")');
    
    // Preenche dados de pagamento
    await page.fill('input[name="cardNumber"]', '4111111111111111');
    await page.fill('input[name="cardName"]', 'Comprador Teste');
    await page.fill('input[name="expiry"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    
    await page.click('button:has-text("Confirmar Pagamento")');
    
    // Verifica a pagina de sucesso
    await expect(page).toHaveURL(/.*\/order-success/);
    await expect(
      page.locator('text=Pedido realizado com sucesso')
    ).toBeVisible();
    
    // Verifica se recebeu um numero de pedido
    const orderNumber = page.locator('.order-number');
    await expect(orderNumber).toBeVisible();
  });
});
```

### Testes de Performance

Os testes de performance verificam se o sistema responde dentro de tempos aceitaveis sob diferentes cargas. Vamos usar o Artillery como exemplo:

```typescript
// performance/load-test.ts
import { artillery } from 'artillery';

export const loadTestConfig = {
  config: {
    target: 'http://localhost:3000',
    phases: [
      // Fase de aquecimento: aumenta usuarios gradualmente
      { duration: 60, arrivalRate: 5, name: 'Warm up' },
      // Fase de carga sustentada: mantem usuarios constantes
      { duration: 120, arrivalRate: 20, name: 'Sustained load' },
      // Fase de pico: aumenta drasticamente a carga
      { duration: 60, arrivalRate: 50, name: 'Spike' }
    ],
    // Define metricas de sucesso
    ensure: {
      maxErrorRate: 1,
      p95: 500, // 95% das requisicoes devem responder em menos de 500ms
      p99: 1000
    }
  },
  scenarios: [
    {
      name: 'Buscar produtos e adicionar ao carrinho',
      flow: [
        {
          get: {
            url: '/api/products',
            // Captura dados da resposta para usar depois
            capture: {
              json: '$.products[0].id',
              as: 'productId'
            }
          }
        },
        {
          // Simula tempo de leitura do usuario
          think: 2
        },
        {
          post: {
            url: '/api/cart',
            json: {
              productId: '{{ productId }}',
              quantity: 1
            }
          }
        }
      ]
    }
  ]
};
```

### Testes de Segurança

Os testes de seguranca verificam vulnerabilidades conhecidas. Vamos criar testes para verificar proteções básicas:

```typescript
// security/sql-injection.test.ts
import { UserRepository } from '../user-repository';
import { Database } from '../database';

describe('Testes de Seguranca - SQL Injection', () => {
  let db: Database;
  let repository: UserRepository;

  beforeEach(async () => {
    db = new Database('test_database');
    await db.connect();
    repository = new UserRepository(db);
  });

  afterEach(async () => {
    await db.disconnect();
  });

  test('deve proteger contra SQL injection no email', async () => {
    // Tenta injecao SQL classica
    const maliciousEmail = "' OR '1'='1";
    
    const result = await repository.findUserByEmail(maliciousEmail);
    
    // Se estiver protegido, deve retornar null em vez de todos os usuarios
    expect(result).toBeNull();
  });

  test('deve escapar caracteres especiais corretamente', async () => {
    // Cria usuario com caracteres especiais legitimos
    await repository.createUser('Test User', "test'user@example.com");
    
    // Deve conseguir buscar o usuario normalmente
    const user = await repository.findUserByEmail("test'user@example.com");
    expect(user).not.toBeNull();
    expect(user?.email).toBe("test'user@example.com");
  });
});
```

```typescript
// security/xss.test.ts
import { renderToString } from 'react-dom/server';
import { UserProfile } from '../components/UserProfile';

describe('Testes de Seguranca - XSS', () => {
  test('deve escapar scripts maliciosos no nome do usuario', () => {
    const maliciousName = '<script>alert("XSS")</script>';
    
    const html = renderToString(
      <UserProfile name={maliciousName} />
    );
    
    // Verifica se o script nao foi renderizado como codigo executavel
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  test('deve proteger contra event handlers maliciosos', () => {
    const maliciousName = '<img src=x onerror="alert(1)">';
    
    const html = renderToString(
      <UserProfile name={maliciousName} />
    );
    
    expect(html).not.toContain('onerror=');
  });
});
```

### Testes de Acessibilidade

Os testes de acessibilidade garantem que a aplicacao seja usavel por pessoas com diferentes necessidades:

```typescript
// accessibility/button.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../components/Button';

expect.extend(toHaveNoViolations);

describe('Testes de Acessibilidade - Button', () => {
  test('deve ser acessivel com texto visivel', async () => {
    const { container } = render(<Button>Clique aqui</Button>);
    const results = await axe(container);
    
    expect(results).toHaveNoViolations();
  });

  test('deve ter label adequado quando usa apenas icone', async () => {
    const { container } = render(
      <Button aria-label="Fechar">
        <CloseIcon />
      </Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('deve ter contraste de cor adequado', async () => {
    const { container } = render(
      <Button style={{ backgroundColor: '#fff', color: '#000' }}>
        Botao
      </Button>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Testes de Regressão Visual

Os testes de regressão visual detectam mudancas nao intencionais na aparencia da interface:

```typescript
// visual/homepage.visual.test.ts
import { test, expect } from '@playwright/test';

test.describe('Testes de Regressao Visual', () => {
  test('homepage deve corresponder ao snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Aguarda todos os elementos carregarem
    await page.waitForLoadState('networkidle');
    
    // Tira screenshot e compara com baseline
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      threshold: 0.2 // Permite 0.2% de diferenca
    });
  });

  test('modal de login deve corresponder ao snapshot', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('button:has-text("Login")');
    
    const modal = page.locator('.modal');
    await expect(modal).toBeVisible();
    
    await expect(modal).toHaveScreenshot('login-modal.png');
  });
});
```

## Melhores Praticas

Para finalizar, vamos revisar algumas praticas importantes que devem guiar a escrita de todos esses tipos de testes.

Primeiro, seus testes devem ser independentes uns dos outros. Cada teste deve poder rodar sozinho sem depender da ordem de execucao. Isso significa que voce deve sempre preparar o estado necessario no inicio do teste e limpar tudo no final.

Segundo, use nomes descritivos que expliquem exatamente o que esta sendo testado e qual e o comportamento esperado. Um bom nome de teste funciona como documentacao viva do sistema.

Terceiro, siga o padrao Arrange-Act-Assert: prepare os dados necessarios, execute a acao que deseja testar e depois verifique se o resultado foi o esperado. Essa estrutura torna os testes mais legiveis.

Quarto, teste casos extremos e situacoes de erro, nao apenas o caminho feliz. E nos cenarios inesperados que muitos bugs se escondem.

Finalmente, mantenha seus testes simples e focados. Cada teste deve verificar uma unica coisa. Se voce perceber que esta testando multiplos comportamentos em um unico teste, provavelmente e hora de dividir em testes menores.

Com essa base solida de diferentes tipos de testes, voce tera as ferramentas necessarias para construir aplicacoes mais confiaveis e manter a qualidade do codigo ao longo do tempo.
