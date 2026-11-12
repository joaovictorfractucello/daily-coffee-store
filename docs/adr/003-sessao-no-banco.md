# ADR 003 — Sessão no banco em vez de JWT

- **Status:** Aceita (implementação na Etapa 4)
- **Data:** 2026-11-12
- **Origem:** SPEC §5 "Autenticação"

## Contexto

Clientes e administradores precisam continuar logados entre requisições, e uma sessão precisa poder ser encerrada na hora (logout, troca de senha, conta comprometida).

## Decisão

Sessão salva no banco (tabela `Session`), identificada por um token aleatório enviado em cookie `httpOnly`, `secure` e `sameSite`. O banco guarda **só o hash** do token. Sem JWT.

## Alternativas consideradas

- **JWT sem estado:** dispensa consulta ao banco, mas não dá para revogar antes de expirar sem montar uma lista de bloqueio, o que traz o banco de volta com mais complexidade.
- **Biblioteca pronta (Auth.js, Clerk):** menos código, mas esconde justamente o que o projeto quer mostrar e aprender (ver ADR 004).

## Consequências

- **Ganha:** logout e revogação imediatos; modelo simples de entender; um vazamento do banco não entrega tokens usáveis (só hashes).
- **Perde:** uma consulta ao banco por requisição autenticada; a limpeza de sessões expiradas fica por nossa conta.
