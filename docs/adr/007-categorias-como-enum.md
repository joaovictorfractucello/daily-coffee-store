# ADR 007 — Categorias como enum

- **Status:** Aceita (implementação na Etapa 2)
- **Data:** 2026-11-12
- **Origem:** SPEC §2 (backlog) e data-model §2

## Contexto

Os produtos se dividem em poucas categorias (cafés, bebidas geladas, salgados, doces), que quase nunca mudam numa cafeteria.

## Decisão

Categoria é o enum `ProductCategory` do Prisma (`CAFES`, `BEBIDAS_GELADAS`, `SALGADOS`, `DOCES`). Os rótulos de tela ficam num mapa no código. Nova categoria = alteração no enum + migration.

## Alternativas consideradas

- **Tabela `Category` com CRUD no painel:** o admin cria categorias sozinho, mas exige tela, API, validação e regra para categoria sem produto. Fica no backlog.
- **Texto livre no produto:** simples, mas permite "Cafés" e "cafes" como categorias diferentes.

## Consequências

- **Ganha:** valores garantidos pelo banco e pelo TypeScript; nenhuma tela extra.
- **Perde:** criar categoria exige deploy com migration. Aceitável porque o cardápio muda pouco. Se passar a mudar com frequência, trocar pela tabela (novo ADR).
