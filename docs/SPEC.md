# Daily Coffee — E-commerce
 
> Documento vivo que guia o desenvolvimento do projeto.
> Toda decisão nova ou alterada deve ser registrada aqui antes de virar código.
 
---
 
## 1. Visão geral
 
E-commerce da **Daily Coffee**, cafeteria fictícia na Vila Mariana (São Paulo).
O projeto nasce da landing page já existente (`daily-coffee-cafeteria.vercel.app`), que será clonada e usada como base visual e como **home** da loja.
 
**Objetivo:** projeto de portfólio para apresentar a clientes e recrutadores.
Apesar de fictício, **deve ser pensado como um produto real**: regras de negócio coerentes com uma cafeteria, segurança, tratamento de erros, documentação e testes.
 
**Princípios:**
- Simplicidade antes de complexidade. Nada de funcionalidade só porque "parece legal".
- Toda ferramenta deve ter **plano gratuito**.
- Arquitetura clara e bem documentada (é um dos pontos de destaque do portfólio).
- Testes nos **pontos críticos**, não em tudo.
---
 
## 2. Funcionalidades (escopo)
 
### Cliente
- Catálogo de produtos (vindo do banco, não mais fixo no código)
- Busca de produtos pelo nome ou descrição (sem acento nem maiúscula)
- Carrinho (não exige login)
- Checkout (exige login)
- Cadastro e login (e-mail/senha + Google)
- Verificação de e-mail e recuperação de senha
- Checkout com pagamento (Asaas sandbox)
- Escolha entre **entrega** ou **retirada no balcão**
- Histórico de pedidos
### Administrador
- CRUD de produtos
- Cadastro de bairros atendidos e suas taxas de entrega
- Lista de pedidos e mudança de status
### Regras do carrinho
- Fica no **navegador (localStorage)**. Carrinho de visitante não ocupa servidor nem banco. Guarda só `productId` e `quantity`; nome, foto e preço vêm do servidor. Migrar para o servidor (conta logada, com merge no login) só quando houver multi-dispositivo ou aviso de carrinho abandonado: veja o [ADR 010](adr/010-carrinho-no-navegador.md).
- Pode ser montado sem login. O login é pedido só ao finalizar.
- **O servidor nunca confia no front-end.** Na finalização, recebe apenas IDs e quantidades, busca os preços no banco, confere se os produtos estão ativos e recalcula o total.
- **Quantidade por item: de 1 a 99** (`src/lib/quantity.ts`, a mesma constante na tela e no servidor). Adicionar um produto que já está no carrinho soma as quantidades, até 99.
- **Conferência no servidor:** `POST /api/cart/quote` recebe `{ items: [{ productId, quantity }] }` (até 50 itens), devolve os produtos com o preço do banco, o total de cada item, o subtotal e os ids indisponíveis (desativados ou inexistentes), que a tela tira do carrinho com aviso. Regra em `cartService.quote`, reaproveitada pelo checkout na Etapa 6.
- **Página `/carrinho`:** itens com foto, preço, quantidade editável e botão de remover; subtotal; a taxa de entrega aparece só no checkout. Página com `noindex`.
### Status do pedido
Máquina de estados: cada status só pode avançar para os permitidos. Regras no service, com testes unitários.
 
| Transição | Quem faz |
|---|---|
| Aguardando pagamento → Pago | Sistema (webhook do Asaas) |
| Aguardando pagamento → Cancelado (pagamento expirou) | Sistema (webhook do Asaas) |
| Pago → Em preparo | Admin |
| Em preparo → Saiu para entrega / Pronto para retirada | Admin |
| Saiu para entrega / Pronto para retirada → Entregue | Admin |
 
O admin **não** marca pedidos como pagos e **não** cancela pedidos já pagos no MVP.
 
