import "server-only";
import { unstable_rethrow as rethrowNextInternalError } from "next/navigation";
import { AppError, type ErrorKind } from "./app-error";
import { RateLimitedError } from "./auth.errors";

const statusByKind: Record<ErrorKind, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  // Entrada válida, mas a regra de negócio recusa (ex.: endereço fora da área de entrega).
  UNPROCESSABLE: 422,
  RATE_LIMITED: 429,
  // Serviço externo fora do ar (ex.: ViaCEP).
  UNAVAILABLE: 503,
};

function respondWithAppError(error: AppError): Response {
  const headers =
    error instanceof RateLimitedError
      ? { "Retry-After": String(error.retryAfterSeconds) }
      : undefined;
  return Response.json(
    { error: { code: error.code, message: error.message } },
    { status: statusByKind[error.kind], headers },
  );
}

function logAndRespondWithGenericError(error: unknown): Response {
  console.error(error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Erro interno." } },
    { status: 500 },
  );
}

export function withErrorHandler<Req extends Request, Context>(
  handler: (request: Req, context: Context) => Promise<Response>,
) {
  return async (request: Req, context: Context): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      rethrowNextInternalError(error);
      return error instanceof AppError
        ? respondWithAppError(error)
        : logAndRespondWithGenericError(error);
    }
  };
}
