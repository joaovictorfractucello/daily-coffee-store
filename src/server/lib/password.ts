import "server-only";
import { hash, verify } from "@node-rs/argon2";

// argon2id com os parâmetros mínimos recomendados pela OWASP (19 MiB, 2 passadas, 1 thread).
const ARGON2_OPTIONS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

let dummyHash: Promise<string> | undefined;

// Confere a senha. Sem hash (e-mail inexistente ou conta só do Google), confere contra um hash falso
// e devolve `false`: a resposta leva o mesmo tempo e não revela se a conta existe.
export async function verifyPassword(
  passwordHash: string | null | undefined,
  password: string,
): Promise<boolean> {
  if (!passwordHash) {
    dummyHash ??= hashPassword("senha-falsa-para-igualar-o-tempo");
    await verify(await dummyHash, password);
    return false;
  }
  return verify(passwordHash, password);
}
