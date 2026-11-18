# Etapa 3 — Carrinho

> Local no repositório: `docs/etapas/03-carrinho.md`
> Status: **concluída**

---

# Parte 1 — Plano

## Objetivo

Carrinho funcionando sem login: o cliente adiciona produtos pela página do produto, vê o total de unidades na cesta do cabeçalho e revisa o pedido em `/carrinho`. O carrinho fica no navegador e guarda só ids e quantidades. Preço, nome e foto vêm sempre do servidor ([ADR 010](../adr/010-carrinho-no-navegador.md)).

## Escopo

- Estado do carrinho no navegador (Zustand com persistência no localStorage)
- `POST /api/cart/quote`: confere o carrinho e calcula o subtotal com os preços do banco
- Cesta do cabeçalho vira link para `/carrinho`, com contador de unidades
- Página do produto: "Adicionar ao carrinho" e "Comprar agora" funcionando
- Página `/carrinho`: itens com foto, nome, preço unitário e total; quantidade editável; remover; subtotal; estados vazio, carregando e erro
- Testes unitários e pasta "Carrinho" no Postman

## Fora do escopo

- Taxa de entrega (Etapa 5): a página avisa "calculada no checkout"
- Finalizar o pedido: depende de login (Etapa 4) e pagamento (Etapa 6). "Finalizar pedido" aparece "em breve"
- Botão rápido de carrinho nos cards de produto (registrado no SPEC como ideia futura)
- Carrinho no servidor (ADR 010)
- Limite de requisições na rota: ela só lê e a entrada é limitada. Entra junto com o de login (Etapa 4)

## Decisões

| Decisão | Motivo |
|---|---|
| `POST /api/cart/quote` com `{ items: [{ productId, quantity }] }` | Só lê, mas a lista vai no corpo: GET não tem corpo e a URL teria limite de tamanho |
| Resposta com `items` (produto público, quantidade, total), `unavailableProductIds` e `subtotalInCents` | A tela não decide nada. O produto desativado ou inexistente volta separado, para a tela tirá-lo do carrinho e avisar |
| Repetidos no corpo são somados, com teto de 99 | O carrinho do navegador não manda repetidos, mas o servidor não confia nele |
| Até 50 itens por requisição; `productId` no formato cuid; quantidade inteira de 1 a 99 | Lista de permitidos: entrada fora do formato nem chega ao banco |
| Adicionar produto que já está no carrinho soma as quantidades, até 99 | Comportamento esperado. Ao bater no teto, aparece "Limite de 99 por item" |
| Contador e página só desenham o carrinho depois de ler o localStorage (`skipHydration`) | O servidor não conhece o carrinho. Desenhar antes daria diferença entre o HTML do servidor e o do navegador (erro de hidratação) |
| Itens do localStorage passam por `sanitizeCartItems` | O localStorage pode ser editado à mão: só entram itens com formato certo, sem repetidos e com quantidade de 1 a 99 |
| A lista do servidor é pedida de novo só quando muda o conjunto de produtos | Mudar a quantidade não faz requisição. O total da tela usa o preço que o servidor devolveu; o pedido recalcula tudo no servidor |
| Outra aba mudou o carrinho → a aba atual relê o localStorage | Uma aba não sobrescreve o carrinho da outra |
| Controle de quantidade extraído para `QuantityStepper` | Segundo uso real (página do produto e carrinho) |
| `/carrinho` com `noindex` | Página pessoal, sem conteúdo útil para busca |
| zustand fixado na 5.0.16, não na 5.1.0 | A 5.1.0 tinha menos de duas semanas de publicada: cautela com a cadeia de dependências |

---

## Tarefas (commits direto na `develop`)

### 1. Documentação
- [x] Este documento
- [x] SPEC: regras do carrinho (rota, soma até 99, página) e botão rápido nos cards no backlog
- [x] ADR 010 (carrinho no navegador, checkout recalculado no servidor)

### 2. Modelo
- [x] Sem tabela nova. `product.repository.findActiveByIds(ids)`

### 3. Regras e testes
- [x] `src/lib/cart.ts`: somar, mudar quantidade, remover, contar, limpar o que veio do localStorage, somar para a tela
- [x] `cart.service.quote`: preço do banco, repetidos somados até 99, indisponíveis separados, subtotal
- [x] Testes: `cart.test.ts`, `cart.service.test.ts`, `cart.validator.test.ts`

### 4. API e Postman
- [x] `cart.validator`, `cart.presenter`, `cart.controller` e `POST /api/cart/quote`
- [x] Pasta "Carrinho" na collection do Postman (6 requisições com testes)

