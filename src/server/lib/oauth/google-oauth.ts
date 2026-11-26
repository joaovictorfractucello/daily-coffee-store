import "server-only";
import { timingSafeEqual } from "node:crypto";
import {
  decodeIdToken,
  generateCodeVerifier,
  generateState,
  Google,
} from "arctic";
import { z } from "zod";
import { env } from "@/env";
import {
  GoogleUnavailableError,
  OAuthCallbackError,
} from "@/server/errors/auth.errors";

// O que o resto do sistema sabe do Google: só isto. Arctic e o protocolo OAuth ficam aqui dentro.
export type GoogleProfile = {
  providerUserId: string;
  email: string;
  emailVerified: boolean;
  name: string | undefined;
};

type CallbackParams = {
  code: string | null;
  state: string | null;
  storedState: string | undefined;
  codeVerifier: string | undefined;
};

const SCOPES = ["openid", "email", "profile"];

// Campos do id_token que usamos. `sub` é o id fixo da pessoa no Google (o e-mail pode mudar).
const idTokenClaimsSchema = z.object({
  sub: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
});

function createClient() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new GoogleUnavailableError();
  }
  return new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.APP_URL}/api/auth/google/callback`,
  );
}

// O `state` que voltou na URL precisa ser o mesmo do cookie deste navegador. Sem isso, alguém
// poderia mandar a vítima para um retorno com o código da conta Google do atacante (login CSRF).
export function isMatchingState(
  received: string | null,
  stored: string | undefined,
): boolean {
  if (!received || !stored) return false;
  const receivedBytes = Buffer.from(received);
  const storedBytes = Buffer.from(stored);
  return (
    receivedBytes.length === storedBytes.length &&
    timingSafeEqual(receivedBytes, storedBytes)
  );
}

export const googleOAuth = {
  // PKCE: o code_verifier fica num cookie nosso; quem interceptar o código não consegue trocá-lo.
  createAuthorization() {
    const client = createClient();
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = client.createAuthorizationURL(state, codeVerifier, SCOPES);
    return { url, state, codeVerifier };
  },

  async fetchProfile({
    code,
    state,
    storedState,
    codeVerifier,
  }: CallbackParams): Promise<GoogleProfile> {
    const client = createClient();
    if (!code || !codeVerifier || !isMatchingState(state, storedState)) {
      throw new OAuthCallbackError();
    }

    let idToken: string;
    try {
      const tokens = await client.validateAuthorizationCode(code, codeVerifier);
      idToken = tokens.idToken();
    } catch {
      // Código inválido, vencido ou já usado (o Google responde erro). O detalhe não sai daqui.
      throw new OAuthCallbackError();
    }

    // Sem conferir a assinatura: o token veio direto do Google por HTTPS, em troca do código, e
    // não pelo navegador. A documentação do Google aceita esse caso.
    const claims = idTokenClaimsSchema.safeParse(decodeIdToken(idToken));
    if (!claims.success) throw new OAuthCallbackError();

    return {
      providerUserId: claims.data.sub,
      email: claims.data.email,
      emailVerified: claims.data.email_verified === true,
      name: claims.data.name,
    };
  },
};
