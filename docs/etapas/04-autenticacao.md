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
- Trocar senha e e-mail logado, lista de dispositivos: backlog
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
| Have I Been Pwned fora do ar: deixa passar e registra | Um serviço de terceiro não pode travar o cadastro |
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
- [ ] Cliente OAuth no Google Cloud e variáveis `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (local e Vercel)
- [ ] Teste real: conta nova, vínculo com conta verificada e tomada de conta não verificada

### `feature/auth-hardening`
- [ ] Have I Been Pwned
- [ ] Limite no `/api/cart/quote`

### Fechamento
- [ ] Checklist manual
- [ ] Parte 2 deste documento
- [ ] Release `develop` → `main`

---

## Endpoints

| Método | Rota | Acesso | Resposta |
|---|---|---|---|
| POST | `/api/auth/register` | Público | `202` sempre (mesma mensagem) |
| POST | `/api/auth/verify-email` | Público | `200` · `400 INVALID_TOKEN` |
| POST | `/api/auth/resend-verification` | Público | `202` sempre |
| POST | `/api/auth/login` | Público | `200` + cookie · `401 INVALID_CREDENTIALS` · `403 EMAIL_NOT_VERIFIED` |
| POST | `/api/auth/logout` | Público | `204` (idempotente) |
| GET | `/api/auth/me` | Logado | `200 { user }` · `401` |
| POST | `/api/auth/forgot-password` | Público | `202` sempre |
| POST | `/api/auth/reset-password` | Público | `200` · `400 INVALID_TOKEN` |
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
- [ ] `/conta` sem sessão leva a `/entrar?next=/conta` e volta depois do login
- [ ] Celular e desktop; teclado; sem erro no console

---

## Critério de pronto

- Todos os fluxos acima funcionando em local e no staging
- Testes unitários das regras (service, sessão, limite, `withAuth`, `Origin`, `next`) e Postman cobrindo as rotas
- Nenhum segredo no código; `.env.example` atualizado

---

# Parte 2 — Registro

> Preencher ao concluir a etapa.

## O que mudou em relação ao plano

## Problemas encontrados e soluções

## Aprendizados