### Fora do escopo (backlog / ideias futuras)
- Cancelamento de pedido já pago, com estorno via Asaas
- Categorias gerenciadas pelo admin (trocar o enum `ProductCategory` por uma tabela `Category` com CRUD no painel)
- Envio nacional de café em grão/kits via Melhor Envio (faria sentido só se a loja vendesse produtos embalados)
- Outros provedores de login além do Google
- **Cupom de desconto** (planejar com calma depois das 8 etapas). Pontos a decidir: tabela `Coupon` (código, tipo percentual ou valor fixo, validade, limite de usos, ativo); desconto calculado só no servidor (`cartService.quote` e checkout), copiado no pedido como snapshot; se vale sobre a taxa de entrega; valor mínimo do pedido; uso único por cliente. Riscos: código adivinhável e uso repetido (limite de tentativas na rota) e total negativo ou abaixo do mínimo do Pix/cartão (teste obrigatório)
- Botão rápido de carrinho nos cards de produto (adiciona 1 unidade sem abrir o produto). Exige mudar o card, que hoje é um link inteiro
- **2FA para o cliente** (app autenticador, opcional). Obrigatório para cliente derrubaria a conversão. O 2FA do admin está na Etapa 7
- **Trocar senha e e-mail logado**, pedindo a senha atual de novo (*step-up*) e encerrando as outras sessões
- Lista de "dispositivos conectados" com opção de encerrar cada sessão
---
 
## 3. Stack
 
| Camada | Tecnologia |
|---|---|
| Framework | **Next.js 16** (front + back no mesmo projeto), React 19, TypeScript |
| Estilo | **Tailwind CSS v4** (herdado da landing) |
| Componentes (principalmente admin) | **shadcn/ui** |
| Animações | **Motion** (herdado da landing) |
| Ícones | **Phosphor Icons** (herdado da landing; único pacote de ícones do projeto) |
| Formulários | **React Hook Form + Zod** (mesmos schemas do back-end) |
| Estado do carrinho | **Zustand** (com persistência no localStorage) |
| Notificações | **Sonner** |
| API | Route Handlers (`/api/...`) no padrão REST |
| Banco | PostgreSQL no **Neon** |
| ORM | **Prisma** |
| Autenticação | Implementação própria (sessão no banco) + **Arctic** para OAuth do Google |
| Pagamento | **Asaas** (sandbox) |
| E-mail | **Nodemailer + Gmail** (senha de app) |
| Validação de dados | **Zod** (inclusive das variáveis de ambiente) |
| Formatação de código | **Prettier** + `prettier-plugin-tailwindcss` |
| Testes unitários | **Vitest** |
| Testes de API | **Postman** (collection versionada no repositório) |
| Hospedagem | **Vercel** |
| CI | **GitHub Actions** |
| Imagens dos produtos | Iniciais geradas com IA (Gemini); uploads do admin no **Cloudinary**, com a URL salva no banco |
 
---
 
## 4. Arquitetura
 
### Decisão: projeto único (Next.js full-stack)
Um único projeto e um único deploy. Sem back-end separado.
Server Actions **não** serão usadas para a API, porque não podem ser testadas no Postman. Toda operação de dados passa por Route Handlers REST.
 
### Decisão: arquitetura em camadas
Inspirada no padrão usado com Express (routes, controllers, services, repositories e middlewares), adaptada ao Next.js.
Nome correto: **arquitetura em camadas** (*layered architecture*), não MVC.
 
### Fluxo de uma requisição
```
route.ts → middleware (quando necessário) → Controller → Service → Repository → Banco
```
 
### Responsabilidade de cada camada
 
| Camada | Responsabilidade | Não pode |
|---|---|---|
| **route.ts** | Ligar o método HTTP ao controller | Ter lógica |
| **Middleware** | Autenticação e permissão | Ter regra de negócio |
| **Controller** | Ler a requisição, validar a entrada (Zod), chamar o service, transformar erros em status HTTP | Acessar o banco |
| **Service** | Regras de negócio | Conhecer HTTP (request, response, status) |
| **Repository** | Acessar o banco via Prisma | Ter regra de negócio |
 
