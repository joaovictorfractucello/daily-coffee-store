import "server-only";
import { ValidationError } from "@/server/errors/validation.error";

// JSON malformado vira 400 (como qualquer entrada inválida), não 500.
export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError();
  }
}
