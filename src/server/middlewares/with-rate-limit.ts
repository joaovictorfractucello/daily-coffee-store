import "server-only";
import { getClientIp } from "@/server/lib/client-ip";
import {
  rateLimitService,
  type RateLimitRule,
} from "@/server/services/rate-limit.service";

// Conta a chamada por IP antes de o controller ler o corpo: quem estoura o limite não gasta banco
// nem processamento da regra. Estourou → RateLimitedError, que o withErrorHandler troca por 429.
export function withRateLimit<Req extends Request, Context>(
  rule: RateLimitRule,
  handler: (request: Req, context: Context) => Promise<Response>,
) {
  return async (request: Req, context: Context): Promise<Response> => {
    await rateLimitService.consume(rule, getClientIp(request));
    return handler(request, context);
  };
}
