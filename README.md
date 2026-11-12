# Daily Coffee — E-commerce

E-commerce de uma cafeteria fictícia na Vila Mariana (São Paulo), construído como **projeto de portfólio**, mas tratado como produto real: regras de negócio coerentes, segurança, tratamento de erros, testes e documentação.

> Todos os dados (nome, endereço, telefone, preços, cardápio) são fictícios. O endereço usa uma rua real só para o mapa funcionar.

- **Produção:** https://daily-coffee-store.vercel.app
- **Staging:** https://daily-coffee-store-staging.vercel.app (branch `develop`, não indexado)

## Status

A **Etapa 1 (Setup)** está concluída: infraestrutura, arquitetura em camadas, banco por ambiente, CI e deploy. A home ainda é a landing page original; ela vira loja na Etapa 2.

| Etapa | Entrega |
|---|---|
| 1. Setup | Repositório, estrutura, Neon + Prisma, CI, deploy ✅ |
| 2. Catálogo | Produtos no banco, API e páginas; home adaptada para loja |
| 3. Carrinho | Carrinho no navegador, total recalculado no servidor |
| 4. Autenticação | Cadastro, login, sessão, verificação de e-mail, recuperação de senha, Google |
| 5. Entrega e retirada | Bairros, taxas, endereço com ViaCEP |
| 6. Checkout e pagamento | Pedido, Asaas sandbox (Pix e cartão), webhook |
| 7. Painel administrativo | Produtos, bairros, pedidos e status |
| 8. Polimento | E-mails de pedido, revisão de segurança, documentação final |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion · Phosphor Icons · Prisma 7 + Neon (Postgres) · Zod · Vitest · GitHub Actions · Vercel

Detalhes e motivos em [`docs/SPEC.md`](docs/SPEC.md#3-stack).

## Arquitetura

Projeto único (front e back no Next.js), com API REST em Route Handlers e back-end em camadas:

```
route.ts → controller → service → repository → banco
```

- **controller:** lê e valida a requisição (Zod), monta a resposta HTTP
- **service:** regras de negócio, sem conhecer HTTP
- **repository:** único lugar que usa o Prisma
- Erros do domínio (`AppError`) viram status HTTP em um só lugar (`withErrorHandler`)

Exemplo real: `GET /api/health` atravessa todas as camadas e responde `200 { "status": "ok" }` ou `503 { "status": "error" }`.

As decisões ficam registradas em [ADRs](docs/adr/README.md).

## Como rodar

Pré-requisitos: [Node.js 24](https://nodejs.org) (veja `.nvmrc`) e um banco Postgres no [Neon](https://neon.tech).

1. Copie `.env.example` para `.env` e preencha as URLs da branch **`dev`** do Neon (`DATABASE_URL` com pooler, `DIRECT_URL` direta).
2. Instale as dependências (isso também gera o cliente do Prisma):

   ```bash
   npm install
   ```

3. Suba o servidor:

   ```bash
   npm run dev
   ```

4. Abra http://localhost:3000 e confira http://localhost:3000/api/health.

Se faltar alguma variável, o projeto não sobe e diz qual falta.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run format` / `format:check` | Formata / confere a formatação (Prettier) |
| `npm run typecheck` | Checagem de tipos |
| `npm test` / `test:watch` | Testes unitários (Vitest) |

## Fluxo de trabalho e deploy

```
feature/* → PR para develop → CI + preview → merge → staging
develop   → PR para main    → CI           → merge → produção
```

- `main` e `develop` são protegidas: merge só por PR, com o CI (lint, formatação, tipos, testes e build) passando.
- O deploy é feito pela Vercel a cada merge. O build roda `prisma migrate deploy` antes do `next build`.
- Cada ambiente tem seu banco: produção usa a branch `production` do Neon; staging, previews e local usam a `dev`.

## Documentação

- [`docs/SPEC.md`](docs/SPEC.md): escopo, arquitetura, regras de negócio e decisões
- [`docs/data-model.md`](docs/data-model.md): tabelas, enums e dados pessoais
- [`docs/adr/`](docs/adr/README.md): decisões de arquitetura
- [`docs/etapas/`](docs/etapas/01-setup.md): plano e registro de cada etapa
- [`docs/postman/`](docs/postman): collection e ambientes (local, staging, produção)
