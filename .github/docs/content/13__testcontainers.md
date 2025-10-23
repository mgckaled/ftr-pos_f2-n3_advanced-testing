# Testcontainers - Infraestrutura para testes de integração

## Índice

- [Testcontainers - Infraestrutura para testes de integração](#testcontainers---infraestrutura-para-testes-de-integração)
  - [Índice](#índice)
  - [Introdução](#introdução)
    - [Conceitos Fundamentais](#conceitos-fundamentais)
  - [Configuração Inicial](#configuração-inicial)
    - [Instalação](#instalação)
    - [Dependências adicionais](#dependências-adicionais)
    - [Configuração do Mocha](#configuração-do-mocha)
    - [Configuração do TypeScript](#configuração-do-typescript)
  - [Exemplos Práticos](#exemplos-práticos)
    - [Exemplo 1: Teste de Integração com PostgreSQL](#exemplo-1-teste-de-integração-com-postgresql)
    - [Exemplo 2: Teste com Redis para Cache](#exemplo-2-teste-com-redis-para-cache)
    - [Exemplo 3: Teste com MongoDB](#exemplo-3-teste-com-mongodb)
    - [Exemplo 4: Teste com RabbitMQ](#exemplo-4-teste-com-rabbitmq)
  - [Configurações Ideais](#configurações-ideais)
    - [Configuração de Timeout](#configuração-de-timeout)
    - [Configuração de Wait Strategies](#configuração-de-wait-strategies)
    - [Variáveis de Ambiente](#variáveis-de-ambiente)
    - [Volumes e Dados Iniciais](#volumes-e-dados-iniciais)
  - [Melhores Práticas](#melhores-práticas)
    - [1. Isolamento de Testes](#1-isolamento-de-testes)
    - [2. Reutilização de Contêineres](#2-reutilização-de-contêineres)
    - [3. Configuração de Recursos](#3-configuração-de-recursos)
    - [4. Logs e Debugging](#4-logs-e-debugging)
    - [5. Network Isolation](#5-network-isolation)
    - [6. Tratamento de Erros](#6-tratamento-de-erros)
    - [7. Cache de Imagens](#7-cache-de-imagens)
    - [8. Configuração de CI/CD](#8-configuração-de-cicd)
    - [9. Organização de Testes](#9-organização-de-testes)
    - [10. Performance e Otimização](#10-performance-e-otimização)
  - [Conclusão](#conclusão)

## Introdução

Testcontainers é uma biblioteca que fornece instâncias descartáveis e leves de bancos de dados, message brokers, navegadores web ou praticamente qualquer coisa que possa ser executada em um contêiner Docker. A principal vantagem é permitir testes de integração reais contra dependências reais, eliminando a necessidade de mocks complexos ou ambientes compartilhados que podem causar interferências entre testes.

### Conceitos Fundamentais

**Contêineres efêmeros**: cada execução de teste pode ter seu próprio contêiner isolado, garantindo que os testes não interfiram uns com os outros.

**Infraestrutura como código**: a configuração da infraestrutura de teste é definida no próprio código de teste, facilitando manutenção e versionamento.

**Testes determinísticos**: ao usar dependências reais em contêineres isolados, os testes se tornam mais confiáveis e reproduzíveis em qualquer ambiente.

**Ciclo de vida automático**: os contêineres são automaticamente iniciados antes dos testes e destruídos após a execução, evitando desperdício de recursos.

## Configuração Inicial

### Instalação

```bash
pnpm add testcontainers --save-dev
```

### Dependências adicionais

```bash
pnpm add mocha @types/mocha chai @types/chai sinon @types/sinon ts-node --save-dev
```

### Configuração do Mocha

Crie o arquivo `.mocharc.json` na raiz do projeto:

```json
{
  "require": ["ts-node/register"],
  "extensions": ["ts"],
  "spec": ["test/**/*.test.ts"],
  "timeout": 60000,
  "slow": 10000
}
```

O timeout elevado é necessário porque a inicialização de contêineres pode levar alguns segundos, especialmente na primeira execução quando as imagens Docker precisam ser baixadas.

### Configuração do TypeScript

Certifique-se de que seu `tsconfig.json` está configurado adequadamente:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*", "test/**/*"],
  "exclude": ["node_modules"]
}
```

## Exemplos Práticos

### Exemplo 1: Teste de Integração com PostgreSQL

Este exemplo simula um cenário real onde você precisa testar operações de CRUD em um banco de dados PostgreSQL.

```typescript
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { Client } from 'pg';

describe('UserRepository Integration Tests', () => {
  let container: StartedTestContainer;
  let dbClient: Client;

  before(async function() {
    this.timeout(60000);

    container = await new GenericContainer('postgres:15-alpine')
      .withEnvironment({
        POSTGRES_USER: 'testuser',
        POSTGRES_PASSWORD: 'testpass',
        POSTGRES_DB: 'testdb'
      })
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .start();

    const port = container.getMappedPort(5432);
    const host = container.getHost();

    dbClient = new Client({
      host,
      port,
      user: 'testuser',
      password: 'testpass',
      database: 'testdb'
    });

    await dbClient.connect();

    await dbClient.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  });

  after(async () => {
    await dbClient?.end();
    await container?.stop();
  });

  it('deve inserir e recuperar um usuário', async () => {
    const insertResult = await dbClient.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
      ['João Silva', 'joao@example.com']
    );

    const userId = insertResult.rows[0].id;

    const selectResult = await dbClient.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );

    expect(selectResult.rows).to.have.lengthOf(1);
    expect(selectResult.rows[0].name).to.equal('João Silva');
    expect(selectResult.rows[0].email).to.equal('joao@example.com');
  });

  it('deve retornar erro ao inserir email duplicado', async () => {
    await dbClient.query(
      'INSERT INTO users (name, email) VALUES ($1, $2)',
      ['Maria Santos', 'maria@example.com']
    );

    try {
      await dbClient.query(
        'INSERT INTO users (name, email) VALUES ($1, $2)',
        ['Maria Silva', 'maria@example.com']
      );
      expect.fail('Deveria ter lançado erro de constraint');
    } catch (error: any) {
      expect(error.code).to.equal('23505');
    }
  });
});
```

### Exemplo 2: Teste com Redis para Cache

Cenário comum em aplicações modernas que utilizam Redis para armazenamento em cache.

```typescript
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import Redis from 'ioredis';

describe('CacheService Integration Tests', () => {
  let container: StartedTestContainer;
  let redisClient: Redis;

  before(async function() {
    this.timeout(60000);

    container = await new GenericContainer('redis:7-alpine')
      .withExposedPorts(6379)
      .withWaitStrategy(Wait.forLogMessage('Ready to accept connections'))
      .start();

    const port = container.getMappedPort(6379);
    const host = container.getHost();

    redisClient = new Redis({
      host,
      port,
      maxRetriesPerRequest: 3
    });
  });

  after(async () => {
    await redisClient?.quit();
    await container?.stop();
  });

  it('deve armazenar e recuperar dados do cache', async () => {
    const key = 'user:123';
    const value = JSON.stringify({
      id: 123,
      name: 'Carlos Eduardo',
      email: 'carlos@example.com'
    });

    await redisClient.set(key, value, 'EX', 3600);

    const retrieved = await redisClient.get(key);
    const parsed = JSON.parse(retrieved!);

    expect(parsed.id).to.equal(123);
    expect(parsed.name).to.equal('Carlos Eduardo');
  });

  it('deve respeitar o tempo de expiração', async () => {
    const key = 'temp:key';
    await redisClient.set(key, 'valor temporário', 'EX', 1);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const result = await redisClient.get(key);
    expect(result).to.be.null;
  });

  it('deve incrementar contadores atomicamente', async () => {
    const key = 'page:views';
    
    await redisClient.incr(key);
    await redisClient.incr(key);
    await redisClient.incr(key);

    const views = await redisClient.get(key);
    expect(parseInt(views!)).to.equal(3);
  });
});
```

### Exemplo 3: Teste com MongoDB

Teste de operações em documentos NoSQL, comum em aplicações que lidam com dados semi-estruturados.

```typescript
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import { MongoClient, Db } from 'mongodb';

describe('ProductRepository Integration Tests', () => {
  let container: StartedTestContainer;
  let mongoClient: MongoClient;
  let db: Db;

  before(async function() {
    this.timeout(60000);

    container = await new GenericContainer('mongo:7')
      .withExposedPorts(27017)
      .withWaitStrategy(Wait.forLogMessage('Waiting for connections'))
      .start();

    const port = container.getMappedPort(27017);
    const host = container.getHost();
    const uri = `mongodb://${host}:${port}`;

    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    db = mongoClient.db('testdb');
  });

  after(async () => {
    await mongoClient?.close();
    await container?.stop();
  });

  it('deve inserir e buscar produtos', async () => {
    const products = db.collection('products');

    const product = {
      name: 'Notebook Dell',
      price: 3500.00,
      category: 'eletrônicos',
      tags: ['computador', 'portátil'],
      stock: 15
    };

    const result = await products.insertOne(product);

    const found = await products.findOne({ _id: result.insertedId });

    expect(found).to.not.be.null;
    expect(found!.name).to.equal('Notebook Dell');
    expect(found!.price).to.equal(3500.00);
  });

  it('deve realizar busca por texto', async () => {
    const products = db.collection('products');

    await products.createIndex({ name: 'text', category: 'text' });

    await products.insertMany([
      { name: 'Mouse Logitech', category: 'periféricos', price: 150 },
      { name: 'Teclado Mecânico', category: 'periféricos', price: 400 },
      { name: 'Monitor LG', category: 'eletrônicos', price: 1200 }
    ]);

    const results = await products
      .find({ $text: { $search: 'periféricos' } })
      .toArray();

    expect(results).to.have.lengthOf(2);
  });

  it('deve atualizar estoque de produto', async () => {
    const products = db.collection('products');

    const inserted = await products.insertOne({
      name: 'Webcam HD',
      price: 250,
      stock: 10
    });

    await products.updateOne(
      { _id: inserted.insertedId },
      { $inc: { stock: -3 } }
    );

    const updated = await products.findOne({ _id: inserted.insertedId });

    expect(updated!.stock).to.equal(7);
  });
});
```

### Exemplo 4: Teste com RabbitMQ

Simulação de teste de mensageria, cenário fundamental em arquiteturas de microserviços.

```typescript
import { describe, before, after, it } from 'mocha';
import { expect } from 'chai';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import amqp, { Connection, Channel } from 'amqplib';

describe('MessageQueue Integration Tests', () => {
  let container: StartedTestContainer;
  let connection: Connection;
  let channel: Channel;

  before(async function() {
    this.timeout(60000);

    container = await new GenericContainer('rabbitmq:3-management-alpine')
      .withExposedPorts(5672, 15672)
      .withWaitStrategy(Wait.forLogMessage('Server startup complete'))
      .start();

    const port = container.getMappedPort(5672);
    const host = container.getHost();

    connection = await amqp.connect(`amqp://${host}:${port}`);
    channel = await connection.createChannel();
  });

  after(async () => {
    await channel?.close();
    await connection?.close();
    await container?.stop();
  });

  it('deve publicar e consumir mensagem de uma fila', async () => {
    const queue = 'orders';
    const message = JSON.stringify({
      orderId: '12345',
      customer: 'Ana Paula',
      total: 299.90
    });

    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(message));

    const consumed = await new Promise<string>((resolve) => {
      channel.consume(queue, (msg) => {
        if (msg) {
          resolve(msg.content.toString());
          channel.ack(msg);
        }
      });
    });

    const parsed = JSON.parse(consumed);
    expect(parsed.orderId).to.equal('12345');
    expect(parsed.customer).to.equal('Ana Paula');
  });

  it('deve implementar padrão pub/sub com exchange', async () => {
    const exchange = 'notifications';
    const queue1 = 'email-service';
    const queue2 = 'sms-service';

    await channel.assertExchange(exchange, 'fanout', { durable: false });
    await channel.assertQueue(queue1, { durable: false });
    await channel.assertQueue(queue2, { durable: false });

    await channel.bindQueue(queue1, exchange, '');
    await channel.bindQueue(queue2, exchange, '');

    const notification = JSON.stringify({
      type: 'order_confirmed',
      userId: '789',
      message: 'Seu pedido foi confirmado'
    });

    channel.publish(exchange, '', Buffer.from(notification));

    await new Promise(resolve => setTimeout(resolve, 100));

    const msg1 = await channel.get(queue1, { noAck: true });
    const msg2 = await channel.get(queue2, { noAck: true });

    expect(msg1).to.not.be.false;
    expect(msg2).to.not.be.false;
    expect(msg1 && msg1.content.toString()).to.equal(notification);
  });
});
```

## Configurações Ideais

### Configuração de Timeout

Os testes de integração com contêineres geralmente levam mais tempo que testes unitários. Configure timeouts apropriados:

```typescript
describe('Suite de Integração', () => {
  before(async function() {
    this.timeout(120000); // 2 minutos para inicialização
  });

  it('teste específico', async function() {
    this.timeout(30000); // 30 segundos para o teste
    // código do teste
  });
});
```

### Configuração de Wait Strategies

Use estratégias de espera adequadas para garantir que o contêiner esteja pronto:

```typescript
// Esperar por mensagem de log
.withWaitStrategy(Wait.forLogMessage('ready to accept connections'))

// Esperar por porta disponível
.withWaitStrategy(Wait.forListeningPorts())

// Esperar por health check
.withWaitStrategy(Wait.forHealthCheck())

// Combinar múltiplas estratégias
.withWaitStrategy(
  Wait.forAll([
    Wait.forLogMessage('started'),
    Wait.forListeningPorts()
  ])
)
```

### Variáveis de Ambiente

Configure variáveis de ambiente necessárias para o contêiner:

```typescript
container = await new GenericContainer('postgres:15')
  .withEnvironment({
    POSTGRES_USER: 'user',
    POSTGRES_PASSWORD: 'pass',
    POSTGRES_DB: 'dbname',
    POSTGRES_MAX_CONNECTIONS: '100'
  })
  .start();
```

### Volumes e Dados Iniciais

Para testes que requerem dados iniciais ou configurações específicas:

```typescript
import path from 'path';

container = await new GenericContainer('postgres:15')
  .withBindMounts([{
    source: path.resolve(__dirname, './init.sql'),
    target: '/docker-entrypoint-initdb.d/init.sql'
  }])
  .start();
```

## Melhores Práticas

### 1. Isolamento de Testes

Cada teste deve ser independente e não deve depender do estado de outros testes:

```typescript
describe('UserService', () => {
  beforeEach(async () => {
    // Limpar dados antes de cada teste
    await dbClient.query('TRUNCATE TABLE users CASCADE');
  });

  it('teste 1', async () => {
    // Este teste começa com banco limpo
  });

  it('teste 2', async () => {
    // Este teste também começa com banco limpo
  });
});
```

### 2. Reutilização de Contêineres

Para suites de teste grandes, considere reutilizar o mesmo contêiner:

```typescript
describe('Suite completa', () => {
  let container: StartedTestContainer;

  before(async function() {
    this.timeout(60000);
    container = await new GenericContainer('postgres:15')
      // configurações
      .start();
  });

  after(async () => {
    await container.stop();
  });

  describe('UserTests', () => {
    beforeEach(async () => {
      await dbClient.query('TRUNCATE TABLE users');
    });
    // testes
  });

  describe('OrderTests', () => {
    beforeEach(async () => {
      await dbClient.query('TRUNCATE TABLE orders');
    });
    // testes
  });
});
```

### 3. Configuração de Recursos

Limite recursos para evitar sobrecarga do sistema:

```typescript
container = await new GenericContainer('postgres:15')
  .withMemoryLimit(512 * 1024 * 1024) // 512 MB
  .withCpuCount(2)
  .start();
```

### 4. Logs e Debugging

Habilite logs para facilitar debugging quando necessário:

```typescript
container = await new GenericContainer('postgres:15')
  .withLogConsumer(stream => {
    stream.on('data', line => console.log(line));
    stream.on('err', line => console.error(line));
  })
  .start();
```

### 5. Network Isolation

Para testes que envolvem múltiplos contêineres:

```typescript
import { Network } from 'testcontainers';

const network = await new Network().start();

const dbContainer = await new GenericContainer('postgres:15')
  .withNetwork(network)
  .withNetworkAliases('database')
  .start();

const appContainer = await new GenericContainer('myapp:latest')
  .withNetwork(network)
  .withEnvironment({
    DATABASE_HOST: 'database'
  })
  .start();

// Não esqueça de parar a rede
await network.stop();
```

### 6. Tratamento de Erros

Sempre implemente tratamento robusto de erros:

```typescript
describe('ErrorHandling', () => {
  let container: StartedTestContainer | undefined;

  before(async function() {
    this.timeout(60000);
    try {
      container = await new GenericContainer('postgres:15')
        .withExposedPorts(5432)
        .start();
    } catch (error) {
      console.error('Falha ao iniciar contêiner:', error);
      throw error;
    }
  });

  after(async () => {
    try {
      await container?.stop();
    } catch (error) {
      console.error('Erro ao parar contêiner:', error);
    }
  });
});
```

### 7. Cache de Imagens

Para acelerar os testes, mantenha as imagens Docker em cache localmente:

```bash
# Pré-baixar imagens antes de executar testes
docker pull postgres:15-alpine
docker pull redis:7-alpine
docker pull mongo:7
```

### 8. Configuração de CI/CD

Em ambientes de integração contínua, considere usar Docker-in-Docker ou configure o runner adequadamente:

```yaml
# Exemplo para GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      docker:
        image: docker:dind
        options: --privileged
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: pnpm install
      - name: Run integration tests
        run: pnpm test
```

### 9. Organização de Testes

Organize testes de integração separadamente dos testes unitários:

```plaintext
test/
├── unit/
│   ├── services/
│   └── utils/
├── integration/
│   ├── database/
│   │   ├── postgres.test.ts
│   │   └── mongodb.test.ts
│   ├── cache/
│   │   └── redis.test.ts
│   └── messaging/
│       └── rabbitmq.test.ts
└── e2e/
```

### 10. Performance e Otimização

Use imagens Alpine quando possível para reduzir tempo de download e uso de disco:

```typescript
// Prefira versões Alpine
new GenericContainer('postgres:15-alpine')
new GenericContainer('redis:7-alpine')
new GenericContainer('node:20-alpine')
```

## Conclusão

Testcontainers transforma a forma como escrevemos testes de integração, permitindo que testemos contra dependências reais em ambientes isolados e reproduzíveis. Ao seguir as melhores práticas apresentadas, você pode criar uma suíte de testes robusta e confiável que aproxima seus testes de cenários reais de produção, aumentando significativamente a qualidade e a confiabilidade do seu código.

A combinação de Testcontainers com Mocha e TypeScript oferece uma experiência de desenvolvimento eficiente, permitindo que você identifique problemas de integração cedo no ciclo de desenvolvimento, reduzindo custos e riscos associados a bugs em produção.
