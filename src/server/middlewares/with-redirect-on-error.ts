import "server-only";
import { unstable_rethrow as rethrowNextInternalError } from "next/navigation";
import { NextResponse } from "next/server";
import { AppError } from "@/server/errors/app-error";
import { getClientIp } from "@/server/lib/client-ip";
import {
  logSecurityEvent,
  type SecurityEvent,
} from "@/server/lib/security-log";

type RedirectOnErrorOptions = {
  // Página para onde a pessoa volta, já com o aviso na URL (ex.: /entrar?erro=google).
  redirectTo: string;
  failureEvent: SecurityEvent;
};

// Par do withErrorHandler para rotas que o navegador abre direto (o retorno do Google): lá, um erro
// em JSON deixaria a pessoa numa tela crua. Aqui todo erro vira redirecionamento para uma página com
// aviso genérico, e o motivo fica só no log.
export function withRedirectOnError<Req extends Request, Context>(
  handler: (request: Req, context: Context) => Promise<Response>,
  { redirectTo, failureEvent }: RedirectOnErrorOptions,
) {
  return async (request: Req, context: Context): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      rethrowNextInternalError(error);
      if (!(error instanceof AppError)) console.error(error);
      logSecurityEvent(failureEvent, {
        ip: getClientIp(request),
        reason: error instanceof AppError ? error.code : "INTERNAL_ERROR",
      });
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  };
}
