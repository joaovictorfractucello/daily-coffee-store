# Etapa 2 — Catálogo

> Local no repositório: `docs/etapas/02-catalogo.md`
> Status: **em andamento**

---

# Parte 1 — Plano

## Objetivo

Levar o catálogo para o banco: tabela `Product`, primeira migration, seed com o cardápio completo, API REST de leitura e as páginas da loja (`/cardapio` e `/cardapio/[slug]`). A home passa a mostrar os destaques vindos do banco.

## Escopo

- Modelo `Product` (com o campo novo `isFeatured`) e migration
- Seed idempotente com 17 produtos em 4 categorias, rodando no build da Vercel
- API: `GET /api/products` (filtros por categoria e destaque) e `GET /api/products/:slug`
- Home: seção "Mais pedidos" lendo os destaques do banco
- Página `/cardapio` (por categoria) e página de produto `/cardapio/[slug]`
- Novo cabeçalho (estilo Header 3 do 21st.dev, recriado no projeto): links centralizados, dropdown de categorias, busca que abre para a esquerda e ícones de perfil e cesta
- Remoção do cardápio em PDF e dos produtos fixos no código
- Testes unitários, collection do Postman e checklist manual

## Fora do escopo

- CRUD de produtos e upload de fotos (Etapa 7)
- Carrinho (Etapa 3); os botões de WhatsApp continuam até o checkout (Etapa 6)
- Paginação (poucos produtos), estoque e busca por sugestões ao digitar
- Cache das páginas de produto (quando houver edição pelo admin, com invalidação)

## Decisões

| Decisão | Motivo |
|---|---|
| Campo `isFeatured` no `Product` | O admin (Etapa 7) escolhe os destaques sem deploy. Registrado no `data-model.md` |
| Frappé em "Bebidas geladas" + 2 bebidas novas | O PDF tinha 3 categorias; o enum tem 4 e nenhuma deve ficar vazia |
| Seed só cria o que falta (`upsert` com `update: {}`) | Pode rodar a cada deploy sem desfazer edições futuras do admin |
| Seed no build da Vercel (`migrate deploy && db seed && next build`) | Staging e produção recebem os produtos sem ninguém manusear a URL de produção |
| Páginas leem pelo service, não pela própria API | Server Components já estão no servidor; uma chamada HTTP para si mesmo seria uma ida e volta inútil |
| Listas de produtos renderizadas a cada requisição (`connection()` + `Suspense`) | O build (inclusive o do CI, com banco fictício) não consulta o banco |
| Ordem: categoria (ordem do enum) e preço crescente | Igual ao cardápio em PDF; reproduz a ordem atual dos destaques |
| Busca sem acento nem maiúscula, feita no service em memória | São poucos produtos e o Postgres só faria isso com a extensão `unaccent`; passa a valer a pena revisar com centenas de itens |
| Perfil e cesta visíveis, sem ação | Login é a Etapa 4 e carrinho a Etapa 3; ganham destino nelas |
| Menu hambúrguer vale até `lg` (1024px) | A busca precisa de espaço ao lado dos links; a barra fixa do WhatsApp acompanha |
| Foto por `imageUrl`; caminho local inexistente vira bloco vazio | 12 produtos ainda sem foto; as fotos entram em `public/images/produtos/<slug>.webp` sem mudar o banco |

---

## Tarefas (commits direto na `develop`)

### 1. Documentação
- [x] Este documento
- [x] `isFeatured` no `data-model.md`
- [x] Decisão "páginas leem pelo service" no SPEC §4

### 2. Modelo
- [x] `Product` no `schema.prisma` (campos do `data-model.md`), índice em `(isActive, category)`
- [x] Migration `create_products`, aplicada e conferida no Neon `dev`

### 3. Seed
- [x] `prisma/seed.ts` + `prisma/seed-data/products.ts` com os 17 produtos, idempotente (rodado três vezes no Neon `dev`: sempre 17)
- [x] `tsx` para executar o seed (script de instalação do `esbuild` aprovado no `allowScripts`); configuração no `prisma.config.ts`
- [x] Build da Vercel: `prisma migrate deploy && prisma db seed && next build`

### 4. Regras (service) e testes
- [x] `product.repository`: `findActive({ category?, featured? })`, `findActiveBySlug(slug)`
- [x] `product.service`: `list(filters)`, `getBySlug(slug)` → `ProductNotFoundError`
- [x] `ValidationError` e `parseInput` (Zod → erro do domínio)
- [x] `product.validator` (query: `category`, `featured`; slug com formato e tamanho)
- [x] `product.presenter` (só campos públicos)
- [x] Testes unitários (31 no total)

### 5. API e Postman
- [x] `product.controller` e rotas `/api/products` e `/api/products/[slug]`
- [x] Pasta "Produtos" na collection do Postman (6 requisições com testes)