**Regra principal:** o service não sabe que HTTP existe. Ele recebe dados simples e lança erros do domínio (ex.: `ProductNotFoundError`). O controller transforma esses erros em status HTTP (ex.: 404). Isso deixa os services fáceis de testar com Vitest.
 
### Rotas
No Next.js, a rota é definida pela estrutura de pastas (`app/api/products/route.ts` → `/api/products`).
O `route.ts` deve ser fino: apenas exporta os métodos ligados ao controller.
 
```ts
// app/api/products/route.ts
export const GET = productController.list
export const POST = withAuth(productController.create, { role: 'ADMIN' })
```
 
### Páginas (leitura de dados)
Server Components leem dados chamando o **service** direto, a mesma camada que o controller usa. Não fazem `fetch` para a própria API: estão no mesmo servidor, e a chamada HTTP seria uma ida e volta inútil. A API REST continua sendo o caminho para clientes externos, o carrinho no navegador e o Postman.

### Middlewares
- **Global** (`proxy.ts`, nome usado no Next.js 16 para o antigo `middleware.ts`): um único arquivo que roda antes de todas as requisições. Apenas checagens leves, como redirecionar para o login quando não há cookie de sessão.
- **Por rota:** funções que envolvem o controller, no estilo do Express. Ex.: `withAuth(handler, { role: 'ADMIN' })` valida a sessão no banco e o papel do usuário, e responde 401 (não autenticado) ou 403 (sem permissão).
### Erros
- Classe base `AppError` com `message`, `code` (erro exato, ex.: `PRODUCT_NOT_FOUND`) e `kind` (categoria do domínio: `NOT_FOUND`, `CONFLICT`, `VALIDATION`, `UNAUTHORIZED`, `FORBIDDEN`). Sem status HTTP. Erros específicos do domínio em `server/errors/`.
- Tratamento centralizado em `server/errors/error-handler.ts`: wrapper `withErrorHandler(handler)` usado no `route.ts`, com o mapa `kind → status HTTP` tipado como `Record<ErrorKind, number>`. Erros inesperados viram 500 sem expor detalhes internos. Controllers não precisam de try/catch.
### Serviços externos
E-mail e pagamento ficam atrás de **interfaces**, com implementações trocáveis.
Exemplo: `EmailService` com implementação `GmailEmailService` hoje e `ResendEmailService` no futuro, sem o resto do sistema saber qual está em uso.
 
### Home e página Sobre
A home é uma **vitrine curta**, não uma landing: hero, atalhos de categoria e "Mais pedidos". O cliente já conhece a loja e vem para comprar.
"Quem somos", endereço, horário e mapa ficam em `/sobre`. A promoção do combo sai da home e volta como banner no hero promocional (a definir).

