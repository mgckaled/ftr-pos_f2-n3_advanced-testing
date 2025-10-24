# Sistema Médico com DDD em TypeScript

Sistema completo de gerenciamento de pacientes implementado com Domain-Driven Design (DDD), TypeScript e cobertura total de testes.

## Características

- **~100% de cobertura de testes** (184 testes passando)
- **Arquitetura DDD completa** com separação em camadas
- **TypeScript strict mode** com tipagem forte
- **Imutabilidade garantida** em datas e coleções
- **Validações robustas** em todas as camadas
- **API RESTful** com Express

## Estrutura de Pastas

```plaintext
src/
├── index.ts                        # Ponto de entrada da aplicação
├── domain/
│   ├── entities/
│   │   └── Patient.ts              # Entidade principal (paciente)
│   ├── repositories/
│   │   └── Repository.ts           # Classe base abstrata genérica
│   ├── services/
│   │   └── PatientService.ts       # Lógica de negócio
│   └── value-objects/
│       ├── Address.ts              # Endereço
│       ├── Allergy.ts              # Alergia
│       ├── EmergencyContact.ts     # Contato de emergência
│       └── medical-record/
│           ├── Diagnosis.ts        # Diagnóstico
│           ├── Medication.ts       # Medicação
│           ├── Treatment.ts        # Tratamento
│           └── MedicalRecord.ts    # Prontuário médico
├── infrastructure/
│   └── persistence/
│       └── PatientRepository.ts    # Implementação do repositório
└── interfaces/
    └── controllers/
        └── PatientController.ts    # Controlador HTTP (REST API)

tests/
└── domain/
    ├── entities/
    │   └── Patient.test.ts
    ├── repositories/
    │   └── Repository.test.ts
    ├── services/
    │   └── PatientService.test.ts
    └── value-objects/
        └── ...                     # Testes espelhando estrutura do src/
```

## Tecnologias

| Tecnologia     | Propósito                          |
| -------------- | ---------------------------------- |
| **TypeScript** | Linguagem com tipagem estática     |
| **Node.js**    | Runtime JavaScript                 |
| **Express**    | Framework web para API REST        |
| **Mocha**      | Framework de testes                |
| **Chai**       | Biblioteca de assertions           |
| **Sinon**      | Mocks, stubs e spies               |
| **ts-node**    | Execução TypeScript sem compilação |
| **c8**         | Cobertura de código                |

## Instalação

```bash
npm install
```

## Scripts Disponíveis

```bash
npm run dev           # Inicia servidor em modo desenvolvimento
npm test              # Executa todos os testes
npm run coverage      # Testes com relatório de cobertura
npm run build         # Compila TypeScript para JavaScript
```

## API REST Endpoints

### Pacientes

```plaintext
POST   /patients                          # Criar paciente
GET    /patients                          # Listar todos os pacientes
GET    /patients/:id                      # Buscar paciente por ID
PUT    /patients/:id                      # Atualizar paciente
DELETE /patients/:id                      # Deletar paciente
GET    /patients/search/name/:name        # Buscar por nome
GET    /patients/search/bloodType/:type   # Buscar por tipo sanguíneo
```

## Conceitos DDD Implementados

### Camadas da Arquitetura

1. **Domain Layer** (Domínio)
   - **Entities**: Objetos com identidade única (`Patient`)
   - **Value Objects**: Objetos imutáveis definidos por atributos (`Address`, `EmergencyContact`, etc.)
   - **Services**: Lógica de negócio complexa
   - **Repositories**: Interfaces para persistência

2. **Infrastructure Layer** (Infraestrutura)
   - **Persistence**: Implementações concretas dos repositórios
   - Detalhes técnicos e acesso a dados

3. **Interface Layer** (Apresentação)
   - **Controllers**: Adaptadores HTTP (REST API)
   - Entrada e saída de dados

### Características Importantes

1. **Encapsulamento**: Campos privados com `#` (private fields do ES2022)
2. **Imutabilidade**: Retorno de cópias em getters de datas e arrays
3. **Validações**: Todas as entradas são validadas nos construtores
4. **Métodos de negócio**: `getAge()`, `isActive()`, `getActiveTreatments()`
5. **Repository Pattern**: Abstração de persistência com generics
6. **Dependency Injection**: Inversão de controle entre camadas

## Exemplos de Uso

### Criar um Paciente via API

