import "server-only";
import { AppError } from "./app-error";

// Mesma mensagem para e-mail inexistente, senha errada e conta só do Google: não revela qual foi.
export class InvalidCredentialsError extends AppError {
  constructor() {
    super({
      message: "E-mail ou senha inválidos.",
      code: "INVALID_CREDENTIALS",
      kind: "UNAUTHORIZED",
    });
  }
}

export class EmailNotVerifiedError extends AppError {
  constructor() {
    super({
      message: "Confirme seu e-mail para entrar.",
      code: "EMAIL_NOT_VERIFIED",
      kind: "FORBIDDEN",
    });
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super({
      message: "Link inválido ou expirado.",
      code: "INVALID_TOKEN",
      kind: "VALIDATION",
    });
  }
}

export class UnauthenticatedError extends AppError {
  constructor() {
    super({
      message: "Faça login para continuar.",
      code: "UNAUTHENTICATED",
      kind: "UNAUTHORIZED",
    });
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super({
      message: "Você não tem permissão para isso.",
      code: "FORBIDDEN",
      kind: "FORBIDDEN",
    });
  }
}

export class RateLimitedError extends AppError {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super({
      message: "Muitas tentativas. Tente de novo mais tarde.",
      code: "RATE_LIMITED",
      kind: "RATE_LIMITED",
    });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
