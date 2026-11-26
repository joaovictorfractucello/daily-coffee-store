# Etapa 4 — Autenticação

> Local no repositório: `docs/etapas/04-autenticacao.md`
> Status: **em andamento**

---

# Parte 1 — Plano

## Objetivo

Cadastro com e-mail e senha, verificação de e-mail, login, logout, recuperação de senha e login com Google, com sessão no banco ([ADR 003](../adr/003-sessao-no-banco.md)) e OAuth pelo Arctic ([ADR 004](../adr/004-autenticacao-propria-arctic.md)). O checkout (Etapa 6) e o painel (Etapa 7) dependem disso.

A etapa foi desenhada a partir das **ameaças**: cada defesa existe por causa de um ataque concreto (SPEC §5, "Ameaças e defesas").

## Escopo

- Cadastro, verificação de e-mail, reenvio do link, login, logout, `GET /api/auth/me`
- Esqueci e redefinir senha
- Login com Google (Arctic), com as regras de vínculo e a defesa contra pré-sequestro de conta
- Limite de tentativas no Postgres ([ADR 011](../adr/011-rate-limit-no-postgres.md)), incluindo o `/api/cart/quote` (pendência da Etapa 3)
- Recusa de senha vazada (Have I Been Pwned)
- `withAuth`, `proxy.ts` (checagem de `Origin`), log de segurança
- Telas `/entrar`, `/cadastro`, `/verificar-email`, `/esqueci-senha`, `/redefinir-senha` e `/conta`; cabeçalho e "Perfil" da barra de baixo

## Fora do escopo

- 2FA: TOTP do admin na Etapa 7; do cliente no backlog
- CSP e cabeçalhos de segurança: Etapa 8 (motivo no SPEC §5)
- Trocar e-mail logado, lista de dispositivos: backlog (a troca de senha logado entrou nesta etapa, ver Parte 2)
- Telefone e `asaasCustomerId` no usuário: Etapa 6
- Acesso do `DEMO_ADMIN` e seed de admin: Etapa 7 (agora só o valor no enum)
- "Finalizar pedido" continua inerte até a Etapa 6

## Decisões

| Decisão | Motivo |
|---|---|
| argon2id (`@node-rs/argon2`), m=19 MiB, t=2, p=1 | Recomendação da OWASP. O bcrypt corta a senha em 72 bytes |
| Token de 32 bytes aleatórios; o banco guarda o SHA-256 | Um vazamento do banco não entrega sessões nem links usáveis. SHA-256 basta porque o token já é aleatório (não precisa de hash lento) |
| Cookie `__Host-session` | O prefixo obriga o navegador a exigir `secure`, `path=/` e nenhum domínio: um subdomínio não consegue sobrescrevê-lo |
| Cadastro sempre responde `202` com a mesma mensagem | Não revela quem tem conta. O e-mail diz "confirme seu cadastro" ou "você já tem conta" |
| Hash de uma senha falsa quando o e-mail não existe | O tempo de resposta não revela se a conta existe |
| Confirmação do link por botão (`POST`), não ao abrir | Robôs de e-mail (Outlook, antivírus) abrem os links sozinhos e gastariam o token |
| Sem e-mail confirmado, sem login | Evita conta com e-mail de outra pessoa e protege o vínculo com o Google |
| Redefinir a senha apaga todas as sessões e não loga sozinho | Quem estava com a sessão roubada cai. Não criar sessão a partir de um link de e-mail |
| Google verificado toma conta local não verificada (apaga senha e sessões) | Defesa contra *account pre-hijacking* (SPEC §5) |
| Limite por IP + e-mail e por IP, sem bloquear a conta | Bloquear a conta deixaria o atacante travar a vítima |
| Estado de login no cabeçalho por `GET /api/auth/me` | O `Header` é client component. Ler o cookie no servidor obrigaria todas as páginas a serem dinâmicas |
| `/conta` lê a sessão no servidor, dentro de `Suspense` | Só ela fica dinâmica; o resto do site continua pré-renderizado |
| Em desenvolvimento sem credenciais do Gmail, o e-mail vai para o terminal | Dá para testar sem configurar o Gmail. Em produção, sem as variáveis, a aplicação não sobe |
| Have I Been Pwned fora do ar: deixa passar e registra (`password_breach_check_failed`) | Um serviço de terceiro não pode travar o cadastro. Timeout de 3 s |
| Senha vazada é recusada **antes** de olhar o e-mail (cadastro) e **depois** de validar o link, mas antes de gastá-lo (redefinição) | A recusa depende só da senha, então não revela quem tem conta; e quem escolhe outra senha ainda usa o mesmo link |
| Consulta ao HIBP com `Add-Padding` e só o prefixo de 5 caracteres do SHA-1 | k-anonymity: nem a senha nem o hash completo saem do servidor. Linhas de preenchimento (quantidade 0) são ignoradas |
| Botão do Google abaixo do botão principal, separado por "ou", no login e no cadastro | E-mail e senha continuam sendo o caminho principal da tela |
| "G" colorido do Google em SVG (`GoogleIcon`), exceção à regra de ícones só do Phosphor | As diretrizes de marca do Google pedem o logo oficial no botão de login; o Phosphor só tem a versão de uma cor |
| Limite do `/api/cart/quote` no middleware `withRateLimit`, não no `cartService` | O checkout (Etapa 6) reaproveita o service e terá os próprios limites. O limite roda antes de ler o corpo |
| App do Google em modo **Teste** (só usuários de teste entram) até a Etapa 8 | Publicar exige URL de política de privacidade, que o site ainda não tem. A página `/privacidade` e a publicação ficam no Polimento |
| Trabalho em `feature/auth-*`, cada uma com PR para a `develop` | Etapa grande, com migration e segurança: o staging só recebe cada parte pronta |

