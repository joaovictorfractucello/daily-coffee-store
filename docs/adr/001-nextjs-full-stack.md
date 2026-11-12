# ADR 001 — Next.js full-stack com Route Handlers REST

- **Status:** Aceita (implementada na Etapa 1)
- **Data:** 2026-11-12
- **Origem:** SPEC §4 "Decisão: projeto único"

## Contexto

O projeto precisa de interface (loja e painel) e de uma API (catálogo, carrinho, pedidos, webhook do Asaas). É mantido por uma pessoa, hospedado em plano gratuito, e a API precisa ser testável no Postman.

## Decisão

Um único projeto Next.js para front-end e back-end, com um único deploy na Vercel. Toda operação de dados passa por **Route Handlers REST** (`app/api/.../route.ts`). **Server Actions não são usadas para dados.**

## Alternativas consideradas

- **Back-end separado (Express ou Nest) + front-end Next.js:** separação mais clara, mas dois deploys, CORS, duas configurações de ambiente e o dobro de manutenção para um projeto solo.
- **Server Actions:** menos código para formulários, mas não são endpoints HTTP comuns: não dá para testar no Postman nem documentar como API REST.

## Consequências

- **Ganha:** um repositório, um deploy, tipos compartilhados entre front e back, API testável no Postman.
- **Perde:** front e back sobem juntos (um erro no build trava os dois). Escalar só o back-end, ou servir outro cliente pesado, exigiria separar o projeto.
