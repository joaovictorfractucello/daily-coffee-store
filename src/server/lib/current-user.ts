import "server-only";
import { connection } from "next/server";
import { readSessionToken } from "@/server/lib/session-cookie";
import { sessionService } from "@/server/services/session.service";

// Para páginas (Server Components): quem está logado, ou null. Não renova a sessão porque página
// não consegue regravar cookie; a renovação acontece no GET /api/auth/me que o cabeçalho chama.
export async function getSignedInUser() {
  // Depende da requisição (cookie e hora atual): nunca pode ser pré-renderizado.
  await connection();
  const token = await readSessionToken();
  if (!token) return null;
  const session = await sessionService.validate(token, { renew: false });
  return session?.user ?? null;
}
