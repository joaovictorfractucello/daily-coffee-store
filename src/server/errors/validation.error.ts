import "server-only";
import { AppError } from "./app-error";

export class ValidationError extends AppError {
  constructor() {
    super({
      message: "Dados inválidos.",
      code: "INVALID_INPUT",
      kind: "VALIDATION",
    });
  }
}
