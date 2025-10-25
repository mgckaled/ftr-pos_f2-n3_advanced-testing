# React Testing - Projeto de Referência

Projeto educacional focado em demonstrar testes automatizados aplicados a componentes React através de uma aplicação de agendamento de consultas médicas.

## Objetivo

Este projeto serve como material de consulta e aprendizado sobre:

- Testes de componentes React com Vitest e Testing Library
- Estratégias de teste para diferentes tipos de componentes (básicos, formulários, modais)
- Validação de acessibilidade (ARIA attributes, keyboard navigation)
- Testes de interações do usuário e estados assíncronos
- Configuração de ambiente de testes moderno

## Tecnologias

- **React 19.1.1** - Biblioteca UI
- **TypeScript 5.9.3** - Tipagem estática
- **Vite 7.1.7** - Build tool e dev server
- **Vitest 4.0.3** - Framework de testes
- **Testing Library** - Utilitários para testes de componentes
- **Tailwind CSS 4.1.16** - Estilização

## Estrutura do Projeto

```plaintext
web/
├── src/
│   ├── components/
│   │   ├── Accordion.tsx          # Componente de accordion expansível
│   │   ├── Accordion.test.tsx     # 20 testes
│   │   ├── AppointmentForm.tsx    # Formulário de agendamento
│   │   ├── AppointmentForm.test.tsx # 37 testes
│   │   ├── Button.tsx             # Botão reutilizável
│   │   ├── Button.test.tsx        # 15 testes
│   │   ├── Card.tsx               # Card clicável
│   │   ├── Card.test.tsx          # 22 testes
│   │   ├── Input.tsx              # Input com validação
│   │   ├── Input.test.tsx         # 27 testes
│   │   ├── Modal.tsx              # Modal acessível
│   │   └── Modal.test.tsx         # 19 testes
│   ├── test/
│   │   └── setup.ts               # Configuração global de testes
│   ├── App.tsx                    # Aplicação principal
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais
├── vite.config.ts                 # Configuração Vite + Vitest
├── package.json
└── README.md
```

## Componentes e Testes

### Button (15 testes)

Componente de botão com variantes e estados.

**Funcionalidades:**

- 3 variantes: primary, secondary, danger
- Estado de loading
- Estado disabled

**Testes cobrem:**

- Renderização com diferentes variantes
- Estados de loading e disabled
- Interações de click
- Props customizadas

### Input (27 testes)

Campo de input com label, validação e mensagens de erro.

**Funcionalidades:**

- Label associado automaticamente
- Mensagens de erro e helper text
- Suporte a diferentes tipos (text, email, password, etc)
- Acessibilidade completa (ARIA)

**Testes cobrem:**

- Associação label-input
- Mensagens de erro e helper text
- Estados de validação (aria-invalid, aria-describedby)
- Interações do usuário (typing, focus, blur)

### Card (22 testes)

Componente de card com suporte a click e navegação por teclado.

**Funcionalidades:**

- Modo clickable com callback
- Navegação por teclado (Enter, Space)
- Ícone opcional

**Testes cobrem:**

- Renderização de conteúdo
- Comportamento clickable vs não-clickable
- Navegação por teclado
- Acessibilidade (role, tabIndex, aria-label)

### Modal (19 testes)

Modal acessível com backdrop e múltiplas formas de fechar.

**Funcionalidades:**

- Controle de abertura/fechamento
- Fechamento por ESC, backdrop ou botão X
- Gerenciamento de body overflow
- Footer opcional

**Testes cobrem:**

- Renderização condicional
- Métodos de fechamento
- Acessibilidade (role="dialog", aria-modal)
- Gerenciamento de overflow
- Cleanup ao desmontar

### Accordion (20 testes)

Accordion com modos single e multiple.

**Funcionalidades:**

- Modo single (apenas 1 aberto) ou multiple (vários)
- Índices abertos por padrão
- Navegação por teclado
- Ícone animado

**Testes cobrem:**

- Modos single e multiple
- Estados aberto/fechado
- Navegação por teclado
- Acessibilidade (aria-expanded, aria-controls)

### AppointmentForm (37 testes)

Formulário completo de agendamento de consultas.

**Funcionalidades:**

- 7 campos com validações robustas
- Validação de email (regex) e telefone (formato brasileiro)
- Regras de negócio (data futura, horário 08:00-18:00)
- Loading state durante submissão
- Modal de confirmação
- Botão de limpar formulário

**Testes cobrem:**

- Validação individual de cada campo
- Submissão do formulário
- Estados de loading
- Modal de confirmação
- Botão limpar
- Acessibilidade completa

## Instalação e Execução

### Instalar dependências

```bash
pnpm install
```

### Modo desenvolvimento

```bash
pnpm dev
```

### Build para produção

```bash
pnpm build
```

## Executar Testes

### Modo watch (desenvolvimento)

```bash
pnpm test
```

### Execução única

```bash
pnpm test:run
```

### Interface visual