### 6. Interface
- [x] Home: "Mais pedidos" a partir do banco, cards levando à página do produto
- [x] `/cardapio` por categoria, com âncoras em português
- [x] `/cardapio/[slug]`, com `notFound()` e título do produto
- [x] Links "Ver cardápio" e menu para `/cardapio`; JSON-LD com o novo endereço
- [x] Remover `public/cardapio.pdf`, `src/data/menu.ts`, `menuPdfUrl` e as imagens de produto do registro fixo
- [x] Grupos de rotas `(home)` e `(store)`: o cabeçalho recebe a variante (transparente sobre o hero ou sólido) sem ler a URL
- [x] Cabeçalho novo: dropdown de categorias (sem ícones), lupa com busca que abre para a esquerda, ícones de perfil e cesta (Phosphor, sem ação por enquanto), WhatsApp só na gaveta e na barra do celular
- [x] Busca: `GET /api/products?q=`, `/cardapio?q=` com resultados e mensagem de lista vazia (sem acento, nome ou descrição); testes e Postman

- [x] Home enxuta: hero, atalhos de categoria (`Categories`) e "Mais pedidos"; saem Promoção, Quem somos, Visitar e a faixa final do WhatsApp
- [x] Página `/sobre` com Quem somos, endereço, horário e mapa; menu e rodapé apontam para ela
- [x] Barra de navegação fixa no celular (Início, Cardápio, Carrinho, Perfil) no lugar do menu hambúrguer; busca na primeira linha do cabeçalho

### 7. Fechamento
- [ ] Checklist manual
- [ ] Parte 2 deste documento
- [ ] Release `develop` → `main`

---

## Seed

| Categoria | Produto | Preço | Destaque |
|---|---|---|---|
| Cafés | Espresso | R$ 7,00 | |
| Cafés | Espresso duplo | R$ 9,00 | |
| Cafés | Café coado na hora | R$ 12,00 | |
| Cafés | Cappuccino cremoso | R$ 14,00 | ✓ |
| Bebidas geladas | Café gelado com leite | R$ 15,00 | |
| Bebidas geladas | Cold brew | R$ 16,00 | |
| Bebidas geladas | Frappé de chocolate | R$ 18,00 | ✓ |
| Salgados | Pão na chapa | R$ 9,00 | |
| Salgados | Pão de queijo quentinho | R$ 13,00 | ✓ |
| Salgados | Croissant de manteiga | R$ 16,00 | ✓ |
| Salgados | Misto quente | R$ 18,00 | |
| Salgados | Quiche de alho-poró | R$ 22,00 | |
| Doces | Cookie de chocolate | R$ 10,00 | |
| Doces | Pudim de leite | R$ 12,00 | |
| Doces | Brownie com nozes | R$ 14,00 | |
| Doces | Bolo de cenoura com chocolate | R$ 15,00 | ✓ |
| Doces | Torta de limão | R$ 17,00 | |

Itens, preços e descrições fictícios.

---

## Endpoints

| Método | Rota | Acesso | Resposta |
|---|---|---|---|
| GET | `/api/products` | Público | `200 [produto]` (ativos, ordenados) |
| GET | `/api/products?category=CAFES` | Público | `200` filtrado · `400 { error: { code: "INVALID_INPUT" } }` se a categoria não existe |
| GET | `/api/products?featured=true` | Público | `200` só destaques |
| GET | `/api/products/:slug` | Público | `200 produto` · `404 { error: { code: "PRODUCT_NOT_FOUND" } }` |

Produto na resposta: `id, name, slug, description, priceInCents, imageUrl, category, isFeatured`. Nunca `isActive` nem datas.

---

## Testes

### Unitários (Vitest)
- `product.service`: repassa os filtros ao repository
- `product.service`: `getBySlug` devolve o produto
- `product.service`: `getBySlug` lança `ProductNotFoundError` quando o produto não existe
- `parseInput` + `product.validator`: categoria inválida → `ValidationError`; `featured` vira booleano; query vazia é válida
- `product.presenter`: só os campos públicos saem

### Postman
- Pasta "Produtos": listar, filtrar por categoria, destaques, categoria inválida (400), por slug (200), slug inexistente (404)
- Testes automáticos de status e formato

### Checklist manual
- [ ] Home igual à anterior, com os 5 destaques vindos do banco
- [ ] `/cardapio` com 4 categorias e 17 produtos na ordem certa; âncoras funcionando
- [ ] `/cardapio/cappuccino-cremoso` abre; `/cardapio/nao-existe` dá 404
- [ ] Celular e desktop
- [ ] Staging e produção com os 17 produtos depois do deploy

---

## Critério de pronto

- Produtos vindo do banco em staging e produção
- API de produtos respondendo, com 400 e 404 tratados
- Testes unitários e collection do Postman cobrindo os endpoints
- PDF e produtos fixos no código removidos

---

# Parte 2 — Registro

> Preencher ao concluir a etapa.

## O que mudou em relação ao plano

## Problemas encontrados e soluções

## Aprendizados
