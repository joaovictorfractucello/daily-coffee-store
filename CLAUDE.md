# Daily Coffee — E-commerce
 
E-commerce de uma cafeteria fictícia, construído como projeto de portfólio, mas tratado como produto real.
 
Documentação de referência:
- `docs/SPEC.md` — escopo, stack, arquitetura, regras de negócio e decisões. **Leia as seções relacionadas antes de planejar ou implementar qualquer tarefa.**
- @docs/data-model.md — tabelas, enums e regras de dados pessoais
Se uma tarefa contradizer esses documentos, pare e pergunte antes de implementar.
 
## Stack
 
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Motion · Phosphor Icons · Prisma + Neon (Postgres) · Zod · React Hook Form · Zustand · Vitest
 
## Comandos
 
> Atualizar esta seção ao final da Etapa 1 (Setup).
 
```bash
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção
npm run lint           # ESLint
npm run typecheck      # checagem de tipos
npm run test           # testes unitários (Vitest)
npx prisma migrate dev # criar/aplicar migration em desenvolvimento
npx prisma db seed     # popular o banco com dados de exemplo
```
 
## Arquitetura (regras obrigatórias)
 
Fluxo: `route.ts → middleware → controller → service → repository`
 
- `route.ts`: só liga o método HTTP ao controller.
- **Controller**: lê a requisição, valida com Zod e chama o service. Sem try/catch: erros sobem até o `withErrorHandler`.
- **Service**: regras de negócio. Não conhece HTTP (nada de `Request`, `Response` ou status).
- **Repository**: único lugar que usa o Prisma.
- Erros do domínio estendem `AppError` (`message`, `code`, `kind`), sem status HTTP. O `withErrorHandler` (`src/server/errors/error-handler.ts`) converte `kind` em status.
- Serviços externos (e-mail, pagamento) ficam atrás de interfaces.
- Tudo em `src/server/` importa `server-only`.
- Não usar Server Actions para operações de dados: a API é REST (Route Handlers), testável no Postman.

## Convenções
 
- Código (variáveis, funções, arquivos) em **inglês**; textos da interface em **português**.
- Dinheiro sempre em **centavos (inteiro)**, com sufixo `InCents`. Formatar em reais só na interface.
- Listas fixas de valores são **enums do Prisma**. Rótulos de tela ficam em mapas no código.
- Ícones: somente **Phosphor**. Ao adicionar componentes do shadcn, trocar os ícones do lucide.
- Commits no padrão **Conventional Commits** (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
## Segurança (nunca violar)
 
- O servidor **nunca confia no front-end**: preços, totais e permissões são sempre calculados ou verificados no back-end.
- Permissões validadas no back-end (`withAuth`), nunca apenas escondendo elementos da interface.
- Status `PAID` só é definido pelo **webhook do Asaas**. O webhook é idempotente.
- **CPF não é salvo no banco e nunca aparece em logs.**
- Dados de cartão nunca passam pelo servidor.
- Senhas e tokens são salvos apenas com hash.
- Segredos só em variáveis de ambiente. Nunca commitar `.env`; manter o `.env.example` atualizado.
- `DEMO_ADMIN` é somente leitura e só acessa dados com `isDemo = true`.
## Testes
 
Foco nos pontos críticos: regras dos services (carrinho, taxa de entrega, transições de status, permissões), autenticação e webhook.
Toda regra de negócio nova vem acompanhada de teste unitário.
 
## Git
 
- `feature/*` → PR para `develop` → PR para `main`.
- Nunca commitar direto em `main` ou `develop`.
- **Os commits são feitos por mim.** Não execute `git commit`, `git push`, merge ou abertura de PR.
- Ao terminar uma parte do trabalho, sugira a mensagem de commit (Conventional Commits) e quais arquivos entram nele. Se houver mudanças de assuntos diferentes, sugira separá-las em commits distintos.

## Como trabalhar comigo
 
- Respostas **precisas, didáticas e resumidas**: vá direto ao ponto, explique em linguagem simples e use exemplos curtos quando ajudarem.
- **Resumir não é omitir.** Riscos, efeitos colaterais, o que pode quebrar, alternativas relevantes e pontos em que você não tem certeza devem sempre aparecer, mesmo que em uma linha.
- Eu tomo as decisões. Antes de mudanças grandes, apresente um plano curto e espere aprovação.
- Se uma ideia minha tiver problema (segurança, arquitetura, complexidade), diga claramente e explique o motivo.
- Prefira a solução simples. Cite a alternativa complexa só se fizer sentido, dizendo quando valeria a pena.
- Não adicione funcionalidades fora do escopo do SPEC sem discutir antes.
- Ao concluir uma tarefa, explique o que foi feito e o porquê das decisões principais.
- Decisões novas devem ser registradas no `docs/SPEC.md` (e em um ADR em `docs/adr/` quando forem de arquitetura).