### Cardápio e página do produto
- **`/cardapio`** mostra todas as categorias, cada uma em uma fileira (no celular, a fileira rola de lado). Os botões de categoria no topo são **filtros**: clicar leva a **`/cardapio/<categoria>`** (ex.: `/cardapio/cafes`), que mostra só os produtos daquela categoria em grade. Clicar de novo no botão ativo volta para `/cardapio`. Os links de categoria do cabeçalho, da home e da página do produto usam o mesmo endereço (`menuCategoryLink`).
- **Mesma rota para categoria e produto:** `/cardapio/[slug]` serve as duas coisas. O slug de categoria vence, então **nenhum produto pode ter o slug de uma categoria** (`cafes`, `bebidas-geladas`, `salgados`, `doces`). Um teste confere o seed; o CRUD de produtos (Etapa 7) precisa rejeitar esses slugs.
- **Busca:** `/cardapio?q=termo` mostra os resultados da busca, sem categorias.
- **Título e caminho:** com uma categoria aberta, o caminho "Início > Cardápio > Cafés" aparece acima do título (o item atual em negrito). Na página do produto, "Início > Cardápio > Cafés > Nome do produto". É o componente `Breadcrumb`.
- **Página do produto:** caminho, foto, nome, preço, quantidade, "Adicionar ao carrinho", "Comprar agora", descrição e **produtos relacionados** (outros produtos ativos da mesma categoria, em fileira que rola; regra em `productService.listRelated`).
- **Carrinho (Etapa 3):** "Adicionar ao carrinho" soma a quantidade escolhida ao carrinho e mostra "Adicionado ao carrinho" por 2 segundos; a cesta do cabeçalho mostra o total de unidades. "Comprar agora" adiciona e leva a `/carrinho` (vai direto ao checkout quando ele existir, na Etapa 6).
- **WhatsApp:** saiu da página do produto. Continua no hero promocional e no rodapé.
- **Barra de baixo no celular:** Início, Cardápio, Pedidos ("em breve") e Perfil (leva a `/conta`; sem sessão, ao login, que volta para lá). O ícone do Cardápio é um livro aberto.

### Estrutura de pastas
```
src/
├── app/
│   ├── (home)/            → home (cabeçalho transparente sobre o hero)
│   ├── (store)/           → páginas da loja (cardápio, produto, sobre...)
│   └── api/               → route.ts (rotas)
└── server/
    ├── controllers/
    ├── services/
    ├── repositories/
    ├── middlewares/       → withAuth etc.
    ├── validators/        → schemas Zod
    ├── errors/            → AppError e erros do domínio
    └── lib/               → prisma, email, asaas
```
Tudo em `server/` roda apenas no servidor, garantido com o pacote `server-only`.
 
---
 
## 5. Autenticação
 
### Decisões
- **Sessão salva no banco** + cookie `httpOnly`, `secure` e `sameSite`. Sem JWT.
  Motivo: mais simples de entender e permite encerrar sessões na hora.
- **Sem lib de autenticação completa.** Feito na mão para aprendizado.
- **Arctic** cuida apenas do protocolo OAuth do Google (link de login, validação do retorno com `state`/PKCE, troca do código). Depois disso o fluxo volta para o nosso código.
### Responsabilidades da implementação própria
- Hash de senha (argon2 ou bcrypt)
- Criação, validação, expiração e encerramento de sessões
- Middleware que identifica o usuário pelo cookie
- Verificação de e-mail no cadastro
- Recuperação de senha com token de uso único e com expiração
- Limite de tentativas de login
- Papéis: `CUSTOMER` e `ADMIN`
### Vinculação de contas (Google + e-mail/senha)
Mesma pessoa = mesma conta, desde que:
- o e-mail da conta local esteja **verificado**; e
- o Google informe que o e-mail dele é **verificado**.
Sem essas duas condições, **não vincula** (evita tomada de conta).

**Exceção, decidida na Etapa 4 (pré-sequestro de conta):** se a conta local **não** está verificada e o Google diz que o e-mail **é** verificado, o Google provou quem é o dono do e-mail. A conta é vinculada e marcada como verificada, e **a senha e as sessões existentes são apagadas**. Sem isso, alguém poderia cadastrar o e-mail de outra pessoa com uma senha própria, esperar a vítima entrar com o Google e usar a senha para entrar na conta já confirmada (*account pre-hijacking*).
 
Modelo:
- `User`: a pessoa. Senha **opcional** (quem só usa Google não tem senha).
- `OAuthAccount`: formas de login externas ligadas ao usuário (provedor + id no provedor).

### Ameaças e defesas (Etapa 4)
A autenticação foi desenhada a partir dos ataques, não das telas. Detalhes em `docs/etapas/04-autenticacao.md`.

