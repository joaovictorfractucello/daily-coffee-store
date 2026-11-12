# ADR 004 — Autenticação própria + Arctic

- **Status:** Aceita (implementação na Etapa 4)
- **Data:** 2026-11-12
- **Origem:** SPEC §5 "Autenticação"

## Contexto

O site precisa de cadastro com e-mail e senha, login com Google, verificação de e-mail, recuperação de senha e papéis (`CUSTOMER`, `ADMIN`, `DEMO_ADMIN`). O projeto é de portfólio e aprendizado: entender cada passo de segurança faz parte do objetivo.

## Decisão

Autenticação feita no próprio projeto: hash de senha (argon2 ou bcrypt), sessões (ADR 003), verificação de e-mail, recuperação com token de uso único e expiração, e limite de tentativas de login. A biblioteca **Arctic** cuida só do protocolo OAuth do Google (link de login, `state` e PKCE, troca do código). Depois disso o fluxo volta para o nosso código.

**Vinculação de contas:** a conta Google só é ligada a uma conta de e-mail existente se o e-mail local **e** o do Google estiverem verificados. Sem as duas condições, não vincula (evita tomada de conta).

## Alternativas consideradas

- **Auth.js, Clerk ou Supabase Auth:** mais rápido e já testado, mas esconde as decisões de segurança e cria dependência de terceiros (o Clerk é pago acima de um limite).
- **OAuth do Google feito à mão:** possível, mas o protocolo tem detalhes fáceis de errar (PKCE, `state`); a Arctic é pequena e só faz isso.

## Consequências

- **Ganha:** controle total e código que demonstra o entendimento de segurança; sem custo e sem fornecedor de autenticação.
- **Perde:** mais código e mais responsabilidade; qualquer erro de segurança é nosso. Por isso essa parte exige testes e revisão redobrada.
