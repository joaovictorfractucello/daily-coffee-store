import "server-only";
import { cookies } from "next/headers";

// Guardam o que o retorno do Google precisa conferir. `__Host-` + `httpOnly` + `secure`, como o
// cookie de sessão. `sameSite=lax` (e não `strict`): o retorno é uma navegação vinda do site do
// Google, e só o `lax` deixa o navegador mandar os cookies nela.
const STATE_COOKIE = "__Host-google-oauth-state";
const CODE_VERIFIER_COOKIE = "__Host-google-code-verifier";
const NEXT_COOKIE = "__Host-google-next";

// Tempo para a pessoa escolher a conta no Google. Depois disso, o retorno é recusado.
const MAX_AGE_SECONDS = 10 * 60;

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
} as const;

type OAuthCookies = { state: string; codeVerifier: string; next: string };

export async function writeOAuthCookies({
  state,
  codeVerifier,
  next,
}: OAuthCookies) {
  const cookieStore = await cookies();
  const options = { ...cookieOptions, maxAge: MAX_AGE_SECONDS };
  cookieStore.set(STATE_COOKIE, state, options);
  cookieStore.set(CODE_VERIFIER_COOKIE, codeVerifier, options);
  cookieStore.set(NEXT_COOKIE, next, options);
}

// Lê e apaga na mesma hora: cada retorno do Google só pode ser usado uma vez.
export async function takeOAuthCookies(): Promise<Partial<OAuthCookies>> {
  const cookieStore = await cookies();
  const values = {
    state: cookieStore.get(STATE_COOKIE)?.value,
    codeVerifier: cookieStore.get(CODE_VERIFIER_COOKIE)?.value,
    next: cookieStore.get(NEXT_COOKIE)?.value,
  };
  for (const name of [STATE_COOKIE, CODE_VERIFIER_COOKIE, NEXT_COOKIE]) {
    cookieStore.delete({ name, ...cookieOptions });
  }
  return values;
}
