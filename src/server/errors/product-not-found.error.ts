import "server-only";
import { AppError } from "./app-error";

export class ProductNotFoundError extends AppError {
  constructor() {
    super({
      message: "Produto não encontrado.",
      code: "PRODUCT_NOT_FOUND",
      kind: "NOT_FOUND",
    });
  }
}
