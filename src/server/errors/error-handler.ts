import "server-only";
import { AppError, type ErrorKind } from "./app-error";

const statusByKind: Record<ErrorKind, number> = {
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
};

function toErrorResponse(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: statusByKind[error.kind] },
    );
  }

  // Erro inesperado: o detalhe fica só no log do servidor, o cliente recebe uma resposta genérica.
  console.error(error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "Erro interno." } },
    { status: 500 },
  );
}

// Envolve o handler do route.ts. Controllers não precisam de try/catch: qualquer erro lançado
// por eles (ou pelos services) vira a resposta HTTP certa aqui.
export function withErrorHandler<Req extends Request, Context>(
  handler: (request: Req, context: Context) => Promise<Response>,
) {
  return async (request: Req, context: Context): Promise<Response> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}
