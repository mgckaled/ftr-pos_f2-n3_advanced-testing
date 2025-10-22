# Glossário de Testes de Software

## Índice

- [Glossário de Testes de Software](#glossário-de-testes-de-software)
  - [Índice](#índice)
  - [Conceitos Fundamentais](#conceitos-fundamentais)
    - [Teste de Software](#teste-de-software)
    - [Teste Automatizado](#teste-automatizado)
    - [Teste Manual](#teste-manual)
  - [Tipos de Teste](#tipos-de-teste)
    - [Teste Funcional](#teste-funcional)
    - [Teste Não Funcional](#teste-não-funcional)
    - [Teste de Performance](#teste-de-performance)
    - [Teste de Carga](#teste-de-carga)
    - [Teste de Estresse](#teste-de-estresse)
    - [Teste de Segurança](#teste-de-segurança)
    - [Teste de Usabilidade](#teste-de-usabilidade)
    - [Teste E2E (End-to-End)](#teste-e2e-end-to-end)
    - [Teste de Fumaça (Smoke Test)](#teste-de-fumaça-smoke-test)
    - [Teste de Sanidade (Sanity Test)](#teste-de-sanidade-sanity-test)
    - [Teste Exploratório](#teste-exploratório)
  - [Técnicas e Estratégias](#técnicas-e-estratégias)
    - [Caixa Preta (Black Box)](#caixa-preta-black-box)
    - [Caixa Branca (White Box)](#caixa-branca-white-box)
    - [Caixa Cinza (Gray Box)](#caixa-cinza-gray-box)
    - [TDD (Test-Driven Development)](#tdd-test-driven-development)
    - [BDD (Behavior-Driven Development)](#bdd-behavior-driven-development)
    - [Cobertura de Código](#cobertura-de-código)
    - [Mocking e Stubbing](#mocking-e-stubbing)
  - [Padrões e Práticas](#padrões-e-práticas)
    - [Fixture](#fixture)
    - [Flaky Test](#flaky-test)
    - [Page Object Model](#page-object-model)
    - [Pirâmide de Testes](#pirâmide-de-testes)
    - [AAA Pattern (Arrange-Act-Assert)](#aaa-pattern-arrange-act-assert)
  - [CI/CD](#cicd)
    - [Continuous Integration (Integração Contínua)](#continuous-integration-integração-contínua)
    - [Continuous Delivery/Deployment (Entrega/Implantação Contínua)](#continuous-deliverydeployment-entregaimplantação-contínua)
  - [Conceitos Avançados](#conceitos-avançados)
    - [Mutation Testing](#mutation-testing)
    - [Test Doubles](#test-doubles)
    - [Snapshot Testing](#snapshot-testing)
    - [Contract Testing](#contract-testing)
    - [Property-Based Testing](#property-based-testing)
    - [Visual Regression Testing](#visual-regression-testing)
    - [Chaos Engineering](#chaos-engineering)
  - [Outros Conceitos](#outros-conceitos)
    - [Assertion](#assertion)
    - [Test Runner](#test-runner)
    - [Test Framework](#test-framework)
    - [Teste de Acessibilidade](#teste-de-acessibilidade)
    - [API Testing](#api-testing)
    - [GraphQL Testing](#graphql-testing)
    - [Test Data Management](#test-data-management)
    - [Métricas de Teste](#métricas-de-teste)
    - [Test Smell (Cheiro de Teste)](#test-smell-cheiro-de-teste)
    - [Teste de Regressão](#teste-de-regressão)
    - [Teste de Integração](#teste-de-integração)
    - [Teste Unitário](#teste-unitário)
    - [Retry Pattern](#retry-pattern)
  - [Conclusão](#conclusão)
    - [Pontos-Chave](#pontos-chave)
    - [Próximos Passos](#próximos-passos)

---

## Conceitos Fundamentais

### Teste de Software

**Iniciante:** Processo de verificar se um programa funciona corretamente, como conferir se todas as funcionalidades de um aplicativo fazem o que deveriam fazer.

**Estudante:** Atividade sistemática de executar um software com o objetivo de encontrar defeitos, validar requisitos e garantir que o sistema atende às especificações. Envolve planejamento, execução e análise de resultados.

**Profissional:** Processo estruturado de validação e verificação que avalia a qualidade do software através de técnicas estáticas e dinâmicas, buscando identificar defeitos, avaliar riscos, medir cobertura e garantir que o produto atende aos requisitos funcionais e não funcionais estabelecidos.

```typescript
import { expect } from 'chai';

describe('Calculadora', () => {
  it('deve somar dois números corretamente', () => {
    const resultado = somar(2, 3);
    expect(resultado).to.equal(5);
  });
});

function somar(a: number, b: number): number {
  return a + b;
}
```

---

### Teste Automatizado

**Iniciante:** Testes que rodam sozinhos através de código, sem precisar que alguém clique manualmente em botões para verificar se tudo funciona.

**Estudante:** Scripts ou programas que executam testes de forma automática, verificando comportamentos esperados sem intervenção manual. Aumentam a velocidade de execução e permitem testar repetidamente.

**Profissional:** Implementação de casos de teste através de frameworks e ferramentas que executam verificações de forma programática, proporcionando feedback rápido, reduzindo custo de regressão e permitindo integração contínua. Essencial para DevOps e entrega contínua.

```typescript
import { expect } from 'chai';

describe('API de Usuários', () => {
  it('deve criar um usuário e retornar status 201', async () => {
    const novoUsuario = {
      nome: 'João Silva',
      email: 'joao@example.com'
    };
    
    const resposta = await criarUsuario(novoUsuario);
    
    expect(resposta.status).to.equal(201);
    expect(resposta.data).to.have.property('id');
    expect(resposta.data.nome).to.equal(novoUsuario.nome);
  });
});
```

---

### Teste Manual

**Iniciante:** Quando uma pessoa testa o software clicando, digitando e verificando se tudo funciona como esperado, sem usar ferramentas automáticas.

**Estudante:** Processo onde testadores executam casos de teste manualmente, explorando a aplicação através de interação direta. Útil para testes exploratórios e validação de usabilidade.

**Profissional:** Abordagem de teste onde analistas executam casos de teste sem automação, focando em cenários complexos, experiência do usuário, testes exploratórios e situações que requerem julgamento humano. Complementar aos testes automatizados, especialmente para validação de UX/UI.

---

## Tipos de Teste

### Teste Funcional

**Iniciante:** Verifica se cada funcionalidade do software faz o que deveria fazer, como testar se o botão de login realmente loga o usuário.

**Estudante:** Valida se o sistema executa suas funções conforme especificado nos requisitos, testando entradas, processamento e saídas esperadas.

**Profissional:** Tipo de teste black-box que valida se o sistema atende aos requisitos funcionais, verificando comportamentos, regras de negócio e fluxos de trabalho através de casos de teste baseados em especificações.

```typescript
import { expect } from 'chai';

describe('Autenticação - Teste Funcional', () => {
  it('deve autenticar usuário com credenciais válidas', async () => {
    const credenciais = {
      email: 'usuario@example.com',
      senha: 'SenhaSegura123!'
    };
    
    const resultado = await autenticar(credenciais);
    
    expect(resultado.sucesso).to.be.true;
    expect(resultado.token).to.be.a('string');
    expect(resultado.usuario.email).to.equal(credenciais.email);
  });
  
  it('deve rejeitar credenciais inválidas', async () => {
    const credenciais = {
      email: 'usuario@example.com',
      senha: 'senhaErrada'
    };
    
    const resultado = await autenticar(credenciais);
    
    expect(resultado.sucesso).to.be.false;
    expect(resultado.erro).to.equal('Credenciais inválidas');
  });
});
```

---

### Teste Não Funcional

**Iniciante:** Testa características do sistema que não são funcionalidades diretas, como velocidade, segurança e facilidade de uso.

**Estudante:** Avalia atributos de qualidade do sistema como performance, segurança, usabilidade e confiabilidade, ao invés de funcionalidades específicas.

**Profissional:** Validação de requisitos não funcionais incluindo performance, escalabilidade, segurança, usabilidade, portabilidade, manutenibilidade e confiabilidade. Crítico para garantir atributos de qualidade e SLAs.

---

### Teste de Performance

**Iniciante:** Verifica se o sistema funciona rápido o suficiente, medindo quanto tempo leva para responder às ações do usuário.

**Estudante:** Avalia o desempenho do sistema sob condições específicas, medindo tempo de resposta, throughput e uso de recursos.

**Profissional:** Categoria de testes não funcionais que mede e valida a responsividade, estabilidade, escalabilidade e uso de recursos do sistema sob cargas de trabalho definidas, identificando gargalos e limites operacionais.

```typescript
import { expect } from 'chai';

describe('Performance - API de Busca', () => {
  it('deve responder busca em menos de 200ms', async () => {
    const inicio = Date.now();
    
    await buscarProdutos('notebook');
    
    const tempoDecorrido = Date.now() - inicio;
    expect(tempoDecorrido).to.be.below(200);
  });
  
  it('deve processar 100 requisições em menos de 5s', async () => {
    const inicio = Date.now();
    const requisicoes = [];
    
    for (let i = 0; i < 100; i++) {
      requisicoes.push(buscarProdutos('teste'));
    }
    
    await Promise.all(requisicoes);
    
    const tempoTotal = Date.now() - inicio;
    expect(tempoTotal).to.be.below(5000);
  });
});
```

---

### Teste de Carga

**Iniciante:** Testa como o sistema se comporta quando muitas pessoas usam ao mesmo tempo, como 1000 usuários acessando um site simultaneamente.

**Estudante:** Simula múltiplos usuários acessando o sistema simultaneamente para verificar como ele se comporta sob carga esperada.

**Profissional:** Tipo de teste de performance que valida o comportamento do sistema sob condições de carga antecipadas, medindo degradação de performance, identificando limites de capacidade e validando requisitos de throughput e concorrência.

---

### Teste de Estresse

**Iniciante:** Testa o sistema no limite, colocando muito mais carga do que o normal para ver quando ele começa a falhar.

**Estudante:** Empurra o sistema além de seus limites operacionais para identificar o ponto de quebra e como ele se recupera.

**Profissional:** Teste que submete o sistema a condições extremas além da capacidade normal, identificando pontos de falha, validando mecanismos de recuperação e avaliando comportamento sob condições adversas como picos de tráfego inesperados.

---

### Teste de Segurança

**Iniciante:** Verifica se o sistema está protegido contra hackers e se dados sensíveis estão seguros.

**Estudante:** Identifica vulnerabilidades e fraquezas do sistema que podem ser exploradas, testando autenticação, autorização e proteção de dados.

**Profissional:** Processo sistemático de identificar vulnerabilidades, ameaças e riscos de segurança através de técnicas como penetration testing, análise de vulnerabilidades, fuzzing e validação de conformidade com padrões de segurança (OWASP, ISO 27001).

```typescript
import { expect } from 'chai';

describe('Segurança - Injeção SQL', () => {
  it('deve prevenir injeção SQL em busca', async () => {
    const entradaMaliciosa = "' OR '1'='1";
    
    const resultado = await buscarUsuario(entradaMaliciosa);
    
    expect(resultado).to.be.null;
  });
  
  it('deve sanitizar entrada XSS', () => {
    const entradaXSS = '<script>alert("XSS")</script>';
    
    const saida = sanitizarHTML(entradaXSS);
    
    expect(saida).to.not.include('<script>');
    expect(saida).to.not.include('alert');
  });
});

describe('Segurança - Autenticação', () => {
  it('deve bloquear acesso sem token válido', async () => {
    try {
      await acessarRecursoProtegido(null);
      expect.fail('Deveria ter lançado erro');
    } catch (erro) {
      expect(erro.message).to.include('Não autorizado');
    }
  });
});
```

---

### Teste de Usabilidade

**Iniciante:** Avalia se o sistema é fácil de usar e se as pessoas conseguem fazer o que precisam sem dificuldade.

**Estudante:** Verifica a experiência do usuário, incluindo facilidade de aprendizado, eficiência de uso e satisfação do usuário.

**Profissional:** Avaliação da interface e experiência do usuário através de técnicas como testes com usuários reais, heurísticas de usabilidade, análise de acessibilidade e medição de métricas como tempo de conclusão de tarefas e taxa de erro.

---

### Teste E2E (End-to-End)

**Iniciante:** Testa o sistema completo do início ao fim, como um usuário real faria, verificando se tudo funciona junto.

**Estudante:** Valida fluxos completos da aplicação, simulando cenários reais de uso do usuário através de múltiplos componentes e camadas.

**Profissional:** Teste que valida o fluxo completo da aplicação em um ambiente que simula produção, verificando integração entre todos os componentes, serviços externos, banco de dados e interface, garantindo que o sistema funciona como um todo.

```typescript
import { expect } from 'chai';

describe('E2E - Fluxo de Compra', () => {
  it('deve completar fluxo de compra do carrinho ao pagamento', async () => {
    // 1. Adicionar produto ao carrinho
    const produto = { id: 123, nome: 'Notebook', preco: 3000 };
    await adicionarAoCarrinho(produto);
    
    // 2. Verificar carrinho
    const carrinho = await obterCarrinho();
    expect(carrinho.itens).to.have.lengthOf(1);
    expect(carrinho.total).to.equal(3000);
    
    // 3. Realizar checkout
    const dadosPagamento = {
      numeroCartao: '4111111111111111',
      cvv: '123',
      validade: '12/25'
    };
    const pedido = await realizarCheckout(dadosPagamento);
    
    // 4. Validar pedido criado
    expect(pedido.status).to.equal('confirmado');
    expect(pedido.total).to.equal(3000);
    
    // 5. Verificar email de confirmação
    const email = await obterUltimoEmail();
    expect(email.assunto).to.include('Pedido confirmado');
  });
});
```

---

### Teste de Fumaça (Smoke Test)

**Iniciante:** Testes rápidos para verificar se as funcionalidades mais importantes do sistema estão funcionando antes de testar mais a fundo.

**Estudante:** Conjunto mínimo de testes que verifica se as funcionalidades críticas estão operacionais após um build ou deploy.

**Profissional:** Conjunto superficial de testes que valida as funcionalidades críticas do sistema, executado após cada build para determinar se testes mais profundos devem prosseguir. Também conhecido como Build Verification Test (BVT).

```typescript
import { expect } from 'chai';

describe('Smoke Test - Sistema', () => {
  it('deve conectar ao banco de dados', async () => {
    const conexao = await conectarBancoDados();
    expect(conexao.status).to.equal('conectado');
  });
  
  it('deve responder no endpoint de health check', async () => {
    const resposta = await verificarSaude();
    expect(resposta.status).to.equal(200);
    expect(resposta.data.servico).to.equal('online');
  });
  
  it('deve autenticar usuário padrão', async () => {
    const resultado = await autenticar({
      email: 'admin@example.com',
      senha: 'senha123'
    });
    expect(resultado.sucesso).to.be.true;
  });
});
```

---

### Teste de Sanidade (Sanity Test)

**Iniciante:** Testes rápidos após uma mudança pequena para garantir que o bug foi corrigido e nada mais quebrou.

**Estudante:** Subconjunto dos testes de regressão focado em verificar se uma funcionalidade específica ainda funciona após mudanças.

**Profissional:** Teste estreito e profundo que verifica se uma funcionalidade ou correção específica funciona corretamente após uma mudança, validando rapidamente se vale a pena prosseguir com testes mais abrangentes.

---

### Teste Exploratório

**Iniciante:** Testar o sistema livremente, sem roteiro fixo, tentando encontrar problemas que ninguém pensou antes.

**Estudante:** Abordagem simultânea de aprendizado, design de teste e execução, onde o testador explora o sistema de forma livre e criativa.

**Profissional:** Técnica de teste ad-hoc onde testadores experientes exploram o sistema sem casos de teste predefinidos, usando intuição, experiência e criatividade para descobrir defeitos inesperados e avaliar qualidade geral.

---

## Técnicas e Estratégias

### Caixa Preta (Black Box)

**Iniciante:** Testar o sistema sem saber como ele funciona por dentro, apenas verificando se as entradas produzem as saídas esperadas.

**Estudante:** Técnica de teste que foca em entradas e saídas sem conhecimento da estrutura interna do código.

**Profissional:** Abordagem de teste baseada em especificações que valida funcionalidades através de entradas e saídas esperadas, sem considerar a implementação interna. Técnicas incluem particionamento de equivalência, análise de valor limite e tabelas de decisão.

```typescript
import { expect } from 'chai';

describe('Caixa Preta - Validação de Email', () => {
  // Testamos apenas o comportamento, sem saber a implementação
  
  it('deve aceitar emails válidos', () => {
    expect(validarEmail('usuario@example.com')).to.be.true;
    expect(validarEmail('nome.sobrenome@empresa.com.br')).to.be.true;
  });
  
  it('deve rejeitar emails inválidos', () => {
    expect(validarEmail('emailsem@')).to.be.false;
    expect(validarEmail('@example.com')).to.be.false;
    expect(validarEmail('email@')).to.be.false;
  });
});
```

---

### Caixa Branca (White Box)

**Iniciante:** Testar o sistema conhecendo todo o código interno, verificando se cada linha e caminho do código funciona corretamente.

**Estudante:** Técnica que usa conhecimento da estrutura interna do código para criar casos de teste que exercitam caminhos específicos.

**Profissional:** Abordagem de teste estrutural que utiliza conhecimento profundo da implementação para criar casos de teste que cobrem caminhos de código, condições, loops e estruturas de dados, maximizando cobertura de código e identificando lógica complexa.

```typescript
import { expect } from 'chai';

// Função a ser testada
function calcularDesconto(valor: number, cliente: string): number {
  if (valor > 1000) {
    if (cliente === 'vip') {
      return valor * 0.8; // 20% desconto
    }
    return valor * 0.9; // 10% desconto
  }
  return valor;
}

describe('Caixa Branca - Cobertura de Caminhos', () => {
  // Conhecemos a implementação e testamos todos os caminhos
  
  it('caminho 1: valor <= 1000', () => {
    expect(calcularDesconto(500, 'normal')).to.equal(500);
  });
  
  it('caminho 2: valor > 1000 e cliente vip', () => {
    expect(calcularDesconto(1500, 'vip')).to.equal(1200);
  });
  
  it('caminho 3: valor > 1000 e cliente normal', () => {
    expect(calcularDesconto(1500, 'normal')).to.equal(1350);
  });
});
```

---

### Caixa Cinza (Gray Box)

**Iniciante:** Combinação de testar sabendo um pouco do código interno, mas focando principalmente no comportamento externo.

**Estudante:** Abordagem híbrida que combina conhecimento parcial da implementação com teste baseado em requisitos.

**Profissional:** Técnica que utiliza conhecimento limitado da arquitetura e design interno para criar testes mais efetivos, comum em testes de integração onde se conhece a estrutura mas não toda a implementação.

---

### TDD (Test-Driven Development)

**Iniciante:** Escrever os testes antes de escrever o código da funcionalidade, garantindo que o código atenda aos requisitos desde o início.

**Estudante:** Prática de desenvolvimento onde você escreve um teste que falha, implementa o código mínimo para passar e então refatora.

**Profissional:** Disciplina de desenvolvimento que segue o ciclo Red-Green-Refactor: escrever teste que falha, implementar código mínimo para passar, refatorar mantendo testes passando. Melhora design, cobertura de testes e reduz defeitos.

```typescript
import { expect } from 'chai';

// 1. RED - Escrever teste que falha
describe('TDD - Calculadora de Impostos', () => {
  it('deve calcular imposto de 15% para valores até 1000', () => {
    const calculadora = new CalculadoraImpostos();
    expect(calculadora.calcular(1000)).to.equal(150);
  });
  
  it('deve calcular imposto de 25% para valores acima de 1000', () => {
    const calculadora = new CalculadoraImpostos();
    expect(calculadora.calcular(2000)).to.equal(500);
  });
});

// 2. GREEN - Implementar código mínimo
class CalculadoraImpostos {
  calcular(valor: number): number {
    if (valor <= 1000) {
      return valor * 0.15;
    }
    return valor * 0.25;
  }
}

// 3. REFACTOR - Melhorar código mantendo testes passando
class CalculadoraImpostosRefatorada {
  private readonly ALIQUOTA_BAIXA = 0.15;
  private readonly ALIQUOTA_ALTA = 0.25;
  private readonly LIMITE = 1000;
  
  calcular(valor: number): number {
    const aliquota = valor <= this.LIMITE 
      ? this.ALIQUOTA_BAIXA 
      : this.ALIQUOTA_ALTA;
    return valor * aliquota;
  }
}
```

---

### BDD (Behavior-Driven Development)

**Iniciante:** Escrever testes na linguagem do negócio, descrevendo comportamentos esperados de forma que todos entendam.

**Estudante:** Extensão do TDD focada em comportamento, usando linguagem ubíqua para descrever cenários em formato Given-When-Then.

**Profissional:** Prática colaborativa que une desenvolvedores, QA e stakeholders de negócio para definir comportamentos através de especificações executáveis em linguagem natural, usando ferramentas como Cucumber ou frameworks BDD-style.

```typescript
import { expect } from 'chai';

// Estilo BDD usando sintaxe descritiva
describe('Feature: Carrinho de Compras', () => {
  describe('Cenário: Adicionar produto ao carrinho', () => {
    let carrinho: Carrinho;
    
    beforeEach(() => {
      // Given - Dado que tenho um carrinho vazio
      carrinho = new Carrinho();
    });
    
    it('deve adicionar produto e atualizar total', () => {
      // When - Quando adiciono um produto
      const produto = { id: 1, nome: 'Livro', preco: 50 };
      carrinho.adicionar(produto);
      
      // Then - Então o carrinho deve conter o produto
      expect(carrinho.itens).to.have.lengthOf(1);
      expect(carrinho.total).to.equal(50);
    });
  });
  
  describe('Cenário: Aplicar cupom de desconto', () => {
    it('deve aplicar 10% de desconto com cupom válido', () => {
      // Given
      const carrinho = new Carrinho();
      carrinho.adicionar({ id: 1, nome: 'Livro', preco: 100 });
      
      // When
      carrinho.aplicarCupom('DESC10');
      
      // Then
      expect(carrinho.total).to.equal(90);
    });
  });
});
```

---

### Cobertura de Código

**Iniciante:** Medir quanto do código foi executado pelos testes, geralmente mostrado em porcentagem.

**Estudante:** Métrica que indica a proporção do código-fonte exercitada pelos testes, incluindo linhas, branches e funções.

**Profissional:** Conjunto de métricas que mede a completude dos testes através de cobertura de linhas, branches, funções, statements e caminhos. Alta cobertura não garante qualidade mas baixa cobertura indica testes insuficientes.

```typescript
import { expect } from 'chai';

// Exemplo: função com múltiplos caminhos
function processarPedido(pedido: Pedido): string {
  if (!pedido.itens || pedido.itens.length === 0) {
    return 'Pedido vazio'; // Branch 1
  }
  
  if (pedido.total > 1000) {
    return 'Pedido aprovado com revisão'; // Branch 2
  }
  
  return 'Pedido aprovado'; // Branch 3
}

describe('Cobertura - Processar Pedido', () => {
  // Para 100% de cobertura de branches, precisamos testar todos os caminhos
  
  it('deve retornar erro para pedido vazio', () => {
    const pedido = { itens: [], total: 0 };
    expect(processarPedido(pedido)).to.equal('Pedido vazio');
  });
  
  it('deve aprovar com revisão para pedidos grandes', () => {
    const pedido = { itens: [1, 2, 3], total: 1500 };
    expect(processarPedido(pedido)).to.equal('Pedido aprovado com revisão');
  });
  
  it('deve aprovar pedidos normais', () => {
    const pedido = { itens: [1], total: 500 };
    expect(processarPedido(pedido)).to.equal('Pedido aprovado');
  });
});
```

---

### Mocking e Stubbing

**Iniciante:** Criar objetos falsos que imitam partes do sistema para testar um pedaço específico sem depender de outros.

**Estudante:** Técnicas para substituir dependências reais por versões controladas durante testes, isolando a unidade sendo testada.

**Profissional:** Padrão de Test Doubles onde mocks verificam interações (expectativas) e stubs fornecem respostas predefinidas. Essencial para isolar unidades, testar casos difíceis de reproduzir e acelerar execução de testes.

```typescript
import { expect } from 'chai';
import * as sinon from 'sinon';

// Serviço que depende de chamadas externas
class ServicoUsuario {
  constructor(private bancoRepository: BancoRepository) {}
  
  async obterUsuario(id: number): Promise<Usuario> {
    return this.bancoRepository.buscar(id);
  }
  
  async criarUsuario(dados: Usuario): Promise<void> {
    await this.bancoRepository.salvar(dados);
  }
}

describe('Mocking e Stubbing - Serviço de Usuário', () => {
  let repositoryMock: sinon.SinonStubbedInstance<BancoRepository>;
  let servico: ServicoUsuario;
  
  beforeEach(() => {
    // Criar stub do repository
    repositoryMock = {
      buscar: sinon.stub(),
      salvar: sinon.stub()
    } as any;
    
    servico = new ServicoUsuario(repositoryMock);
  });
  
  it('deve retornar usuário do banco (Stub)', async () => {
    // Stub: definir retorno pré-configurado
    const usuarioMock = { id: 1, nome: 'João' };
    repositoryMock.buscar.resolves(usuarioMock);
    
    const resultado = await servico.obterUsuario(1);
    
    expect(resultado).to.deep.equal(usuarioMock);
  });
  
  it('deve chamar repository.salvar com dados corretos (Mock)', async () => {
    // Mock: verificar se método foi chamado corretamente
    const novoUsuario = { id: 2, nome: 'Maria' };
    repositoryMock.salvar.resolves();
    
    await servico.criarUsuario(novoUsuario);
    
    expect(repositoryMock.salvar.calledOnce).to.be.true;
    expect(repositoryMock.salvar.calledWith(novoUsuario)).to.be.true;
  });
});
```

---

## Padrões e Práticas

### Fixture

**Iniciante:** Dados de teste preparados e reutilizáveis que servem como ponto de partida para vários testes.

**Estudante:** Conjunto de dados ou estado conhecido usado para inicializar o ambiente de teste de forma consistente.

**Profissional:** Estado ou dados predefinidos que estabelecem um contexto conhecido para execução de testes, garantindo repetibilidade e isolamento. Podem ser fixtures de banco de dados, arquivos de configuração ou objetos pré-configurados.

```typescript
import { expect } from 'chai';

// Fixture: dados de teste reutilizáveis
const usuariosFixture = {
  usuarioValido: {
    id: 1,
    nome: 'João Silva',
    email: 'joao@example.com',
    ativo: true
  },
  usuarioInativo: {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@example.com',
    ativo: false
  },
  usuarioAdmin: {
    id: 3,
    nome: 'Admin',
    email: 'admin@example.com',
    ativo: true,
    perfil: 'administrador'
  }
};

describe('Autenticação com Fixtures', () => {
  beforeEach(() => {
    // Setup: carregar fixtures no banco de teste
    carregarFixtures(usuariosFixture);
  });
  
  it('deve autenticar usuário ativo', async () => {
    const resultado = await autenticar(
      usuariosFixture.usuarioValido.email,
      'senha123'
    );
    expect(resultado.sucesso).to.be.true;
  });
  
  it('deve bloquear usuário inativo', async () => {
    const resultado = await autenticar(
      usuariosFixture.usuarioInativo.email,
      'senha123'
    );
    expect(resultado.sucesso).to.be.false;
    expect(resultado.erro).to.include('inativo');
  });
});
```

---

### Flaky Test

**Iniciante:** Teste que às vezes passa e às vezes falha, mesmo sem mudanças no código, sendo pouco confiável.

**Estudante:** Teste não determinístico que produz resultados inconsistentes devido a condições de corrida, dependências externas ou timeouts.

**Profissional:** Anti-padrão de teste que exibe comportamento intermitente devido a problemas como concorrência não controlada, dependências temporais, estado compartilhado, condições de corrida ou dependência de recursos externos instáveis. Reduz confiança no suite de testes.

```typescript
import { expect } from 'chai';

// RUIM: Flaky Test - depende de timing
describe('Flaky Test - Exemplo Ruim', () => {
  it('deve processar requisição assíncrona', (done) => {
    let resultado: string;
    
    processarAsync(() => {
      resultado = 'processado';
    });
    
    // Problema: não sabemos quando callback será executado
    setTimeout(() => {
      expect(resultado).to.equal('processado'); // Pode falhar aleatoriamente
      done();
    }, 100); // Timing arbitrário
  });
});

// BOM: Teste determinístico
describe('Teste Determinístico - Exemplo Correto', () => {
  it('deve processar requisição assíncrona', async () => {
    // Usar async/await ou Promises
    const resultado = await processarAsync();
    expect(resultado).to.equal('processado');
  });
  
  it('deve usar mock para evitar dependências externas', async () => {
    // Mockar dependências externas
    const apiMock = sinon.stub().resolves({ data: 'teste' });
    const servico = new Servico(apiMock);
    
    const resultado = await servico.buscar();
    expect(resultado.data).to.equal('teste');
  });
});
```

---

### Page Object Model

**Iniciante:** Padrão para organizar testes de interface onde cada página do sistema tem sua própria classe com métodos para interagir com ela.

**Estudante:** Design pattern que encapsula a estrutura e comportamento de páginas web em classes, separando lógica de teste da interação com elementos.

**Profissional:** Padrão de design para testes E2E que abstrai detalhes de implementação de UI em objetos que representam páginas ou componentes, melhorando manutenibilidade, reusabilidade e legibilidade dos testes.

```typescript
import { expect } from 'chai';

// Page Object: encapsula interações com a página de login
class LoginPage {
  private emailInput = '#email';
  private senhaInput = '#senha';
  private loginButton = '#btn-login';
  private mensagemErro = '.erro-login';
  
  async preencherEmail(email: string): Promise<void> {
    await preencher(this.emailInput, email);
  }
  
  async preencherSenha(senha: string): Promise<void> {
    await preencher(this.senhaInput, senha);
  }
  
  async clicarLogin(): Promise<void> {
    await clicar(this.loginButton);
  }
  
  async obterMensagemErro(): Promise<string> {
    return await obterTexto(this.mensagemErro);
  }
  
  async fazerLogin(email: string, senha: string): Promise<void> {
    await this.preencherEmail(email);
    await this.preencherSenha(senha);
    await this.clicarLogin();
  }
}

// Teste usando Page Object
describe('Login E2E com Page Object', () => {
  let loginPage: LoginPage;
  
  beforeEach(() => {
    loginPage = new LoginPage();
  });
  
  it('deve fazer login com credenciais válidas', async () => {
    await loginPage.fazerLogin('usuario@example.com', 'senha123');
    
    // Verificar redirecionamento para dashboard
    expect(await obterURL()).to.include('/dashboard');
  });
  
  it('deve mostrar erro com credenciais inválidas', async () => {
    await loginPage.fazerLogin('usuario@example.com', 'senhaErrada');
    
    const erro = await loginPage.obterMensagemErro();
    expect(erro).to.include('Credenciais inválidas');
  });
});
```

---

### Pirâmide de Testes

**Iniciante:** Modelo que diz para ter muitos testes pequenos e rápidos na base, menos testes de integração no meio e poucos testes de interface no topo.

**Estudante:** Estratégia que recomenda maior quantidade de testes unitários, quantidade moderada de testes de integração e poucos testes E2E.

**Profissional:** Modelo conceitual que guia a distribuição de esforço de testes através das camadas: base ampla de testes unitários (rápidos, baratos), camada intermediária de testes de integração e topo estreito de testes E2E (lentos, caros). Otimiza custo, velocidade e confiabilidade.

```typescript
import { expect } from 'chai';

// CAMADA 1: Testes Unitários (Base da Pirâmide) - 70%
// Rápidos, isolados, muitos testes
describe('Unitário - Validador de CPF', () => {
  it('deve validar CPF válido', () => {
    expect(validarCPF('12345678901')).to.be.true;
  });
  
  it('deve rejeitar CPF inválido', () => {
    expect(validarCPF('00000000000')).to.be.false;
  });
  
  it('deve rejeitar CPF com formato incorreto', () => {
    expect(validarCPF('123')).to.be.false;
  });
});

// CAMADA 2: Testes de Integração (Meio da Pirâmide) - 20%
// Testam interação entre componentes
describe('Integração - Serviço de Pedidos', () => {
  it('deve criar pedido e salvar no banco', async () => {
    const pedido = { usuario: 1, itens: [{ id: 1, qtd: 2 }] };
    
    const resultado = await servicoPedidos.criar(pedido);
    const pedidoSalvo = await repository.buscar(resultado.id);
    
    expect(pedidoSalvo).to.exist;
    expect(pedidoSalvo.total).to.be.greaterThan(0);
  });
});

// CAMADA 3: Testes E2E (Topo da Pirâmide) - 10%
// Lentos, complexos, poucos testes críticos
describe('E2E - Fluxo de Compra Completo', () => {
  it('deve completar compra do produto até confirmação', async () => {
    await navegarPara('/produtos');
    await adicionarProdutoAoCarrinho('produto-1');
    await irParaCheckout();
    await preencherDadosPagamento();
    await confirmarCompra();
    
    expect(await obterMensagemSucesso()).to.include('Pedido confirmado');
  });
});
```

---

### AAA Pattern (Arrange-Act-Assert)

**Iniciante:** Padrão para organizar testes em três partes: preparar o cenário, executar a ação e verificar o resultado.

**Estudante:** Estrutura de teste que separa claramente preparação de dados, execução do comportamento e validação de resultados.

**Profissional:** Padrão de estruturação de testes que divide cada caso em três seções distintas: Arrange (configurar pré-condições e dados), Act (executar o comportamento sendo testado) e Assert (verificar resultados esperados), melhorando legibilidade e manutenção.

```typescript
import { expect } from 'chai';

describe('AAA Pattern - Carrinho de Compras', () => {
  it('deve calcular total com desconto aplicado', () => {
    // ARRANGE: Preparar dados e estado inicial
    const carrinho = new Carrinho();
    const produto1 = { id: 1, nome: 'Livro', preco: 50 };
    const produto2 = { id: 2, nome: 'Caneta', preco: 10 };
    carrinho.adicionar(produto1);
    carrinho.adicionar(produto2);
    const cupomDesconto = 'DESC10'; // 10% de desconto
    
    // ACT: Executar a ação sendo testada
    carrinho.aplicarCupom(cupomDesconto);
    const total = carrinho.obterTotal();
    
    // ASSERT: Verificar resultados esperados
    expect(total).to.equal(54); // (50 + 10) * 0.9 = 54
    expect(carrinho.cupomAplicado).to.equal(cupomDesconto);
  });
  
  it('deve remover item e recalcular total', () => {
    // Arrange
    const carrinho = new Carrinho();
    const produto = { id: 1, nome: 'Mouse', preco: 100 };
    carrinho.adicionar(produto);
    const totalInicial = carrinho.obterTotal();
    
    // Act
    carrinho.remover(produto.id);
    const totalFinal = carrinho.obterTotal();
    
    // Assert
    expect(totalInicial).to.equal(100);
    expect(totalFinal).to.equal(0);
    expect(carrinho.itens).to.have.lengthOf(0);
  });
});
```

---

## CI/CD

### Continuous Integration (Integração Contínua)

**Iniciante:** Prática de juntar o código de todos os desenvolvedores várias vezes ao dia, executando testes automaticamente para detectar problemas cedo.

**Estudante:** Prática de desenvolvimento onde desenvolvedores integram código frequentemente ao repositório principal, com builds e testes automáticos executados a cada commit.

**Profissional:** Prática de DevOps onde desenvolvedores integram código ao trunk múltiplas vezes ao dia, com pipeline automatizado que executa build, testes e análise de qualidade, fornecendo feedback rápido sobre integração e qualidade.

```typescript
// Exemplo de configuração de CI (.github/workflows/ci.yml conceitual)
/*
name: CI Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage
      - run: npm run lint
*/

// Estrutura de testes para CI
describe('CI - Suite de Testes', () => {
  describe('Testes Unitários', () => {
    it('deve passar em todos os testes unitários', () => {
      const resultado = funcaoUnitaria();
      expect(resultado).to.be.true;
    });
  });
  
  describe('Testes de Integração', () => {
    it('deve passar em testes de integração', async () => {
      const resultado = await funcaoIntegracao();
      expect(resultado.status).to.equal('success');
    });
  });
  
  describe('Quality Gates', () => {
    it('deve ter cobertura mínima de 80%', () => {
      // Verificado pela ferramenta de cobertura
      expect(cobertura).to.be.at.least(80);
    });
  });
});
```

---

### Continuous Delivery/Deployment (Entrega/Implantação Contínua)

**Iniciante:** Automação que permite enviar código para produção de forma rápida e segura sempre que necessário (Delivery), ou automaticamente após testes (Deployment).

**Estudante:** Continuous Delivery mantém código sempre pronto para deploy manual. Continuous Deployment vai além, fazendo deploy automático em produção após pipeline.

**Profissional:** CD (Delivery) é prática onde código está sempre em estado deployable através de pipeline automatizado, com deploy manual para produção. CD (Deployment) estende isso com deploy automático em produção após passar por todos os estágios. Ambos requerem testes robustos e monitoramento.

```typescript
import { expect } from 'chai';

// Testes que garantem código pronto para produção
describe('CD - Pré-requisitos para Deploy', () => {
  describe('Health Checks', () => {
    it('deve responder health check', async () => {
      const health = await verificarSaude();
      expect(health.status).to.equal('healthy');
      expect(health.database).to.equal('connected');
      expect(health.cache).to.equal('connected');
    });
  });
  
  describe('Smoke Tests Produção', () => {
    it('deve executar operações críticas', async () => {
      const resultado = await executarOperacaoCritica();
      expect(resultado.sucesso).to.be.true;
    });
  });
  
  describe('Rollback Safety', () => {
    it('deve permitir rollback seguro', async () => {
      const versaoAtual = await obterVersao();
      await realizarRollback();
      const versaoAnterior = await obterVersao();
      
      expect(versaoAnterior).to.not.equal(versaoAtual);
    });
  });
  
  describe('Feature Flags', () => {
    it('deve habilitar/desabilitar features dinamicamente', () => {
      const feature = obterFeatureFlag('nova-funcionalidade');
      expect(feature).to.have.property('habilitada');
      expect(feature).to.have.property('percentual');
    });
  });
});
```

---

## Conceitos Avançados

### Mutation Testing

**Iniciante:** Técnica que modifica propositalmente o código para ver se os testes conseguem detectar os erros introduzidos.

**Estudante:** Processo de introduzir pequenas mudanças (mutações) no código para verificar se os testes existentes falham, avaliando a qualidade dos testes.

**Profissional:** Técnica de teste dos testes onde ferramentas introduzem mutações sistemáticas no código (operadores alterados, condições invertidas) para validar se o suite de testes detecta essas mudanças. Mutation Score indica qualidade dos testes.

```typescript
import { expect } from 'chai';

// Código original
function aplicarDesconto(valor: number, percentual: number): number {
  return valor - (valor * percentual / 100);
}

// Mutação 1: trocar subtração por adição
// function aplicarDesconto(valor: number, percentual: number): number {
//   return valor + (valor * percentual / 100); // MUTANTE
// }

// Mutação 2: trocar multiplicação por divisão
// function aplicarDesconto(valor: number, percentual: number): number {
//   return valor - (valor / percentual / 100); // MUTANTE
// }

describe('Mutation Testing - Desconto', () => {
  // Teste que MATA a Mutação 1
  it('deve reduzir valor com desconto', () => {
    const resultado = aplicarDesconto(100, 10);
    expect(resultado).to.be.lessThan(100); // Falha se mutação 1
    expect(resultado).to.equal(90);
  });
  
  // Teste que MATA a Mutação 2
  it('deve calcular percentual corretamente', () => {
    const resultado = aplicarDesconto(200, 50);
    expect(resultado).to.equal(100); // Falha se mutação 2
  });
  
  // Bons testes matam mutantes
  // Mutation Score = mutantes mortos / total mutantes
});
```

---

### Test Doubles

**Iniciante:** Objetos falsos usados no lugar de objetos reais durante testes para facilitar e isolar o que está sendo testado.

**Estudante:** Categoria que inclui Dummy, Stub, Spy, Mock e Fake - objetos substitutos com diferentes propósitos em testes.

**Profissional:** Padrão genérico para objetos que substituem dependências reais em testes: Dummy (não usado), Stub (respostas pré-programadas), Spy (registra chamadas), Mock (verifica comportamento), Fake (implementação simplificada funcional).

```typescript
import { expect } from 'chai';
import * as sinon from 'sinon';

interface EmailService {
  enviar(para: string, assunto: string, corpo: string): Promise<void>;
}

// 1. DUMMY: Objeto passado mas nunca usado
class EmailServiceDummy implements EmailService {
  async enviar(): Promise<void> {
    throw new Error('Não deveria ser chamado');
  }
}

// 2. STUB: Retorna respostas pré-programadas
class EmailServiceStub implements EmailService {
  async enviar(): Promise<void> {
    return Promise.resolve();
  }
}

// 3. SPY: Registra como foi chamado
class EmailServiceSpy implements EmailService {
  chamadas: Array<{ para: string; assunto: string }> = [];
  
  async enviar(para: string, assunto: string, corpo: string): Promise<void> {
    this.chamadas.push({ para, assunto });
  }
}

// 4. MOCK: Verifica comportamento esperado
// (geralmente usando biblioteca como Sinon)

// 5. FAKE: Implementação simplificada funcional
class EmailServiceFake implements EmailService {
  emailsEnviados: Array<any> = [];
  
  async enviar(para: string, assunto: string, corpo: string): Promise<void> {
    this.emailsEnviados.push({ para, assunto, corpo });
  }
}

describe('Test Doubles - Exemplos', () => {
  it('Dummy - objeto passado mas não usado', () => {
    const dummy = new EmailServiceDummy();
    const servico = new ServicoQueNaoUsaEmail(dummy);
    
    servico.processar();
    // Dummy nunca é chamado
  });
  
  it('Stub - retorna resposta pré-definida', async () => {
    const stub = new EmailServiceStub();
    const servico = new NotificacaoService(stub);
    
    await servico.notificar('user@example.com');
    // Apenas verifica que não lançou erro
  });
  
  it('Spy - registra chamadas', async () => {
    const spy = new EmailServiceSpy();
    const servico = new NotificacaoService(spy);
    
    await servico.notificar('user@example.com');
    
    expect(spy.chamadas).to.have.lengthOf(1);
    expect(spy.chamadas[0].para).to.equal('user@example.com');
  });
  
  it('Mock - verifica interação esperada', async () => {
    const mock = sinon.mock(EmailService);
    mock.expects('enviar')
      .once()
      .withArgs('user@example.com', 'Bem-vindo');
    
    const servico = new NotificacaoService(mock.object);
    await servico.notificar('user@example.com');
    
    mock.verify();
  });
  
  it('Fake - implementação simplificada', async () => {
    const fake = new EmailServiceFake();
    const servico = new NotificacaoService(fake);
    
    await servico.notificar('user@example.com');
    
    expect(fake.emailsEnviados).to.have.lengthOf(1);
    expect(fake.emailsEnviados[0].assunto).to.equal('Bem-vindo');
  });
});
```

---

### Snapshot Testing

**Iniciante:** Salvar uma foto do resultado de um teste e comparar com essa foto nas próximas execuções para detectar mudanças inesperadas.

**Estudante:** Técnica que captura a saída de um componente ou função e compara com uma versão salva anteriormente, detectando mudanças não intencionais.

**Profissional:** Abordagem de teste que serializa e armazena saída de componentes ou estruturas de dados, comparando execuções futuras contra snapshots salvos. Útil para UI components, APIs e estruturas complexas, mas requer disciplina para revisar mudanças legítimas.

```typescript
import { expect } from 'chai';
import * as fs from 'fs';

function matchSnapshot(nome: string, dados: any): void {
  const caminhoSnapshot = `./snapshots/${nome}.json`;
  const dadosSerializados = JSON.stringify(dados, null, 2);
  
  if (!fs.existsSync(caminhoSnapshot)) {
    fs.writeFileSync(caminhoSnapshot, dadosSerializados);
    return;
  }
  
  const snapshotSalvo = fs.readFileSync(caminhoSnapshot, 'utf-8');
  expect(dadosSerializados).to.equal(snapshotSalvo);
}

describe('Snapshot Testing - Componente de Produto', () => {
  it('deve corresponder ao snapshot do card de produto', () => {
    const produto = {
      id: 1,
      nome: 'Notebook Dell',
      preco: 3500.00,
      descricao: 'Intel i5, 8GB RAM',
      disponivel: true
    };
    
    const cardHTML = renderizarCardProduto(produto);
    matchSnapshot('card-produto-basico', cardHTML);
  });
});
```

---

### Contract Testing

**Iniciante:** Testes que verificam se diferentes partes do sistema concordam sobre como devem se comunicar entre si.

**Estudante:** Validação de que consumidores e provedores de API concordam sobre a estrutura e comportamento das mensagens trocadas.

**Profissional:** Técnica que valida contratos entre serviços através de testes consumer-driven, onde consumidores definem expectativas que provedores devem satisfazer. Ferramentas como Pact permitem teste independente de microsserviços sem integração completa.

```typescript
import { expect } from 'chai';

interface ContratoUsuarioAPI {
  obterUsuario(id: number): Promise<{
    id: number;
    nome: string;
    email: string;
    ativo: boolean;
  }>;
}

describe('Contract Testing - Consumer Side', () => {
  it('contrato: obterUsuario deve retornar estrutura correta', async () => {
    const mockProvider: ContratoUsuarioAPI = {
      obterUsuario: async (id) => ({
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        ativo: true
      })
    };
    
    const usuario = await mockProvider.obterUsuario(1);
    
    expect(usuario).to.have.all.keys('id', 'nome', 'email', 'ativo');
    expect(usuario.id).to.be.a('number');
    expect(usuario.nome).to.be.a('string');
  });
});
```

---

### Property-Based Testing

**Iniciante:** Ao invés de testar exemplos específicos, você define propriedades que devem ser sempre verdadeiras e o teste gera vários casos automaticamente.

**Estudante:** Técnica que gera automaticamente casos de teste baseados em propriedades invariantes que devem ser mantidas para qualquer entrada válida.

**Profissional:** Abordagem de teste que utiliza geradores automáticos de dados para validar propriedades universais do sistema, explorando edge cases e combinações não previstas. Complementa testes baseados em exemplos, sendo especialmente eficaz para funções puras e algoritmos.

```typescript
import { expect } from 'chai';

function gerarInteiroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

describe('Property-Based Testing', () => {
  it('propriedade: reverter array duas vezes retorna original', () => {
    for (let i = 0; i < 100; i++) {
      const tamanho = gerarInteiroAleatorio(0, 50);
      const array = Array.from({ length: tamanho }, () => 
        gerarInteiroAleatorio(-1000, 1000)
      );
      
      const original = [...array];
      const revertido = reverter(array);
      const duploRevertido = reverter(revertido);
      
      expect(duploRevertido).to.deep.equal(original);
    }
  });
});
```

---

### Visual Regression Testing

**Iniciante:** Testes que comparam capturas de tela da interface para detectar mudanças visuais não intencionais.

**Estudante:** Técnica automatizada que captura screenshots de páginas ou componentes e compara com versões anteriores para identificar diferenças visuais.

**Profissional:** Abordagem de teste que utiliza comparação pixel-a-pixel ou baseada em IA de screenshots para detectar regressões visuais não intencionais em UI, incluindo problemas de layout, fontes, cores e responsividade através de ferramentas como Percy, BackstopJS ou Chromatic.

```typescript
import { expect } from 'chai';

describe('Visual Regression', () => {
  it('deve corresponder ao snapshot visual do botão', async () => {
    const botao = renderizarBotao({
      tipo: 'primario',
      texto: 'Confirmar'
    });
    
    const screenshot = await capturarScreenshot(botao);
    const diff = await compararComBaseline(
      screenshot,
      'botao-primario-baseline.png'
    );
    
    expect(diff.percentualDiferenca).to.be.below(0.1);
  });
});
```

---

### Chaos Engineering

**Iniciante:** Testar o sistema causando problemas propositalmente, como desligar servidores, para ver se ele continua funcionando.

**Estudante:** Prática de introduzir falhas controladas em produção para testar resiliência e capacidade de recuperação do sistema.

**Profissional:** Disciplina de experimentação em sistemas distribuídos que injeta falhas deliberadas e controladas em produção para validar resiliência, descobrir fraquezas antes que causem incidentes e construir confiança na capacidade do sistema de suportar condições turbulentas.

```typescript
import { expect } from 'chai';

describe('Chaos Engineering', () => {
  it('deve continuar operando com latência alta', async () => {
    const apiComLatencia = new APIComLatencia(5000);
    const servico = new ServicoComTimeout(apiComLatencia, 10000);
    
    const resultado = await servico.buscarDados();
    expect(resultado).to.exist;
  });
  
  it('deve fazer fallback quando serviço falha', async () => {
    const servicoPrincipal = new ServicoQueFalha();
    const servicoBackup = new ServicoBackup();
    const servicoComFallback = new ServicoComFallback(
      servicoPrincipal,
      servicoBackup
    );
    
    const resultado = await servicoComFallback.buscar();
    expect(resultado.fonte).to.equal('backup');
  });
});
```

---

## Outros Conceitos

### Assertion

**Iniciante:** Declaração que verifica se algo é verdadeiro no teste, como verificar se um resultado é igual ao esperado.

**Estudante:** Instrução que valida uma condição esperada, falhando o teste se a condição não for satisfeita.

**Profissional:** Declaração booleana que verifica invariantes ou pós-condições no código de teste, formando a base da validação em testes automatizados. Frameworks fornecem bibliotecas ricas de assertions para diferentes tipos de validações.

```typescript
import { expect } from 'chai';

describe('Assertions - Exemplos', () => {
  it('assertions de igualdade', () => {
    expect(2 + 2).to.equal(4);
    expect({ a: 1 }).to.deep.equal({ a: 1 });
  });
  
  it('assertions de tipo', () => {
    expect('texto').to.be.a('string');
    expect(42).to.be.a('number');
  });
  
  it('assertions de coleções', () => {
    const numeros = [1, 2, 3];
    expect(numeros).to.have.lengthOf(3);
    expect(numeros).to.include(2);
  });
});
```

---

### Test Runner

**Iniciante:** Programa que executa todos os testes automaticamente e mostra quais passaram ou falharam.

**Estudante:** Ferramenta que descobre, executa e reporta resultados de testes, gerenciando o ciclo de vida da suíte de testes.

**Profissional:** Framework que orquestra execução de testes, gerenciando descoberta de testes, setup/teardown, execução paralela, filtragem, reporting e integração com ferramentas de CI. Exemplos incluem Mocha, Jest, Vitest.

```typescript
describe('Test Runner - Hooks', () => {
  before(() => {
    console.log('Setup inicial');
  });
  
  after(() => {
    console.log('Limpeza final');
  });
  
  beforeEach(() => {
    console.log('Setup antes de cada teste');
  });
  
  afterEach(() => {
    console.log('Limpeza após cada teste');
  });
  
  it('teste 1', () => {
    expect(true).to.be.true;
  });
});
```

---

### Test Framework

**Iniciante:** Conjunto de ferramentas e bibliotecas que facilitam escrever e organizar testes.

**Estudante:** Biblioteca que fornece estrutura, utilitários e convenções para criação e organização de testes automatizados.

**Profissional:** Ecossistema completo que fornece primitivas para definição de testes (describe, it), assertions, mocking, fixtures, reporters e integração com outras ferramentas. Exemplos: Mocha + Chai + Sinon, Jest, Vitest.

---

### Teste de Acessibilidade

**Iniciante:** Verificar se o site pode ser usado por pessoas com deficiência, como usar leitores de tela ou navegar apenas com teclado.

**Estudante:** Validação de que a aplicação atende a padrões de acessibilidade (WCAG) e pode ser utilizada por pessoas com diferentes capacidades.

**Profissional:** Processo de validar conformidade com diretrizes de acessibilidade (WCAG, Section 508) através de testes automatizados e manuais, verificando navegação por teclado, compatibilidade com tecnologias assistivas, contraste, ARIA attributes e semântica HTML.

```typescript
import { expect } from 'chai';

describe('Acessibilidade', () => {
  it('deve ter atributos ARIA corretos', () => {
    const botao = renderizarBotao({ texto: 'Fechar' });
    const html = botao.outerHTML;
    
    expect(html).to.include('role="button"');
    expect(html).to.include('aria-label="Fechar"');
  });
  
  it('deve ter alt text em imagens', () => {
    const imagens = document.querySelectorAll('img');
    imagens.forEach(img => {
      expect(img.hasAttribute('alt')).to.be.true;
    });
  });
});
```

---

### API Testing

**Iniciante:** Testar APIs (comunicação entre sistemas) verificando se as requisições retornam as respostas corretas.

**Estudante:** Validação de endpoints de API testando requisições HTTP, validando respostas, códigos de status e contratos.

**Profissional:** Processo de validar interfaces de programação através de testes funcionais, de contrato, de performance e segurança, verificando requisições, respostas, autenticação, autorização, validação de dados, tratamento de erros e conformidade com especificações (OpenAPI, GraphQL Schema).

```typescript
import { expect } from 'chai';

describe('API Testing', () => {
  it('deve retornar usuário quando existe', async () => {
    const resposta = await fetch('/api/usuarios/1');
    const dados = await resposta.json();
    
    expect(resposta.status).to.equal(200);
    expect(dados).to.have.property('id', 1);
    expect(dados).to.have.property('nome');
  });
  
  it('deve retornar 404 quando não existe', async () => {
    const resposta = await fetch('/api/usuarios/99999');
    expect(resposta.status).to.equal(404);
  });
});
```

---

### GraphQL Testing

**Iniciante:** Testar APIs GraphQL verificando se as queries e mutations retornam os dados corretos.

**Estudante:** Validação de endpoints GraphQL testando queries, mutations, subscriptions e validação de schema.

**Profissional:** Processo especializado de testar APIs GraphQL incluindo validação de schema, resolvers, queries complexas, mutations, autenticação, autorização, N+1 queries, performance de resolvers e tratamento de erros específicos do GraphQL.

```typescript
import { expect } from 'chai';

describe('GraphQL Testing', () => {
  it('deve buscar usuário por ID', async () => {
    const query = `
      query {
        usuario(id: 1) {
          id
          nome
          email
        }
      }
    `;
    
    const resposta = await executarGraphQL(query);
    
    expect(resposta.errors).to.be.undefined;
    expect(resposta.data.usuario).to.exist;
    expect(resposta.data.usuario.id).to.equal(1);
  });
});
```

---

### Test Data Management

**Iniciante:** Gerenciar os dados usados nos testes, garantindo que cada teste tenha os dados necessários de forma organizada.

**Estudante:** Processo de criar, manter e limpar dados de teste de forma consistente e independente entre testes.

**Profissional:** Disciplina de gerenciar ciclo de vida de dados de teste incluindo criação de fixtures, seeding de banco, isolamento entre testes, geração de dados sintéticos, anonimização de dados de produção e estratégias de cleanup para garantir testes determinísticos e independentes.

```typescript
import { expect } from 'chai';

class UsuarioBuilder {
  private dados: any = {
    nome: 'Usuário Teste',
    email: 'teste@example.com'
  };
  
  comNome(nome: string): this {
    this.dados.nome = nome;
    return this;
  }
  
  comEmail(email: string): this {
    this.dados.email = email;
    return this;
  }
  
  build(): any {
    return { ...this.dados };
  }
}

describe('Test Data Management', () => {
  it('deve criar usuário com builder', () => {
    const usuario = new UsuarioBuilder()
      .comNome('João Silva')
      .comEmail('joao@example.com')
      .build();
    
    expect(usuario.nome).to.equal('João Silva');
  });
});
```

---

### Métricas de Teste

**Iniciante:** Números que ajudam a entender a qualidade dos testes, como quantos testes passaram e quanto do código foi testado.

**Estudante:** Indicadores quantitativos que medem efetividade, cobertura e qualidade dos testes, incluindo cobertura de código, taxa de defeitos e tempo de execução.

**Profissional:** Conjunto de KPIs que avaliam maturidade e efetividade do processo de teste: cobertura de código (line, branch, function), mutation score, flakiness rate, tempo de execução, taxa de detecção de defeitos, custo por defeito, ROI de automação e mean time to detect/repair bugs.

```typescript
import { expect } from 'chai';

describe('Métricas de Teste', () => {
  it('deve rastrear tempo de execução', () => {
    const inicio = Date.now();
    const resultado = operacaoRapida();
    const tempoDecorrido = Date.now() - inicio;
    
    expect(tempoDecorrido).to.be.below(100);
  });
  
  it('deve calcular taxa de sucesso', () => {
    const resultados = {
      passaram: 95,
      falharam: 3
    };
    
    const taxaSucesso = (resultados.passaram / 
      (resultados.passaram + resultados.falharam)) * 100;
    
    expect(taxaSucesso).to.be.above(95);
  });
});
```

---

### Test Smell (Cheiro de Teste)

**Iniciante:** Sinais de que um teste está mal escrito, como ser muito longo ou depender de outros testes.

**Estudante:** Padrões problemáticos em código de teste que indicam baixa qualidade, dificuldade de manutenção ou design inadequado.

**Profissional:** Anti-padrões em testes que indicam problemas estruturais: testes frágeis, dependências entre testes, assertions ambíguas, setup complexo, testes lentos, lógica condicional em testes, ou falta de isolamento. Identificar e refatorar test smells melhora qualidade e manutenibilidade.

```typescript
import { expect } from 'chai';

// RUIM: Testes dependentes
describe('Test Smell - Dependência', () => {
  let usuarioGlobal: any;
  
  it('teste 1: criar usuário', async () => {
    usuarioGlobal = await criarUsuario({ nome: 'João' });
  });
  
  it('teste 2: atualizar usuário', async () => {
    // Depende do teste anterior - RUIM
    await atualizarUsuario(usuarioGlobal);
  });
});

// BOM: Testes independentes
describe('Sem Test Smell', () => {
  it('deve criar usuário', async () => {
    const usuario = await criarUsuario({ nome: 'João' });
    expect(usuario.id).to.exist;
  });
  
  it('deve atualizar usuário', async () => {
    const usuario = await criarUsuario({ nome: 'João' });
    await atualizarUsuario(usuario);
    expect(usuario.nome).to.equal('João Silva');
  });
});
```

---

### Teste de Regressão

**Iniciante:** Testes que garantem que mudanças no código não quebraram funcionalidades que já estavam funcionando.

**Estudante:** Processo de re-executar testes existentes após mudanças no código para verificar que funcionalidades anteriores continuam operando corretamente.

**Profissional:** Estratégia de teste que valida que modificações recentes no código não introduziram defeitos em funcionalidades existentes, utilizando automação, seleção inteligente de testes e análise de impacto para otimizar execução em ciclos de CI/CD.

```typescript
import { expect } from 'chai';

describe('Teste de Regressão', () => {
  it('deve manter comportamento após refatoração', () => {
    expect(calcularPrecoFinal(100, 'basico')).to.equal(100);
    expect(calcularPrecoFinal(100, 'premium')).to.equal(85);
    expect(calcularPrecoFinal(100, 'vip')).to.equal(70);
  });
});
```

---

### Teste de Integração

**Iniciante:** Testes que verificam se diferentes partes do sistema funcionam bem juntas.

**Estudante:** Validação da interação entre múltiplos componentes ou módulos do sistema, verificando se trabalham corretamente em conjunto.

**Profissional:** Categoria de teste que valida interfaces e interações entre componentes integrados, incluindo integração de módulos, APIs, bancos de dados, serviços externos e message brokers, identificando problemas de comunicação, serialização, transações e contratos entre componentes.

```typescript
import { expect } from 'chai';

describe('Teste de Integração', () => {
  it('deve criar usuário e persistir no banco', async () => {
    const servico = new UsuarioService(new UsuarioRepository(conexaoBanco));
    const dados = { nome: 'João', email: 'joao@example.com' };
    
    const usuario = await servico.criar(dados);
    
    expect(usuario.id).to.exist;
    
    const usuarioBanco = await conexaoBanco.query(
      'SELECT * FROM usuarios WHERE id = ?',
      [usuario.id]
    );
    
    expect(usuarioBanco[0].nome).to.equal(dados.nome);
  });
});
```

---

### Teste Unitário

**Iniciante:** Testar uma pequena parte do código isoladamente, como uma única função.

**Estudante:** Validação de unidades individuais de código (funções, métodos, classes) em isolamento, geralmente usando mocks para dependências.

**Profissional:** Teste de menor granularidade que valida comportamento de unidades individuais de código em completo isolamento, utilizando test doubles para dependências externas. Deve ser rápido, determinístico e seguir princípios FIRST (Fast, Independent, Repeatable, Self-validating, Timely). Base da pirâmide de testes.

```typescript
import { expect } from 'chai';

describe('Teste Unitário', () => {
  it('deve somar dois números', () => {
    expect(somar(2, 3)).to.equal(5);
  });
  
  it('deve validar email', () => {
    const validador = new ValidadorEmail();
    expect(validador.validar('user@example.com')).to.be.true;
    expect(validador.validar('invalid')).to.be.false;
  });
});
```

---

### Retry Pattern

**Iniciante:** Tentar executar uma operação novamente quando ela falha, útil para lidar com problemas temporários.

**Estudante:** Padrão que repete automaticamente uma operação falhada após um intervalo, usado para lidar com falhas transientes.

**Profissional:** Padrão de resiliência que implementa lógica de retentativa para operações que podem falhar temporariamente, incluindo estratégias como retry exponencial com jitter, circuit breaker integration e políticas de fallback. Essencial para sistemas distribuídos e integração com serviços externos.

```typescript
import { expect } from 'chai';

async function retryComTentativas<T>(
  operacao: () => Promise<T>,
  maxTentativas: number
): Promise<T> {
  let ultimoErro: Error;
  
  for (let i = 0; i < maxTentativas; i++) {
    try {
      return await operacao();
    } catch (erro) {
      ultimoErro = erro as Error;
      if (i === maxTentativas - 1) throw ultimoErro;
    }
  }
  
  throw ultimoErro;
}

describe('Retry Pattern', () => {
  it('deve retentar após falha', async () => {
    let tentativas = 0;
    const operacao = async () => {
      tentativas++;
      if (tentativas < 3) throw new Error('Falha temporária');
      return 'sucesso';
    };
    
    const resultado = await retryComTentativas(operacao, 3);
    expect(resultado).to.equal('sucesso');
    expect(tentativas).to.equal(3);
  });
});
```

---

## Conclusão

Este glossário apresenta os principais conceitos de testes de software com exemplos práticos em TypeScript usando Mocha, Chai e Sinon.

### Pontos-Chave

**Iniciantes:** Focar em conceitos fundamentais e testes unitários simples

**Estudantes:** Expandir para diferentes tipos de teste e técnicas como TDD/BDD

**Profissionais:** Dominar estratégias avançadas, CI/CD e padrões de resiliência

### Próximos Passos

1. Praticar em projetos reais
2. Configurar pipelines de CI/CD
3. Monitorar métricas de teste
4. Acompanhar novas ferramentas

---

**Lembre-se:** Testes não são apenas sobre encontrar bugs, mas sobre construir confiança no código e facilitar refatoração.
