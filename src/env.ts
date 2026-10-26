import { z } from "zod";

// Variáveis de ambiente, validadas na inicialização: o next.config.ts importa este arquivo, então
// `next dev` e `next build` param com uma mensagem clara se faltar alguma.
// Uso só no servidor. Componentes client leem as NEXT_PUBLIC_ direto de process.env (o Next só
// leva ao navegador o que é acessado assim).
const envSchema = z.object({
  // Opcional e sem checagem de formato: valor inválido cai no mapa padrão (veja src/lib/map.ts).
  NEXT_PUBLIC_MAP_EMBED_URL: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Variáveis de ambiente inválidas (confira o .env e o .env.example):\n${z.prettifyError(parsedEnv.error)}`,
  );
}

export const env = parsedEnv.data;
