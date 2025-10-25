# Sessão de Desenvolvimento - 2025-10-25

## Objetivo
Criar um projeto React de referência para testes com Vitest, focado em demonstrar testes aplicados aos componentes mais comuns do React através de uma landing page de clínica médica.

## Contexto do Projeto
- **Repositório**: Testes Avançados (Nível 3 - Fase 2)
- **Curso**: Pós-Graduação Tech Developer 360 - FTR Rocketseat
- **Projeto Base**: Sistema de gerenciamento de pacientes (src/p1) usado como inspiração
- **Tema**: Landing page de clínica médica com agendamento de consultas

---

## Trabalho Realizado

### 1. Configuração Inicial do Ambiente de Testes

#### 1.1 Instalação de Dependências
```bash
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui @vitest/coverage-v8
```

**Pacotes instalados:**
- `vitest@4.0.3` - Framework de testes
- `jsdom@27.0.1` - Ambiente DOM para testes
- `@testing-library/react@16.3.0` - Utilidades para testar React
- `@testing-library/jest-dom@6.9.1` - Matchers customizados
- `@testing-library/user-event@14.6.1` - Simulação de interações
- `@vitest/ui@4.0.3` - Interface visual para testes
- `@vitest/coverage-v8@4.0.3` - Cobertura de código com V8

#### 1.2 Configuração do Vitest (vite.config.ts)
```typescript
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/dist/**',
      ],
    },
  },
})
```

**Melhores práticas aplicadas:**
- V8 como provider de coverage (mais rápido e menos memória)
- Globals habilitados para simplicidade
- jsdom como ambiente de teste
- Exclusões apropriadas para coverage

#### 1.3 Arquivos de Configuração Criados
- `web/src/test/setup.ts` - Import do jest-dom
- `web/tsconfig.app.json` - Adicionado `vitest/globals` aos types
- `web/package.json` - Scripts de teste adicionados:
  - `test` - Modo watch
  - `test:ui` - Interface visual
  - `test:run` - Execução única
  - `coverage` - Com relatório de cobertura

**Commit:**
```
config(web): setup vitest with testing library and best practices
```

---

### 2. Criação dos Componentes React com Testes

#### 2.1 Button Component (15 testes)
**Arquivo:** `src/components/Button.tsx` e `Button.test.tsx`

**Funcionalidades:**
- 3 variantes: primary, secondary, danger
- Estado de loading com texto "Loading..."
- Estado disabled
- Suporte a todos os atributos HTML de button
- Classes Tailwind CSS para estilização

**Testes implementados:**
- ✅ Renderização com children
- ✅ Variantes (primary, secondary, danger)
- ✅ Estado de loading (texto e disabled)
- ✅ Estado disabled
- ✅ Interações de click
- ✅ Props customizadas (className, type, data-*)

**Problema resolvido:**
- Erro de importação: `ButtonHTMLAttributes` não existe no React 19
- Solução: Usar `ComponentProps<'button'>` ao invés

#### 2.2 Input Component (27 testes)
**Arquivo:** `src/components/Input.tsx` e `Input.test.tsx`

**Funcionalidades:**
- Label opcional com associação automática (htmlFor/id)
- Mensagem de erro com estilo vermelho
- Helper text para informações adicionais
- Estados visuais para erro/normal
- Suporte completo a acessibilidade (ARIA)

**Testes implementados:**
- ✅ Renderização com/sem label
- ✅ Associação label-input (htmlFor/id)
- ✅ Helper text
- ✅ Mensagens de erro com role="alert"
- ✅ ARIA attributes (aria-invalid, aria-describedby)
- ✅ Diferentes tipos de input (email, password, number)
- ✅ Interações do usuário (typing, focus, blur)
- ✅ Estado disabled
- ✅ Props customizadas (required, maxLength, placeholder)

#### 2.3 Card Component (22 testes)
**Arquivo:** `src/components/Card.tsx` e `Card.test.tsx`

**Funcionalidades:**
- Título obrigatório
- Descrição opcional
- Ícone opcional (ReactNode)
- Modo clickable com onClick
- Navegação por teclado (Enter, Space)
- Acessibilidade completa

**Testes implementados:**
- ✅ Renderização de title, description, icon
- ✅ Comportamento clickable vs não-clickable
- ✅ Classes CSS condicionais (cursor-pointer, hover)
- ✅ Navegação por teclado (Enter, Space, outras teclas)
- ✅ Acessibilidade (role="button", tabIndex, aria-label)
- ✅ Props customizadas (className)
- ✅ Integração completa com todas as props

#### 2.4 Modal Component (19 testes)
**Arquivo:** `src/components/Modal.tsx` e `Modal.test.tsx`

**Funcionalidades:**
- Controle de abertura/fechamento (isOpen)
- Título customizável
- Children para conteúdo
- Footer opcional
- Fechamento por Escape, backdrop click, botão X
- Gerenciamento de body overflow

**Testes implementados:**
- ✅ Renderização condicional (isOpen true/false)
- ✅ Renderização de title, children, footer
- ✅ Acessibilidade (role="dialog", aria-modal, aria-labelledby)
- ✅ Fechamento por botão X
- ✅ Fechamento por Escape key
- ✅ Fechamento por backdrop click
- ✅ Não fechar ao clicar no conteúdo
- ✅ Gerenciamento de body overflow (hidden/unset)
- ✅ Cleanup ao desmontar

