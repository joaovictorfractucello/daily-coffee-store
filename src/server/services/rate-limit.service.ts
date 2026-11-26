import "server-only";
import { RateLimitedError } from "@/server/errors/auth.errors";
import { fingerprint, logSecurityEvent } from "@/server/lib/security-log";
import { rateLimitRepository } from "@/server/repositories/rate-limit.repository";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

// Limites da SPEC §5. Por IP + e-mail (força bruta numa conta) e por IP (credential stuffing:
// muitas contas, poucas tentativas em cada). Nenhuma regra bloqueia a conta.
export const rateLimitRules = {
  loginPerAccount: { limit: 5, windowMs: 15 * MINUTE_MS },
  loginPerIp: { limit: 30, windowMs: 15 * MINUTE_MS },
  registerPerIp: { limit: 5, windowMs: HOUR_MS },
  emailPerAddress: { limit: 3, windowMs: HOUR_MS },
  emailPerIp: { limit: 10, windowMs: HOUR_MS },
  tokenPerIp: { limit: 10, windowMs: 15 * MINUTE_MS },
} as const;

export type RateLimitRule = keyof typeof rateLimitRules;

// Limpa as janelas vencidas em ~1% das chamadas: evita uma tarefa agendada só para isso.
const CLEANUP_PROBABILITY = 0.01;

export const rateLimitService = {
  // Conta uma tentativa e lança RateLimitedError quando passa do limite.
  async consume(rule: RateLimitRule, identifier: string, now = new Date()) {
    const { limit, windowMs } = rateLimitRules[rule];
    const key = `${rule}:${fingerprint(identifier)}`;
    const window = await rateLimitRepository.increment(
      key,
      now,
      new Date(now.getTime() + windowMs),
    );

    if (Math.random() < CLEANUP_PROBABILITY) {
      await rateLimitRepository.deleteExpired(now);
    }

    if (window.count > limit) {
      logSecurityEvent("rate_limited", { rule });
      const retryAfterMs = new Date(window.resetAt).getTime() - now.getTime();
      throw new RateLimitedError(Math.max(1, Math.ceil(retryAfterMs / 1000)));
    }
  },
};
