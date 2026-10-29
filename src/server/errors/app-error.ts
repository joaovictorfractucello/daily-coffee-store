import "server-only";

export type ErrorKind =
  "NOT_FOUND" | "CONFLICT" | "VALIDATION" | "UNAUTHORIZED" | "FORBIDDEN";

type AppErrorParams = {
  message: string;
  code: string;
  kind: ErrorKind;
};

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
