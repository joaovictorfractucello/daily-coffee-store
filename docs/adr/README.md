# ADRs — Architecture Decision Records

Um ADR registra **uma decisão de arquitetura**: o problema, o que foi escolhido, o que ficou de fora e o preço da escolha. Serve para entender o desenho do projeto daqui a meses e para não rediscutir o que já foi pesado.

Vira ADR a decisão difícil de reverter ou que alguém questionaria. Detalhe pequeno fica no código ou no SPEC.

## Formato

Cada arquivo tem: **Status · Data · Origem · Contexto · Decisão · Alternativas consideradas · Consequências**.

Status possíveis: *Aceita*, *Substituída por ADR-xxx*, *Descartada*. Um ADR não é reescrito quando a decisão muda: cria-se um novo que o substitui.

## Lista

| ADR | Decisão | Situação |
|---|---|---|
| [001](001-nextjs-full-stack.md) | Next.js full-stack com Route Handlers REST | Implementada |
| [002](002-arquitetura-em-camadas.md) | Arquitetura em camadas | Implementada |
| [003](003-sessao-no-banco.md) | Sessão no banco em vez de JWT | Etapa 4 |
| [004](004-autenticacao-propria-arctic.md) | Autenticação própria + Arctic | Etapa 4 |
| [005](005-cpf-fora-do-banco.md) | CPF fora do banco | Etapa 6 |
| [006](006-pix-e-cartao-sem-boleto.md) | Pix e cartão, sem boleto | Etapa 6 |
| [007](007-categorias-como-enum.md) | Categorias como enum | Etapa 2 |
| [008](008-imagens-no-cloudinary.md) | Imagens no Cloudinary com URL no banco | Etapa 7 |
| [009](009-branches-do-neon-por-ambiente.md) | Branches do Neon por ambiente | Implementada |