#### 2.5 Accordion Component (20 testes)
**Arquivo:** `src/components/Accordion.tsx` e `Accordion.test.tsx`

**Funcionalidades:**
- Lista de items (title + content)
- Modo single (apenas 1 aberto) ou multiple (vários abertos)
- Índices abertos por padrão (defaultOpenIndexes)
- Navegação por teclado
- Ícone animado (rotação)
- ARIA completo

**Testes implementados:**
- ✅ Renderização de todos os items
- ✅ Items fechados por padrão
- ✅ DefaultOpenIndexes
- ✅ Modo single (fechar outros ao abrir novo)
- ✅ Modo multiple (vários abertos simultaneamente)
- ✅ Navegação por teclado
- ✅ Acessibilidade (aria-expanded, aria-controls)
- ✅ Feedback visual (rotação de ícone)
- ✅ Conteúdo complexo (JSX)

**Problemas resolvidos durante implementação:**
- Testes de teclado falhando: Ajustado para usar getAllByRole
- Testes de acessibilidade falhando: Corrigido seletores
- Testes de ícone falhando: Usado container.querySelector

**Commit:**
```
feat(web): add core UI components with comprehensive tests

Created 5 reusable React components with full test coverage (103 tests)
```

---

### 3. Configuração do Tailwind CSS v4

#### 3.1 Pesquisa da Documentação
Consultado site oficial do Tailwind CSS para confirmar abordagem da v4:
- URL: https://tailwindcss.com/docs/installation
- Descoberta: Tailwind v4 usa abordagem zero-config
- Mudança: Plugin Vite ao invés de PostCSS
- Simplificação: `@import "tailwindcss"` ao invés de `@tailwind` directives

#### 3.2 Instalação
```bash
pnpm add -D @tailwindcss/vite tailwindcss postcss autoprefixer
```

#### 3.3 Configuração

**vite.config.ts:**
```typescript
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ...
})
```

**src/index.css:**
```css
@import "tailwindcss";
```

**src/main.tsx:**
```typescript
import "./index.css"
```

**Observações:**
- Não precisa de `tailwind.config.js` (zero-config)
- Não precisa de `postcss.config.js` para o plugin Vite
- Mais simples que versão 3

#### 3.4 Validação
- Todos os 103 testes continuam passando
- Componentes já usavam classes Tailwind

**Commit:**
```
config(web): setup tailwind css v4 with vite

Using Tailwind CSS v4 new approach:
- No tailwind.config.js required (zero-config setup)
- Uses Vite plugin instead of PostCSS plugin
- Simple @import directive instead of @tailwind directives
```

---

## Estatísticas Finais

### Componentes Criados
- **Button**: 15 testes
- **Input**: 27 testes
- **Card**: 22 testes
- **Modal**: 19 testes
- **Accordion**: 20 testes
- **TOTAL**: 5 componentes, 103 testes

### Cobertura de Testes
- Todos os testes passando (103/103)
- Cobertura de código com V8
- Testes organizados por categorias:
  - Rendering
  - Interactions
  - Accessibility
  - Custom props
  - Edge cases

### Tecnologias Utilizadas
- **React 19.1.1**
- **TypeScript 5.9.3**
- **Vite 7.1.7**
- **Vitest 4.0.3**
- **Testing Library (React 16.3.0)**
- **Tailwind CSS 4.1.16**

### Commits Realizados
1. `config(web): setup vitest with testing library and best practices`
2. `feat(web): add core UI components with comprehensive tests`
3. `config(web): setup tailwind css v4 with vite`

---

## Próximos Passos Planejados

### Pendente
1. **AppointmentForm Component**
   - Formulário de agendamento usando Input e Button
   - Validação de campos
   - Seleção de especialidade e data
   - Testes de validação e submit

2. **Landing Page Completa**
   - Hero section
   - Grid de especialidades usando Cards
   - FAQ usando Accordion
   - Formulário de agendamento
   - Modal de confirmação

---

## Notas e Aprendizados

### Melhores Práticas Aplicadas
1. **TypeScript Strict**: Tipagem forte em todos os componentes
2. **Acessibilidade**: ARIA attributes, keyboard navigation, semantic HTML
3. **Testes Completos**: Renderização, interações, acessibilidade, edge cases
4. **Componentes Reutilizáveis**: Props bem definidas, composição
5. **Zero-config**: Usando padrões modernos (Tailwind v4, Vitest globals)

### Problemas Encontrados e Soluções
1. **React 19 imports**: Usar `ComponentProps` ao invés de tipos específicos
2. **Testes de teclado**: `userEvent.keyboard` nem sempre funciona como esperado
3. **Seletores em testes**: Usar `getAllByRole` quando há múltiplos elementos

### Decisões de Arquitetura
1. Componentes em `src/components/` (flat structure)
2. Testes colocados ao lado dos componentes (.test.tsx)
3. Setup de testes centralizado em `src/test/setup.ts`
4. Coverage com V8 ao invés de Istanbul (performance)

---

## Referências
- [Vitest Documentation](https://vitest.dev)
- [Testing Library React](https://testing-library.com/react)
- [Tailwind CSS v4](https://tailwindcss.com)
- Projeto inspiração: `src/p1/` (Sistema de gerenciamento de pacientes com DDD)