---

## Tarefas

### `feature/auth-core`
- [x] Documentação (este documento, SPEC, `data-model.md`, ADR 011)
- [x] Schema + migration (`User`, `Session`, `OAuthAccount`, `EmailToken`, `RateLimit`)
- [x] Senha, tokens, sessão, limite de tentativas, IP do cliente, log de segurança
- [x] `EmailService` (Gmail e terminal)
- [x] `authService`: cadastro, verificação, reenvio, login, logout, usuário atual (com testes)
- [x] Rotas, `withAuth`, `proxy.ts`, Postman
- [x] Telas `/entrar`, `/cadastro`, `/verificar-email`, `/conta`; cabeçalho e barra de baixo
- [x] ESLint `react/no-danger`

### `feature/auth-password-reset`
- [x] Esqueci e redefinir senha (service, rotas, telas, testes, Postman)

### `feature/auth-google`
- [x] Arctic e regras de vínculo (com testes dos 4 casos)
- [x] Botão "Continuar com o Google" no login e no cadastro, com aviso quando o retorno falha
- [x] Cliente OAuth no Google Cloud (redirects de local, staging e produção) e variáveis `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (local e Vercel)
- [ ] Teste real: conta nova (falta), vínculo com conta verificada (ok, local) e tomada de conta não verificada (ok, local: senha e sessão antiga apagadas, login com a senha antiga recusado)

### `feature/auth-hardening`
- [x] Have I Been Pwned (cadastro e redefinição, com testes)
- [x] Limite no `/api/cart/quote` (60 por minuto por IP, middleware `withRateLimit`, com testes)

### Fechamento
- [ ] Checklist manual
- [ ] Parte 2 deste documento
- [ ] Release `develop` → `main`

---

## Endpoints

| Método | Rota | Acesso | Resposta |
|---|---|---|---|
| POST | `/api/auth/register` | Público | `202` sempre (mesma mensagem) · `400 PASSWORD_BREACHED` |
| POST | `/api/auth/verify-email` | Público | `200` · `400 INVALID_TOKEN` |
| POST | `/api/auth/resend-verification` | Público | `202` sempre |
| POST | `/api/auth/login` | Público | `200` + cookie · `401 INVALID_CREDENTIALS` · `403 EMAIL_NOT_VERIFIED` |
| POST | `/api/auth/logout` | Público | `204` (idempotente) |
| GET | `/api/auth/me` | Logado | `200 { user }` · `401` |
| POST | `/api/auth/forgot-password` | Público | `202` sempre |
| POST | `/api/auth/reset-password` | Público | `200` · `400 INVALID_TOKEN` · `400 PASSWORD_BREACHED` |
| POST | `/api/auth/change-password` | Logado | `200` · `400 INVALID_CURRENT_PASSWORD` · `400 PASSWORD_BREACHED` · `409 PASSWORD_NOT_SET` · `401` |
| GET | `/api/auth/google`, `/api/auth/google/callback` | Público | Redirecionamentos |

Todas as rotas públicas de escrita têm limite de tentativas (`429` com `Retry-After`).

---

## Checklist manual

- [ ] Cadastro → e-mail → confirmar → login → `/conta` → sair
- [ ] Login antes de confirmar: aviso e reenvio
- [ ] Cadastro com e-mail existente: mesma tela, e-mail "você já tem conta"
- [ ] 6 logins errados seguidos → mensagem de limite
- [ ] Cookie `__Host-session` com `HttpOnly`, `Secure`, `SameSite=Lax` (DevTools)
- [ ] Redefinir a senha derruba as sessões abertas
- [ ] Google: conta nova, vínculo com conta verificada e tomada de conta não verificada
- [ ] Cadastro e redefinição com senha vazada (ex.: `password123`): aviso no campo de senha (cadastro ok, local)
- [ ] Carrinho: a página continua abrindo normalmente (o limite de 60 por minuto não atrapalha o uso)
- [ ] `/conta` sem sessão leva a `/entrar?next=/conta` e volta depois do login
- [ ] Celular e desktop; teclado; sem erro no console

---

## Critério de pronto

- Todos os fluxos acima funcionando em local e no staging
- Testes unitários das regras (service, sessão, limite, `withAuth`, `Origin`, `next`) e Postman cobrindo as rotas
- Nenhum segredo no código; `.env.example` atualizado

---

# Parte 2 — Registro

> Preenchida com o que já foi feito. Falta o fechamento: variáveis na Vercel, PRs para a `develop`, checklist manual no staging e release.

## O que mudou em relação ao plano

- **Área da conta redesenhada:** `/conta` e `/conta/dados` (nova). Celular: "Olá" com as iniciais, banner do primeiro pedido e lista em cards. Desktop: menu lateral simples com o título "Minha conta" e, no topo do conteúdo, iniciais, nome, e-mail e "Cliente desde". Dados pessoais em campos só de leitura (viram editáveis quando a edição chegar).
- **Troca de senha logado** (`/conta/senha`, `POST /api/auth/change-password`): saiu do backlog a pedido, porque mandar quem está logado para o "esqueci a senha" era ruim. Regras no SPEC §5.
- **Margem lateral única** (`--gutter` no `globals.css`): 24px no celular e no tablet, 40px no desktop.

- **Telas de autenticação:** ficaram num grupo de rotas `(auth)`, sem cabeçalho e rodapé, com um layout único (`AuthShell`): card centralizado sobre a foto da cafeteria, título e subtítulo centralizados ("Entrar", "Criar uma conta").
- **Redefinir senha:** a tela pede para repetir a senha nova. A conferência é só na tela; o servidor recebe uma senha.
- **Google:** o botão fica abaixo do botão principal, separado por "ou", com o "G" colorido oficial em SVG (exceção à regra de ícones do Phosphor, nas Decisões).
- **Middlewares novos:** `withRedirectOnError` (rotas GET do Google: qualquer erro vira volta para `/entrar?erro=google`) e `withRateLimit` (limite por IP antes do controller, usado no `/api/cart/quote`).
- **Branches:** o trabalho foi em branches empilhadas (`auth-core` → `auth-password-reset` → `auth-google` → `auth-hardening`). Os PRs entram na `develop` nessa ordem.

## Problemas encontrados e soluções

- **Origem inválida no Google Cloud:** o campo "Origens JavaScript autorizadas" aceita só a origem (`http://localhost:3000`). O caminho do callback vai em "URIs de redirecionamento autorizados".
- **Segredo do Google num print:** o client secret apareceu numa captura de tela. Foi trocado no Google Cloud na hora. Regra: esconder segredos antes de mandar print.
- **Nome da conta nova vindo do e-mail:** quando o Google não manda nome, o nome usava o e-mail cru (com maiúsculas). Corrigido usando o e-mail já normalizado, com teste.
- **Home abrindo no meio (nas categorias) ao voltar de outra aba:** bug antigo, com remendos desde a Etapa 3 (`scrollTo` na barra de baixo e logos apontando para `/#inicio`). Causa real: ao abrir uma página, o Next chama `scrollIntoView` nas seções dela, e com `scroll-behavior: smooth` no `<html>` essas rolagens viravam animações que se atropelavam e paravam no meio. No Next 16 ele só desliga a rolagem suave na troca de página se o `<html>` tiver `data-scroll-behavior="smooth"` (o aviso aparecia no terminal). Corrigido com o atributo; os remendos saíram. Já estando na home, logo e "Início" (`HomeLink`) só sobem até o topo, sem navegar. Testado nas abas (cardápio, produto, carrinho, sobre, perfil/login), no logo do cabeçalho, do rodapé e do login, celular e desktop.
- **Servidor de desenvolvimento antigo:** um `next dev` aberto desde cedo respondeu com código velho e deixou passar uma senha vazada no teste manual. Reiniciado, a recusa funcionou. Lição: conferir no log se o evento esperado aparece antes de concluir que o código falhou ou passou.

## Aprendizados

- **Pre-hijacking:** a conta criada com o e-mail de outra pessoa (e nunca confirmada) é tomada pelo dono quando ele entra com o Google verificado: senha e sessões apagadas numa transação. Testado com mocks e contra o Neon `dev` com e-mails falsos (`@example.test`), apagados depois.
- **`id_token` sem checar a assinatura:** aceitável porque vem direto do Google por HTTPS na troca do código, não do navegador.
- **Have I Been Pwned:** com `Add-Padding`, a resposta traz linhas falsas com quantidade 0, que precisam ser ignoradas. Só o prefixo de 5 caracteres do SHA-1 sai do servidor.
- **Teste contra o banco real:** os testes unitários simulam o Prisma; rodar o service real contra o `dev` com dados falsos pegou o que os mocks não pegam (transação, chaves únicas).
