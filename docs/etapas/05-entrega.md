# Etapa 5 — Entrega e retirada

> Local no repositório: `docs/etapas/05-entrega.md`
> Status: **em andamento** (código pronto; falta staging e release)

---

# Parte 1 — Plano

## Objetivo

Deixar pronto o que o checkout (Etapa 6) precisa: **onde a loja entrega e quanto custa** e **os endereços salvos do cliente**. Já nesta etapa, o cliente cadastra endereços na conta e calcula a entrega no carrinho pelo CEP.

## Escopo

- Cidades atendidas e taxas (`DeliveryCity`), pelo seed: cidade de São Paulo e as 7 do ABC ([ADR 012](../adr/012-taxa-de-entrega-por-cidade.md))
- Consulta de CEP no ViaCEP, pelo servidor
- `GET /api/delivery/quote?cep=`: endereço do CEP, se a loja entrega e a taxa
- Endereços salvos (`Address`): listar, criar, editar, tornar padrão e apagar, sempre do próprio usuário
- Telas `/conta/enderecos`, `/conta/enderecos/novo` e `/conta/enderecos/[id]`; item "Endereços" do menu da conta deixa de ser "Em breve"
- "Calcular entrega" no resumo do carrinho

## Fora do escopo

- Escolha entre entrega e retirada, telefone e pedido: Etapa 6
- Cadastro e edição das cidades pelo admin: Etapa 7
- Taxa por distância ou por zona dentro de São Paulo; cache das consultas ao ViaCEP: só se o uso pedir

## Decisões

| Decisão | Motivo |
|---|---|
| Taxa **por cidade**, não por bairro ([ADR 012](../adr/012-taxa-de-entrega-por-cidade.md)) | Com SP + ABC, a lista de bairros seria enorme e o nome do ViaCEP nem sempre bate com o cadastrado: cliente dentro da área seria recusado por grafia |
| ViaCEP consultado **só pelo servidor**, atrás de `lookupCep` | A cidade que define a taxa vem de uma fonte que o navegador não controla; trocar de provedor não mexe em quem usa |
| Ao salvar, o servidor **consulta o CEP de novo** e usa a cidade e a UF do ViaCEP | A tela pode ser adulterada: um endereço de Campinas não pode ser salvo como "São Paulo" |
| Cidade comparada sem acento e sem maiúscula | "Sao Paulo" e "São Paulo" são a mesma cidade |
| Fora da área: **não salva** e oferece retirada | Todo endereço salvo serve para entrega; o checkout não precisa tratar o caso |
| Rua e bairro editáveis; cidade e UF só leitura | CEPs de cidade pequena vêm sem rua; a cidade é o que define a taxa e não pode ser trocada |
| Até 10 endereços por pessoa; o primeiro vira padrão; apagar o padrão promove o mais recente | Teto contra abuso; sempre há um padrão para o checkout |
| Endereço de outra pessoa responde `404` | Não revela que o id existe (IDOR) |
| `GET /api/delivery/quote` público, com limite de 30 por minuto por IP | Calcular entrega no carrinho não exige login; cada chamada vai ao ViaCEP |
| CEP e endereço **fora do log** | Dado pessoal; erros do ViaCEP registram só o tipo |
| Escolha entre entrega e retirada fica no checkout | Depende de login, endereço e telefone, que só se juntam ali; o carrinho mostra só a estimativa |

## Cidades e taxas (seed)

| Cidade | Taxa |
|---|---|
| São Paulo | R$ 6,00 |
| São Caetano do Sul | R$ 8,00 |
| Santo André, São Bernardo do Campo, Diadema | R$ 10,00 |
| Mauá | R$ 12,00 |
| Ribeirão Pires | R$ 14,00 |
| Rio Grande da Serra | R$ 15,00 |

---

## Tarefas (commits direto na `develop`)

