import "server-only";

export type ErrorKind =
  "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN";

type AppErrorParams = {
  // Vai para o cliente: texto em português, sem detalhe interno.
  message: string;
  // Erro exato, para o front-end e os logs (ex.: PRODUCT_NOT_FOUND).
  code: string;
  kind: ErrorKind;
};

// Erro esperado do domínio. Não tem status HTTP: quem traduz `kind` em status é o withErrorHandler.
export class AppError extends Error {
  readonly code: string;
  readonly kind: ErrorKind;

  constructor({ message, code, kind }: AppErrorParams) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.kind = kind;
  }
}