| Ameaça | Defesa |
|---|---|
| Vazamento do banco | Senha com **argon2id** (parâmetros da OWASP). Tokens de sessão e de e-mail salvos só como SHA-256 |
| Força bruta e *credential stuffing* | Limite por IP + e-mail **e** por IP, sem bloquear a conta ([ADR 011](adr/011-rate-limit-no-postgres.md)). Recusa de senha que já vazou (Have I Been Pwned, por *k-anonymity*) |
| Descobrir quem tem conta (enumeração) | Mensagens genéricas. Cadastro com e-mail já usado responde igual e avisa por e-mail. Hash de uma senha falsa quando o e-mail não existe, para o tempo de resposta ser igual |
| Roubo ou fixação de sessão | Cookie `__Host-session` (`httpOnly`, `secure`, `sameSite=lax`). Sessão nova a cada login. Redefinir a senha encerra todas |
| CSRF | `sameSite=lax` + `proxy.ts` recusando escrita em `/api` com `Origin` de outro site |
| Link de e-mail reaproveitado | Token de 32 bytes, com hash, uso único e expiração (24h na verificação, 30 min na redefinição). Confirmação por botão, porque robôs de e-mail abrem os links sozinhos |
| Redirecionamento para site falso | `?next=` aceito só como caminho interno |
| Retorno do Google forjado ou interceptado | `state` + PKCE (Arctic) em cookies `__Host-` de 10 min, apagados no primeiro uso. Exige `email_verified`. O `id_token` vem direto do Google por HTTPS, em troca do código, por isso não tem a assinatura conferida (caso aceito pela documentação do Google). Qualquer falha volta para o login com aviso genérico; o motivo vai só para o log |
| XSS | React escapa o texto; ESLint proíbe `dangerouslySetInnerHTML` |

### Regras
- **Senha:** de 8 a 128 caracteres, **sem** regra de maiúscula, número e símbolo (NIST 800-63B): essas regras levam a senhas previsíveis como `Senha@123`. Comprimento e a lista de senhas vazadas protegem mais. Se o Have I Been Pwned estiver fora do ar, o cadastro segue e o caso vai para o log.
- **E-mail:** sem espaços e em minúsculas antes de salvar e buscar.
- **Sem e-mail confirmado, sem login.** O aviso aparece só depois da senha certa, com botão para reenviar o link.
- **Sessão:** cliente 30 dias, renovada quando faltam menos de 15; `ADMIN` e `DEMO_ADMIN` 8 horas, sem renovação.
- **Limites de tentativas:** login 5 a cada 15 min por IP + e-mail e 30 por IP; cadastro 5 por hora por IP; recuperação e reenvio 3 por hora por e-mail e 10 por IP; confirmação de link 10 a cada 15 min por IP; `/api/cart/quote` 60 por minuto por IP. Estourou: `429` com `Retry-After`.
- **Log de segurança** (JSON): login, falha, limite atingido, cadastro, verificação, redefinição, Google e logout. Com id do usuário ou hash do e-mail e do IP; nunca senha, token ou cookie.
- **CSP e cabeçalhos de segurança ficam na Etapa 8.** A CSP com *nonce* obrigaria todas as páginas a serem geradas a cada visita e é incompatível com o Partial Prerendering (`cacheComponents`). O plano é uma CSP sem nonce, rígida no resto (`connect-src`, `frame-ancestors`, `form-action`, `base-uri`, `object-src`), testada antes em `Report-Only`. O SRI do Next fica para quando sair do experimental.
---
 
## 6. Entrega e retirada
 
- O cliente escolhe **entrega** ou **retirada no balcão**.
- Na entrega, o CEP preenche o endereço via **ViaCEP**.
- A **taxa de entrega é por bairro**, cadastrada pelo admin.
- Bairro não cadastrado: a loja informa que não entrega no local.
Motivo: produtos de cafeteria (bebidas, salgados) não são enviados por transportadora. A entrega é local, como em uma cafeteria real.
 
---
 
## 7. Pagamento
 
