# ADR 009 — Branches do Neon por ambiente

- **Status:** Aceita (implementada na Etapa 1)
- **Data:** 2026-11-12
- **Origem:** SPEC §10 e §11

## Contexto

Há três ambientes (local, staging e previews, produção). Testes e migrations em desenvolvimento não podem afetar os dados de produção, e o projeto precisa caber no plano gratuito.

## Decisão

Um projeto no Neon com duas branches de banco:

| Ambiente | Branch do Neon |
|---|---|
| Produção (`main` na Vercel) | `production` |
| Staging (`develop`), previews de PR e local | `dev` |

- A aplicação usa a URL **com pooler** (`DATABASE_URL`); as migrations usam a URL **direta** (`DIRECT_URL`).
- Na Vercel, as variáveis são separadas por ambiente (Production e Preview).
- As migrations rodam no **build da Vercel**: `prisma migrate deploy && next build` (`vercel.json`).

## Alternativas consideradas

- **Um banco só:** mais simples, mas qualquer teste mexeria nos dados reais.
- **Um projeto Neon por ambiente:** isolamento total, mas mais configuração e sem a cópia instantânea de dados que as branches oferecem.
- **Integração Neon + Vercel com uma branch por preview:** cada PR teria seu banco, mas cria e apaga branches automaticamente e complica o projeto agora.

## Consequências

- **Ganha:** produção isolada; staging e local compartilham um banco de teste sem custo; migrations aplicadas automaticamente a cada deploy.
- **Perde / risco conhecido:** previews de PR também rodam o migrate no banco `dev` compartilhado. Quando dois PRs abertos tiverem migrations diferentes, um pode quebrar o outro. Solução quando isso começar a acontecer: rodar o migrate só na produção e na `develop`, ou adotar uma branch por preview, registrada em um novo ADR.
