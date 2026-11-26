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

export class BreachedPasswordError extends AppError {
  constructor() {
    super({
      message: "Essa senha apareceu em vazamentos de dados.",
      code: "PASSWORD_BREACHED",
      kind: "VALIDATION",
    });
  }
}

// Troca de senha logado: a senha atual não confere. Erro de campo (400), não de sessão: a pessoa
// continua logada e corrige o campo.
export class InvalidCurrentPasswordError extends AppError {
  constructor() {
    super({
      message: "A senha atual não confere.",
      code: "INVALID_CURRENT_PASSWORD",
      kind: "VALIDATION",
    });
  }
}

// Conta sem senha (só Google): não há senha atual para conferir. Criar senha é pelo link do e-mail.
export class PasswordNotSetError extends AppError {
  constructor() {
    super({
      message: "Esta conta ainda não tem senha.",
      code: "PASSWORD_NOT_SET",
      kind: "CONFLICT",
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

// Retorno do Google que não dá para aceitar: `state` diferente do cookie, pessoa cancelou, código
// inválido ou já usado. Uma mensagem só; o detalhe não ajuda quem está tentando forjar o retorno.
export class OAuthCallbackError extends AppError {
  constructor() {
    super({
      message: "Não foi possível entrar com o Google.",
      code: "OAUTH_CALLBACK_FAILED",
      kind: "UNAUTHORIZED",
    });
  }
}

// Sem e-mail verificado no Google não dá para saber se a pessoa é dona do endereço (SPEC §5).
export class GoogleEmailNotVerifiedError extends AppError {
  constructor() {
    super({
      message: "O e-mail da conta Google não está verificado.",
      code: "GOOGLE_EMAIL_NOT_VERIFIED",
      kind: "FORBIDDEN",
    });
  }
}

// GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET ausentes (só acontece fora da Vercel).
export class GoogleUnavailableError extends AppError {
  constructor() {
    super({
      message: "Login com Google indisponível.",
      code: "GOOGLE_UNAVAILABLE",
      kind: "NOT_FOUND",
    });
  }
}
