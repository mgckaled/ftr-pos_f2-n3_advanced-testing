# Guia de Estudos - Testes Avançados

> [Voltar](../../../README.md) ao README.md

## Índice

- [Guia de Estudos - Testes Avançados](#guia-de-estudos---testes-avançados)
  - [Índice](#índice)
  - [Glossário / Terminologia](#glossário--terminologia)
  - [1. Níveis de Testes - Fundação conceitual](#1-níveis-de-testes---fundação-conceitual)
  - [2. Frameworks de Testes - Panorama de ferramentas](#2-frameworks-de-testes---panorama-de-ferramentas)
  - [3. Organização de Diretório e Arquivos - Estrutura prática](#3-organização-de-diretório-e-arquivos---estrutura-prática)
  - [4. Chai e Sinon para Testes com Mocha - Domínio das ferramentas](#4-chai-e-sinon-para-testes-com-mocha---domínio-das-ferramentas)
  - [5. Testes Unitários - Aplicação no nível mais granular](#5-testes-unitários---aplicação-no-nível-mais-granular)
  - [6. Testes de Integração - Aplicação no nível intermediário](#6-testes-de-integração---aplicação-no-nível-intermediário)
  - [7. Testes E2E - Aplicação no nível mais amplo](#7-testes-e2e---aplicação-no-nível-mais-amplo)
  - [8. Testes Assíncronos - Caso especial transversal](#8-testes-assíncronos---caso-especial-transversal)
  - [9. Cobertura de Testes com c8 - Medição de qualidade](#9-cobertura-de-testes-com-c8---medição-de-qualidade)
  - [10. Testes para Arquitetura DDD - Contexto arquitetural específico](#10-testes-para-arquitetura-ddd---contexto-arquitetural-específico)
  - [11. Design Patterns em DDD - Padrões e suas estratégias de teste](#11-design-patterns-em-ddd---padrões-e-suas-estratégias-de-teste)
  - [12. CI/CD com Github Actions - Automação de Testes do Pipeline](#12-cicd-com-github-actions---automação-de-testes-do-pipeline)
  - [13. Testcontainers - Infraestrutura para testes de integração](#13-testcontainers---infraestrutura-para-testes-de-integração)

## Glossário / Terminologia

Este glossário foi desenvolvido como um recurso abrangente e progressivo para profissionais de tecnologia em diferentes estágios de conhecimento sobre testes de software. Estruturado em três níveis de compreensão (iniciante, estudante e profissional), o material apresenta mais de 40 conceitos fundamentais, técnicas avançadas e padrões de mercado, todos exemplificados com código TypeScript real utilizando Mocha, Chai e Sinon. Os exemplos práticos foram cuidadosamente elaborados para refletir desafios reais do dia a dia de desenvolvimento, desde validações simples até cenários complexos envolvendo integração de sistemas, APIs, bancos de dados e resiliência. O objetivo é servir como material de consulta rápida e aprendizado contínuo, permitindo que desenvolvedores iniciantes compreendam os conceitos básicos, estudantes aprofundem suas habilidades técnicas, e profissionais refinhem suas estratégias de teste em ambientes de produção modernos com CI/CD e DevOps.

- [Glossário](./0__terminology.md)

## 1. Níveis de Testes - Fundação conceitual

Os testes automatizados representam a espinha dorsal da qualidade no desenvolvimento de software moderno, funcionando como uma rede de segurança que nos permite evoluir aplicações com confiança. Eles se organizam em uma hierarquia conhecida como pirâmide de testes, onde a base larga é composta por numerosos testes unitários que verificam funções e classes isoladamente de forma rápida e barata. No meio da pirâmide encontramos os testes de integração, que avaliam como diferentes módulos trabalham juntos, incluindo interações com bancos de dados e APIs externas. No topo, em menor quantidade devido ao custo computacional, estão os testes end-to-end que simulam o comportamento real do usuário através de toda a aplicação, desde o login até a conclusão de operações complexas como finalizar uma compra.

Além dessa estrutura fundamental, existem categorias especializadas que atendem necessidades específicas do desenvolvimento profissional. Os testes de performance verificam se o sistema mantém tempos de resposta aceitáveis sob diferentes cargas de usuários, enquanto os testes de segurança procuram vulnerabilidades como injeção SQL e ataques XSS que poderiam comprometer dados sensíveis. Os testes de acessibilidade garantem que a aplicação seja utilizável por pessoas com diferentes necessidades, e os testes de regressão visual detectam mudanças não intencionais na interface. Quando bem implementados seguindo práticas como independência entre testes, nomes descritivos e cobertura de casos extremos, esses diferentes tipos de testes trabalham em conjunto para criar um ecossistema robusto que reduz drasticamente a probabilidade de bugs chegarem à produção e permite que equipes modifiquem código legado com segurança.

- [Níveis de Testes - Fundação conceitual](./1__test_levels.md)

## 2. Frameworks de Testes - Panorama de ferramentas

Os frameworks de testes representam uma das evoluções mais significativas no desenvolvimento de software das últimas décadas, transformando a forma como construímos e mantemos aplicações confiáveis. No ecossistema JavaScript e TypeScript, essa evolução se manifesta de maneira particularmente interessante através de ferramentas como Jest, Vitest, Mocha, Jasmine e Playwright, cada uma refletindo diferentes filosofias e momentos do desenvolvimento web. Jest, criado pelo Facebook, emergiu como resposta à necessidade de testar aplicações React de forma mais simples e integrada, oferecendo uma solução completa que elimina a fadiga de decisões sobre qual biblioteca de assertions usar ou como configurar mocking. Por outro lado, Mocha representa a filosofia Unix de fazer uma coisa bem feita, permitindo que desenvolvedores componham seu próprio stack de testes escolhendo ferramentas especializadas como Chai para assertions e Sinon para mocking. O mais recente Vitest surge como uma resposta moderna aos desafios de performance, aproveitando o ESM nativo e as transformações do Vite para oferecer feedback quase instantâneo durante o desenvolvimento. Essa diversidade não é acidental, mas reflete diferentes valores na comunidade: alguns priorizam conveniência e produtividade imediata, enquanto outros valorizam controle granular e flexibilidade arquitetural. Compreender essas diferenças fundamentais ajuda equipes a fazer escolhas alinhadas com suas necessidades específicas, cultura de desenvolvimento e requisitos técnicos.

A escolha de um framework de testes vai muito além de preferências pessoais ou popularidade no momento, exigindo uma análise cuidadosa do contexto técnico e organizacional do projeto. Quando você trabalha com uma aplicação React moderna que utiliza Vite como bundler, Vitest se torna uma escolha natural pela integração perfeita e velocidade excepcional, permitindo que desenvolvedores vejam resultados de testes atualizarem em tempo real enquanto codificam através do Hot Module Replacement. Projetos Node.js complexos com requisitos específicos de configuração podem se beneficiar enormemente da flexibilidade do Mocha, onde você pode escolher exatamente quais ferramentas usar em cada camada do teste, desde a execução até o reporting personalizado. Jest brilha em cenários onde a produtividade da equipe é prioritária e você quer minimizar decisões de configuração, oferecendo uma experiência consistente e bem documentada que novos membros podem aprender rapidamente. Para testes end-to-end, Playwright se estabeleceu como o padrão de facto ao resolver problemas históricos de automação de navegadores, como flakiness e inconsistências entre diferentes browsers, através de auto-waiting inteligente e execução paralela confiável. A chave está em reconhecer que cada framework foi otimizado para resolver problemas específicos, e a melhor escolha emerge naturalmente quando você identifica claramente quais são seus desafios mais críticos.

O impacto real dos frameworks de testes se manifesta na capacidade de uma equipe manter e evoluir software com confiança ao longo do tempo, transformando a cultura de desenvolvimento de reativa para proativa. Quando você tem uma suite de testes bem estruturada usando qualquer desses frameworks, refatorações que antes seriam arriscadas se tornam seguras e até encorajadas, permitindo que o código evolua para acompanhar mudanças de requisitos sem acumular dívida técnica. Os exemplos práticos apresentados neste guia demonstram como testes bem escritos servem também como documentação viva do comportamento esperado do sistema, algo particularmente valioso quando novos desenvolvedores precisam entender código complexo ou quando você retorna a um projeto após meses. A integração com pipelines de CI/CD transforma esses testes em guardiões automatizados da qualidade, impedindo que bugs cheguem à produção e fornecendo feedback imediato sobre o impacto de cada mudança. Mais profundamente, a prática consistente de escrever testes influencia o design do próprio código, incentivando arquiteturas mais modulares e desacopladas que são naturalmente mais testáveis e, consequentemente, mais mantíveis. Dominar os conceitos apresentados aqui sobre mocking, fixtures, parametrized tests e padrões avançados capacita desenvolvedores a construir não apenas software que funciona hoje, mas sistemas resilientes que continuarão funcionando e evoluindo amanhã, independentemente do framework específico escolhido.

- [Guia de Referência: Frameworks de Testes - Panorama de ferramentas](./2__frameworks_overview.md)

## 3. Organização de Diretório e Arquivos - Estrutura prática

O gerenciamento eficaz de testes em estruturas complexas de diretórios requer uma abordagem sistemática que equilibre organização, performance e manutenibilidade. A prática recomendada sugere manter os arquivos de teste próximos ao código de produção, utilizando convenções de nomenclatura claras como ".test.ts" para testes unitários e ".integration.test.ts" para testes de integração. A configuração de scripts no package.json deve permitir execução granular dos testes, possibilitando que desenvolvedores executem apenas subconjuntos relevantes através de comandos como "test:services" ou "test:grep" com padrões específicos. A interpretação correta dos resultados é crucial: mensagens de timeout geralmente indicam problemas com operações assíncronas mal configuradas, enquanto erros de asserção apontam discrepâncias entre comportamento esperado e real. Ferramentas como nyc fornecem relatórios de cobertura que identificam linhas não testadas, guiando desenvolvedores sobre onde adicionar testes adicionais sem necessariamente buscar 100% de cobertura.

As descrições de testes devem funcionar como documentação viva do sistema, seguindo o padrão de completar a frase "deve" com comportamentos específicos em linguagem de negócio ao invés de termos técnicos. O uso de blocos "describe" aninhados para agrupar cenários relacionados cria uma hierarquia clara que facilita a identificação de falhas no terminal. Técnicas avançadas incluem a criação de fixtures reutilizáveis para dados de teste, configuração de hooks globais que automatizam limpeza entre testes, e implementação de testes parametrizados que validam múltiplos casos com código conciso. A integração com pipelines de CI/CD garante execução automática dos testes a cada commit, enquanto configurações de debugging em editores como VS Code permitem investigar falhas complexas com breakpoints e inspeção de variáveis. O objetivo final é construir uma suíte de testes que previna regressões, documente comportamentos críticos e acelere o desenvolvimento sem se tornar um fardo de manutenção.

- [Guia de Referência: Organização de Diretório e Arquivos - Estrutura prática](./3__files_directories_complexity.md)

## 4. Chai e Sinon para Testes com Mocha - Domínio das ferramentas

Chai e Sinon representam dois pilares fundamentais no ecossistema de testes JavaScript e TypeScript, cada um atendendo a necessidades complementares mas distintas. O Chai funciona como uma biblioteca de asserções que transforma verificações técnicas em declarações quase naturais, permitindo que você escreva testes que se leem como frases em inglês. Por exemplo, ao invés de usar comparações diretas e pouco expressivas, você pode escrever algo como `expect(usuario).to.have.property('email').that.includes('@')`, o que torna imediatamente claro para qualquer desenvolvedor que leia o código qual é a intenção da verificação. A biblioteca oferece três estilos diferentes de sintaxe (assert, expect e should), sendo o estilo "expect" o mais popular por equilibrar legibilidade com segurança, já que não modifica protótipos globais como o estilo "should" faz. O Chai também se destaca por suas mensagens de erro extremamente descritivas, que ajudam a identificar rapidamente o que falhou em um teste, economizando tempo precioso durante o desenvolvimento e manutenção do código.

O Sinon, por sua vez, resolve um problema diferente mas igualmente crucial: como isolar o código que você está testando das suas dependências externas. Imagine que você está testando uma função que envia emails e consulta um banco de dados, seria impraticável executar essas operações reais em cada teste, pois isso tornaria os testes lentos, imprevisíveis e dependentes de serviços externos. É aqui que o Sinon brilha, oferecendo spies para observar chamadas de funções sem alterar seu comportamento, stubs para substituir funções por versões controladas que retornam valores específicos, e mocks para criar objetos completos com expectativas pré-programadas. Um dos recursos mais poderosos do Sinon são os fake timers, que permitem controlar o tempo nos seus testes, fazendo com que um timeout de cinco segundos seja executado instantaneamente através de um simples comando `clock.tick(5000)`. Quando combinado com Chai através do plugin sinon-chai, você obtém o melhor dos dois mundos: pode verificar se uma função foi chamada com determinados argumentos usando uma sintaxe elegante como `expect(spy).to.have.been.calledWith('argumento')`, tornando seus testes não apenas funcionais, mas também altamente legíveis e fáceis de manter ao longo do tempo.

- [Guia de Referência: Chai e Sinon para Testes com Mocha - Domínio das ferramentas](./4__guide_chai_sinon.md)

## 5. Testes Unitários - Aplicação no nível mais granular

Testes unitários representam a fundação da qualidade de software, atuando como a primeira linha de defesa contra defeitos no código. Quando falamos em aplicação no nível mais granular, estamos nos referindo à prática de testar cada pequena unidade de código, geralmente funções ou métodos individuais, de forma completamente isolada de suas dependências externas. Essa granularidade é essencial porque permite identificar problemas exatamente onde eles ocorrem, sem a interferência de outros componentes do sistema. Por exemplo, ao testar uma função que calcula descontos em um sistema de e-commerce, não queremos que o teste falhe porque o banco de dados está fora do ar ou porque a API de pagamento está lenta. O teste unitário isola essa função específica usando mocks e stubs, garantindo que estamos avaliando apenas a lógica de cálculo em si. Essa abordagem traz benefícios práticos imediatos no dia a dia do desenvolvedor, como feedback rápido durante o desenvolvimento, facilidade para refatorar código com confiança e documentação viva que demonstra como cada parte do sistema deve se comportar.

A escolha de ferramentas como Mocha, Chai e Sinon para TypeScript não é acidental, mas reflete necessidades reais do mercado de trabalho atual. O Mocha fornece a estrutura básica para organizar e executar testes de forma clara e expressiva, permitindo agrupar casos relacionados e preparar ambientes controlados antes de cada teste. O Chai complementa oferecendo asserções que tornam os testes mais legíveis e próximos da linguagem natural, como "espero que este valor seja verdadeiro" ou "espero que esta lista contenha três elementos". Já o Sinon resolve um dos maiores desafios dos testes unitários, que é lidar com dependências externas, criando substitutos controlados para APIs, bancos de dados e outros serviços. No contexto profissional, essa combinação permite que equipes de desenvolvimento mantenham bases de código complexas com milhares de linhas, onde cada alteração pode ser validada em segundos através de centenas ou milhares de testes unitários automatizados. A granularidade desses testes significa que quando algo quebra, você sabe imediatamente qual função específica causou o problema, economizando horas de depuração manual e permitindo entregas mais rápidas e confiáveis.

- [Guia de Referência: Testes Unitários - Aplicação no Nível Mais Granular](./5__unit_tests.md)

## 6. Testes de Integração - Aplicação no nível intermediário

Testes de integração constituem uma camada essencial na estratégia de qualidade de software, ocupando o espaço intermediário entre os testes unitários, que verificam componentes isolados, e os testes end-to-end, que validam fluxos completos da aplicação. Diferentemente dos testes unitários que substituem todas as dependências por mocks ou stubs, os testes de integração permitem que componentes reais trabalhem juntos, validando se a comunicação entre eles ocorre conforme o esperado. No contexto do desenvolvimento moderno com TypeScript, isso significa testar se um serviço consegue realmente persistir dados no banco, se uma API externa retorna as informações no formato correto, ou se múltiplos módulos orquestrados por um controlador produzem o resultado desejado. A importância desses testes aumenta proporcionalmente à complexidade da aplicação, pois muitos bugs surgem não de falhas em componentes individuais, mas dos mal-entendidos na interface entre eles, como incompatibilidades de contrato, erros de serialização ou problemas de sincronização.

No nível intermediário de conhecimento, compreender testes de integração envolve dominar não apenas a mecânica de escrevê-los usando frameworks como Mocha, Chai e Sinon, mas também desenvolver o discernimento sobre quando e como aplicá-los efetivamente. Um desenvolvedor intermediário precisa equilibrar o custo de execução desses testes, que são naturalmente mais lentos e complexos que testes unitários, com o valor que eles proporcionam ao capturar bugs que testes isolados não conseguiriam identificar. Isso requer decisões conscientes sobre quais integrações merecem cobertura automatizada, como configurar ambientes de teste que sejam ao mesmo tempo realistas e controláveis, e como estruturar os testes para que permaneçam manuteníveis conforme a aplicação evolui. Ferramentas como bancos de dados em memória, containers Docker e stubs de serviços externos tornam-se aliadas valiosas nesse processo, permitindo simular cenários complexos sem comprometer a velocidade de execução ou a confiabilidade dos resultados.

- [Guia de Referência: Testes de Integração - Aplicação no nível intermediário](./6__integration_tests.md)

## 7. Testes E2E - Aplicação no nível mais amplo

Os testes End-to-End representam o ápice da pirâmide de testes em desenvolvimento de software, funcionando como a última linha de defesa antes que uma aplicação chegue aos usuários finais. Diferentemente dos testes unitários que verificam funções isoladas ou dos testes de integração que examinam a comunicação entre componentes específicos, os testes E2E simulam jornadas completas de usuários reais, validando que todo o ecossistema da aplicação funcione harmoniosamente. Imagine que você está desenvolvendo um sistema bancário: enquanto um teste unitário verificaria se o cálculo de juros está correto e um teste de integração confirmaria que o serviço de pagamento se comunica adequadamente com o banco de dados, o teste E2E simularia um cliente acessando sua conta, transferindo dinheiro para outro cliente e verificando se o saldo foi atualizado corretamente em ambas as contas. Essa abordagem holística captura problemas que testes mais granulares simplesmente não conseguem detectar, como falhas na orquestração entre microsserviços, problemas de renderização no frontend que impedem interações, ou inconsistências de dados que só aparecem quando múltiplos sistemas trabalham juntos.

O valor dos testes E2E está diretamente relacionado à confiança que eles proporcionam, mas essa confiança vem acompanhada de desafios significativos que todo desenvolvedor precisa entender e gerenciar adequadamente. Esses testes são naturalmente mais lentos porque precisam inicializar navegadores reais, carregar aplicações completas, aguardar respostas de APIs e banco de dados, e simular interações humanas que incluem tempos de espera realistas. No mercado de trabalho atual, onde pipelines de CI/CD executam dezenas ou centenas de builds diários, uma suíte mal otimizada de testes E2E pode se tornar um gargalo crítico, levando equipes a ignorarem ou desabilitarem esses testes, o que elimina justamente a camada de proteção que eles deveriam fornecer. Por isso, a estratégia moderna envolve selecionar criteriosamente os fluxos mais críticos para o negócio e implementá-los com técnicas avançadas como paralelização de execução, uso de dados de teste isolados, implementação do padrão Page Object Model para facilitar manutenção, e criação de mecanismos inteligentes de retry para lidar com a natureza assíncrona das aplicações web modernas, garantindo que os testes sejam tanto confiáveis quanto sustentáveis a longo prazo.

- [Guia de Referência: Testes E2E - Aplicação no nível mais amplo](./7__e2e_tests.md)

## 8. Testes Assíncronos - Caso especial transversal

- [Guia de Referência: Testes Assíncronos - Caso especial transversal](./8__async_functions.md)

## 9. Cobertura de Testes com c8 - Medição de qualidade

A cobertura de testes com C8 representa uma abordagem moderna e eficiente para medir a qualidade dos testes automatizados em projetos Node.js e TypeScript. Utilizando a API nativa do motor V8, o C8 analisa quais linhas, funções, branches e declarações do código são executadas durante os testes, fornecendo métricas precisas sem necessidade de instrumentação prévia do código. A ferramenta gera relatórios em múltiplos formatos, incluindo tabelas no terminal para feedback imediato, arquivos `lcov.info` para integração com serviços de CI/CD, e visualizações HTML interativas que permitem navegar pelo código fonte identificando exatamente quais trechos carecem de testes. A configuração é simples através do `package.json`, onde scripts como `"coverage": "c8 mocha"` envolvem o framework de testes e monitoram toda a execução, enquanto opções de personalização permitem definir diretórios incluídos, excluídos, formatos de saída e limites mínimos de cobertura que devem ser respeitados.

Alcançar e manter alta cobertura de testes requer uma abordagem estratégica que vai além de simplesmente executar mais linhas de código durante os testes. É fundamental testar todos os caminhos lógicos incluindo casos extremos, validar comportamentos em condições de erro, e garantir que branches condicionais sejam exercitadas em todas as suas variações possíveis. O exemplo prático apresentado demonstra como um serviço de processamento de pedidos pode atingir cobertura próxima a 100% através de testes sistemáticos que validam não apenas o fluxo principal, mas também cenários como validações de entrada, transições de estado inválidas, e limites de valores que acionam regras de negócio específicas. A visualização HTML gerada pelo C8 torna-se uma ferramenta indispensável durante code reviews e desenvolvimento, permitindo identificar rapidamente gaps de cobertura e priorizar esforços de teste em áreas críticas do sistema, sempre lembrando que cobertura alta é um meio para construir software confiável, não um fim em si mesmo.

- [Guia de Referência: Cobertura de Testes com c8 - Medição de qualidade](./9__c8_coverage.md)

## 10. Testes para Arquitetura DDD - Contexto arquitetural específico

3 parágrafos introdutórios

**Guia de Referência**:

- [Entities](./ddd/a__ddd_entities.md)
- [Value Objects](./ddd/b__ddd_value_objects.md)
- [Agregados (Aggregates)](./ddd/c__ddd_aggregates.md)
- [Repositories](./ddd/d__ddd_repositories.md)
- [Use Cases](./ddd/e__ddd_use_cases.md)
- [Services (Domain Services)](./ddd/f__ddd_domain_services.md)
- [Controllers](./ddd/g__ddd_controllers.md)
- [Adapters (Adaptadores)](./ddd/h__ddd_adapters.md)
- [Interfaces](./ddd/i__ddd_interfaces.md)
- [Domain Core](./ddd/j__ddd_domain_core.md)
- [Domain Events](./ddd/k__ddd_domain_events.md)
- [Domain Factories](./ddd/l__ddd_domain-factories.md)

## 11. Design Patterns em DDD - Padrões e suas estratégias de teste

Domain-Driven Design (DDD) utiliza diversos padrões arquiteturais para organizar a complexidade do domínio de negócio. Cada padrão possui características específicas que demandam estratégias de teste particulares.

A arquitetura DDD estabelece uma relação direta entre a complexidade dos padrões utilizados e a necessidade de estratégias de teste específicas para cada camada da aplicação. Os padrões táticos como Aggregates e Value Objects concentram as regras de negócio mais críticas e, por isso, demandam uma cobertura massiva de testes unitários que validem invariantes e comportamentos esperados do domínio. Já os padrões estruturais como Repository e Factory atuam nas fronteiras entre camadas, exigindo testes de integração que verifiquem a comunicação adequada com infraestrutura externa, bancos de dados e sistemas terceiros. A pirâmide de testes em DDD tende a ser invertida em relação a aplicações tradicionais, priorizando maior volume de testes unitários no núcleo do domínio e quantidade moderada de testes de integração nas bordas arquiteturais.

A escolha dos tipos de teste adequados para cada padrão DDD impacta diretamente na qualidade e manutenibilidade do software. Domain Services e Specifications, por exemplo, devem ser testados primariamente com mocks das dependências externas, garantindo que a lógica de negócio seja validada isoladamente e permaneça independente de detalhes de implementação. Domain Events, por sua vez, requerem testes que contemplem tanto handlers individuais quanto o fluxo completo de eventos em cenários de integração, assegurando que a comunicação assíncrona entre agregados funcione corretamente. A estratégia de testes em DDD também deve considerar a complexidade temporal, utilizando testes end-to-end para validar workflows completos que envolvem múltiplos agregados, eventos e transações, enquanto mantém a agilidade dos ciclos de feedback através de testes unitários rápidos e focados nas regras de negócio essenciais

- [Guia de Referência: Design Patterns em DDD e Estratégias de Testes](./11_dp_ddd_strategy_tests.md)

## 12. CI/CD com Github Actions - Automação de Testes do Pipeline

2 parágrafos introdutórios

- [Guia de Referência]

## 13. Testcontainers - Infraestrutura para testes de integração

1 parágrafos introdutórios

- [Guia de Referência]
