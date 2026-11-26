import "server-only";
import { cookies } from "next/headers";

// O prefixo __Host- obriga o navegador a só aceitar o cookie com `secure`, `path=/` e sem domínio:
// um subdomínio comprometido não consegue sobrescrevê-lo. `httpOnly`: o JavaScript da página não
// lê o token (um XSS não rouba a sessão). `sameSite=lax`: não vai junto em POST vindo de outro site.
export const SESSION_COOKIE = "__Host-session";

export async function readSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function writeSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete({
    name: SESSION_COOKIE,
    path: "/",
    secure: true,
    httpOnly: true,
    sameSite: "lax",
  });
}