### 5. Interface
- [x] `src/stores/cart-store.ts` (Zustand + persist) e `useCartHydrated`
- [x] Cesta do cabeçalho com contador (`HeaderCartLink`)
- [x] Página do produto: adicionar e comprar agora
- [x] Página `/carrinho` (`CartView`, `CartLine`, `CartSkeleton`)

### 6. Fechamento
- [x] Checklist manual
- [x] Parte 2 deste documento
- [x] Release `develop` → `main`

---

## Endpoint

| Método | Rota | Acesso | Resposta |
|---|---|---|---|
| POST | `/api/cart/quote` | Público | `200 { items, unavailableProductIds, subtotalInCents }` · `400 { error: { code: "INVALID_INPUT" } }` |

Corpo: `{ "items": [{ "productId": "…", "quantity": 2 }] }`. Qualquer outro campo, como um preço, é descartado.

---

## Testes

### Unitários (Vitest)
- `cart`: soma ao adicionar, teto de 99, repetidos juntados na ordem, quantidade de 1 a 99, limpeza do localStorage, remover e contar, soma da tela
- `cartService.quote`: preço do banco, repetidos somados até 99 com uma consulta, indisponíveis separados, carrinho vazio sem consulta
- `cartQuoteSchema`: descarta campos extras, aceita vazio, recusa quantidade 0, 100, 1.5 e texto, id fora do formato, mais de 50 itens e corpo sem `items`

### Postman
- Carrinho válido, preço enviado ignorado, produto indisponível, quantidade 0 e 100 (400), JSON inválido (400)

### Checklist manual
- [x] Adicionar 2 unidades: botão mostra "Adicionado ao carrinho" e a cesta mostra 2; adicionar de novo soma
- [x] Teto de 99 com aviso "Limite de 99 por item"
- [x] "Comprar agora" adiciona e abre `/carrinho`
- [x] No carrinho: mudar quantidade e remover atualizam totais e contador; recarregar mantém o carrinho
- [x] Carrinho vazio com link para o cardápio
- [x] localStorage editado (preço falso, quantidade 500, id inexistente): preço do banco, quantidade 99 e aviso de indisponível
- [x] API fora do ar: mensagem e "Tentar de novo"
- [x] Celular e desktop; teclado e leitor de tela no controle de quantidade e no remover
- [x] Sem erro de hidratação no console

---

## Pontos para a Etapa 6

- O preço pode mudar entre o carrinho e o pagamento. O checkout recalcula no servidor e deve avisar a diferença antes de cobrar (por exemplo, recebendo o total que o cliente viu e respondendo `409` se mudou).
- O checkout reaproveita `cartService.quote` e o `cartQuoteSchema`.

---

## Critério de pronto

- Carrinho funcionando sem login, mantido ao recarregar
- `POST /api/cart/quote` respondendo, com `400` tratado e preço sempre do banco
- Testes unitários e Postman cobrindo a rota

---

# Parte 2 — Registro

## O que mudou em relação ao plano

- **Cartão do item:** a lixeira ficou só com o ícone, no canto superior direito. A quantidade ficou embaixo à esquerda e o total do item embaixo à direita, igual em todas as telas. A foto é quadrada (1:1).
- **Resumo:** card com borda arredondada (`1.25rem`, o mesmo dos cards de categoria), alinhado ao primeiro item e fixo (`sticky`) a partir de `lg`.
- **Início no menu de baixo:** ao voltar para o início depois de trocar de aba, a página abria nas categorias. Corrigido com um `scrollTo` depois da navegação (o Next restaura o scroll antigo).
- **Fora do plano, só registrado:** cupom de desconto entrou no backlog do SPEC.

## Problemas encontrados e soluções

- **Erro de hidratação evitado:** o servidor não conhece o carrinho. Contador e página só desenham depois de ler o localStorage (`skipHydration` + `useCartHydrated`).
- **localStorage editado à mão:** `sanitizeCartItems` descarta item fora do formato e limita a quantidade a 1–99. Testado com preço falso, quantidade 500 e id inexistente: o preço vem do banco e o item inexistente sai com aviso.
- **Foto esticada:** o `aspect-square` perdia para o alinhamento do flex. Resolvido com `self-start`.
- **Next 16.4.2 com aviso de segurança** (cache em `'use cache'`): a correção é a 16.4.6, fora da faixa fixada. Não atualizado nesta etapa; fazer em commit separado, testando antes.

## Aprendizados

- Preço, nome e foto vêm sempre do servidor: o carrinho do navegador guarda só `productId` e `quantity` (ADR 010).
- Regra de negócio no service (`cartService.quote`) deixa o checkout da Etapa 6 reaproveitar o cálculo.
- Pendências conhecidas: sem limite de requisições em `/api/cart/quote` (entra com o login, Etapa 4) e o preço pode mudar entre o carrinho e o pagamento (tratar na Etapa 6).
