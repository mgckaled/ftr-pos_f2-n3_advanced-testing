# Questionário Avaliativo - Testing Avançado

## Questão 01/10

**Pergunta:** O que os testes de integração geralmente verificam?

**Resposta:** O comportamento de componentes interagindo entre si

**Justificativa:** Testes de integração validam como diferentes módulos e componentes trabalham juntos, diferente de testes unitários (componentes isolados) ou testes de performance (velocidade).

---

## Questão 02/10

**Pergunta:** Qual biblioteca foi mencionada como ferramenta de stub e spy nos testes?

**Resposta:** Sinon

**Justificativa:** Sinon é a biblioteca padrão em TypeScript/JavaScript para criar stubs (substituir funções), spies (monitorar chamadas) e mocks em testes, conforme configurado no `package.json` do projeto.

---

## Questão 03/10

**Pergunta:** Por que o padrão Singleton pode ser considerado um anti-padrão em testes?

**Resposta:** Porque viola princípios como a responsabilidade única

**Justificativa:** Singleton dificulta testes porque cria estado global compartilhado, violando o princípio da responsabilidade única e tornando testes interdependentes e não isolados.

---

## Questão 04/10

**Pergunta:** No TDD, o que representa a "fase vermelha"?

**Resposta:** Quando o teste é implementado antes do código e falha

**Justificativa:** A fase vermelha (Red) é o primeiro passo do ciclo Red-Green-Refactor do TDD, onde se escreve um teste que falha propositalmente antes de implementar a funcionalidade.

---

## Questão 05/10

**Pergunta:** O que caracteriza um objeto de valor (Value Object) no DDD?

**Resposta:** Ter igualdade baseada em seus atributos e não em sua identidade

**Justificativa:** Value Objects são imutáveis e comparados pelo conteúdo de seus atributos, não pela referência em memória, diferentemente de Entities que possuem identidade única.

---

## Questão 06/10

**Pergunta:** Qual é a principal vantagem de usar Testcontainers em testes?

**Resposta:** Testes mais próximos do ambiente de produção

**Justificativa:** Testcontainers permite executar contêineres Docker (banco de dados, serviços) durante os testes, replicando o ambiente real de produção sem necessidade de mocks, garantindo testes de integração mais realistas e confiáveis.

---

## Questão 07/10

**Pergunta:** No padrão Strategy, qual é o benefício principal para testes?

**Resposta:** Substituir estratégias de forma dinâmica sem impactar o funcionamento

**Justificativa:** O padrão Strategy permite trocar comportamentos em tempo de execução, facilitando testes ao permitir injetar diferentes implementações (mocks, stubs) sem alterar o código principal, promovendo isolamento e testabilidade.

---

## Questão 08/10

**Pergunta:** No contexto do GitHub Actions, qual é o objetivo de um job de testes em CI/CD?

**Resposta:** Rodar os testes automaticamente ao subir código

**Justificativa:** Um job de testes em CI/CD (Integração Contínua/Entrega Contínua) executa automaticamente a suite de testes sempre que há push de código, garantindo qualidade antes de merge ou deploy, sem necessidade de intervenção manual.

---

## Questão 09/10

**Pergunta:** O padrão de projeto Builder é útil quando:

**Resposta:** Estamos lidando com objetos complexos com várias dependências

**Justificativa:** O padrão Builder é particularmente útil em testes para construir objetos complexos com múltiplas dependências de forma legível e flexível, evitando construtores longos e facilitando a criação de diferentes configurações de teste.

---

## Questão 10/10

**Pergunta:** O que é a biblioteca Testcontainers usada para testes?

**Resposta:** Uma biblioteca para rodar testes em containers Docker reais

**Justificativa:** Testcontainers é uma biblioteca que permite gerenciar containers Docker durante testes, possibilitando executar serviços reais (bancos de dados, message brokers, etc.) em um ambiente isolado e controlado, garantindo testes de integração realistas sem dependências externas.
