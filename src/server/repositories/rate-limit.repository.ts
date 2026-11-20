import "server-only";
import { prisma } from "@/server/lib/prisma";

type RateLimitWindow = { count: number; resetAt: Date };

export const rateLimitRepository = {
  // Soma uma tentativa numa única instrução (atômica): duas requisições ao mesmo tempo não leem o
  // mesmo valor. Janela vencida recomeça em 1. Template do $queryRaw = consulta parametrizada.
  async increment(key: string, now: Date, resetAt: Date) {
    const [window] = await prisma.$queryRaw<RateLimitWindow[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${resetAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
      RETURNING "count", "resetAt"
    `;
    return window;
  },

  deleteExpired(now: Date) {
    return prisma.rateLimit.deleteMany({ where: { resetAt: { lte: now } } });
  },
};
