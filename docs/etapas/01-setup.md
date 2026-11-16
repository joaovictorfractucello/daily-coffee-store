# Etapa 1 — Setup
 
> Local no repositório: `docs/etapas/01-setup.md`
> Status: **concluída** (2026-11-12)
 
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
- [x] Criar o projeto na Vercel ligado ao repositório (`daily-coffee-store`) → plano Hobby, preset Next.js, Node 24.x, região das funções `iad1` (mesma do Neon, us-east-1)
- [x] Variáveis de ambiente: Production → Neon `main`; Preview → Neon `dev` → `DATABASE_URL` e `DIRECT_URL` em cada ambiente da Vercel (valores só no painel)
- [x] Build com `prisma migrate deploy` antes do `next build` → `vercel.json`; `migrate deploy` sem a pasta `migrations` termina com código 0 (testado no Neon `dev`)
- [x] URL fixa para a branch `develop` (staging) → `daily-coffee-store-staging.vercel.app` ligado à branch `develop`; previews e staging sem login da Vercel (decisão: público, com `noindex`)
- [x] Corrigir metadados herdados da landing: endereço único (Rua Capitão Macedo, 450) e `canonical`/`og:url` com o domínio novo → descrição do SEO usa `site.address`; `site.url` = `https://daily-coffee-store.vercel.app`
- [x] `robots.txt` (via `app/robots.ts`) bloqueando `/api/` para buscadores → `src/app/robots.ts` (teste em `robots.test.ts`)
- [x] Bloquear a indexação de staging (`noindex`), para o Google não indexar a URL da `develop` como uma cópia do site → `VERCEL_ENV !== production` gera `noindex` e `Disallow: /`
### 7. `feature/setup-docs`
- [x] `README.md` inicial: sobre o projeto, stack, como rodar localmente
- [x] `.env.example` com todas as variáveis (sem valores reais)
- [x] ADRs em `docs/adr/` (com um `README.md` explicando o formato):
  - 001 — Next.js full-stack com Route Handlers (sem back-end separado e sem Server Actions para dados)
  - 002 — Arquitetura em camadas
  - 003 — Sessão no banco em vez de JWT
  - 004 — Autenticação própria + Arctic
  - 005 — CPF fora do banco
  - 006 — Pix e cartão, sem boleto
  - 007 — Categorias como enum
  - 008 — Imagens no Cloudinary com URL no banco
  - 009 — Branches do Neon por ambiente