- [x] Documentação (este documento, SPEC §2/§6/§13, `data-model.md`, ADR 012)
- [x] Schema + migration (`DeliveryCity`, `Address`) e seed das cidades
- [x] ViaCEP (`lookupCep`), `deliveryService` e `GET /api/delivery/quote`, com testes
- [x] `addressService` e rotas de endereços, com testes (inclusive IDOR)
- [x] Telas de endereços na conta
- [x] "Calcular entrega" no carrinho
- [x] Postman (pasta "Entrega e endereços")

---

## Endpoints

| Método | Rota | Acesso | Resposta |
|---|---|---|---|
| GET | `/api/delivery/quote?cep=` | Público | `200 { address, delivery: { available, city, feeInCents } }` · `400 INVALID_INPUT` · `404 CEP_NOT_FOUND` · `503 CEP_UNAVAILABLE` |
| GET | `/api/addresses` | Logado | `200 { addresses }` |
| POST | `/api/addresses` | Logado | `201 { address }` · `422 DELIVERY_UNAVAILABLE` · `409 ADDRESS_LIMIT` |
| PATCH | `/api/addresses/:id` | Logado | `200 { address }` · `404` · `422 DELIVERY_UNAVAILABLE` |
| POST | `/api/addresses/:id/default` | Logado | `200 { address }` · `404` |
| DELETE | `/api/addresses/:id` | Logado | `204` · `404` |

Limites de tentativas (`429` com `Retry-After`): cotação, 30 por minuto por IP; criar e editar endereço, 30 a cada 15 minutos por pessoa. Tornar padrão e apagar não consultam o ViaCEP e ficam só atrás do login.

---

## Checklist manual

- [x] CEPs reais: São Paulo (01303-000), Santo André (09010-000), Rio Grande da Serra (09450-000, sem rua no CEP), Campinas (13010-000, fora da área), inexistente (404)
- [x] Conta: listar, adicionar, editar, tornar padrão e apagar (local)
- [x] Outro usuário não acessa o endereço de ninguém (`404`)
- [x] Carrinho: calcular entrega dentro e fora da área (local)
- [x] Celular e desktop; sem erro no console (local)
- [ ] Os mesmos testes no staging, pelo celular

---

## Critério de pronto

- Endereços e cálculo de entrega funcionando em local e no staging
- Testes unitários das regras e Postman cobrindo as rotas
- Seed das cidades rodado em produção depois da release

---

# Parte 2 — Registro

> Preenchida com o que já foi feito. Falta: commits, push para a `develop`, checklist no staging, release e seed das cidades em produção.

## O que mudou em relação ao plano