- **Asaas sandbox.**
- Formas de pagamento: **Pix e cartão de crédito**. Sem boleto (leva dias para compensar, incompatível com pedido de cafeteria).
- **CPF não é salvo no banco.** É pedido no primeiro checkout e enviado ao Asaas para criar o cliente; guardamos só o `asaasCustomerId`. CPF nunca vai para logs.
- **Dados de cartão não passam pelo nosso servidor** (padrão PCI): pagamento com cartão na página do Asaas. Detalhes definidos na etapa de pagamento.
- A confirmação do pagamento **vem sempre pelo webhook** do Asaas. O front-end nunca decide se um pedido foi pago.
- O webhook deve ser **idempotente**: receber o mesmo aviso duas vezes não pode processar o pedido duas vezes.
- Em desenvolvimento, usar um túnel (ngrok ou Cloudflare Tunnel) para o Asaas alcançar o localhost.
---
 
## 8. E-mail
 
- **Nodemailer + Gmail** (sem domínio próprio por enquanto).
- Usos: verificação de e-mail, recuperação de senha, confirmação de pedido.
- Implementado atrás da interface `EmailService` (ver Arquitetura).
- Motivo de não usar Resend agora: sem domínio verificado, ele só entrega para o e-mail do dono da conta.
---
 
## 9. Testes
 
Foco nos **pontos críticos**.
 
| Tipo | Ferramenta | O que cobre |
|---|---|---|
| Unitário | Vitest | Total do carrinho, taxa de entrega, transições de status do pedido, validações, hash de senha, sessão |
| API | Postman | Todos os endpoints (collection exportada em `docs/`) |
| Manual | Checklist por etapa | Interface, responsividade, fluxo de compra |
| E2E (opcional, futuro) | Playwright | Fluxo de compra completo |
 
---
 
## 10. Git, CI e deploy
 
### Branches
- `main`: produção. Só recebe código por PR vindo da `develop`.
- `develop`: onde o trabalho acontece (commits diretos, projeto com um único desenvolvedor) e homologação (staging), com URL fixa na Vercel.
- `feature/*`: opcional, para mudança grande ou arriscada que não deve parar no staging pela metade.
### Fluxo
```
develop (commits diretos) → CI avisa a cada push → staging
develop → PR para main    → CI obrigatório       → merge → produção
```
Depois de cada release, a `main` ganha um merge commit. Para não acumular diferença, a `develop` é adiantada até ela: `git merge --ff-only origin/main` e `git push`.

Antes de empurrar para a `develop`: rodar `lint`, `typecheck` e `test`, porque o push já publica o staging. Migration e troca de dependência se testam localmente antes do push (o staging roda `migrate deploy` no banco `dev`) ou vão numa `feature/*`.
 
### CI (GitHub Actions)
Roda a cada push na `develop` (só avisa, não bloqueia) e em todo PR para a `main` (obrigatório): install (`npm ci`), lint, `format:check`, typecheck, testes e build, nesta ordem. O build usa `DATABASE_URL` e `DIRECT_URL` fictícias, definidas no workflow. O job se chama `CI`.
 
### Proteção de branch
**`main`** (produção, padrão de mercado, valendo também para administradores):
- merge só via PR, sem exigir aprovação de revisor enquanto o projeto tem um único desenvolvedor (o GitHub não permite aprovar o próprio PR);
- o check `CI` precisa passar, e a branch precisa estar atualizada com a base;
- comentários do PR resolvidos antes do merge;
- sem force-push e sem exclusão da branch.

**`develop`:** push direto liberado; apenas sem force-push e sem exclusão. A rede de segurança é o CI obrigatório na `main`: a `develop` e o staging podem quebrar, a produção não.
 
### Deploy
Feito automaticamente pela integração Git da Vercel. Quem publica é o merge; o CI decide se ele pode acontecer.

