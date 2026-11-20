# ADR 011 — Limite de tentativas guardado no Postgres

- **Status:** Aceita (implementação na Etapa 4)
- **Data:** 2026-11-20
- **Origem:** SPEC §5 (Autenticação)

## Contexto

Login, cadastro, recuperação de senha e reenvio de e-mail precisam de limite de tentativas contra força bruta e *credential stuffing* (senhas vazadas de outros sites testadas em massa). Na Vercel cada requisição pode cair numa instância diferente, então contar na memória do servidor não funciona: cada instância teria a própria contagem.

## Decisão

A contagem fica numa tabela `RateLimit` no Postgres (Neon), com janela fixa: uma linha por chave (`key` única, `count`, `resetAt`). Cada tentativa faz um único `INSERT … ON CONFLICT DO UPDATE … RETURNING`, que é atômico: duas requisições ao mesmo tempo não contam errado.

- A chave guarda só hashes (`login:ip-email:<sha256>`), nunca o IP ou o e-mail em texto (LGPD).
- O limite é por IP + e-mail **e** por IP, sem bloquear a conta: bloquear a conta deixaria o atacante travar a vítima de propósito.
- Linhas vencidas são apagadas no próprio consumo, de vez em quando.
- O acesso fica atrás de `rateLimiter.consume(rule, identifier)`, para trocar a origem sem mexer em quem usa.

## Alternativas consideradas

- **Upstash Redis:** padrão de mercado e mais rápido, mas é mais um serviço, mais um segredo e mais um ponto de falha para um portfólio.
- **Memória do servidor:** não funciona em serverless.
- **Firewall da Vercel:** limita por IP, mas não por e-mail, e fica fora do código (não é testável nem visível no portfólio).

## Consequências

- **Ganha:** nenhum serviço novo; regra testável; fácil de explicar.
- **Perde:** uma escrita no banco por tentativa. Com tráfego alto, trocar para Redis atrás da mesma interface.