```bash
curl -X POST http://localhost:3000/patients \
  -H "Content-Type: application/json" \
  -d '{
    "identificationDocument": "123.456.789-00",
    "name": "João da Silva",
    "birthDate": "1990-05-15",
    "gender": "Masculino",
    "bloodType": "O+",
    "address": {
      "street": "Rua das Flores",
      "number": 123,
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234-567"
    },
    "phone": "+55 11 98765-4321",
    "email": "joao@email.com",
    "emergencyContact": {
      "name": "Maria Silva",
      "phone": "+55 11 99999-9999"
    }
  }'
```

### Uso Programático

```typescript
import { PatientRepository } from "./infrastructure/persistence/PatientRepository";
import { PatientService } from "./domain/services/PatientService";
import { Address } from "./domain/value-objects/Address";
import { EmergencyContact } from "./domain/value-objects/EmergencyContact";

// Criar instâncias
const repository = new PatientRepository();
const service = new PatientService(repository);

// Adicionar paciente
const patient = service.addPatient({
  identificationDocument: "123.456.789-00",
  name: "João da Silva",
  birthDate: new Date("1990-05-15"),
  gender: "Masculino",
  bloodType: "O+",
  address: new Address("Rua das Flores", 123, "São Paulo", "SP", "01234-567"),
  phone: "+55 11 98765-4321",
  email: "joao@email.com",
  emergencyContact: new EmergencyContact("Maria Silva", "+55 11 99999-9999")
});

// Adicionar diagnóstico
const diagnosis = new Diagnosis("Hipertensão", new Date());
patient.medicalRecord.addDiagnosis(diagnosis);

// Calcular idade
const age = patient.getAge();

// Verificar tratamentos ativos
const activeTreatments = patient.medicalRecord.getActiveTreatments();

// Buscar pacientes por tipo sanguíneo
const patientsO = service.findPatientByBloodType("O+");
```

## Cobertura de Testes

### Estatísticas Atuais

```plaintext
Statements   : ~100%
Branches     : ~96%
Functions    : 100%
Lines        : ~100%
Total Tests  : 184 passing
```

### Distribuição de Testes

- **Domain Layer**: 120+ testes
  - Entities: 24 testes
  - Value Objects: 56 testes
  - Repositories: 25 testes
  - Services: 31 testes
- **Infrastructure Layer**: 30+ testes
- **Interface Layer**: 25+ testes

## Pontos de Destaque Técnicos

### Imutabilidade de Datas

Todas as datas são copiadas no construtor e nos getters usando `new Date(date.getTime())` para evitar mutações externas.

```typescript
get startDate(): Date {
  return new Date(this.#startDate.getTime());
}
```

### Timezone-Safe

Testes utilizam `Date.UTC()` e métodos UTC para evitar problemas de timezone.

```typescript
const date = new Date(Date.UTC(2024, 0, 1, 12, 0, 0));
```

### Repository Genérico

Classe base abstrata com type safety usando generics do TypeScript.

```typescript
export abstract class Repository<T> {
  protected data: Map<number, T>;
  // ...
}
```

### Testes com Mocks e Stubs

Uso do Sinon para simular comportamentos e testar casos extremos.

```typescript
sinon.stub(repository, "addPatient").returns(1);
sinon.stub(repository, "findById").returns(null);
```

## Estrutura de Testes

Cada arquivo possui testes organizados por:

- **Constructor**: Validações de criação
- **Getters/Setters**: Comportamento de acesso
- **Métodos de negócio**: Lógica específica
- **Casos de erro**: Validações e exceções
- **Casos de borda**: Situações extremas
- **Integração**: Interação entre componentes

## Resultado Final (com c8 Coverage)

