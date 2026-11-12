# ADR 002 — Arquitetura em camadas

- **Status:** Aceita (implementada na Etapa 1)
- **Data:** 2026-11-12
- **Origem:** SPEC §4 "Arquitetura"

## Contexto

O Next.js não impõe organização no back-end. Sem regra, lógica de negócio acaba espalhada em `route.ts`, consultas ao banco aparecem em qualquer lugar e testar regra de negócio exige subir HTTP e banco.

## Decisão

Fluxo fixo: `route.ts → middleware (quando houver) → controller → service → repository → banco`.

- **route.ts:** só liga o método HTTP ao controller.
- **controller:** lê e valida a entrada com Zod, chama o service e monta a resposta.
- **service:** regras de negócio; não conhece `Request`, `Response` nem status HTTP.
- **repository:** único lugar que usa o Prisma.
- Erros do domínio estendem `AppError` (`message`, `code`, `kind`), sem status. O `withErrorHandler` traduz `kind` em status e devolve 500 genérico para o inesperado. Controllers não têm try/catch.
- Tudo em `src/server/` importa `server-only`.

## Alternativas consideradas

- **Lógica direto no `route.ts`:** menos arquivos, mas mistura HTTP, regra e banco; difícil de testar e de reutilizar.
- **Service falando direto com o Prisma (sem repository):** aceitável em projeto pequeno, mas o repository é a fronteira do banco que permite simular os dados nos testes.
- **Organização por feature (`features/orders/...`):** boa com muitas features. Hoje são poucas, e a separação por camada é mais fácil de explicar. Reavaliar se cada feature crescer muito.

## Consequências

- **Ganha:** regra de negócio testável com Vitest sem HTTP nem banco (repository simulado); status HTTP decidido num só lugar; trocar o banco mexe só no repository.
- **Perde:** mais arquivos por endpoint, mesmo nos simples (o `/api/health` tem quatro); exige disciplina para não pular camadas.
