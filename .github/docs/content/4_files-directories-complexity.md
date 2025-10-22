# Testes em Estruturas Complexas de Diretórios: Guia Completo

## Índice

- [Testes em Estruturas Complexas de Diretórios: Guia Completo](#testes-em-estruturas-complexas-de-diretórios-guia-completo)
  - [Índice](#índice)
  - [Introdução aos Fundamentos de Testes](#introdução-aos-fundamentos-de-testes)
  - [Configuração de Scripts no package.json](#configuração-de-scripts-no-packagejson)
    - [Explicação Detalhada dos Scripts](#explicação-detalhada-dos-scripts)
  - [Estrutura de Diretórios para Projetos Complexos](#estrutura-de-diretórios-para-projetos-complexos)
  - [Interpretação de Resultados e Padrões de Erro](#interpretação-de-resultados-e-padrões-de-erro)
    - [Saída Padrão do Reporter Spec](#saída-padrão-do-reporter-spec)
    - [Padrões Comuns de Erro](#padrões-comuns-de-erro)
  - [Descrições Eficazes de Testes](#descrições-eficazes-de-testes)
    - [Exemplo Prático de Boas Descrições](#exemplo-prático-de-boas-descrições)
    - [Princípios para Boas Descrições](#princípios-para-boas-descrições)
  - [Relatórios de Cobertura](#relatórios-de-cobertura)
    - [Interpretando o Relatório de Cobertura](#interpretando-o-relatório-de-cobertura)
  - [Testes Parametrizados](#testes-parametrizados)
  - [Organização de Fixtures](#organização-de-fixtures)
  - [Configuração Avançada com Arquivo .mocharc.js](#configuração-avançada-com-arquivo-mocharcjs)
  - [Estratégias de Filtragem Avançada](#estratégias-de-filtragem-avançada)
  - [Hooks Globais e Setup Compartilhado](#hooks-globais-e-setup-compartilhado)
  - [Debugging de Testes](#debugging-de-testes)
  - [Integração com CI/CD](#integração-com-cicd)
  - [Considerações sobre Performance](#considerações-sobre-performance)
  - [Conclusão](#conclusão)

## Introdução aos Fundamentos de Testes

Quando trabalhamos com aplicações de médio a grande porte, inevitavelmente nos deparamos com estruturas de diretórios que espelham a complexidade do próprio sistema. Neste contexto, a organização e execução de testes se tornam desafios que exigem estratégias deliberadas e bem pensadas.

A teoria por trás da organização de testes propõe que a estrutura de testes deve refletir a arquitetura da aplicação, mantendo uma correlação clara entre o código de produção e seus respectivos testes. Este princípio, conhecido como colocação de testes, sugere que cada módulo, componente ou funcionalidade deve ter seus testes correspondentes organizados de forma que qualquer desenvolvedor possa localizá-los intuitivamente.

Os fundamentos dessa abordagem repousam sobre três pilares essenciais. Primeiro, a rastreabilidade, que permite identificar rapidamente quais testes cobrem determinada funcionalidade. Segundo, a manutenibilidade, facilitando atualizações quando o código de produção muda. Terceiro, a escalabilidade, permitindo que a suíte de testes cresça organicamente com a aplicação sem se tornar ingerenciável.

Em projetos reais, frequentemente encontramos estruturas onde camadas como controladores, serviços, repositórios e utilitários convivem com regras de negócio complexas, integrações externas e lógicas de validação. Cada uma dessas camadas demanda estratégias de teste específicas, e a capacidade de executar testes de forma seletiva se torna crucial para a produtividade da equipe.

## Configuração de Scripts no package.json

O arquivo package.json serve como centro de comando para a execução de testes em um projeto Node.js. A configuração adequada dos scripts permite que a equipe execute testes de diversas maneiras, adaptando-se às necessidades do momento.

```json
{
  "name": "aplicacao-complexa",
  "version": "1.0.0",
  "scripts": {
    "test": "mocha 'src/**/*.test.ts' --require ts-node/register --recursive",
    "test:unit": "mocha 'src/**/*.unit.test.ts' --require ts-node/register --recursive",
    "test:integration": "mocha 'src/**/*.integration.test.ts' --require ts-node/register --recursive",
    "test:watch": "mocha 'src/**/*.test.ts' --require ts-node/register --recursive --watch --watch-files src/**/*.ts",
    "test:coverage": "nyc --reporter=html --reporter=text mocha 'src/**/*.test.ts' --require ts-node/register --recursive",
    "test:services": "mocha 'src/services/**/*.test.ts' --require ts-node/register --recursive",
    "test:controllers": "mocha 'src/controllers/**/*.test.ts' --require ts-node/register --recursive",
    "test:repositories": "mocha 'src/repositories/**/*.test.ts' --require ts-node/register --recursive",
    "test:grep": "mocha 'src/**/*.test.ts' --require ts-node/register --recursive --grep",
    "test:reporter-json": "mocha 'src/**/*.test.ts' --require ts-node/register --recursive --reporter json > test-results.json",
    "test:ci": "mocha 'src/**/*.test.ts' --require ts-node/register --recursive --reporter json --reporter-option output=test-results.json"
  },
  "devDependencies": {
    "mocha": "^10.2.0",
    "chai": "^4.3.10",
    "sinon": "^17.0.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3",
    "nyc": "^15.1.0",
    "@types/mocha": "^10.0.6",
    "@types/chai": "^4.3.11",
    "@types/sinon": "^17.0.2"
  }
}
```

### Explicação Detalhada dos Scripts

O script principal "test" executa todos os testes da aplicação, percorrendo recursivamente a estrutura de diretórios. A flag "--require ts-node/register" permite que o Mocha execute diretamente arquivos TypeScript sem necessidade de compilação prévia, agilizando o processo de desenvolvimento.

Os scripts "test:unit" e "test:integration" demonstram uma prática valiosa de separação por tipo de teste. Testes unitários geralmente são rápidos e podem ser executados constantemente durante o desenvolvimento. Já testes de integração, que podem envolver banco de dados ou chamadas de rede, são mais lentos e frequentemente executados antes de commits ou em pipelines de integração contínua.

O script "test:watch" implementa um modo de desenvolvimento especialmente útil quando praticamos TDD. Ele monitora mudanças nos arquivos e reexecuta automaticamente os testes afetados.

O script "test:grep" utiliza a flag "--grep" do Mocha, permitindo filtrar testes por padrões de texto. Exemplo de uso:

```bash
npm run test:grep "processamento de pagamento"
```

A geração de relatórios de cobertura através do script "test:coverage" utiliza a ferramenta nyc. Ela analisa quais linhas de código foram executadas durante os testes e gera relatórios em formato HTML e texto.

## Estrutura de Diretórios para Projetos Complexos

Uma organização eficiente da estrutura de diretórios é fundamental para manter a clareza e facilitar a navegação em projetos de grande escala:

```plaintext
src/
├── controllers/
│   ├── pedido.controller.ts
│   ├── pedido.controller.test.ts
│   ├── usuario.controller.ts
│   └── usuario.controller.test.ts
├── services/
│   ├── autenticacao.service.ts
│   ├── autenticacao.service.test.ts
│   ├── pagamento/
│   │   ├── processador-cartao.service.ts
│   │   ├── processador-cartao.service.test.ts
│   │   ├── processador-pix.service.ts
│   │   └── processador-pix.service.test.ts
│   ├── pedido.service.ts
│   └── pedido.service.test.ts
├── repositories/
│   ├── pedido.repository.ts
│   ├── pedido.repository.test.ts
│   ├── usuario.repository.ts
│   └── usuario.repository.integration.test.ts
├── models/
│   ├── pedido.model.ts
│   └── usuario.model.ts
├── validators/
│   ├── endereco.validator.ts
│   ├── endereco.validator.test.ts
│   ├── cpf.validator.ts
│   └── cpf.validator.test.ts
└── utils/
    ├── formatadores.ts
    ├── formatadores.test.ts
    ├── calculadora-frete.ts
    └── calculadora-frete.test.ts

test/
├── fixtures/
│   ├── usuarios.fixture.ts
│   ├── produtos.fixture.ts
│   └── pedidos.fixture.ts
└── setup.ts
```

Esta estrutura demonstra o princípio de colocação onde cada arquivo de teste reside no mesmo diretório que o código que testa. A convenção de nomenclatura clara, utilizando sufixos como ".test.ts" ou ".integration.test.ts", permite filtrar facilmente quais arquivos são testes.

## Interpretação de Resultados e Padrões de Erro

A leitura e interpretação corretas dos resultados de testes são habilidades fundamentais. O Mocha oferece diversos formatos de saída, cada um adequado a diferentes contextos.

### Saída Padrão do Reporter Spec

Quando executamos testes com o reporter padrão, obtemos uma saída estruturada:

```plaintext
  Serviço de Processamento de Pedidos
    ✓ deve calcular o total do pedido corretamente (45ms)
    ✓ deve aplicar desconto quando o valor excede o limite
    ✓ deve rejeitar pedidos com itens inválidos
    1) deve enviar notificação após confirmação do pedido
    
  Validador de Endereços
    ✓ deve aceitar endereços brasileiros válidos
    2) deve rejeitar CEPs em formato incorreto
    ✓ deve normalizar strings de endereço

  5 passing (156ms)
  2 failing

  1) Serviço de Processamento de Pedidos
       deve enviar notificação após confirmação do pedido:
     Error: Timeout of 2000ms exceeded
      at Context.<anonymous> (src/services/pedidos.test.ts:87:5)
      
  2) Validador de Endereços
       deve rejeitar CEPs em formato incorreto:
     AssertionError: expected false to be true
      at Context.<anonymous> (src/validators/endereco.test.ts:23:8)
```

Esta saída nos conta uma história completa sobre o estado da aplicação. Os checkmarks indicam testes que passaram, enquanto os números entre parênteses mostram a duração de cada teste.

### Padrões Comuns de Erro

**Erro de Timeout em Operações Assíncronas**: A mensagem "Error: Timeout of 2000ms exceeded" geralmente indica que uma operação assíncrona não foi concluída dentro do tempo esperado. As causas mais comuns incluem stubs que não retornam Promises resolvidas, await esquecido em funções assíncronas, ou callbacks que nunca são chamados.

**Erro de Asserção com Valores Undefined**: Mensagens como "TypeError: Cannot read property 'x' of undefined" indicam que um objeto esperado não existe. Isso frequentemente ocorre quando mocks ou stubs não foram configurados adequadamente.

**Erro de Comparação de Objetos**: O erro "AssertionError: expected { a: 1 } to equal { a: 1 }" ocorre quando usamos "expect().to.equal()" ao invés de "expect().to.deep.equal()". O método equal compara referências, enquanto deep.equal compara valores.

**Erro de Promise Não Tratada**: Avisos como "UnhandledPromiseRejectionWarning" indicam que uma Promise foi rejeitada mas não foi capturada. Em testes, isso geralmente significa que esquecemos de aguardar uma operação assíncrona.

## Descrições Eficazes de Testes

A forma como descrevemos nossos testes impacta diretamente a manutenibilidade do código. Descrições bem escritas funcionam como documentação viva da aplicação.

### Exemplo Prático de Boas Descrições

```typescript
// src/services/autenticacao.service.test.ts
import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import * as sinon from 'sinon';
import { AutenticacaoService } from './autenticacao.service';
import { UsuarioRepository } from '../repositories/usuario.repository';
import { Usuario } from '../models/usuario.model';

describe('Serviço de Autenticação', () => {
  let autenticacaoService: AutenticacaoService;
  let usuarioRepository: UsuarioRepository;
  let buscarPorEmailStub: sinon.SinonStub;
  const jwtSecret = 'chave-secreta-teste';

  beforeEach(() => {
    usuarioRepository = new UsuarioRepository();
    autenticacaoService = new AutenticacaoService(usuarioRepository, jwtSecret);
    buscarPorEmailStub = sinon.stub(usuarioRepository, 'buscarPorEmail');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('quando credenciais válidas são fornecidas', () => {
    it('deve retornar um token JWT válido para usuário ativo', async () => {
      const usuarioAtivo: Usuario = {
        id: 'USR-001',
        email: 'usuario@exemplo.com',
        senhaHash: 'hash-seguro',
        ativo: true,
        nome: 'João Silva'
      };

      buscarPorEmailStub.resolves(usuarioAtivo);

      const token = await autenticacaoService.autenticar(
        'usuario@exemplo.com',
        'senhaCorreta'
      );

      expect(token).to.be.a('string');
      expect(token).to.have.length.greaterThan(0);
    });
  });

  describe('quando credenciais inválidas são fornecidas', () => {
    it('deve retornar null quando usuário não existe', async () => {
      buscarPorEmailStub.resolves(null);

      const resultado = await autenticacaoService.autenticar(
        'inexistente@exemplo.com',
        'qualquerSenha'
      );

      expect(resultado).to.be.null;
    });
  });
});
```

### Princípios para Boas Descrições

**Use linguagem de negócio, não técnica**: Ao invés de "testa o método calcularDesconto()", prefira "deve calcular desconto de 10% para compras acima de 100 reais". A primeira apenas descreve uma ação técnica, enquanto a segunda comunica a regra de negócio sendo verificada.

**Complete a frase "deve"**: Cada descrição no bloco "it" deve completar naturalmente a frase "o componente deve...". Esta convenção força clareza e foco no comportamento esperado.

**Agrupe testes relacionados**: Use blocos "describe" aninhados para agrupar cenários similares. Por exemplo, "quando usuário está autenticado" pode conter vários testes sobre comportamentos específicos desse estado.

**Seja específico sobre o cenário**: Ao invés de "deve funcionar corretamente", seja explícito: "deve retornar lista vazia quando não há produtos cadastrados".

## Relatórios de Cobertura

A cobertura de testes fornece insights sobre áreas do código que podem estar subexpostas a testes. O nyc gera relatórios detalhados que ajudam a identificar essas lacunas.

### Interpretando o Relatório de Cobertura

Quando executamos "npm run test:coverage", obtemos uma saída no terminal:

```plaintext
----------------------|---------|----------|---------|---------|-------------------
| File                   | % Stmts   | % Branch   | % Funcs   | % Lines   | Uncovered Line #s   |
| ---------------------- | --------- | ---------- | --------- | --------- | ------------------- |
| All files              | 87.23     | 78.45      | 91.67     | 86.98     |
| controllers            | 92.31     | 85.71      | 100       | 92.00     |
| pedido.controller      | 95.45     | 90.00      | 100       | 95.24     | 45,67               |
| services               | 85.67     | 75.00      | 88.89     | 85.23     |
| email.service          | 45.45     | 33.33      | 50.00     | 44.44     | 12-28,45-67         |
| validators             | 96.77     | 93.33      | 100       | 96.55     |
| cpf.validator          | 96.00     | 91.67      | 100       | 95.83     | 45                  |
| ---------------------- | --------- | ---------- | --------- | --------- | ------------------- |
```

A coluna "% Stmts" mostra a porcentagem de declarações executadas. "% Branch" indica quantos caminhos de decisão foram testados. "% Funcs" mostra a cobertura de funções, e "% Lines" representa as linhas de código cobertas.

Os números na coluna "Uncovered Line #s" apontam exatamente quais linhas não foram executadas durante os testes, facilitando a identificação de onde adicionar testes.

## Testes Parametrizados

Quando precisamos testar o mesmo comportamento com múltiplas entradas, testes parametrizados evitam duplicação:

```typescript
// src/validators/cpf.validator.test.ts
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { CPFValidator } from './cpf.validator';

describe('Validador de CPF', () => {
  const validator = new CPFValidator();

  describe('validação de CPFs válidos', () => {
    const cpfsValidos = [
      '111.444.777-35',
      '11144477735',
      '123.456.789-09',
      '12345678909'
    ];

    cpfsValidos.forEach((cpf) => {
      it(`deve aceitar CPF válido: ${cpf}`, () => {
        const resultado = validator.validar(cpf);
        expect(resultado).to.be.true;
      });
    });
  });

  describe('validação de CPFs inválidos', () => {
    const testesInvalidos = [
      { cpf: '111.111.111-11', razao: 'todos os dígitos iguais' },
      { cpf: '123.456.789-00', razao: 'dígitos verificadores incorretos' },
      { cpf: '123.456.789', razao: 'quantidade de dígitos insuficiente' }
    ];

    testesInvalidos.forEach(({ cpf, razao }) => {
      it(`deve rejeitar CPF com ${razao}: ${cpf}`, () => {
        const resultado = validator.validar(cpf);
        expect(resultado).to.be.false;
      });
    });
  });
});
```

Esta abordagem produz uma saída clara quando os testes são executados, facilitando a identificação de qual caso específico falhou.

## Organização de Fixtures

Em aplicações complexas, manter dados de teste organizados é crucial:

```typescript
// test/fixtures/usuarios.fixture.ts
import { Usuario } from '../../src/models/usuario.model';

export const usuariosFixture = {
  usuarioAtivo: (): Usuario => ({
    id: 'USR-ATIVO-001',
    email: 'ativo@exemplo.com',
    nome: 'Usuário Ativo',
    ativo: true,
    senhaHash: 'hash-bcrypt-seguro'
  }),

  usuarioInativo: (): Usuario => ({
    id: 'USR-INATIVO-001',
    email: 'inativo@exemplo.com',
    nome: 'Usuário Inativo',
    ativo: false,
    senhaHash: 'hash-bcrypt-seguro'
  }),

  listaUsuarios: (quantidade: number): Usuario[] => {
    return Array.from({ length: quantidade }, (_, index) => ({
      id: `USR-LISTA-${String(index + 1).padStart(3, '0')}`,
      email: `usuario${index + 1}@exemplo.com`,
      nome: `Usuário ${index + 1}`,
      ativo: index % 2 === 0,
      senhaHash: 'hash-bcrypt-seguro'
    }));
  }
};
```

Agora os testes ficam mais limpos e legíveis, importando fixtures conforme necessário.

## Configuração Avançada com Arquivo .mocharc.js

Para projetos maiores, centralizar configurações em um arquivo dedicado é recomendado:

```javascript
// .mocharc.js
module.exports = {
  require: ['ts-node/register'],
  extension: ['ts'],
  spec: 'src/**/*.test.ts',
  recursive: true,
  timeout: 5000,
  slow: 100,
  reporter: 'spec',
  color: true,
  bail: false
};
```

Com este arquivo, os scripts no package.json ficam mais simples:

```json
{
  "scripts": {
    "test": "mocha",
    "test:unit": "mocha 'src/**/*.unit.test.ts'",
    "test:watch": "mocha --watch"
  }
}
```

## Estratégias de Filtragem Avançada

A flag "--grep" do Mocha aceita expressões regulares, permitindo filtragens sofisticadas:

```bash
# Executar apenas testes relacionados a autenticação
npm run test:grep "autenticação|login|senha"

# Executar testes que verificam comportamentos de erro
npm run test:grep "deve rejeitar|deve lançar erro|deve falhar"

# Executar testes de validação
npm run test:grep "validação|validar|válido|inválido"
```

Também podemos usar tags nas descrições para facilitar a filtragem:

```typescript
describe('[RAPIDO] validação de endereços de email', () => {
  // Testes rápidos aqui
});

describe('[LENTO] envio de mensagens', () => {
  // Testes que envolvem I/O
});
```

Executando apenas testes rápidos:

```bash
npm run test:grep "\[RAPIDO\]"
```

## Hooks Globais e Setup Compartilhado

Para evitar repetição, podemos criar arquivos de setup global:

```typescript
// test/setup.ts
import * as chai from 'chai';
import * as sinon from 'sinon';

// Hooks globais executados antes e depois de cada teste
afterEach(function() {
  // Restaura todos os stubs/spies automaticamente
  sinon.restore();
});

// Funções auxiliares compartilhadas
global.criarUsuarioTeste = (sobrescritas = {}) => {
  return {
    id: 'USR-TEST',
    email: 'teste@exemplo.com',
    nome: 'Usuário Teste',
    ativo: true,
    senhaHash: 'hash-teste',
    ...sobrescritas
  };
};
```

Referenciando na configuração:

```javascript
// .mocharc.js
module.exports = {
  require: ['ts-node/register', 'test/setup.ts'],
  // outras configurações
};
```

## Debugging de Testes

O Mocha pode ser executado no modo debug:

```json
{
  "scripts": {
    "test:debug": "mocha --inspect-brk 'src/**/*.test.ts' --require ts-node/register --recursive"
  }
}
```

Em VS Code, podemos criar configurações de debug:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Testes Mocha",
      "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
      "args": [
        "--require",
        "ts-node/register",
        "--timeout",
        "999999",
        "${workspaceFolder}/src/**/*.test.ts"
      ],
      "console": "integratedTerminal"
    }
  ]
}
```

## Integração com CI/CD

Exemplo de configuração para GitHub Actions:

```yaml
# .github/workflows/tests.yml
name: Testes Automatizados

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    
    - name: Configurar Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Instalar dependências
      run: npm ci
    
    - name: Executar testes unitários
      run: npm run test:unit
    
    - name: Executar testes de integração
      run: npm run test:integration
    
    - name: Gerar relatório de cobertura
      run: npm run test:coverage
```

## Considerações sobre Performance

Estratégias para manter testes rápidos:

1. **Priorizar testes unitários**: Testes que não dependem de I/O são ordem de magnitude mais rápidos.

2. **Executar testes em paralelo quando apropriado**: O Mocha suporta execução paralela através da flag "--parallel".

3. **Usar timeouts apropriados**: Configure timeouts adequadamente, nem muito curtos nem muito longos.

4. **Isolar testes de integração**: Manter testes lentos separados permite executá-los seletivamente.

5. **Monitorar duração dos testes**: Use a flag "--slow" para destacar testes lentos.

## Conclusão

A jornada de implementar uma suíte de testes robusta e bem organizada em uma estrutura complexa de diretórios é contínua. As práticas apresentadas neste guia formam uma base sólida, mas cada projeto tem suas particularidades que podem requerer adaptações.

O investimento em testes bem estruturados paga dividendos ao longo do tempo: reduz bugs em produção, facilita refatorações, acelera onboarding de novos desenvolvedores e serve como rede de segurança durante evolução do sistema. A chave está em manter testes legíveis, executáveis rapidamente e alinhados com o valor de negócio que verificam.

Lembre-se que testes não são um fim em si mesmos, mas uma ferramenta para construir software confiável e manutenível. Use-os estrategicamente, mantendo o equilíbrio entre cobertura adequada e pragmatismo. Testes que agregam valor são aqueles que previnem regressões reais e documentam comportamentos críticos do sistema.

A evolução das práticas de teste acompanha a maturidade da equipe e do projeto. Comece simples, com testes para os componentes mais críticos, e expanda gradualmente. Com o tempo, a suíte de testes se torna um ativo valioso que protege o investimento em código e acelera o desenvolvimento de novas funcionalidades.

Mantenha seus testes atualizados, refatore-os quando necessário e trate-os com o mesmo cuidado que dedica ao código de produção. Testes bem escritos são um diferencial competitivo que distingue projetos profissionais de amadores.