| Momento | O que acontece |
|---|---|
| Push na `develop` | CI avisa e a Vercel publica o **staging** em `daily-coffee-store-staging.vercel.app` (banco Neon `dev`, `noindex`) |
| PR `develop` → `main` | CI obrigatório + **preview** do PR |
| Merge na `main` | **produção** em `daily-coffee-store.vercel.app` (banco Neon `production`) |

- O build roda `prisma migrate deploy` antes do `next build` (`vercel.json`).
- `VERCEL_ENV=production` é o que libera a indexação: só a produção tem `robots.txt` permitindo o site (e bloqueando `/api/`) e fica sem `noindex`. Staging e previews bloqueiam tudo. Staging e previews são públicos (sem login da Vercel), sem dados reais.
- O `canonical` e o `og:url` apontam sempre para o domínio de produção.
- Rollback: pelo painel da Vercel (Deployments → deploy anterior → Promote), e a correção entra por PR.
- Risco conhecido: previews de PR e o staging rodam as migrations no Neon `dev` compartilhado. Uma migration errada empurrada para a `develop` já altera o banco `dev`. Por isso migration se testa localmente antes do push.
- Plano Hobby da Vercel é só para uso não comercial: migrar para o Pro antes de vender de verdade.
 
---
 
## 11. Infraestrutura (tudo gratuito)
 
| Necessidade | Ferramenta |
|---|---|
| Hospedagem | Vercel |
| Banco | Neon |
| E-mail | Gmail via Nodemailer |
| Pagamento | Asaas sandbox |
| Endereço por CEP | ViaCEP |
| Túnel para webhook (dev) | ngrok ou Cloudflare Tunnel |
| CI | GitHub Actions |
| Fotos enviadas pelo admin | Cloudinary (upload assinado pelo servidor; a chave secreta nunca vai para o front) |
 
### Banco por ambiente (branches do Neon)
Cada ambiente usa um branch próprio do banco, para que mudanças de teste nunca afetem a produção.
 
| Ambiente | Branch do Neon |
|---|---|
| Produção (`main`) | `production` |
| Preview/staging (`develop` e PRs) | `dev` |
| Local | `dev` ou branch pessoal |
 
Na Vercel, a `DATABASE_URL` é configurada separadamente para Production e Preview.
 
### Migrations
- Rodam no **build da Vercel**: `prisma migrate deploy` antes do `next build`.
- A aplicação usa a URL com pooling do Neon; as migrations usam a URL direta.
**Comportamentos esperados do plano gratuito:**
- Vercel roda o back-end como serverless: pode haver um pequeno atraso na primeira requisição (cold start).
- Neon pausa o banco quando fica parado: a primeira consulta depois de um tempo é mais lenta.
---
 
## 12. Documentação
 
