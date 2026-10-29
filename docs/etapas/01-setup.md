# Etapa 1 — Setup
 
> Local no repositório: `docs/etapas/01-setup.md`
> Status: **planejada**
 
---
 
# Parte 1 — Plano
 
## Objetivo
 
Ter o `daily-coffee-store` rodando localmente, em staging (`develop`) e em produção (`main`), conectado ao banco, com a arquitetura em camadas esqueletada, testes configurados e CI bloqueando PRs com erro.
 
## Escopo
 
- Projeto novo criado a partir da landing
- Ferramentas de qualidade (TypeScript strict, ESLint, Prettier)
- Estrutura de pastas e base da arquitetura
- Banco (Neon + Prisma) por ambiente
- Rota `GET /api/health` atravessando todas as camadas
- Vitest e primeiros testes
- CI no GitHub Actions
- Deploy na Vercel (Production e Preview)
- Documentação inicial (README, `.env.example`, ADRs)
## Fora do escopo
 
- Tabelas de negócio (cada uma nasce na sua etapa)
- Adaptar a home para loja (Etapa 2)
- Telas novas
- Husky / hooks de pré-commit (o CI já cobre; reavaliar se fizer falta)
---
 
## Tarefas
 
### 0. Repositório (commit inicial direto na `main`)
- [x] Copiar a landing **sem** `.git`, `node_modules` e `.next`
- [x] Alterar `name` no `package.json` para `daily-coffee-store`
- [x] Criar o repositório no GitHub e as branches `main` e `develop`
- [x] Proteger `main` e `develop`: merge só via PR com CI aprovado → ligada na tarefa 5 (padrão de mercado: PR obrigatório, check `CI`, branch atualizada, conversas resolvidas, vale para admins, sem force-push, 0 aprovações)
- [x] Adicionar `CLAUDE.md`, `docs/SPEC.md` e `docs/data-model.md`
### 1. `feature/setup-tooling`
- [x] TypeScript em modo `strict` e alias `@/` → `src/`
- [x] Script `typecheck` (`tsc --noEmit`)
- [x] Prettier + `prettier-plugin-tailwindcss` (ordena as classes do Tailwind), integrado ao ESLint
- [x] Scripts `format` e `format:check`
- [x] Fixar a versão do Node: `.nvmrc` + campo `engines` no `package.json`
### 1b. `feature/setup-english`
Traduzir para inglês os identificadores herdados da landing (componentes, funções, variáveis, arquivos e chaves de configuração), seguindo a convenção do CLAUDE.md.
- [x] Apenas renomear: **nenhuma mudança de visual ou comportamento**
- [x] Textos exibidos ao usuário continuam em português (ex.: a chave `address` guarda "Rua Capitão Macedo, 450")
- [x] `formatarPreco` vira a base do `formatPrice` da tarefa 4: verificar se recebe reais ou centavos e alinhar à regra de centavos na tarefa 4 (sem mudar comportamento nesta branch) → recebe **reais**; a conversão para centavos fica na tarefa 4
- [x] Conferência visual: a página fica idêntica antes e depois (HTML e CSS do build comparados antes e depois: equivalentes)
### 2. `feature/setup-structure`
- [x] Criar `src/server/` com `controllers/`, `services/`, `repositories/`, `middlewares/`, `validators/`, `errors/`, `lib/` → só `errors/` agora; as outras pastas nascem com o primeiro arquivo (decisão: sem pasta vazia)
- [x] Instalar `server-only`
- [x] Classe base `AppError` com `message`, `code` (ex.: `PRODUCT_NOT_FOUND`) e `kind` (`NOT_FOUND`, `CONFLICT`, `VALIDATION`, `UNAUTHORIZED`, `FORBIDDEN`), **sem status HTTP**: o domínio não conhece HTTP
- [x] `src/server/errors/error-handler.ts`: wrapper `withErrorHandler(handler)` com o mapa `kind → status` tipado (`Record<ErrorKind, number>`); erros desconhecidos viram 500 sem detalhes internos
- [x] `src/env.ts`: validação das variáveis de ambiente com Zod; o projeto falha ao iniciar se faltar alguma → importado no `next.config.ts`, falha no `dev` e no `build`; as URLs do banco entram na tarefa 3
### 3. `feature/setup-database`
- [x] Criar o projeto no Neon com os branches `main` (produção) e `dev` (staging e local) → branch padrão chamada `production` no Neon; `dev` criada a partir dela
- [x] Instalar e configurar o Prisma **conforme a documentação da versão atual** (versões recentes mudaram a configuração) → Prisma 7.10.1 fixo (o `latest` do npm é uma RC 8.x), adaptador do Neon, cliente gerado em `src/generated/prisma` fora do git
- [x] Configurar as duas URLs do Neon: com pooling (aplicação) e direta (migrations)
- [x] Cliente Prisma único (*singleton*) em `src/server/lib/prisma.ts`
- [x] Rota `GET /api/health` atravessando todas as camadas: → `200 ok` testado com o Neon `dev`; `503` testado com banco inexistente
  - `route.ts` → `health.controller` → `health.service` → `health.repository` (consulta simples ao banco)
  - Resposta de sucesso: `200 { "status": "ok" }`
  - Falha no banco: `503 { "status": "error" }`, **sem detalhes internos**
