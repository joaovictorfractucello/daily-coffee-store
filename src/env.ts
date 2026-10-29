import { z } from "zod";

function hasCredentialsAndDatabaseName(connectionUrl: string) {
  const { username, password, pathname } = new URL(connectionUrl);
  return Boolean(username && password && pathname.length > 1);
}

const postgresConnectionUrl = z
  .url({ protocol: /^postgres(ql)?$/, hostname: z.regexes.domain })
  .refine(
    hasCredentialsAndDatabaseName,
    "precisa ter usuário, senha e nome do banco",
  );

const envSchema = z.object({
  NEXT_PUBLIC_MAP_EMBED_URL: z.string().optional(),
  DATABASE_URL: postgresConnectionUrl,
  DIRECT_URL: postgresConnectionUrl,
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Variáveis de ambiente inválidas (confira o .env e o .env.example):\n${z.prettifyError(parsedEnv.error)}`,
  );
}

export const env = parsedEnv.data;