```bash
pnpm test:ui
```

### Cobertura de código

```bash
pnpm coverage
```

Relatório HTML disponível em: `coverage/index.html`

## Estatísticas de Testes

- **Total de testes:** 140
- **Total de componentes:** 6
- **Tempo de execução:** ~29s
- **Cobertura:** Statements, branches, functions e lines

### Distribuição de testes por componente

| Componente      | Testes | Categorias                                            |
| --------------- | ------ | ----------------------------------------------------- |
| Button          | 15     | Renderização, Variantes, Estados, Interações          |
| Input           | 27     | Renderização, Validação, Acessibilidade, Interações   |
| Card            | 22     | Renderização, Click, Teclado, Acessibilidade          |
| Modal           | 19     | Renderização, Fechamento, Acessibilidade, Lifecycle   |
| Accordion       | 20     | Renderização, Modos, Teclado, Acessibilidade          |
| AppointmentForm | 37     | Validações, Submissão, Loading, Modal, Acessibilidade |

## Padrões de Teste Aplicados

### AAA Pattern (Arrange, Act, Assert)

Todos os testes seguem o padrão AAA para melhor legibilidade.

### Testing Library Principles

- Testes focados no comportamento do usuário
- Queries por role e accessible name
- Evitar detalhes de implementação
- Testes de acessibilidade integrados

### Categorização de Testes

Cada arquivo de teste organiza os casos em categorias:

- Rendering
- Interactions
- Validation
- Accessibility
- Edge cases

### Cobertura de Acessibilidade

Todos os componentes testam:

- ARIA attributes (role, aria-label, aria-invalid, etc)
- Navegação por teclado
- Screen reader support
- Semantic HTML

## Estrutura de Teste Exemplo

```typescript
describe("ComponentName", () => {
  describe("Rendering", () => {
    it("should render with required props", () => {
      // Arrange
      render(<Component prop="value" />)

      // Act (if needed)

      // Assert
      expect(screen.getByText("value")).toBeInTheDocument()
    })
  })

  describe("Interactions", () => {
    it("should handle user interaction", async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Component onClick={handleClick} />)

      await user.click(screen.getByRole("button"))

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<Component />)

      expect(screen.getByRole("button")).toHaveAttribute("aria-label")
    })
  })
})
```

## Configuração de Testes

### Vitest (vite.config.ts)

- Globals habilitados para usar describe/it sem imports
- Ambiente jsdom para simular browser
- Setup file para configurações globais
- Provider V8 para cobertura de código
- Exclusões apropriadas para coverage

### Setup Global (src/test/setup.ts)

- Import do @testing-library/jest-dom para matchers customizados
- Configurações de ambiente compartilhadas

## Melhores Práticas Aplicadas

1. **TypeScript Strict** - Tipagem forte em todos os componentes e testes
2. **Componentes Reutilizáveis** - Props bem definidas, composição
3. **Acessibilidade First** - ARIA, keyboard navigation, semantic HTML
4. **Testes Completos** - Renderização, interações, acessibilidade, edge cases
5. **Zero-config** - Padrões modernos (Tailwind v4, Vitest globals)

## Referências

- [Vitest Documentation](https://vitest.dev)
- [Testing Library React](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Tailwind CSS v4](https://tailwindcss.com)

## Contexto

Este projeto faz parte da disciplina de Testes Avançados (Nível 3 - Fase 2) do curso de Pós-Graduação Tech Developer 360 - FTR Rocketseat. O domínio de negócio (agendamento de consultas médicas) foi inspirado no projeto `src/p1` que demonstra arquitetura DDD.

## Resultado (terminal)

```bash
> vitest


 DEV  v4.0.3 C:/rocketseat/ftr/aulas/f2_n3_advanced-testing/web

 ✓ src/components/Input.test.tsx (27 tests) 774ms
 ✓ src/components/Modal.test.tsx (19 tests) 901ms
 ✓ src/components/Accordion.test.tsx (20 tests) 1923ms
 ✓ src/components/Card.test.tsx (22 tests) 655ms
 ✓ src/components/Button.test.tsx (15 tests) 580ms
 ✓ src/components/AppointmentForm.test.tsx (37 tests) 21497ms
       ✓ should show error when email is invalid  342ms
       ✓ should accept valid email  1375ms
       ✓ should accept valid phone formats  1436ms
       ✓ should show error when date is in the past  354ms
       ✓ should accept time at 08:00  1492ms
       ✓ should accept time at 17:59  1394ms
       ✓ should call onSubmit with form data when valid  1746ms
       ✓ should show loading state during submission  1406ms
       ✓ should show confirmation modal after successful submission  1471ms
       ✓ should reset form after successful submission  1441ms
       ✓ should reset all fields when clear button is clicked  1276ms
       ✓ should close modal when close button is clicked  1388ms
       ✓ should allow form submission without notes  1384ms
       ✓ should accept and submit notes when provided  1875ms

 Test Files  6 passed (6)
      Tests  140 passed (140)
```
