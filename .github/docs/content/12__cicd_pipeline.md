# CI/CD com GitHub Actions - Automação de Testes no Pipeline

## Índice

- [CI/CD com GitHub Actions - Automação de Testes no Pipeline](#cicd-com-github-actions---automação-de-testes-no-pipeline)
  - [Índice](#índice)
  - [Introdução: Entendendo os Fundamentos](#introdução-entendendo-os-fundamentos)
  - [Sequência Lógica para Implementação](#sequência-lógica-para-implementação)
    - [Primeiro Passo: Estruturação do Projeto](#primeiro-passo-estruturação-do-projeto)
    - [Segundo Passo: Criando seu Primeiro Workflow](#segundo-passo-criando-seu-primeiro-workflow)
    - [Terceiro Passo: Adicionando Camadas de Validação](#terceiro-passo-adicionando-camadas-de-validação)
    - [Quarto Passo: Integrando Serviços Externos](#quarto-passo-integrando-serviços-externos)
  - [Melhores Práticas e Configuração](#melhores-práticas-e-configuração)
    - [Cache Inteligente de Dependências](#cache-inteligente-de-dependências)
    - [Paralelização de Testes](#paralelização-de-testes)
    - [Gerenciamento de Secrets e Variáveis de Ambiente](#gerenciamento-de-secrets-e-variáveis-de-ambiente)
  - [Diferentes Formas de Orquestração](#diferentes-formas-de-orquestração)
    - [Workflows Condicionais Baseados em Arquivos](#workflows-condicionais-baseados-em-arquivos)
    - [Pipeline Completo com Deploy Automatizado](#pipeline-completo-com-deploy-automatizado)
    - [Reutilização de Workflows](#reutilização-de-workflows)
  - [Exemplo Prático: E-commerce Real](#exemplo-prático-e-commerce-real)
  - [Estratégias Avançadas de Orquestração](#estratégias-avançadas-de-orquestração)
    - [Workflow com Aprovação Manual](#workflow-com-aprovação-manual)
    - [Workflow de Performance Testing](#workflow-de-performance-testing)
    - [Monorepo com Detecção Inteligente](#monorepo-com-detecção-inteligente)
  - [Métricas e Monitoramento do Pipeline](#métricas-e-monitoramento-do-pipeline)
  - [Configurações Avançadas de Segurança](#configurações-avançadas-de-segurança)
  - [Otimização de Custos e Recursos](#otimização-de-custos-e-recursos)
  - [Debugging e Troubleshooting](#debugging-e-troubleshooting)
  - [Considerações Finais](#considerações-finais)

## Introdução: Entendendo os Fundamentos

Quando falamos de CI/CD, estamos nos referindo a duas práticas complementares que transformaram radicalmente a forma como desenvolvemos e entregamos software. A Integração Contínua (Continuous Integration) consiste em integrar o código de diferentes desenvolvedores em um repositório compartilhado várias vezes ao dia, executando testes automatizados a cada integração. Já a Entrega Contínua (Continuous Delivery) estende esse conceito, garantindo que o código esteja sempre em um estado que permita o deploy para produção de forma automatizada.

O GitHub Actions funciona como um orquestrador desses processos, permitindo que você defina workflows (fluxos de trabalho) que são executados automaticamente em resposta a eventos específicos no seu repositório. Pense no GitHub Actions como um assistente incansável que monitora seu repositório e executa tarefas sempre que algo importante acontece, seja um push, um pull request ou até mesmo um agendamento específico.

A automação de testes dentro desse pipeline é fundamental porque oferece aquele selo de qualidade que mencionamos no documento da Rocketseat. Quando um desenvolvedor envia código novo, o pipeline automaticamente verifica se tudo continua funcionando conforme esperado, reduzindo drasticamente a possibilidade de bugs chegarem à produção. Isso é especialmente crítico em aplicações Node.js que lidam com transações financeiras ou dados sensíveis, onde um erro pode ter consequências graves.

## Sequência Lógica para Implementação

Vamos construir nosso entendimento partindo do básico até configurações mais sofisticadas. A jornada de implementação de CI/CD com GitHub Actions segue uma progressão natural que respeita a curva de aprendizado.

### Primeiro Passo: Estruturação do Projeto

Antes de configurar qualquer pipeline, precisamos garantir que nosso projeto Node.js tenha uma estrutura sólida de testes. Imagine que você está desenvolvendo uma API de gerenciamento de pedidos para um e-commerce. Seu projeto precisa ter scripts bem definidos no `package.json` para executar os testes.

```typescript
// package.json
{
  "name": "ecommerce-api",
  "scripts": {
    "test": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "jest --testPathPattern=e2e",
    "lint": "eslint . --ext .ts",
    "type-check": "tsc --noEmit"
  }
}
```

Observe como organizamos diferentes tipos de testes. Isso permite que nosso pipeline execute apenas os testes necessários em cada etapa, economizando tempo e recursos.

### Segundo Passo: Criando seu Primeiro Workflow

Os workflows do GitHub Actions são definidos em arquivos YAML dentro da pasta `.github/workflows` do seu repositório. Vamos começar com um workflow básico que executa testes a cada push.

```yaml
# .github/workflows/ci-basic.yml
name: CI Básico

# Define quando este workflow será executado
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

# Define as tarefas que serão executadas
jobs:
  test:
    # Especifica o ambiente onde o job será executado
    runs-on: ubuntu-latest
    
    steps:
      # Faz checkout do código do repositório
      - name: Checkout código
        uses: actions/checkout@v4
      
      # Configura a versão do Node.js
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      # Instala as dependências do projeto
      - name: Instalar dependências
        run: npm ci
      
      # Executa os testes
      - name: Executar testes
        run: npm test
```

Este workflow é como uma receita de bolo: cada `step` (passo) é executado em sequência, e se algum falhar, todo o processo é interrompido. O `npm ci` é preferível ao `npm install` em ambientes de CI porque garante uma instalação limpa e determinística baseada no `package-lock.json`.

### Terceiro Passo: Adicionando Camadas de Validação

Em um cenário real de mercado, você raramente quer apenas executar testes. Precisa validar a qualidade do código em múltiplas dimensões. Vamos expandir nosso workflow para incluir linting, verificação de tipos e análise de cobertura.

```yaml
# .github/workflows/ci-completo.yml
name: CI Completo

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Job para verificações de qualidade de código
  code-quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      # Executa o linter para verificar padrões de código
      - name: Verificar linting
        run: npm run lint
      
      # Verifica erros de tipagem TypeScript
      - name: Verificar tipos TypeScript
        run: npm run type-check

  # Job para testes unitários e de integração
  tests:
    runs-on: ubuntu-latest
    # Este job só executa se code-quality passar
    needs: code-quality
    
    # Matriz de estratégia para testar em múltiplas versões do Node
    strategy:
      matrix:
        node-version: [18, 20, 22]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar testes unitários
        run: npm run test:unit
      
      - name: Executar testes de integração
        run: npm run test:integration
      
      # Gera relatório de cobertura
      - name: Gerar cobertura de código
        run: npm test -- --coverage
      
      # Upload do relatório de cobertura
      - name: Upload relatório de cobertura
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-${{ matrix.node-version }}
```

Repare como usamos `needs: code-quality` para criar uma dependência entre jobs. Isso significa que os testes só serão executados se as verificações de qualidade passarem primeiro, economizando recursos computacionais e tempo. A estratégia de matriz permite testar em múltiplas versões do Node.js simultaneamente, garantindo compatibilidade.

### Quarto Passo: Integrando Serviços Externos

No dia a dia do desenvolvimento, suas aplicações frequentemente dependem de bancos de dados, caches e outros serviços. O GitHub Actions oferece containers de serviço para simular esses ambientes.

```yaml
# .github/workflows/ci-com-servicos.yml
name: CI com Serviços

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test-com-banco:
    runs-on: ubuntu-latest
    
    # Configuração de serviços necessários para os testes
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: testuser
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      # Configura variáveis de ambiente para conexão com os serviços
      - name: Executar testes de integração
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://testuser:testpass@localhost:5432/testdb
          REDIS_URL: redis://localhost:6379
```

Este exemplo demonstra um cenário muito comum: testar uma API que usa PostgreSQL e Redis. Os containers de serviço são iniciados antes dos testes e automaticamente encerrados ao final, criando um ambiente isolado e reproduzível.

## Melhores Práticas e Configuração

A experiência do mercado nos ensina que alguns padrões fazem diferença significativa na eficiência e confiabilidade dos pipelines.

### Cache Inteligente de Dependências

O cache é crucial para acelerar seus workflows. Veja como implementar um sistema de cache robusto:

```yaml
# .github/workflows/ci-cache-otimizado.yml
name: CI com Cache Otimizado

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js com cache
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          # Cache automático baseado no package-lock.json
          cache: 'npm'
      
      # Cache adicional para node_modules
      - name: Cache node_modules
        uses: actions/cache@v3
        id: cache-node-modules
        with:
          path: node_modules
          key: node-modules-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            node-modules-${{ runner.os }}-
      
      # Só instala se o cache não existir
      - name: Instalar dependências
        if: steps.cache-node-modules.outputs.cache-hit != 'true'
        run: npm ci
      
      - name: Executar testes
        run: npm test
```

O sistema de cache usa o hash do `package-lock.json` como chave, garantindo que o cache seja invalidado apenas quando as dependências realmente mudarem.

### Paralelização de Testes

Para projetos grandes, dividir testes em jobs paralelos reduz drasticamente o tempo de execução:

```yaml
# .github/workflows/ci-paralelo.yml
name: CI com Testes Paralelos

on: [push, pull_request]

jobs:
  # Separa testes unitários em múltiplos runners
  test-unit:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      # Jest suporta sharding nativo para dividir testes
      - name: Executar shard ${{ matrix.shard }} de testes
        run: npm test -- --shard=${{ matrix.shard }}/4

  # Testes de integração executam separadamente
  test-integration:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar testes de integração
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
```

Esta estratégia de sharding divide seus testes unitários em quatro partes que executam simultaneamente, reduzindo o tempo total em até 75% comparado à execução sequencial.

### Gerenciamento de Secrets e Variáveis de Ambiente

Aplicações reais precisam de credenciais e configurações sensíveis. O GitHub Actions oferece um sistema seguro para isso:

```yaml
# .github/workflows/ci-com-secrets.yml
name: CI com Secrets

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      # Exemplo de uso de secrets do GitHub
      - name: Executar testes com API keys
        run: npm test
        env:
          # Secrets são configurados nas Settings do repositório
          API_KEY: ${{ secrets.API_KEY }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          # Variáveis públicas podem ser definidas diretamente
          NODE_ENV: test
          LOG_LEVEL: debug
```

Os secrets nunca aparecem nos logs do GitHub Actions, garantindo segurança mesmo em repositórios públicos.

## Diferentes Formas de Orquestração

A orquestração de workflows permite criar pipelines sofisticados que se adaptam a diferentes cenários.

### Workflows Condicionais Baseados em Arquivos

Muitas vezes você quer executar testes apenas quando arquivos relevantes são modificados:

```yaml
# .github/workflows/ci-condicional.yml
name: CI Condicional

on:
  push:
    branches: [ main, develop ]
    # Só executa se arquivos específicos mudarem
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package.json'
      - 'package-lock.json'
      - 'tsconfig.json'
  pull_request:
    branches: [ main ]
    paths:
      - 'src/**'
      - 'tests/**'

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    # Este job detecta quais partes do código mudaram
    outputs:
      backend: ${{ steps.filter.outputs.backend }}
      frontend: ${{ steps.filter.outputs.frontend }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Verificar mudanças
        uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            backend:
              - 'src/api/**'
              - 'src/services/**'
            frontend:
              - 'src/components/**'
              - 'src/pages/**'

  # Só executa se o backend mudou
  test-backend:
    needs: detect-changes
    if: needs.detect-changes.outputs.backend == 'true'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Testar backend
        run: npm run test:backend

  # Só executa se o frontend mudou
  test-frontend:
    needs: detect-changes
    if: needs.detect-changes.outputs.frontend == 'true'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Testar frontend
        run: npm run test:frontend
```

Esta abordagem é extremamente útil em monorepos ou projetos grandes, onde diferentes equipes trabalham em partes distintas do código.

### Pipeline Completo com Deploy Automatizado

Vamos ver um exemplo completo que integra testes, build e deploy condicional:

```yaml
# .github/workflows/ci-cd-completo.yml
name: CI/CD Completo

on:
  push:
    branches: [ main, develop, staging ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'

jobs:
  # Fase 1: Validação de código
  lint-and-typecheck:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar ESLint
        run: npm run lint
      
      - name: Verificar TypeScript
        run: npm run type-check

  # Fase 2: Testes automatizados
  test:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        test-type: [unit, integration, e2e]
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar testes ${{ matrix.test-type }}
        run: npm run test:${{ matrix.test-type }}
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/testdb
      
      - name: Upload cobertura
        if: matrix.test-type == 'unit'
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  # Fase 3: Build da aplicação
  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Build da aplicação
        run: npm run build
      
      # Salva o build como artefato para uso posterior
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-artifacts
          path: dist/
          retention-days: 7

  # Fase 4: Deploy para staging (apenas branch staging)
  deploy-staging:
    needs: build
    if: github.ref == 'refs/heads/staging' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/
      
      - name: Deploy para staging
        run: |
          echo "Iniciando deploy para staging..."
          # Aqui você colocaria seus comandos de deploy reais
          # Exemplo com AWS: aws s3 sync dist/ s3://my-staging-bucket/
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

  # Fase 5: Deploy para produção (apenas branch main)
  deploy-production:
    needs: build
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    environment: 
      name: production
      url: https://minha-api.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: dist/
      
      - name: Deploy para produção
        run: |
          echo "Iniciando deploy para produção..."
          # Comandos de deploy para produção
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_PRODUCTION_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_PRODUCTION_SECRET_ACCESS_KEY }}
      
      # Notificação de sucesso
      - name: Notificar sucesso
        if: success()
        run: |
          echo "Deploy realizado com sucesso!"
          # Aqui você poderia enviar notificação para Slack, Discord, etc.
```

Este pipeline completo demonstra uma arquitetura profissional onde cada fase depende do sucesso da anterior, e deploys só acontecem em branches específicas.

### Reutilização de Workflows

Para equipes maiores, workflows reutilizáveis evitam duplicação de código:

```yaml
# .github/workflows/reusable-tests.yml
name: Workflow de Testes Reutilizável

on:
  workflow_call:
    inputs:
      node-version:
        required: true
        type: string
      test-command:
        required: true
        type: string
      working-directory:
        required: false
        type: string
        default: '.'
    secrets:
      api-key:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    
    defaults:
      run:
        working-directory: ${{ inputs.working-directory }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ inputs.node-version }}
          cache: 'npm'
          cache-dependency-path: ${{ inputs.working-directory }}/package-lock.json
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar testes
        run: ${{ inputs.test-command }}
        env:
          API_KEY: ${{ secrets.api-key }}
```

Agora você pode chamar este workflow de outros arquivos:

```yaml
# .github/workflows/ci-projeto-a.yml
name: CI Projeto A

on: [push, pull_request]

jobs:
  call-reusable-workflow:
    uses: ./.github/workflows/reusable-tests.yml
    with:
      node-version: '20'
      test-command: 'npm run test:all'
      working-directory: './packages/projeto-a'
    secrets:
      api-key: ${{ secrets.PROJECT_A_API_KEY }}
```

## Exemplo Prático: E-commerce Real

Vamos consolidar tudo em um exemplo real de um e-commerce com múltiplos serviços:

```yaml
# .github/workflows/ecommerce-ci-cd.yml
name: E-commerce CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20'

jobs:
  # Validação inicial rápida
  quick-checks:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Necessário para análise de commits
      
      - name: Verificar mensagens de commit
        run: |
          npx commitlint --from ${{ github.event.pull_request.base.sha }} --to ${{ github.sha }}
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Verificar formatação
        run: npm run format:check
      
      - name: Lint
        run: npm run lint
      
      - name: TypeScript
        run: npm run type-check

  # Testes de unidade para cada serviço
  test-unit:
    needs: quick-checks
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    strategy:
      fail-fast: false
      matrix:
        service: [auth, products, orders, payments, notifications]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Cache node_modules
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar testes unitários - ${{ matrix.service }}
        run: npm run test:unit -- --testPathPattern=services/${{ matrix.service }}
        env:
          NODE_ENV: test

  # Testes de integração com todos os serviços necessários
  test-integration:
    needs: quick-checks
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: ecommerce
          POSTGRES_PASSWORD: testpass123
          POSTGRES_DB: ecommerce_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
      
      rabbitmq:
        image: rabbitmq:3-management-alpine
        env:
          RABBITMQ_DEFAULT_USER: guest
          RABBITMQ_DEFAULT_PASS: guest
        ports:
          - 5672:5672
          - 15672:15672
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar migrations
        run: npm run db:migrate
        env:
          DATABASE_URL: postgresql://ecommerce:testpass123@localhost:5432/ecommerce_test
      
      - name: Seed do banco de dados
        run: npm run db:seed
        env:
          DATABASE_URL: postgresql://ecommerce:testpass123@localhost:5432/ecommerce_test
      
      - name: Executar testes de integração
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://ecommerce:testpass123@localhost:5432/ecommerce_test
          REDIS_URL: redis://localhost:6379
          RABBITMQ_URL: amqp://guest:guest@localhost:5672

  # Testes E2E simulando fluxos completos de usuário
  test-e2e:
    needs: [test-unit, test-integration]
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Build da aplicação
        run: npm run build
      
      - name: Iniciar servidor de teste
        run: |
          npm run start:test &
          npx wait-on http://localhost:3000/health
        env:
          NODE_ENV: test
          PORT: 3000
      
      - name: Executar testes E2E
        run: npm run test:e2e
        env:
          BASE_URL: http://localhost:3000

  # Análise de segurança
  security-scan:
    needs: quick-checks
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Executar auditoria de dependências
        run: npm audit --audit-level=moderate
      
      - name: Scan de segurança com Snyk
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  # Build e preparação para deploy
  build:
    needs: [test-unit, test-integration, test-e2e, security-scan]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Build de produção
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Comprimir artefatos
        run: tar -czf build.tar.gz dist/
      
      - name: Upload artefatos
        uses: actions/upload-artifact@v3
        with:
          name: production-build
          path: build.tar.gz
          retention-days: 30

  deploy:
    needs: build
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        include:
          - branch: develop
            environment: development
            url: https://dev.ecommerce.com
          - branch: staging
            environment: staging
            url: https://staging.ecommerce.com
          - branch: main
            environment: production
            url: https://ecommerce.com
    
    # Só executa se a branch corresponder
    if: github.ref == format('refs/heads/{0}', matrix.branch)
    
    environment:
      name: ${{ matrix.environment }}
      url: ${{ matrix.url }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Download artefatos de build
        uses: actions/download-artifact@v3
        with:
          name: production-build
      
      - name: Extrair build
        run: tar -xzf build.tar.gz
      
      - name: Configurar AWS CLI
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets[format('AWS_ACCESS_KEY_ID_{0}', matrix.environment)] }}
          aws-secret-access-key: ${{ secrets[format('AWS_SECRET_ACCESS_KEY_{0}', matrix.environment)] }}
          aws-region: us-east-1
      
      - name: Deploy para S3
        run: |
          aws s3 sync dist/ s3://ecommerce-${{ matrix.environment }}-bucket/ --delete
      
      - name: Invalidar CloudFront cache
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets[format('CLOUDFRONT_DIST_ID_{0}', matrix.environment)] }} \
            --paths "/*"
      
      - name: Executar smoke tests
        run: |
          npx wait-on ${{ matrix.url }}/health --timeout 60000
          curl -f ${{ matrix.url }}/health || exit 1
      
      - name: Notificar equipe no Slack
        if: always()
        uses: slackapi/slack-github-action@v1
        with:
          payload: |
            {
              "text": "Deploy ${{ job.status }} para ${{ matrix.environment }}",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*Deploy Status:* ${{ job.status }}\n*Environment:* ${{ matrix.environment }}\n*Branch:* ${{ github.ref_name }}\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}"
                  }
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

  # Rollback automático em caso de falha
  rollback:
    needs: deploy
    if: failure()
    runs-on: ubuntu-latest
    
    steps:
      - name: Configurar AWS CLI
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Executar rollback
        run: |
          echo "Iniciando rollback para versão anterior..."
          # Lógica de rollback específica da sua infraestrutura
          aws ecs update-service \
            --cluster ecommerce-cluster \
            --service ecommerce-service \
            --force-new-deployment \
            --task-definition ecommerce-task:previous
```

## Estratégias Avançadas de Orquestração

### Workflow com Aprovação Manual

Para ambientes críticos, você pode exigir aprovação manual antes do deploy:

```yaml
# .github/workflows/deploy-com-aprovacao.yml
name: Deploy com Aprovação Manual

on:
  workflow_dispatch:  # Permite execução manual
    inputs:
      environment:
        description: 'Ambiente para deploy'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Versão a ser deployada'
        required: true
        type: string

jobs:
  validate-version:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validar versão
        run: |
          if [[ ! "${{ inputs.version }}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "Erro: Versão inválida. Use formato v1.0.0"
            exit 1
          fi
      
      - name: Verificar se versão existe
        run: |
          git fetch --tags
          if ! git tag | grep -q "^${{ inputs.version }}$"; then
            echo "Erro: Tag ${{ inputs.version }} não existe"
            exit 1
          fi

  # Ambiente que requer aprovação manual
  approval:
    needs: validate-version
    runs-on: ubuntu-latest
    environment: 
      name: ${{ inputs.environment }}-approval
    
    steps:
      - name: Aguardando aprovação
        run: echo "Deploy aprovado para ${{ inputs.environment }}"

  deploy:
    needs: approval
    runs-on: ubuntu-latest
    environment:
      name: ${{ inputs.environment }}
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ inputs.version }}
      
      - name: Deploy versão ${{ inputs.version }}
        run: |
          echo "Deployando ${{ inputs.version }} para ${{ inputs.environment }}"
          # Comandos de deploy aqui
```

### Workflow de Performance Testing

Testes de performance são cruciais para e-commerce de alta demanda:

```yaml
# .github/workflows/performance-tests.yml
name: Testes de Performance

on:
  schedule:
    # Executa diariamente às 2h da manhã
    - cron: '0 2 * * *'
  workflow_dispatch:  # Permite execução manual

jobs:
  load-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: |
          npm ci
          npm install -g artillery
      
      - name: Executar testes de carga
        run: |
          artillery run tests/performance/load-test.yml \
            --output report.json
      
      - name: Gerar relatório HTML
        run: artillery report report.json --output report.html
      
      - name: Analisar resultados
        run: |
          # Script personalizado para validar métricas
          node scripts/analyze-performance.js report.json
      
      - name: Upload relatório
        uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: |
            report.json
            report.html
      
      - name: Comentar no PR se aplicável
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = JSON.parse(fs.readFileSync('report.json'));
            
            const comment = `
            ## Resultados do Teste de Performance
            
            - **Requisições totais:** ${results.aggregate.counters['http.requests']}
            - **Taxa de sucesso:** ${(100 - results.aggregate.rates['http.request_rate']).toFixed(2)}%
            - **Latência média:** ${results.aggregate.summaries['http.response_time'].mean.toFixed(2)}ms
            - **P95:** ${results.aggregate.summaries['http.response_time'].p95.toFixed(2)}ms
            - **P99:** ${results.aggregate.summaries['http.response_time'].p99.toFixed(2)}ms
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Monorepo com Detecção Inteligente

Para projetos monorepo, detectar mudanças específicas otimiza o pipeline:

```yaml
# .github/workflows/monorepo-ci.yml
name: Monorepo CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  # Detecta quais pacotes foram modificados
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      packages: ${{ steps.filter.outputs.changes }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Detectar mudanças por pacote
        uses: dorny/paths-filter@v2
        id: filter
        with:
          filters: |
            api:
              - 'packages/api/**'
            web:
              - 'packages/web/**'
            mobile:
              - 'packages/mobile/**'
            shared:
              - 'packages/shared/**'

  # Job matriz dinâmica baseado em mudanças
  test-packages:
    needs: detect-changes
    if: needs.detect-changes.outputs.packages != '[]'
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        package: ${{ fromJSON(needs.detect-changes.outputs.packages) }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências do workspace
        run: npm ci
      
      - name: Testar pacote ${{ matrix.package }}
        run: npm run test --workspace=packages/${{ matrix.package }}
      
      - name: Build pacote ${{ matrix.package }}
        run: npm run build --workspace=packages/${{ matrix.package }}

  # Testes de integração entre pacotes
  test-integration-cross-package:
    needs: [detect-changes, test-packages]
    # Só executa se shared mudou, pois afeta outros pacotes
    if: contains(needs.detect-changes.outputs.packages, 'shared')
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Build todos os pacotes
        run: npm run build --workspaces
      
      - name: Testar integrações
        run: npm run test:integration
```

## Métricas e Monitoramento do Pipeline

Acompanhar a saúde do seu pipeline é fundamental:

```yaml
# .github/workflows/pipeline-metrics.yml
name: Métricas do Pipeline

on:
  workflow_run:
    workflows: ["CI/CD Completo"]
    types: [completed]

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    
    steps:
      - name: Coletar dados do workflow
        uses: actions/github-script@v6
        with:
          script: |
            const workflow = context.payload.workflow_run;
            
            const metrics = {
              workflow_name: workflow.name,
              conclusion: workflow.conclusion,
              duration: (new Date(workflow.updated_at) - new Date(workflow.created_at)) / 1000,
              branch: workflow.head_branch,
              commit: workflow.head_sha,
              actor: workflow.actor.login,
              timestamp: workflow.created_at
            };
            
            // Envia métricas para seu sistema de monitoramento
            console.log('Métricas coletadas:', JSON.stringify(metrics, null, 2));
            
            // Exemplo de envio para API de métricas
            // await fetch('https://metrics.exemplo.com/api/pipeline', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify(metrics)
            // });
      
      - name: Verificar SLA do pipeline
        uses: actions/github-script@v6
        with:
          script: |
            const workflow = context.payload.workflow_run;
            const duration = (new Date(workflow.updated_at) - new Date(workflow.created_at)) / 1000 / 60;
            
            const SLA_MINUTES = 15;
            
            if (duration > SLA_MINUTES) {
              core.warning(`Pipeline excedeu SLA: ${duration.toFixed(2)} minutos (limite: ${SLA_MINUTES})`);
              
              // Notifica equipe sobre violação de SLA
              // Implementar notificação aqui
            }
```

## Configurações Avançadas de Segurança

Proteção adicional para pipelines em produção:

```yaml
# .github/workflows/security-hardened.yml
name: CI com Segurança Reforçada

on:
  pull_request:
    branches: [ main ]

# Permissões mínimas necessárias
permissions:
  contents: read
  pull-requests: write
  security-events: write

jobs:
  security-checks:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          # Previne ataques de injeção via branch maliciosa
          persist-credentials: false
      
      - name: Validar origem do PR
        if: github.event.pull_request.head.repo.full_name != github.repository
        run: |
          echo "PRs de forks externos requerem revisão manual"
          exit 1
      
      - name: Escanear código em busca de secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.pull_request.base.sha }}
          head: ${{ github.event.pull_request.head.sha }}
      
      - name: Análise estática de segurança (SAST)
        uses: github/codeql-action/init@v2
        with:
          languages: javascript, typescript
      
      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Instalar dependências
        run: npm ci
      
      - name: Executar análise CodeQL
        uses: github/codeql-action/analyze@v2
      
      - name: Verificar licenças de dependências
        run: |
          npx license-checker --summary --onlyAllow "MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC"
      
      - name: Análise de composição de software (SCA)
        run: npm audit --audit-level=high
      
      - name: Verificar vulnerabilidades conhecidas
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload resultados de segurança
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

## Otimização de Custos e Recursos

Estratégias para reduzir tempo de execução e custos:

```yaml
# .github/workflows/cost-optimized.yml
name: CI Otimizado para Custos

on:
  pull_request:
    branches: [ main, develop ]

# Configurações globais para timeout
defaults:
  run:
    shell: bash

jobs:
  # Job de triagem rápida - falha rápido
  quick-validation:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 1  # Shallow clone para velocidade
      
      - name: Cache de dependências
        id: cache-deps
        uses: actions/cache@v3
        with:
          path: |
            ~/.npm
            node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-
      
      - name: Instalação rápida
        if: steps.cache-deps.outputs.cache-hit != 'true'
        run: npm ci --prefer-offline --no-audit
      
      - name: Lint apenas em arquivos modificados
        run: |
          git fetch origin ${{ github.base_ref }}
          CHANGED_FILES=$(git diff --name-only origin/${{ github.base_ref }} HEAD | grep -E '\.(ts|tsx|js|jsx)$' || true)
          if [ -n "$CHANGED_FILES" ]; then
            echo "$CHANGED_FILES" | xargs npx eslint
          fi

  # Testes apenas em código modificado
  test-changed:
    needs: quick-validation
    runs-on: ubuntu-latest
    timeout-minutes: 10
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Restaurar cache de dependências
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
      
      - name: Executar testes relacionados
        run: |
          # Jest executa apenas testes relacionados aos arquivos modificados
          npm test -- --changedSince=origin/${{ github.base_ref }} --coverage=false

  # Testes completos apenas para branches específicas
  test-full:
    if: github.base_ref == 'main'
    needs: test-changed
    runs-on: ubuntu-latest
    timeout-minutes: 20
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Restaurar cache
        uses: actions/cache@v3
        with:
          path: node_modules
          key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
      
      - name: Suite completa de testes
        run: npm test -- --maxWorkers=2
```

## Debugging e Troubleshooting

Ferramentas para diagnosticar problemas no pipeline:

```yaml
# .github/workflows/debug-workflow.yml
name: Debug Workflow

on:
  workflow_dispatch:
    inputs:
      debug_enabled:
        description: 'Habilitar debug SSH'
        required: false
        type: boolean
        default: false

jobs:
  debug-job:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Informações do ambiente
        run: |
          echo "Sistema Operacional: $(uname -a)"
          echo "Node version: $(node -v)"
          echo "NPM version: $(npm -v)"
          echo "Memória disponível: $(free -h)"
          echo "Espaço em disco: $(df -h)"
          echo "Variáveis de ambiente:"
          env | sort
      
      - name: Debug interativo via SSH
        if: ${{ inputs.debug_enabled }}
        uses: mxschmitt/action-tmate@v3
        with:
          limit-access-to-actor: true
      
      - name: Executar com logs detalhados
        run: |
          set -x  # Ativa modo verbose
          npm ci
          npm test
        env:
          DEBUG: '*'
          NODE_ENV: development
```

## Considerações Finais

A implementação de CI/CD com GitHub Actions representa uma mudança cultural no desenvolvimento de software. Não se trata apenas de automatizar testes, mas de criar uma mentalidade onde a qualidade é verificada continuamente e o feedback é imediato.

Os exemplos apresentados demonstram desde configurações básicas até pipelines sofisticados para e-commerce de alta demanda. A chave está em começar simples e evoluir gradualmente, sempre medindo o impacto de cada mudança.

Lembre-se que cada projeto tem necessidades únicas. Um projeto pequeno pode se beneficiar de um pipeline simples, enquanto uma aplicação crítica de e-commerce exige testes extensivos, análise de segurança e deploys cuidadosamente orquestrados. O importante é encontrar o equilíbrio entre segurança, velocidade e custos que faça sentido para seu contexto específico.

A automação de testes no pipeline não elimina a necessidade de boas práticas de desenvolvimento, mas funciona como uma rede de segurança que captura problemas antes que eles cheguem aos usuários finais. Como vimos nos fundamentos da Rocketseat, testes são o selo de qualidade que dá confiança para fazer deploys frequentes e entregar valor continuamente.
