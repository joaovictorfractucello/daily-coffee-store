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

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional();

const envSchema = z
  .object({
    NEXT_PUBLIC_MAP_EMBED_URL: z.string().optional(),
    DATABASE_URL: postgresConnectionUrl,
    DIRECT_URL: postgresConnectionUrl,
    VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
    // Endereço do site usado nos links dos e-mails, sem barra no fim.
    APP_URL: z
      .url({ protocol: /^https?$/ })
      .transform((url) => url.replace(/\/+$/, ""))
      .default("http://localhost:3000"),
    GMAIL_USER: optionalText,
    GMAIL_APP_PASSWORD: optionalText,
    // Cliente OAuth do Google Cloud. O redirect cadastrado lá é `${APP_URL}/api/auth/google/callback`.
    GOOGLE_CLIENT_ID: optionalText,
    GOOGLE_CLIENT_SECRET: optionalText,
  })
  // Na Vercel (staging e produção) os e-mails precisam sair de verdade e o Google precisa funcionar:
  // sem as credenciais, o build falha em vez de publicar um cadastro que nunca envia o link de
  // confirmação ou um botão do Google quebrado.
  .superRefine((values, context) => {
    if (!values.VERCEL_ENV) return;
    for (const key of [
      "APP_URL",
      "GMAIL_USER",
      "GMAIL_APP_PASSWORD",
      "GOOGLE_CLIENT_ID",
      "GOOGLE_CLIENT_SECRET",
    ] as const) {
      if (!process.env[key]?.trim()) {
        context.addIssue({
          code: "custom",
          path: [key],
          message: "obrigatória na Vercel",
        });
      }
    }
  });

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(
    `Variáveis de ambiente inválidas (confira o .env e o .env.example):\n${z.prettifyError(parsedEnv.error)}`,
  );
}

export const env = parsedEnv.data;