- [x] Preencher a Parte 2 deste documento
- [x] Collection e ambientes do Postman em `docs/postman/`
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
- [x] `npm run dev` funciona e o visual da landing está intacto (HTML e CSS do build comparados na `setup-english`)
- [x] Lint, format:check, typecheck, test e build passam localmente
- [x] Remover uma variável do `.env` faz o projeto falhar com mensagem clara
- [x] O PR gera preview na Vercel (check `Vercel` nos PRs desde o #9)
- [x] **Um PR com teste quebrado é bloqueado** (quebrar de propósito, confirmar e reverter) → provado no PR #7 (CI falhou, `mergeStateStatus: BLOCKED`, merge recusado; fechado sem merge)
- [x] Staging usa o Neon `dev` e produção usa o Neon `production` (variáveis separadas por ambiente no painel da Vercel)
- [x] `/api/health` responde `ok` em staging e produção
- [x] `/robots.txt` em produção bloqueia `/api/`; staging não é indexável (`Disallow: /` e `noindex`)
---
 
## Critério de pronto
 
- `develop` e `main` publicadas na Vercel
- `/api/health` respondendo nos dois ambientes, cada um com seu banco
- CI obrigatório e comprovadamente bloqueando PR com erro
- README, `.env.example` e ADRs no repositório
---
 
# Parte 2 — Registro

## O que mudou em relação ao plano

| Ponto | Plano | Como ficou | Motivo |
|---|---|---|---|
| Proteção de `main` e `develop` | Ligada desde a tarefa 0 | Desligada no início (projeto solo) e religada na tarefa 5, no padrão de mercado: PR obrigatório, check `CI`, branch atualizada, conversas resolvidas, vale para admins, sem force-push, 0 aprovações | O check obrigatório só pode ser ligado depois que o workflow existe |
| Inglês no código | Traduzir todos os identificadores | URLs públicas continuam em português: âncoras (`#queridinhos`), rotas futuras (`/cardapio`) e arquivos de `public/` | São parte da URL que o visitante vê; regra registrada no `CLAUDE.md` |
| `typecheck` | `tsc --noEmit` | `next typegen && tsc --noEmit` | O tipo `LayoutProps` é gerado pelo Next; sem o `typegen` o CI falharia |
| Prettier | Configuração padrão | `endOfLine: auto` | O git no Windows grava CRLF na pasta local; no repositório tudo fica LF |
| Pastas de `src/server/` | Criar todas | Criadas com o primeiro arquivo de cada uma | Sem pasta vazia nem `.gitkeep` |
| Variáveis de ambiente | `.env.local` | Um único `.env` | O Prisma 7 não lê `.env` sozinho; um arquivo só para Next e Prisma |
| Validação do env | `z.url()` | URL Postgres completa (protocolo, usuário, senha, banco) | O `z.url()` aceitava o texto de exemplo do `.env` |
| Prisma | "Versão atual" | Fixado em `7.10.1` | O `latest` do npm aponta para uma RC 8.x |
| `@types/node` | 20 (herdado) | 24 | O Vitest 5 exige 22 ou superior; 24 é o Node do projeto |
| Scripts de instalação | — | `allowScripts` no `package.json` para `prisma`, `@prisma/engines` e `unrs-resolver` | O npm 12 bloqueia scripts de instalação não aprovados |
| Branch de produção do Neon | `main` | `production` | Nome padrão criado pelo Neon; mesma função |
| Staging | Preview da `develop` | Domínio fixo `daily-coffee-store-staging.vercel.app`, **público**, com `noindex` e `robots.txt` bloqueando tudo | Asaas e webhook vão precisar de URL pública fora da produção |
| Comentários no código | — | Código gerado sem comentários; nomes descrevem o que fazem | Decisão do João: cada arquivo faz uma coisa e se explica pelo nome |
| Fluxo de trabalho | `feature/*` → PR para `develop` → PR para `main` | Depois da etapa: commits direto na `develop`, `main` só por PR com CI obrigatório | Projeto solo: mais ágil; a rede de segurança é a `main` protegida. Regras no SPEC §10 |
| Testes | `formatPrice` e `health.service` | Também `withErrorHandler` e `robots` | O handler já tinha tido um defeito; toda regra nova vem com teste |

## Problemas encontrados e soluções

| Problema | Causa | Solução |
|---|---|---|
| `typecheck` falhava com `Cannot find name 'LayoutProps'` | O tipo é gerado pelo Next no build | `next typegen` antes do `tsc` |
| `format:check` acusava arquivos sem mudança | CRLF na cópia local (Windows, `autocrlf=true`) | `endOfLine: auto` no Prettier |
| Renomeação para inglês podia quebrar o visual sem erro de build | Classes do Tailwind ficam em dois lugares (CSS e JSX) | Renomeação por script + comparação do HTML e do CSS gerados antes e depois (0 diferenças) |
| Atributos `data-*` e uma variável de ambiente escaparam da renomeação | Atributos JSX são código, não string; o TypeScript não pega | Busca específica depois do script |
| `withErrorHandler` registrava um erro no build | O `try/catch` engolia sinais internos do Next (`connection()` na pré-renderização) | `unstable_rethrow` antes de tratar o erro; teste cobre o caso |
| `/api/health` seria pré-renderizado no build | `cacheComponents` pré-renderiza `GET` que não lê a requisição | `connection()` no controller |
| `npm i prisma` instalaria versão incompatível | `latest` do pacote `prisma` aponta para uma RC | Versões exatas `7.10.1` |
| `ERESOLVE` ao instalar o Vitest 5 | `@types/node` 20 herdado da landing | Subir para `@types/node` 24 |
| `/api/health` respondia 503 localmente | `.env` ainda com texto de exemplo | Diagnóstico sem expor credenciais; validação estrita no `env.ts` para falhar cedo |
| Push recusado ao criar `.github/workflows/ci.yml` | Credencial em cache (outra conta) sem o escopo `workflow` | `git -c credential.helper= push` com token de escopo `workflow`; usuário do GitHub fixado na configuração local do repositório |
| `npm test` falhava com `Cannot read properties of undefined (reading 'config')` | VS Code abre a pasta como `c:\dev\...` (drive minúsculo) e o Vitest carrega duas cópias de si mesmo no Windows | Rodar a partir de `C:\dev\daily-coffee-store` (maiúsculo); o CI (Linux) não é afetado |
| `migrate deploy` sem migrations poderia quebrar o build | Comportamento não documentado | Testado no Neon `dev`: termina com código 0 |

## Aprendizados

- O fluxo `feature/* → develop → main` com PR, CI e proteção de branch funciona bem mesmo sozinho: o CI pegou o teste quebrado de propósito e bloqueou o merge.
- Validar o ambiente na inicialização economiza tempo: o erro aparece no `dev` e no `build`, não na primeira consulta.
- Testar o caminho de falha (503 sem detalhes, erro interno do Next passando adiante) encontrou defeitos que o caminho de sucesso não mostrava.
- Conferir a documentação da versão instalada (Prisma 7, Next 16, Vercel) evitou configuração antiga.
- Mudança grande sem efeito visual se verifica comparando a saída gerada (HTML e CSS), não só pelo build.
- Credenciais e dados do banco nunca passam pelo chat: o diagnóstico usa só o formato das URLs.

## Pendências para as próximas etapas

- Previews de PR rodam o migrate no Neon `dev` compartilhado (ADR 009): rever quando houver dois PRs com migrations.
- `gh` sem o escopo `workflow`: pushes que mexem em `.github/workflows/` precisam do token com esse escopo.
- Plano Hobby da Vercel é só para uso não comercial: migrar para o Pro antes de vender de verdade.