**Na raiz do repositório:**
- **README.md**: visão geral, como rodar, prints (o GitHub exibe na página inicial do repositório)
- **CLAUDE.md**: regras de trabalho para o Claude Code (lido automaticamente da raiz)
**Na pasta `docs/`:**
- **SPEC.md**: este arquivo
- **adr/** (Architecture Decision Records): uma decisão por arquivo, com contexto, decisão e motivo
- **etapas/**: um documento por etapa (`01-setup.md`, `02-catalogo.md`...), com duas partes:
  - **Plano (antes):** objetivo, escopo e fora do escopo, branches/tarefas, endpoints, testes (unitários, Postman, checklist manual) e critério de pronto.
  - **Registro (depois):** o que mudou em relação ao plano, problemas encontrados e como foram resolvidos, aprendizados.
Divisão de papéis: **SPEC** = visão do projeto inteiro · **ADR** = uma decisão de arquitetura · **Etapa** = plano e histórico de uma parte do desenvolvimento.
 
```
docs/
├── SPEC.md
├── data-model.md
├── adr/
├── etapas/
│   ├── 01-setup.md
│   └── ...
├── postman/
└── checklists/
```
- **data-model.md**: modelo de dados (tabelas, enums, relacionamentos, regras de dados pessoais)
- **Collection do Postman**
- **Checklists** de testes manuais e de segurança
---
 
## 13. Etapas
 
### Forma de trabalho: fatias verticais
Cada etapa entrega uma funcionalidade **completa**, do banco até a tela, e termina com algo funcionando, testado e publicável.
Front-end e back-end são feitos **juntos**, não em etapas separadas. Exceções: Etapa 1 (só infraestrutura) e Etapa 8 (ajustes gerais).
A ordem das etapas segue o caminho que o usuário percorre no site.
 
### Ordem dentro de cada etapa
1. Modelo (schema + migration)
2. Repository
3. Service + testes unitários
4. Controller + rota
5. Testes no Postman
6. Interface
7. Checklist manual do fluxo completo
### Branches por etapa
Cada etapa é dividida em várias branches `feature/*` pequenas (ex.: `feature/auth-register`, `feature/auth-google`), cada uma com seu PR.
 
### Lista de etapas
Cada etapa é planejada em detalhe antes de começar, em `docs/etapas/` (ver seção 12).
 
1. **Setup**: clonar a landing, repositório novo, estrutura de pastas, Neon + Prisma, CI, branches
2. **Catálogo**: modelo de produtos no banco, API e páginas; home adaptada para loja
3. **Carrinho**
4. **Autenticação**: cadastro, login, sessão, verificação de e-mail, recuperação de senha, Google
5. **Entrega e retirada**: bairros, taxas, endereço com ViaCEP
6. **Checkout e pagamento**: pedido, Asaas sandbox, webhook
7. **Painel administrativo**: produtos, bairros, pedidos e status; 2FA por app autenticador (TOTP) obrigatório para `ADMIN`; acesso do `DEMO_ADMIN`
8. **Polimento**: e-mails de pedido, revisão de segurança (CSP e cabeçalhos: HSTS, `nosniff`, `frame-ancestors`, `Permissions-Policy`), documentação final
---
 
## 14. Ajustes herdados da landing
 
- ~~A meta description cita "Rua das Acácias, 128", mas a página mostra "Rua Capitão Macedo, 450". Unificar.~~ Resolvido na Etapa 1: a descrição usa `site.address`.
- ~~`canonical` e `og:url` apontam para `example.com`. Corrigir para a URL real.~~ Resolvido na Etapa 1: `site.url` é `https://daily-coffee-store.vercel.app`.
---
 
## 15. Pendências (a discutir)
 
- [ ] **Admin de demonstração** (para recrutadores testarem a demo). Direção inicial:
  - papel `DEMO_ADMIN`, somente leitura, bloqueado no back-end (não só na interface);
  - enxerga apenas dados fictícios do seed (ex.: campo `isDemo`), nunca dados reais de visitantes (LGPD);
  - testes unitários garantindo o 403 em ações de escrita e o filtro de dados;
  - banner no site avisando que é ambiente de demonstração.
- [x] Criar o **CLAUDE.md** do projeto (regras de trabalho para o Claude Code; a seção 16 deste arquivo deve migrar para lá)
---
 
## 16. Como trabalhar neste projeto (orientações para a IA)
 
- O desenvolvedor **toma as decisões**. A IA sugere, explica e **aponta quando uma ideia é ruim**, com o motivo.
- O objetivo é **aprender**: explicar o porquê de cada trecho, não só entregar código.
- Preferir a solução simples. Se existir uma mais complexa, apresentá-la só como alternativa, dizendo quando valeria a pena.
- Não adicionar funcionalidades fora do escopo sem discutir antes.
- Respeitar as camadas: nada de regra de negócio no Route Handler, nada de Prisma fora do repository.
- Código de autenticação e pagamento exige atenção redobrada: explicar cada decisão de segurança.
- Toda decisão nova deve ser registrada neste arquivo e, se for de arquitetura, em um ADR.
 