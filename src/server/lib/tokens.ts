import "server-only";
import { createHash, randomBytes } from "node:crypto";

// 32 bytes aleatórios (256 bits): impossível de adivinhar. Vai no cookie ou no link do e-mail.
export function generateToken(): string {
  return randomBytes(32).toString("base64url");
}

// O banco guarda só o hash. SHA-256 basta (não precisa de hash lento como o da senha) porque o
// token já é aleatório e longo: não existe lista de "tokens comuns" para testar.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
