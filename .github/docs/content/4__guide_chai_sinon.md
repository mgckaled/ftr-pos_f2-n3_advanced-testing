<!-- markdownlint-disable MD024 -->

# Guia Completo: Chai e Sinon para Testes

## Índice

- [Guia Completo: Chai e Sinon para Testes](#guia-completo-chai-e-sinon-para-testes)
  - [Índice](#índice)
  - [Introdução](#introdução)
  - [Chai](#chai)
    - [Para que serve](#para-que-serve)
    - [Estilos de Asserção](#estilos-de-asserção)
    - [Prós](#prós)
    - [Contras](#contras)
    - [Exemplos em TypeScript](#exemplos-em-typescript)
      - [Básico](#básico)
      - [Intermediário](#intermediário)
      - [Avançado](#avançado)
  - [Sinon](#sinon)
    - [Para que serve](#para-que-serve-1)
    - [Conceitos Principais](#conceitos-principais)
    - [Prós](#prós-1)
    - [Contras](#contras-1)
    - [Exemplos em TypeScript](#exemplos-em-typescript-1)
      - [Básico](#básico-1)
      - [Intermediário](#intermediário-1)
      - [Avançado](#avançado-1)
  - [Integração Chai e Sinon](#integração-chai-e-sinon)
    - [Instalação](#instalação)
    - [Exemplo de Integração](#exemplo-de-integração)
  - [Boas Práticas](#boas-práticas)
    - [Com Chai](#com-chai)
    - [Com Sinon](#com-sinon)
  - [Plugins Úteis](#plugins-úteis)
    - [Para Chai](#para-chai)
    - [Para Sinon](#para-sinon)
  - [Alternativas](#alternativas)
    - [Alternativas ao Chai](#alternativas-ao-chai)
    - [Alternativas ao Sinon](#alternativas-ao-sinon)
  - [Padrões de Teste Comuns](#padrões-de-teste-comuns)
    - [Teste de Funções Assíncronas](#teste-de-funções-assíncronas)
    - [Teste de Event Emitters](#teste-de-event-emitters)
    - [Teste de Callbacks](#teste-de-callbacks)
  - [Técnicas Avançadas](#técnicas-avançadas)
    - [Partial Mocks](#partial-mocks)
    - [Matchers Customizados](#matchers-customizados)
    - [Stubbing de Propriedades](#stubbing-de-propriedades)
  - [Depuração de Testes](#depuração-de-testes)
    - [Técnicas de Debug](#técnicas-de-debug)
  - [Performance e Otimização](#performance-e-otimização)
    - [Evitar Testes Lentos](#evitar-testes-lentos)
    - [Limpeza Eficiente](#limpeza-eficiente)
  - [Casos de Uso Específicos](#casos-de-uso-específicos)
    - [Teste de Middleware Express](#teste-de-middleware-express)
    - [Teste de WebSocket](#teste-de-websocket)
  - [Erros Comuns e Soluções](#erros-comuns-e-soluções)
    - [Problema: Stubs não restaurados](#problema-stubs-não-restaurados)
    - [Problema: Asserções em código assíncrono](#problema-asserções-em-código-assíncrono)
    - [Problema: Fake Timers não restaurados](#problema-fake-timers-não-restaurados)
  - [Recursos Adicionais](#recursos-adicionais)
    - [Documentação Oficial](#documentação-oficial)
    - [Plugins Recomendados](#plugins-recomendados)
    - [Configuração TypeScript](#configuração-typescript)
  - [Conclusão](#conclusão)
    - [Principais Takeaways](#principais-takeaways)

## Introdução

Quando trabalhamos com Mocha como framework de testes, frequentemente utilizamos bibliotecas complementares para tornar nossos testes mais expressivos e poderosos. Chai e Sinon são duas dessas bibliotecas essenciais que formam uma combinação poderosa no ecossistema de testes JavaScript/TypeScript.

## Chai

### Para que serve

Chai é uma biblioteca de asserções que permite escrever verificações nos testes de forma mais legível e expressiva. Ela oferece diferentes estilos de sintaxe para se adequar às preferências do desenvolvedor.

### Estilos de Asserção

Chai oferece três estilos principais:

1. **Assert**: Estilo clássico, similar ao Node.js
2. **Expect**: Estilo BDD (Behavior-Driven Development)
3. **Should**: Estilo BDD alternativo

### Prós

- Sintaxe altamente legível e próxima da linguagem natural
- Múltiplos estilos de asserção para diferentes preferências
- Extensível através de plugins
- Mensagens de erro claras e descritivas
- Grande comunidade e ampla adoção
- Funciona tanto no navegador quanto no Node.js
- Integração perfeita com Mocha e outros frameworks

### Contras

- Curva de aprendizado para escolher entre os diferentes estilos
- Pode aumentar o tamanho do bundle em aplicações frontend
- O estilo "should" modifica o protótipo de Object, o que pode causar problemas
- Algumas asserções podem ser verbosas demais
- Performance ligeiramente inferior a asserções nativas em grandes volumes

### Exemplos em TypeScript

#### Básico

```typescript
import { expect } from 'chai';

describe('Exemplos Básicos com Chai', () => {
  it('deve verificar igualdade', () => {
    const valor = 42;
    expect(valor).to.equal(42);
  });

  it('deve verificar tipos', () => {
    const texto = 'Hello';
    expect(texto).to.be.a('string');
    expect(123).to.be.a('number');
  });

  it('deve verificar arrays', () => {
    const frutas = ['maçã', 'banana', 'laranja'];
    expect(frutas).to.have.lengthOf(3);
    expect(frutas).to.include('banana');
  });

  it('deve verificar objetos', () => {
    const usuario = { nome: 'João', idade: 30 };
    expect(usuario).to.have.property('nome');
    expect(usuario).to.deep.equal({ nome: 'João', idade: 30 });
  });

  it('deve verificar valores booleanos', () => {
    expect(true).to.be.true;
    expect(false).to.be.false;
    expect(null).to.be.null;
    expect(undefined).to.be.undefined;
  });
});
```

#### Intermediário

```typescript
import { expect } from 'chai';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

class GerenciadorUsuarios {
  private usuarios: Usuario[] = [];

  adicionar(usuario: Usuario): void {
    if (this.usuarios.find(u => u.id === usuario.id)) {
      throw new Error('Usuário já existe');
    }
    this.usuarios.push(usuario);
  }

  buscarPorId(id: number): Usuario | undefined {
    return this.usuarios.find(u => u.id === id);
  }

  listarAtivos(): Usuario[] {
    return this.usuarios.filter(u => u.ativo);
  }

  total(): number {
    return this.usuarios.length;
  }
}

describe('GerenciadorUsuarios - Testes Intermediários', () => {
  let gerenciador: GerenciadorUsuarios;

  beforeEach(() => {
    gerenciador = new GerenciadorUsuarios();
  });

  it('deve adicionar usuário corretamente', () => {
    const usuario: Usuario = {
      id: 1,
      nome: 'Maria Silva',
      email: 'maria@example.com',
      ativo: true
    };

    gerenciador.adicionar(usuario);
    
    expect(gerenciador.total()).to.equal(1);
    expect(gerenciador.buscarPorId(1)).to.deep.equal(usuario);
  });

  it('deve lançar erro ao adicionar usuário duplicado', () => {
    const usuario: Usuario = {
      id: 1,
      nome: 'João',
      email: 'joao@example.com',
      ativo: true
    };

    gerenciador.adicionar(usuario);
    
    expect(() => gerenciador.adicionar(usuario))
      .to.throw('Usuário já existe');
  });

  it('deve listar apenas usuários ativos', () => {
    gerenciador.adicionar({
      id: 1,
      nome: 'Ana',
      email: 'ana@example.com',
      ativo: true
    });
    
    gerenciador.adicionar({
      id: 2,
      nome: 'Pedro',
      email: 'pedro@example.com',
      ativo: false
    });

    const ativos = gerenciador.listarAtivos();
    
    expect(ativos).to.have.lengthOf(1);
    expect(ativos[0]).to.have.property('nome', 'Ana');
    expect(ativos.every(u => u.ativo)).to.be.true;
  });

  it('deve verificar propriedades aninhadas', () => {
    const usuario = gerenciador.buscarPorId(999);
    
    expect(usuario).to.be.undefined;
  });
});
```

#### Avançado

```typescript
import { expect } from 'chai';

interface Configuracao {
  api: {
    url: string;
    timeout: number;
    headers: Record<string, string>;
  };
  cache: {
    habilitado: boolean;
    ttl: number;
  };
}

class ValidadorConfiguracao {
  validar(config: Configuracao): boolean {
    if (!config.api.url.startsWith('https://')) {
      throw new Error('URL deve usar HTTPS');
    }
    
    if (config.api.timeout < 0) {
      throw new Error('Timeout deve ser positivo');
    }
    
    return true;
  }
}

describe('Chai Avançado - Asserções Complexas', () => {
  describe('Validador de Configuração', () => {
    let validador: ValidadorConfiguracao;

    beforeEach(() => {
      validador = new ValidadorConfiguracao();
    });

    it('deve validar configuração completa', () => {
      const config: Configuracao = {
        api: {
          url: 'https://api.example.com',
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer token123'
          }
        },
        cache: {
          habilitado: true,
          ttl: 3600
        }
      };

      expect(validador.validar(config)).to.be.true;
      
      // Verificações profundas
      expect(config).to.have.nested.property('api.url')
        .that.includes('https://');
      
      expect(config).to.have.nested.property('api.headers')
        .that.has.all.keys('Content-Type', 'Authorization');
      
      expect(config.api.timeout).to.be.within(1000, 10000);
    });

    it('deve rejeitar URL sem HTTPS', () => {
      const config: Configuracao = {
        api: {
          url: 'http://api.example.com',
          timeout: 5000,
          headers: {}
        },
        cache: { habilitado: false, ttl: 0 }
      };

      expect(() => validador.validar(config))
        .to.throw(Error)
        .with.property('message')
        .that.matches(/HTTPS/);
    });

    it('deve usar asserções encadeadas', () => {
      const numeros = [1, 2, 3, 4, 5];
      
      expect(numeros)
        .to.be.an('array')
        .that.has.lengthOf(5)
        .and.includes(3)
        .and.does.not.include(6);
    });
  });

  describe('Asserções com Promises', () => {
    async function buscarDados(id: number): Promise<{ id: number; nome: string }> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (id > 0) {
            resolve({ id, nome: `Usuário ${id}` });
          } else {
            reject(new Error('ID inválido'));
          }
        }, 100);
      });
    }

    it('deve resolver promise com sucesso', async () => {
      const resultado = await buscarDados(1);
      
      expect(resultado).to.have.property('id', 1);
      expect(resultado.nome).to.match(/Usuário \d+/);
    });

    it('deve rejeitar promise com erro', async () => {
      await expect(buscarDados(-1))
        .to.be.rejectedWith('ID inválido');
    });

    it('deve eventualmente ter propriedade', async () => {
      await expect(buscarDados(5))
        .to.eventually.have.property('nome');
    });
  });
});
```

## Sinon

### Para que serve

Sinon é uma biblioteca para criar test doubles, incluindo spies, stubs e mocks. Ela permite isolar o código testado de suas dependências externas, facilitando testes unitários puros e controlados.

### Conceitos Principais

1. **Spies**: Observam chamadas de funções sem alterar comportamento
2. **Stubs**: Substituem funções com comportamento controlado
3. **Mocks**: Objetos com expectativas pré-programadas
4. **Fake Timers**: Controlam o tempo em testes
5. **Fake Server**: Simulam requisições HTTP

### Prós

- Controle total sobre dependências externas
- Facilita testes de código assíncrono
- Fake timers para testar delays e timeouts
- Simulação de requisições HTTP
- API rica e flexível
- Mensagens de erro detalhadas
- Integração com diversos frameworks de teste
- Permite testar código que seria difícil de testar de outra forma

### Contras

- Curva de aprendizado moderada
- Pode levar a testes frágeis se usado incorretamente
- Excesso de mocking pode esconder problemas reais
- Requer limpeza manual após cada teste
- Pode tornar testes difíceis de entender se abusado
- Alguns recursos podem ter comportamento inesperado com TypeScript

### Exemplos em TypeScript

#### Básico

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

describe('Sinon Básico - Spies', () => {
  it('deve espionar chamadas de função', () => {
    const callback = sinon.spy();
    
    callback('argumento1', 'argumento2');
    callback('argumento3');
    
    expect(callback.callCount).to.equal(2);
    expect(callback.calledWith('argumento1', 'argumento2')).to.be.true;
    expect(callback.getCall(0).args).to.deep.equal(['argumento1', 'argumento2']);
  });

  it('deve espionar métodos de objetos', () => {
    const usuario = {
      nome: 'João',
      salvar(): boolean {
        return true;
      }
    };
    
    const spy = sinon.spy(usuario, 'salvar');
    
    usuario.salvar();
    
    expect(spy.calledOnce).to.be.true;
    expect(spy.returned(true)).to.be.true;
    
    spy.restore();
  });
});

describe('Sinon Básico - Stubs', () => {
  it('deve substituir comportamento de função', () => {
    const stub = sinon.stub();
    stub.returns(42);
    
    const resultado = stub();
    
    expect(resultado).to.equal(42);
    expect(stub.calledOnce).to.be.true;
  });

  it('deve retornar valores diferentes por chamada', () => {
    const stub = sinon.stub();
    stub.onFirstCall().returns(1);
    stub.onSecondCall().returns(2);
    stub.returns(3);
    
    expect(stub()).to.equal(1);
    expect(stub()).to.equal(2);
    expect(stub()).to.equal(3);
  });
});
```

#### Intermediário

```typescript
import { expect } from 'chai';
import sinon, { SinonStub, SinonSpy } from 'sinon';

interface ServicoEmail {
  enviar(destinatario: string, assunto: string, corpo: string): Promise<boolean>;
}

class RepositorioUsuarios {
  async buscarPorEmail(email: string): Promise<{ id: number; email: string } | null> {
    throw new Error('Método deve ser stubado');
  }
}

class ServicoNotificacao {
  constructor(
    private emailService: ServicoEmail,
    private repositorio: RepositorioUsuarios
  ) {}

  async notificarUsuario(email: string, mensagem: string): Promise<boolean> {
    const usuario = await this.repositorio.buscarPorEmail(email);
    
    if (!usuario) {
      return false;
    }
    
    return await this.emailService.enviar(
      email,
      'Notificação',
      mensagem
    );
  }
}

describe('Sinon Intermediário - Stubs e Spies', () => {
  let emailService: ServicoEmail;
  let repositorio: RepositorioUsuarios;
  let servico: ServicoNotificacao;
  let enviarStub: SinonStub;
  let buscarStub: SinonStub;

  beforeEach(() => {
    emailService = { enviar: sinon.stub() } as any;
    repositorio = new RepositorioUsuarios();
    
    enviarStub = emailService.enviar as SinonStub;
    buscarStub = sinon.stub(repositorio, 'buscarPorEmail');
    
    servico = new ServicoNotificacao(emailService, repositorio);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('deve notificar usuário existente', async () => {
    const usuario = { id: 1, email: 'teste@example.com' };
    buscarStub.resolves(usuario);
    enviarStub.resolves(true);

    const resultado = await servico.notificarUsuario(
      'teste@example.com',
      'Bem-vindo'
    );

    expect(resultado).to.be.true;
    expect(buscarStub.calledOnce).to.be.true;
    expect(buscarStub.calledWith('teste@example.com')).to.be.true;
    expect(enviarStub.calledOnce).to.be.true;
    expect(enviarStub.calledWith(
      'teste@example.com',
      'Notificação',
      'Bem-vindo'
    )).to.be.true;
  });

  it('deve retornar false para usuário inexistente', async () => {
    buscarStub.resolves(null);

    const resultado = await servico.notificarUsuario(
      'inexistente@example.com',
      'Mensagem'
    );

    expect(resultado).to.be.false;
    expect(buscarStub.calledOnce).to.be.true;
    expect(enviarStub.called).to.be.false;
  });

  it('deve tratar erros no envio de email', async () => {
    buscarStub.resolves({ id: 1, email: 'teste@example.com' });
    enviarStub.rejects(new Error('Falha no envio'));

    await expect(
      servico.notificarUsuario('teste@example.com', 'Mensagem')
    ).to.be.rejectedWith('Falha no envio');
  });
});

describe('Sinon Intermediário - Fake Timers', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('deve executar setTimeout', () => {
    const callback = sinon.spy();
    
    setTimeout(callback, 1000);
    
    expect(callback.called).to.be.false;
    
    clock.tick(1000);
    
    expect(callback.calledOnce).to.be.true;
  });

  it('deve executar setInterval múltiplas vezes', () => {
    const callback = sinon.spy();
    
    setInterval(callback, 500);
    
    clock.tick(1500);
    
    expect(callback.callCount).to.equal(3);
  });

  it('deve avançar para data específica', () => {
    const dataInicial = new Date('2024-01-01T00:00:00Z');
    clock = sinon.useFakeTimers(dataInicial.getTime());
    
    expect(new Date().toISOString()).to.include('2024-01-01');
    
    clock.tick(24 * 60 * 60 * 1000);
    
    expect(new Date().toISOString()).to.include('2024-01-02');
  });
});
```

#### Avançado

```typescript
import { expect } from 'chai';
import sinon, { SinonStub, SinonMock, SinonFakeTimers } from 'sinon';

interface Logger {
  info(mensagem: string): void;
  error(mensagem: string, erro?: Error): void;
}

interface CacheService {
  get(chave: string): Promise<any>;
  set(chave: string, valor: any, ttl: number): Promise<void>;
  delete(chave: string): Promise<void>;
}

class ProcessadorPedidos {
  private tentativas = 0;
  
  constructor(
    private cache: CacheService,
    private logger: Logger
  ) {}

  async processar(pedidoId: string): Promise<{ sucesso: boolean; tentativas: number }> {
    this.logger.info(`Processando pedido ${pedidoId}`);
    
    const pedidoCache = await this.cache.get(`pedido:${pedidoId}`);
    
    if (pedidoCache) {
      this.logger.info('Pedido encontrado no cache');
      return { sucesso: true, tentativas: 0 };
    }
    
    return await this.processarComRetry(pedidoId);
  }

  private async processarComRetry(
    pedidoId: string,
    maxTentativas: number = 3
  ): Promise<{ sucesso: boolean; tentativas: number }> {
    for (let i = 0; i < maxTentativas; i++) {
      this.tentativas++;
      
      try {
        await this.simularProcessamento();
        await this.cache.set(`pedido:${pedidoId}`, { processado: true }, 3600);
        return { sucesso: true, tentativas: this.tentativas };
      } catch (erro) {
        this.logger.error(`Tentativa ${i + 1} falhou`, erro as Error);
        
        if (i === maxTentativas - 1) {
          throw erro;
        }
        
        await this.aguardar(Math.pow(2, i) * 1000);
      }
    }
    
    return { sucesso: false, tentativas: this.tentativas };
  }

  private async simularProcessamento(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 100));
  }

  private async aguardar(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

describe('Sinon Avançado - Mocks e Testes Complexos', () => {
  let cache: CacheService;
  let logger: Logger;
  let processador: ProcessadorPedidos;
  let cacheMock: SinonMock;
  let loggerMock: SinonMock;
  let clock: SinonFakeTimers;

  beforeEach(() => {
    cache = {
      get: sinon.stub(),
      set: sinon.stub(),
      delete: sinon.stub()
    };
    
    logger = {
      info: sinon.stub(),
      error: sinon.stub()
    };
    
    cacheMock = sinon.mock(cache);
    loggerMock = sinon.mock(logger);
    
    processador = new ProcessadorPedidos(cache, logger);
    
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    sinon.restore();
    clock.restore();
  });

  it('deve usar pedido do cache se disponível', async () => {
    const pedidoId = 'pedido-123';
    const pedidoCache = { id: pedidoId, processado: true };
    
    (cache.get as SinonStub).resolves(pedidoCache);
    
    loggerMock.expects('info')
      .once()
      .withArgs(`Processando pedido ${pedidoId}`);
    
    loggerMock.expects('info')
      .once()
      .withArgs('Pedido encontrado no cache');
    
    const resultado = await processador.processar(pedidoId);
    
    expect(resultado.sucesso).to.be.true;
    expect(resultado.tentativas).to.equal(0);
    
    loggerMock.verify();
    expect((cache.set as SinonStub).called).to.be.false;
  });

  it('deve processar com retry e backoff exponencial', async () => {
    const pedidoId = 'pedido-456';
    
    (cache.get as SinonStub).resolves(null);
    (cache.set as SinonStub).resolves();
    
    const promessa = processador.processar(pedidoId);
    
    await clock.tickAsync(100);
    
    const resultado = await promessa;
    
    expect(resultado.sucesso).to.be.true;
    expect(resultado.tentativas).to.equal(1);
    expect((cache.set as SinonStub).calledOnce).to.be.true;
  });

  it('deve registrar erros durante tentativas', async () => {
    const pedidoId = 'pedido-789';
    const erro = new Error('Falha no processamento');
    
    (cache.get as SinonStub).resolves(null);
    
    const stub = sinon.stub(processador as any, 'simularProcessamento');
    stub.onFirstCall().rejects(erro);
    stub.onSecondCall().resolves();
    
    (cache.set as SinonStub).resolves();
    
    loggerMock.expects('error')
      .once()
      .withArgs('Tentativa 1 falhou', erro);
    
    const promessa = processador.processar(pedidoId);
    
    await clock.tickAsync(100);
    await clock.tickAsync(1000);
    await clock.tickAsync(100);
    
    const resultado = await promessa;
    
    expect(resultado.sucesso).to.be.true;
    expect(resultado.tentativas).to.equal(2);
    
    loggerMock.verify();
    stub.restore();
  });

  it('deve falhar após todas as tentativas', async () => {
    const pedidoId = 'pedido-erro';
    const erro = new Error('Erro persistente');
    
    (cache.get as SinonStub).resolves(null);
    
    const stub = sinon.stub(processador as any, 'simularProcessamento');
    stub.rejects(erro);
    
    loggerMock.expects('error').exactly(3);
    
    const promessa = processador.processar(pedidoId);
    
    await clock.tickAsync(100);
    await clock.tickAsync(1000);
    await clock.tickAsync(100);
    await clock.tickAsync(2000);
    await clock.tickAsync(100);
    await clock.tickAsync(4000);
    
    await expect(promessa).to.be.rejectedWith('Erro persistente');
    
    loggerMock.verify();
    stub.restore();
  });
});

describe('Sinon Avançado - Verificação de Ordem de Chamadas', () => {
  it('deve verificar ordem específica de chamadas', () => {
    const primeiraFuncao = sinon.spy();
    const segundaFuncao = sinon.spy();
    const terceiraFuncao = sinon.spy();
    
    primeiraFuncao('primeiro');
    segundaFuncao('segundo');
    terceiraFuncao('terceiro');
    
    sinon.assert.callOrder(primeiraFuncao, segundaFuncao, terceiraFuncao);
  });

  it('deve verificar múltiplas condições', () => {
    const funcao = sinon.spy();
    
    funcao('a', 1);
    funcao('b', 2);
    funcao('c', 3);
    
    sinon.assert.calledThrice(funcao);
    sinon.assert.calledWith(funcao, 'a', 1);
    sinon.assert.calledWith(funcao, 'b', 2);
    sinon.assert.calledWith(funcao, 'c', 3);
  });
});
```

## Integração Chai e Sinon

Uma das combinações mais poderosas é usar Chai e Sinon juntos, especialmente com o plugin `sinon-chai`.

### Instalação

```bash
npm install --save-dev chai sinon sinon-chai @types/chai @types/sinon @types/sinon-chai
```

### Exemplo de Integração

```typescript
import { expect, use } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

use(sinonChai);

describe('Integração Chai + Sinon', () => {
  it('deve usar asserções do sinon-chai', () => {
    const spy = sinon.spy();
    
    spy('argumento1');
    spy('argumento2');
    
    expect(spy).to.have.been.calledTwice;
    expect(spy).to.have.been.calledWith('argumento1');
    expect(spy.firstCall).to.have.been.calledWith('argumento1');
    expect(spy.secondCall).to.have.been.calledWith('argumento2');
  });

  it('deve verificar stubs com sintaxe chai', () => {
    const stub = sinon.stub().returns(42);
    
    const resultado = stub('teste');
    
    expect(stub).to.have.been.calledOnce;
    expect(stub).to.have.been.calledWithExactly('teste');
    expect(resultado).to.equal(42);
  });
});
```

## Boas Práticas

### Com Chai

1. **Escolha um estilo e mantenha consistência**: Prefira o estilo `expect` para melhor legibilidade
2. **Use asserções profundas quando necessário**: `deep.equal` para objetos e arrays
3. **Seja específico nas asserções**: Verifique propriedades específicas ao invés de objetos inteiros quando possível
4. **Use mensagens customizadas**: Adicione contexto às falhas com mensagens descritivas
5. **Evite asserções múltiplas complexas**: Mantenha cada teste focado

### Com Sinon

1. **Sempre restaure spies e stubs**: Use `afterEach` com `sinon.restore()`
2. **Use fake timers com cuidado**: Lembre de restaurar após os testes
3. **Prefira stubs a mocks**: Stubs são mais simples e menos frágeis
4. **Não abuse de mocking**: Mock apenas o necessário para isolar o teste
5. **Verifique comportamentos, não implementação**: Foque no que a função faz, não em como
6. **Use sandbox**: Agrupe spies, stubs e mocks para facilitar limpeza

```typescript
import sinon, { SinonSandbox } from 'sinon';

describe('Usando Sandbox', () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('exemplo com sandbox', () => {
    const spy = sandbox.spy();
    const stub = sandbox.stub().returns(true);
    
    spy();
    stub();
    
    expect(spy.calledOnce).to.be.true;
    expect(stub.calledOnce).to.be.true;
  });
});
```

## Plugins Úteis

### Para Chai

- **chai-as-promised**: Asserções para Promises
- **chai-http**: Testes de APIs HTTP
- **chai-json-schema**: Validação de schemas JSON
- **dirty-chai**: Evita problemas com linters
- **chai-datetime**: Asserções para datas

### Para Sinon

- **sinon-chai**: Integração com Chai
- **@sinonjs/fake-timers**: Timers falsos standalone

## Alternativas

### Alternativas ao Chai

- **Jest Matchers**: Built-in do Jest
- **Assert**: Módulo nativo do Node.js
- **Expect**: Biblioteca standalone

### Alternativas ao Sinon

- **Jest Mocks**: Sistema de mocking do Jest
- **testdouble.js**: Biblioteca similar
- **simple-mock**: Mais simples e leve

## Padrões de Teste Comuns

### Teste de Funções Assíncronas

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

class ServicoAPI {
  async buscarDados(endpoint: string): Promise<any> {
    const response = await fetch(endpoint);
    return response.json();
  }
}

describe('Testes Assíncronos', () => {
  let servico: ServicoAPI;
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    servico = new ServicoAPI();
    fetchStub = sinon.stub(global, 'fetch' as any);
  });

  afterEach(() => {
    fetchStub.restore();
  });

  it('deve buscar dados com sucesso', async () => {
    const dadosMock = { id: 1, nome: 'Teste' };
    
    fetchStub.resolves({
      json: sinon.stub().resolves(dadosMock)
    } as any);

    const resultado = await servico.buscarDados('/api/dados');

    expect(resultado).to.deep.equal(dadosMock);
    expect(fetchStub.calledOnce).to.be.true;
    expect(fetchStub.calledWith('/api/dados')).to.be.true;
  });

  it('deve tratar erros de rede', async () => {
    fetchStub.rejects(new Error('Erro de rede'));

    await expect(servico.buscarDados('/api/dados'))
      .to.be.rejectedWith('Erro de rede');
  });
});
```

### Teste de Event Emitters

```typescript
import { expect } from 'chai';
import sinon from 'sinon';
import { EventEmitter } from 'events';

class ProcessadorEventos extends EventEmitter {
  processar(dados: any): void {
    this.emit('inicio', dados);
    
    try {
      const resultado = this.executar(dados);
      this.emit('sucesso', resultado);
    } catch (erro) {
      this.emit('erro', erro);
    }
  }

  private executar(dados: any): any {
    if (!dados) {
      throw new Error('Dados inválidos');
    }
    return { processado: true, dados };
  }
}

describe('Teste de Event Emitters', () => {
  let processador: ProcessadorEventos;

  beforeEach(() => {
    processador = new ProcessadorEventos();
  });

  it('deve emitir eventos na ordem correta', () => {
    const spyInicio = sinon.spy();
    const spySucesso = sinon.spy();

    processador.on('inicio', spyInicio);
    processador.on('sucesso', spySucesso);

    processador.processar({ valor: 42 });

    expect(spyInicio.calledBefore(spySucesso)).to.be.true;
    expect(spyInicio.calledWith({ valor: 42 })).to.be.true;
    expect(spySucesso.calledOnce).to.be.true;
  });

  it('deve emitir evento de erro quando falha', () => {
    const spyErro = sinon.spy();

    processador.on('erro', spyErro);
    processador.processar(null);

    expect(spyErro.calledOnce).to.be.true;
    expect(spyErro.firstCall.args[0]).to.be.instanceOf(Error);
    expect(spyErro.firstCall.args[0].message).to.equal('Dados inválidos');
  });
});
```

### Teste de Callbacks

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

type Callback<T> = (erro: Error | null, resultado?: T) => void;

class ProcessadorCallback {
  processar(
    dados: any,
    callback: Callback<{ sucesso: boolean; dados: any }>
  ): void {
    setTimeout(() => {
      if (!dados) {
        callback(new Error('Dados inválidos'));
        return;
      }
      callback(null, { sucesso: true, dados });
    }, 100);
  }
}

describe('Teste de Callbacks', () => {
  let processador: ProcessadorCallback;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    processador = new ProcessadorCallback();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('deve chamar callback com sucesso', (done) => {
    const callback = sinon.spy((erro: Error | null, resultado?: any) => {
      expect(erro).to.be.null;
      expect(resultado).to.deep.equal({
        sucesso: true,
        dados: { teste: true }
      });
      expect(callback.calledOnce).to.be.true;
      done();
    });

    processador.processar({ teste: true }, callback);
    clock.tick(100);
  });

  it('deve chamar callback com erro', (done) => {
    const callback = sinon.spy((erro: Error | null) => {
      expect(erro).to.be.instanceOf(Error);
      expect(erro?.message).to.equal('Dados inválidos');
      done();
    });

    processador.processar(null, callback);
    clock.tick(100);
  });
});
```

## Técnicas Avançadas

### Partial Mocks

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

class CalculadoraCompleta {
  somar(a: number, b: number): number {
    return a + b;
  }

  subtrair(a: number, b: number): number {
    return a - b;
  }

  calcularComplexa(x: number, y: number): number {
    const soma = this.somar(x, y);
    const subtracao = this.subtrair(x, y);
    return soma * subtracao;
  }
}

describe('Partial Mocks', () => {
  it('deve fazer mock parcial de métodos', () => {
    const calculadora = new CalculadoraCompleta();
    
    const somarStub = sinon.stub(calculadora, 'somar').returns(100);
    const subtrairStub = sinon.stub(calculadora, 'subtrair').returns(10);

    const resultado = calculadora.calcularComplexa(5, 3);

    expect(resultado).to.equal(1000);
    expect(somarStub.calledWith(5, 3)).to.be.true;
    expect(subtrairStub.calledWith(5, 3)).to.be.true;

    somarStub.restore();
    subtrairStub.restore();
  });
});
```

### Matchers Customizados

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

describe('Matchers Customizados', () => {
  it('deve usar sinon.match para validações complexas', () => {
    const spy = sinon.spy();

    spy({ nome: 'João', idade: 30, ativo: true });

    expect(spy.calledWith(
      sinon.match({
        nome: sinon.match.string,
        idade: sinon.match.number,
        ativo: true
      })
    )).to.be.true;
  });

  it('deve usar predicados customizados', () => {
    const spy = sinon.spy();

    spy(15);
    spy(25);
    spy(35);

    const maiorQue20 = sinon.match((value: number) => value > 20);

    expect(spy.calledWith(maiorQue20)).to.be.true;
    expect(spy.getCall(0).calledWith(maiorQue20)).to.be.false;
    expect(spy.getCall(1).calledWith(maiorQue20)).to.be.true;
  });

  it('deve combinar múltiplos matchers', () => {
    const spy = sinon.spy();

    spy('teste@example.com');

    expect(spy.calledWith(
      sinon.match.string
        .and(sinon.match(/.*@.*\.com/))
    )).to.be.true;
  });
});
```

### Stubbing de Propriedades

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

class Configuracao {
  get ambiente(): string {
    return process.env.NODE_ENV || 'development';
  }

  get urlAPI(): string {
    return this.ambiente === 'production'
      ? 'https://api.producao.com'
      : 'https://api.dev.com';
  }
}

describe('Stubbing de Propriedades', () => {
  let config: Configuracao;

  beforeEach(() => {
    config = new Configuracao();
  });

  it('deve fazer stub de getter', () => {
    sinon.stub(config, 'ambiente').get(() => 'production');

    expect(config.urlAPI).to.equal('https://api.producao.com');
  });

  it('deve fazer stub de setter', () => {
    const obj = {
      _valor: 0,
      get valor() { return this._valor; },
      set valor(v: number) { this._valor = v; }
    };

    const setterSpy = sinon.spy();
    sinon.stub(obj, 'valor').set(setterSpy);

    obj.valor = 42;

    expect(setterSpy.calledWith(42)).to.be.true;
  });
});
```

## Depuração de Testes

### Técnicas de Debug

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

describe('Depuração de Testes', () => {
  it('deve mostrar histórico de chamadas', () => {
    const spy = sinon.spy();

    spy('primeira', 1);
    spy('segunda', 2);
    spy('terceira', 3);

    console.log('Total de chamadas:', spy.callCount);
    console.log('Primeira chamada:', spy.getCall(0).args);
    console.log('Todas as chamadas:', spy.getCalls().map(c => c.args));

    expect(spy.callCount).to.equal(3);
  });

  it('deve mostrar informações detalhadas de stubs', () => {
    const stub = sinon.stub();
    stub.withArgs('tipo1').returns('resultado1');
    stub.withArgs('tipo2').returns('resultado2');

    stub('tipo1');
    stub('tipo2');
    stub('tipo1');

    console.log('Chamado com tipo1:', stub.withArgs('tipo1').callCount);
    console.log('Chamado com tipo2:', stub.withArgs('tipo2').callCount);
    
    expect(stub.withArgs('tipo1').callCount).to.equal(2);
    expect(stub.withArgs('tipo2').callCount).to.equal(1);
  });

  it('deve usar sinon.assert para mensagens melhores', () => {
    const spy = sinon.spy();

    spy('argumento');

    try {
      sinon.assert.calledWith(spy, 'outro-argumento');
    } catch (erro) {
      console.log('Erro capturado:', (erro as Error).message);
    }

    sinon.assert.calledWith(spy, 'argumento');
  });
});
```

## Performance e Otimização

### Evitar Testes Lentos

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

describe('Otimização de Testes', () => {
  it('deve usar fake timers ao invés de delays reais', () => {
    const clock = sinon.useFakeTimers();
    const callback = sinon.spy();

    setTimeout(callback, 5000);

    clock.tick(5000);

    expect(callback.calledOnce).to.be.true;

    clock.restore();
  });

  it('deve reutilizar objetos quando possível', () => {
    const objetoCompartilhado = { dados: 'teste' };
    const spy1 = sinon.spy();
    const spy2 = sinon.spy();

    spy1(objetoCompartilhado);
    spy2(objetoCompartilhado);

    expect(spy1.firstCall.args[0]).to.equal(spy2.firstCall.args[0]);
  });
});
```

### Limpeza Eficiente

```typescript
import sinon, { SinonSandbox } from 'sinon';

describe('Suite com Sandbox', () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('teste 1', () => {
    const spy = sandbox.spy();
    spy();
  });

  it('teste 2', () => {
    const stub = sandbox.stub().returns(42);
    stub();
  });
});
```

## Casos de Uso Específicos

### Teste de Middleware Express

```typescript
import { expect } from 'chai';
import sinon from 'sinon';
import { Request, Response, NextFunction } from 'express';

function middlewareAutenticacao(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ erro: 'Token não fornecido' });
    return;
  }

  if (token !== 'Bearer token-valido') {
    res.status(403).json({ erro: 'Token inválido' });
    return;
  }

  next();
}

describe('Middleware de Autenticação', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };
    next = sinon.spy();
  });

  it('deve rejeitar requisição sem token', () => {
    middlewareAutenticacao(req as Request, res as Response, next);

    expect((res.status as sinon.SinonStub).calledWith(401)).to.be.true;
    expect((res.json as sinon.SinonStub).calledWith({
      erro: 'Token não fornecido'
    })).to.be.true;
    expect((next as sinon.SinonSpy).called).to.be.false;
  });

  it('deve rejeitar token inválido', () => {
    req.headers = { authorization: 'Bearer token-invalido' };

    middlewareAutenticacao(req as Request, res as Response, next);

    expect((res.status as sinon.SinonStub).calledWith(403)).to.be.true;
    expect((next as sinon.SinonSpy).called).to.be.false;
  });

  it('deve aceitar token válido', () => {
    req.headers = { authorization: 'Bearer token-valido' };

    middlewareAutenticacao(req as Request, res as Response, next);

    expect((next as sinon.SinonSpy).calledOnce).to.be.true;
    expect((res.status as sinon.SinonStub).called).to.be.false;
  });
});
```

### Teste de WebSocket

```typescript
import { expect } from 'chai';
import sinon from 'sinon';

interface WebSocketLike {
  send(data: string): void;
  on(event: string, handler: Function): void;
  close(): void;
}

class GerenciadorWebSocket {
  private conexoes: Set<WebSocketLike> = new Set();

  adicionar(ws: WebSocketLike): void {
    this.conexoes.add(ws);
    ws.on('message', (msg: string) => this.handleMessage(ws, msg));
  }

  transmitir(mensagem: string): void {
    this.conexoes.forEach(ws => ws.send(mensagem));
  }

  private handleMessage(ws: WebSocketLike, mensagem: string): void {
    this.transmitir(`Echo: ${mensagem}`);
  }

  remover(ws: WebSocketLike): void {
    this.conexoes.delete(ws);
  }
}

describe('Gerenciador WebSocket', () => {
  let gerenciador: GerenciadorWebSocket;
  let ws1: WebSocketLike;
  let ws2: WebSocketLike;

  beforeEach(() => {
    gerenciador = new GerenciadorWebSocket();
    ws1 = {
      send: sinon.spy(),
      on: sinon.stub(),
      close: sinon.spy()
    };
    ws2 = {
      send: sinon.spy(),
      on: sinon.stub(),
      close: sinon.spy()
    };
  });

  it('deve transmitir mensagem para todas as conexões', () => {
    gerenciador.adicionar(ws1);
    gerenciador.adicionar(ws2);

    gerenciador.transmitir('Olá');

    expect((ws1.send as sinon.SinonSpy).calledWith('Olá')).to.be.true;
    expect((ws2.send as sinon.SinonSpy).calledWith('Olá')).to.be.true;
  });

  it('não deve enviar para conexões removidas', () => {
    gerenciador.adicionar(ws1);
    gerenciador.adicionar(ws2);
    gerenciador.remover(ws1);

    gerenciador.transmitir('Mensagem');

    expect((ws1.send as sinon.SinonSpy).called).to.be.false;
    expect((ws2.send as sinon.SinonSpy).calledOnce).to.be.true;
  });
});
```

## Erros Comuns e Soluções

### Problema: Stubs não restaurados

```typescript
// Errado
describe('Sem restauração', () => {
  it('teste 1', () => {
    sinon.stub(Math, 'random').returns(0.5);
  });

  it('teste 2', () => {
    // Math.random ainda está stubado
    console.log(Math.random());
  });
});

// Correto
describe('Com restauração', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('teste 1', () => {
    sinon.stub(Math, 'random').returns(0.5);
  });

  it('teste 2', () => {
    // Math.random foi restaurado
    console.log(Math.random());
  });
});
```

### Problema: Asserções em código assíncrono

```typescript
import { expect } from 'chai';

// Errado
describe('Async incorreto', () => {
  it('não espera promise', () => {
    Promise.resolve(42).then(valor => {
      expect(valor).to.equal(42); // Pode não executar
    });
  });
});

// Correto
describe('Async correto', () => {
  it('espera promise', async () => {
    const valor = await Promise.resolve(42);
    expect(valor).to.equal(42);
  });

  it('retorna promise', () => {
    return Promise.resolve(42).then(valor => {
      expect(valor).to.equal(42);
    });
  });
});
```

### Problema: Fake Timers não restaurados

```typescript
import sinon from 'sinon';

// Errado
describe('Timers não restaurados', () => {
  it('teste 1', () => {
    const clock = sinon.useFakeTimers();
    clock.tick(1000);
    // Esqueceu de restaurar
  });

  it('teste 2', () => {
    // Tempo ainda está congelado
  });
});

// Correto
describe('Timers restaurados', () => {
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('teste 1', () => {
    clock.tick(1000);
  });

  it('teste 2', () => {
    clock.tick(2000);
  });
});
```

## Recursos Adicionais

### Documentação Oficial

- Chai: <https://www.chaijs.com>
- Sinon: <https://sinonjs.org>
- Mocha: <https://mochajs.org>

### Plugins Recomendados

- `sinon-chai`: Integração perfeita entre Sinon e Chai
- `chai-as-promised`: Testes de Promises com Chai
- `chai-http`: Testes de APIs REST
- `chai-spies`: Alternativa mais leve ao Sinon

### Configuração TypeScript

```json
{
  "compilerOptions": {
    "types": ["mocha", "chai", "sinon", "node"],
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

## Conclusão

Chai e Sinon formam uma dupla poderosa para testes em JavaScript e TypeScript. Chai oferece asserções expressivas que tornam os testes mais legíveis, enquanto Sinon fornece ferramentas robustas para controlar dependências e comportamentos.

A combinação dessas bibliotecas com Mocha cria um ambiente de testes completo e profissional, amplamente adotado pela comunidade. Dominar essas ferramentas é essencial para escrever testes de qualidade e manter a confiabilidade do código.

### Principais Takeaways

1. Use Chai para asserções expressivas e legíveis
2. Use Sinon para isolar dependências e controlar comportamentos
3. Sempre restaure stubs, spies e fake timers
4. Prefira stubs a mocks para testes mais simples
5. Use sandbox para facilitar a limpeza
6. Combine ambas as bibliotecas com sinon-chai
7. Mantenha os testes focados e específicos
8. Evite over-mocking que pode esconder problemas reais