```bash
  Patient Entity
    Constructor
      ✔ deve criar um paciente válido com todos os dados
      ✔ deve converter string de data de nascimento para Date
      ✔ deve aceitar Date como data de nascimento
      ✔ deve inicializar com prontuário médico vazio
      ✔ deve lançar erro quando documento de identificação estiver vazio
      ✔ deve lançar erro quando nome estiver vazio
      ✔ deve lançar erro quando email estiver vazio
    Getters
      ✔ deve retornar undefined para id antes de ser definido
      ✔ deve retornar cópia da data de nascimento
      ✔ deve permitir acesso ao prontuário médico
    Método _setId
      ✔ deve definir o id do paciente
      ✔ deve permitir apenas uma definição de id
    Setters
      Nome
        ✔ deve atualizar nome com valor válido
        ✔ deve lançar erro ao tentar definir nome vazio
      Telefone
        ✔ deve atualizar telefone com valor válido
        ✔ deve lançar erro ao tentar definir telefone vazio
      Email
        ✔ deve atualizar email com valor válido
        ✔ deve lançar erro ao tentar definir email vazio
      Endereço
        ✔ deve atualizar endereço com valor válido
        ✔ deve lançar erro ao tentar definir endereço inválido
      Contato de Emergência
        ✔ deve atualizar contato de emergência com valor válido
        ✔ deve lançar erro ao tentar definir contato inválido
    Método getAge
      ✔ deve calcular idade corretamente para aniversário já ocorrido no ano
      ✔ deve calcular idade corretamente para aniversário ainda não ocorrido no ano
      ✔ deve retornar 0 para bebê nascido este ano
      ✔ deve calcular idade corretamente quando aniversário é exatamente hoje
      ✔ deve calcular idade corretamente quando nasceu no mesmo mês mas dia diferente
    Factory Function addPatient
      ✔ deve criar um paciente usando a factory function
    Integração com Prontuário Médico
      ✔ deve manter dados do prontuário após múltiplas operações

  Repository Base Class
    Constructor
      ✔ deve inicializar com Map vazio
    Método add
      ✔ deve adicionar uma entidade com sucesso
      ✔ deve converter string para número no id
      ✔ deve lançar erro ao adicionar entidade com id existente
    Método findById
      ✔ deve retornar entidade existente
      ✔ deve retornar null para id inexistente
      ✔ deve converter string para número na busca
    Método findAll
      ✔ deve retornar array vazio quando não há entidades
      ✔ deve retornar todas as entidades
      ✔ deve retornar array independente do Map interno
    Método update
      ✔ deve atualizar entidade existente
      ✔ deve lançar erro ao atualizar entidade inexistente
      ✔ deve converter string para número no update
    Método delete
      ✔ deve deletar entidade existente
      ✔ deve lançar erro ao deletar entidade inexistente
      ✔ deve converter string para número no delete
    Método clear
      ✔ deve limpar todos os dados do repositório

  PatientService
    Constructor
      ✔ deve criar serviço com repositório válido
      ✔ deve lançar erro quando repositório não é fornecido
      ✔ deve lançar erro quando repositório é undefined
      ✔ deve aceitar repositório válido sem erros
    Método addPatient
      ✔ deve adicionar paciente e retornar paciente salvo
      ✔ deve criar paciente com dados válidos
      ✔ deve lançar erro com dados inválidos
      ✔ deve lançar erro se falhar ao salvar paciente
    Método findAllPatients
      ✔ deve retornar array vazio quando não há pacientes
      ✔ deve retornar todos os pacientes cadastrados
    Método findPatientById
      ✔ deve retornar null quando paciente não existe
      ✔ deve retornar paciente quando existe
    Método updatePatient
      ✔ deve atualizar nome do paciente
      ✔ deve atualizar telefone do paciente
      ✔ deve atualizar email do paciente
      ✔ deve atualizar endereço do paciente
      ✔ deve atualizar contato de emergência do paciente
      ✔ deve atualizar múltiplos campos simultaneamente
      ✔ deve lançar erro ao atualizar paciente inexistente
      ✔ não deve alterar campos não informados
    Método deletePatient
      ✔ deve deletar paciente existente e retorná-lo
      ✔ deve lançar erro ao deletar paciente inexistente
      ✔ deve remover paciente da lista
    Método findPatientByName
      ✔ deve retornar array vazio quando não há pacientes
      ✔ deve encontrar pacientes por nome
      ✔ deve retornar múltiplos pacientes com mesmo nome
    Método findPatientByBloodType
      ✔ deve retornar array vazio quando não há pacientes
      ✔ deve encontrar pacientes por tipo sanguíneo
      ✔ deve retornar múltiplos pacientes com mesmo tipo sanguíneo
      ✔ deve filtrar por tipo sanguíneo específico

  Address Value Object
    Constructor
      ✔ deve criar um endereço válido com todos os campos preenchidos
      ✔ deve lançar erro quando rua estiver vazia
      ✔ deve lançar erro quando cidade estiver vazia
      ✔ deve lançar erro quando estado estiver vazio
      ✔ deve lançar erro quando CEP estiver vazio
      ✔ deve lançar erro quando número for negativo
      ✔ deve lançar erro quando número for zero
    Método equals
      ✔ deve retornar true para endereços idênticos
      ✔ deve retornar false para endereços com ruas diferentes
      ✔ deve retornar false para endereços com números diferentes
      ✔ deve retornar false quando comparado com objeto que não é Address

  Allergy Value Object
    Constructor
      ✔ deve criar uma alergia válida
      ✔ deve lançar erro quando nome estiver vazio
      ✔ deve lançar erro quando nome for null ou undefined
    Método equals
      ✔ deve retornar true para alergias com mesmo nome
      ✔ deve retornar false para alergias com nomes diferentes
      ✔ deve retornar false quando comparado com objeto que não é Allergy

  EmergencyContact Value Object
    Constructor
      ✔ deve criar um contato de emergência válido
      ✔ deve lançar erro quando nome estiver vazio
      ✔ deve lançar erro quando telefone estiver vazio
      ✔ deve lançar erro quando ambos estiverem vazios
    Método equals
      ✔ deve retornar true para contatos idênticos
      ✔ deve retornar false para contatos com nomes diferentes
      ✔ deve retornar false para contatos com telefones diferentes
      ✔ deve retornar false quando comparado com objeto que não é EmergencyContact

  Diagnosis Value Object
    Constructor
      ✔ deve criar um diagnóstico válido
      ✔ deve lançar erro quando descrição estiver vazia
      ✔ deve lançar erro quando data for inválida
      ✔ deve retornar cópia da data ao acessar getter

  MedicalRecord Value Object
    Constructor
      ✔ deve criar um prontuário vazio por padrão
      ✔ deve criar um prontuário com dados iniciais
    Método addDiagnosis
      ✔ deve adicionar um diagnóstico válido
      ✔ deve adicionar múltiplos diagnósticos
      ✔ deve lançar erro ao adicionar objeto inválido
    Método addMedication
      ✔ deve adicionar uma medicação válida
      ✔ deve adicionar múltiplas medicações
      ✔ deve lançar erro ao adicionar objeto inválido
    Método addTreatment
      ✔ deve adicionar um tratamento válido
      ✔ deve adicionar múltiplos tratamentos
      ✔ deve lançar erro ao adicionar objeto inválido
    Método getActiveTreatments
      ✔ deve retornar apenas tratamentos ativos
      ✔ deve retornar array vazio quando não há tratamentos ativos
    Imutabilidade dos arrays
      ✔ deve retornar cópia do array de diagnósticos
      ✔ deve retornar cópia do array de medicações
      ✔ deve retornar cópia do array de tratamentos

  Medication Value Object
    Constructor
      ✔ deve criar uma medicação válida com todas as informações
      ✔ deve lançar erro quando nome estiver vazio
      ✔ deve lançar erro quando dosagem estiver vazia
      ✔ deve aceitar instruções vazias

  Treatment Value Object
    Constructor
      ✔ deve criar um tratamento válido com data de início e fim
      ✔ deve criar um tratamento sem data de fim
      ✔ deve lançar erro quando descrição estiver vazia
      ✔ deve lançar erro quando data de início for inválida
      ✔ deve lançar erro quando data de fim for inválida
      ✔ deve lançar erro quando data de fim for anterior à data de início
    Método isActive
      ✔ deve retornar true para tratamento sem data de fim
      ✔ deve retornar true para tratamento com data de fim futura
      ✔ deve retornar false para tratamento com data de fim passada
    Imutabilidade de datas
      ✔ deve retornar cópia da data de início
      ✔ deve retornar cópia da data de fim

  PatientRepository
    Constructor
      ✔ deve inicializar com currentId igual a 1
    Método add (herdado)
      ✔ deve adicionar paciente usando método base com id manual
      ✔ deve lançar erro ao adicionar objeto que não é Patient no método base
    Método addPatient
      ✔ deve adicionar um paciente e retornar id auto-incrementado
      ✔ deve incrementar id automaticamente
      ✔ deve lançar erro ao adicionar objeto que não é Patient
      ✔ deve definir id no paciente através do método _setId
      ✔ deve adicionar múltiplos pacientes com ids sequenciais
    Método findByName
      ✔ deve retornar array vazio quando não há pacientes
      ✔ deve encontrar paciente por nome exato
      ✔ deve retornar múltiplos pacientes com mesmo nome
      ✔ deve retornar array vazio para nome inexistente
      ✔ deve ser case sensitive
      ✔ deve filtrar apenas por nome completo
    Método findByBloodType
      ✔ deve retornar array vazio quando não há pacientes
      ✔ deve encontrar paciente por tipo sanguíneo
      ✔ deve retornar múltiplos pacientes com mesmo tipo sanguíneo
      ✔ deve filtrar corretamente tipos sanguíneos diferentes
      ✔ deve retornar array vazio para tipo sanguíneo inexistente
      ✔ deve encontrar todos os tipos sanguíneos diferentes
    Método resetCurrentId
      ✔ deve resetar currentId para 1
      ✔ deve permitir reutilizar ids após reset
    Integração com Repository base
      ✔ deve herdar método findById
      ✔ deve herdar método findAll
      ✔ deve herdar método update
      ✔ deve herdar método delete
      ✔ deve herdar método clear

  PatientController
    Constructor e Rotas
      ✔ deve criar controller com serviço válido
      ✔ deve inicializar rotas
    Método createPatient
      ✔ deve criar paciente com sucesso e retornar status 201
      ✔ deve retornar status 400 em caso de erro
      ✔ deve retornar mensagem de erro adequada
    Método getAllPatients
      ✔ deve retornar lista vazia com status 200
      ✔ deve retornar todos os pacientes
      ✔ deve retornar status 500 em caso de erro
    Método getPatientById
      ✔ deve retornar paciente existente com status 200
      ✔ deve retornar status 404 quando paciente não existe
      ✔ deve retornar status 500 em caso de erro
    Método updatePatient
      ✔ deve atualizar paciente com sucesso e retornar status 200
      ✔ deve retornar status 400 quando paciente não existe
      ✔ deve retornar status 400 quando paciente não existe
    Método deletePatient
      ✔ deve deletar paciente com sucesso e retornar status 200
      ✔ deve retornar status 404 quando paciente não existe
    Método getPatientByName
      ✔ deve retornar pacientes por nome com status 200
      ✔ deve retornar status 404 quando não encontra pacientes
      ✔ deve retornar status 500 em caso de erro
    Método getPatientByBloodType
      ✔ deve retornar pacientes por tipo sanguíneo com status 200
      ✔ deve retornar status 404 quando não encontra pacientes
      ✔ deve retornar status 500 em caso de erro


  185 passing (204ms)

-------------------------------------|---------|----------|---------|---------|-------------------------
| File                                  | % Stmts   | % Branch   | % Funcs   | % Lines   | Uncovered Line #s         |
| ------------------------------------- | --------- | ---------- | --------- | --------- | ------------------------- |
| All files                             | 100       | 96.68      | 100       | 100       |
| domain/entities                       | 100       | 100        | 100       | 100       |
| Patient.ts                            | 100       | 100        | 100       | 100       |
| domain/repositories                   | 100       | 100        | 100       | 100       |
| Repository.ts                         | 100       | 100        | 100       | 100       |
| domain/services                       | 100       | 100        | 100       | 100       |
| PatientService.ts                     | 100       | 100        | 100       | 100       |
| domain/value-objects                  | 100       | 100        | 100       | 100       |
| Address.ts                            | 100       | 100        | 100       | 100       |
| Allergy.ts                            | 100       | 100        | 100       | 100       |
| EmergencyContact.ts                   | 100       | 100        | 100       | 100       |
| domain/value-objects/medical-record   | 100       | 100        | 100       | 100       |
| Diagnosis.ts                          | 100       | 100        | 100       | 100       |
| MedicalRecord.ts                      | 100       | 100        | 100       | 100       |
| Medication.ts                         | 100       | 100        | 100       | 100       |
| Treatment.ts                          | 100       | 100        | 100       | 100       |
| infrastructure/persistence            | 100       | 100        | 100       | 100       |
| PatientRepository.ts                  | 100       | 100        | 100       | 100       |
| interfaces/controllers                | 100       | 70.83      | 100       | 100       |
| PatientController.ts                  | 100       | 70.83      | 100       | 100       | 37,48,66,89,101,121,141   |
| ------------------------------------- | --------- | ---------- | --------- | --------- | ------------------------- |
```