- **Erros novos:** `UNPROCESSABLE` (`422`) e `UNAVAILABLE` (`503`) entraram nos `kind` do `AppError`.
- **Limite também nas escritas de endereço** (`addressWritePerUser`, 30 a cada 15 minutos): criar e editar consultam o ViaCEP, então o login e o teto de 10 não bastavam para conter abuso.
- **`apiRequest`** (`src/lib/api-client.ts`): chamada à API pela tela com o resultado já tratado (`ok`, `code`, `retryAfterSeconds`), usado pelas telas de endereços e pelo carrinho.
- **Apelido do endereço** (`AddressLabel`: Casa, Trabalho ou Outro, com nome livre em Outro), pedido depois de ver a primeira versão, com referência nos apps de entrega. Migration `address_label`, só com colunas novas e padrão `OTHER`.
- **Lista de endereços redesenhada** (referência: [Beat, Saved places](https://dribbble.com/shots/20026793-Beat-Saved-Places)): um card por endereço com miniatura de mapa, ícone e apelido no título, endereço em uma linha com reticências e ações num menu "⋯" (editar, tornar padrão, apagar com confirmação na mesma linha). O mapa é uma ilustração genérica (`public/images/enderecos/mapa.webp`), não o mapa real do endereço: isso exigiria mandar o endereço a um serviço de mapas.
- **Resumo do carrinho redesenhado** (referência: [Shopping Cart Order Summary](https://dribbble.com/shots/26943878-Shopping-Cart-Order-Summary)): pesos mais leves e "Continuar comprando" no resumo e no topo (este só a partir do tablet). "Calcular entrega" abre um campo (no lugar do cupom da referência), a linha Entrega aparece sempre ("—", valor ou "Indisponível" em vermelho) e, dentro da área, entra o total estimado. Os itens em cards foram testados e voltaram para as linhas com divisória, que ficaram melhores.
- **Vermelho de erro como token** (`--color-danger` e `--color-danger-ink`): estava escrito na mão em 5 arquivos, com dois tons. O "fora da área" do carrinho passou a ser vermelho.
- **Ilustrações dos estados** (geradas com IA no estilo de figurinha da marca, componente `StateIllustration`, imagens em `public/images/estados/`): carrinho vazio, endereços vazios, busca sem resultado, e-mail enviado (cadastro e esqueci a senha), tudo certo (e-mail confirmado e senha alterada), link expirado, página não encontrada e erro. A de "Meus pedidos" vazio fica guardada para a Etapa 6.
- **Páginas 404 e de erro próprias:** `app/not-found.tsx` (link inexistente e `notFound()` de produto e endereço, com cabeçalho e rodapé da loja) e `(store)/error.tsx` (com "Tentar de novo"). A home e as telas de login continuam com a página de erro padrão: no topo da home o cabeçalho é transparente e ficaria ilegível sobre a página de erro.
- **Estado vazio ocupa a tela no celular:** o rodapé só aparece depois de rolar (`emptyStateScreenClass`).

## Problemas encontrados e soluções

- **Carrinho estourando a largura em telas pequenas:** a grade do carrinho no celular tinha uma coluna automática que crescia até caber o campo de CEP com "Calculando..." (422 px numa tela de 320). Corrigido com `grid-cols-1` (coluna que respeita a tela) e largura fixa no botão.
- **Imagem gerada com xadrez desenhado:** uma ilustração veio sem transparência, com o xadrez pintado no fundo. O fundo foi removido a partir das bordas (só pixels claros e acinzentados; o contorno escuro segura o preenchimento). Conferir a transparência antes de usar.
- **Imagem trocada com o mesmo nome:** o otimizador de imagens do Next guarda cópias pelo endereço e continuou mostrando a antiga. Localmente, apagar `.next/cache/images`; na Vercel cada deploy começa sem esse cache.
- **Classe própria no `globals.css` descartada:** uma regra em `@layer components` com `@media` não chegou ao CSS final no Tailwind 4. Trocada por classes do próprio Tailwind numa constante.
- **Cliente do Prisma desatualizado:** o `prisma migrate dev` do Prisma 7 não gera o cliente. O seed falhou até rodar `npx prisma generate`, e o `npm run dev` aberto antes respondeu `500` até ser reiniciado.
- **Lint do React 19 (`set-state-in-effect`):** o formulário marcava "carregando" dentro do efeito. Agora o resultado guarda de qual CEP ele é, e o "carregando" é derivado (CEP completo sem resultado).
- **Acento quebrado no teste por `curl`:** o Git Bash do Windows manda o corpo fora de UTF-8. Não era o app: pelo Node, "Consolação" chega certo.
- **Testes de tela num build de produção:** depois de uma migration, o `npm run dev` aberto responde `500` até ser reiniciado (cliente do Prisma antigo). Para não depender disso, os testes das telas novas rodaram num `next start` em outra porta.
- **Recarga em loop no `npm run dev`:** com um arquivo de teste temporário em `src/`, a página recompilava e recarregava sem parar. Parou ao tirar o arquivo (a causa exata não foi confirmada). Lição: arquivo temporário de teste fica fora de `src/` enquanto o servidor de desenvolvimento está aberto.

## Aprendizados

- **ViaCEP:** CEP inexistente volta com `200` e `{ "erro": "true" }`, e não `404`. CEP geral de cidade pequena vem sem rua e sem bairro.
- **Proteção contra outro site (CSRF):** escrita sem cabeçalho `Origin` passa de propósito (Postman, `curl`); com `Origin` de outro site, o proxy responde `403`. Junto com o cookie `sameSite`, cobre o navegador da vítima.