### 4. `feature/setup-tests`
- [x] Instalar e configurar o Vitest (com o alias `@/`) → Vitest 5.0.5 (config em `vitest.config.mts`) + alias de `server-only` para um módulo vazio; `@types/node` subiu para 24 porque o Vitest 5 exige 22 ou superior
- [x] Scripts `test` e `test:watch`
- [x] `formatPrice` em `src/lib/` (centavos → texto em reais) + testes, reaproveitando a função herdada da landing (sem duplicar) e ajustando os pontos que a usam → preço de `price` (reais) para `priceInCents` em `menu.ts` e `copy.ts`; preços exibidos conferidos no HTML do build
- [x] Teste do `health.service` com o repository simulado (*mock*)
- [x] Testes extras (fora do plano): `withErrorHandler` (AppError por kind, erro desconhecido sem vazar detalhe, erro interno do Next repassado)
### 5. `feature/setup-ci`
- [x] Workflow do GitHub Actions em PRs para `develop` e `main`: install → lint → format:check → typecheck → test → build → `.github/workflows/ci.yml`, job `CI` (Node do `.nvmrc`, cancela execução anterior do mesmo PR)
- [x] Definir como o build roda no CI sem as variáveis reais (ex.: valores fictícios só para o build) → `DATABASE_URL` e `DIRECT_URL` fictícias no nível do job (`example.com`); o `env.ts` valida o formato, e o build não consulta o banco
- [x] Tornar o CI obrigatório na proteção das branches → check `CI` exigido em `main` e `develop`
- [x] Aprovar os scripts de instalação (`allowScripts` no `package.json`): `prisma`, `@prisma/engines` e `unrs-resolver`, que o npm 12 passa a bloquear por padrão
### 6. `feature/setup-deploy`
- [ ] Criar o projeto na Vercel ligado ao repositório (`daily-coffee-store`)
- [ ] Variáveis de ambiente: Production → Neon `main`; Preview → Neon `dev`
- [ ] Build com `prisma migrate deploy` antes do `next build`
- [ ] URL fixa para a branch `develop` (staging)
- [ ] Corrigir metadados herdados da landing: endereço único (Rua Capitão Macedo, 450) e `canonical`/`og:url` com o domínio novo
- [ ] `robots.txt` (via `app/robots.ts`) bloqueando `/api/` para buscadores
- [ ] Bloquear a indexação de staging (`noindex`), para o Google não indexar a URL da `develop` como uma cópia do site
### 7. `feature/setup-docs`
- [ ] `README.md` inicial: sobre o projeto, stack, como rodar localmente
- [ ] `.env.example` com todas as variáveis (sem valores reais)
- [ ] ADRs em `docs/adr/`:
  - 001 — Next.js full-stack com Route Handlers (sem back-end separado e sem Server Actions para dados)
  - 002 — Arquitetura em camadas
  - 003 — Sessão no banco em vez de JWT
  - 004 — Autenticação própria + Arctic
  - 005 — CPF fora do banco
  - 006 — Pix e cartão, sem boleto
  - 007 — Categorias como enum
  - 008 — Imagens no Cloudinary com URL no banco
  - 009 — Branches do Neon por ambiente
- [ ] Preencher a Parte 2 deste documento
---
 
## Endpoints
 
| Método | Rota | Acesso | Resposta |
|---|---|---|---|
| GET | `/api/health` | Público | `200 { status: "ok" }` ou `503 { status: "error" }` |
 
---
 
## Testes
 
### Unitários (Vitest)
- `formatPrice(1400)` → `"R$ 14,00"`
- `formatPrice(0)` → `"R$ 0,00"`
- `formatPrice(123456)` → `"R$ 1.234,56"`
- `health.service` retorna `ok` quando o repository responde
- `health.service` retorna erro quando o repository falha
### Postman
- `GET /api/health` em local, staging e produção
- Criar a collection `docs/postman/daily-coffee-store.postman_collection.json`
- Variável `baseUrl` **já inclui `/api`**; requisições usam `{{baseUrl}}/health`
- Ambientes do Postman (exportados em `docs/postman/`):
  - Local: `http://localhost:3000/api`
  - Staging: URL fixa da `develop` + `/api`
  - Produção: `https://daily-coffee-store.vercel.app/api` (ou o domínio definido pela Vercel)
### Checklist manual
- [ ] `npm run dev` funciona e o visual da landing está intacto
- [ ] Lint, format:check, typecheck, test e build passam localmente
- [ ] Remover uma variável do `.env` faz o projeto falhar com mensagem clara
- [ ] O PR gera preview na Vercel
- [x] **Um PR com teste quebrado é bloqueado** (quebrar de propósito, confirmar e reverter) → provado no PR #7 (CI falhou, `mergeStateStatus: BLOCKED`, merge recusado; fechado sem merge)
- [ ] Staging usa o Neon `dev` e produção usa o Neon `main`
- [ ] `/api/health` responde `ok` em staging e produção
- [ ] `/robots.txt` em produção bloqueia `/api/`; staging não é indexável
---
 
## Critério de pronto
 
- `develop` e `main` publicadas na Vercel
- `/api/health` respondendo nos dois ambientes, cada um com seu banco
- CI obrigatório e comprovadamente bloqueando PR com erro
- README, `.env.example` e ADRs no repositório
---
 
# Parte 2 — Registro
 
> Preencher ao concluir a etapa.
 
## O que mudou em relação ao plano
 
## Problemas encontrados e soluções
 
## Aprendizados