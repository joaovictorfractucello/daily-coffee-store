import "server-only";
import { NextResponse } from "next/server";
import {
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenSchema,
} from "@/lib/auth-schemas";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getClientIp } from "@/server/lib/client-ip";
import { googleOAuth } from "@/server/lib/oauth/google-oauth";
import {
  takeOAuthCookies,
  writeOAuthCookies,
} from "@/server/lib/oauth-cookies";
import {
  clearSessionCookie,
  readSessionToken,
  writeSessionCookie,
} from "@/server/lib/session-cookie";
import { presentUser } from "@/server/presenters/user.presenter";
import { authService } from "@/server/services/auth.service";
import type { ValidSession } from "@/server/services/session.service";
import { parseInput } from "@/server/validators/parse-input";
import { readJsonBody } from "./read-json-body";

// 202 sem detalhes: a resposta é a mesma exista ou não a conta (contra enumeração).
const accepted = () => Response.json({ ok: true }, { status: 202 });

export const authController = {
  async register(request: Request): Promise<Response> {
    const input = parseInput(registerSchema, await readJsonBody(request));
    await authService.register(input, { ip: getClientIp(request) });
    return accepted();
  },

  async verifyEmail(request: Request): Promise<Response> {
    const { token } = parseInput(tokenSchema, await readJsonBody(request));
    await authService.verifyEmail(token, { ip: getClientIp(request) });
    return Response.json({ ok: true });
  },

  async resendVerification(request: Request): Promise<Response> {
    const { email } = parseInput(emailOnlySchema, await readJsonBody(request));
    await authService.resendVerification(email, { ip: getClientIp(request) });
    return accepted();
  },

  async login(request: Request): Promise<Response> {
    const input = parseInput(loginSchema, await readJsonBody(request));
    const { user, token, expiresAt } = await authService.login(input, {
      ip: getClientIp(request),
    });
    await writeSessionCookie(token, expiresAt);
    return Response.json({ user: presentUser(user) });
  },

  async forgotPassword(request: Request): Promise<Response> {
    const { email } = parseInput(emailOnlySchema, await readJsonBody(request));
    await authService.requestPasswordReset(email, { ip: getClientIp(request) });
    return accepted();
  },

  async resetPassword(request: Request): Promise<Response> {
    const input = parseInput(resetPasswordSchema, await readJsonBody(request));
    await authService.resetPassword(input, { ip: getClientIp(request) });
    return Response.json({ ok: true });
  },

  // Vai para o Google. O `next` filtrado vai num cookie e volta no retorno (não confiamos na URL).
  async googleStart(request: Request): Promise<Response> {
    const next = safeRedirectPath(
      new URL(request.url).searchParams.get("next"),
    );
    const { url, state, codeVerifier } = googleOAuth.createAuthorization();
    await writeOAuthCookies({ state, codeVerifier, next });
    return NextResponse.redirect(url);
  },

  async googleCallback(request: Request): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const stored = await takeOAuthCookies();
    const profile = await googleOAuth.fetchProfile({
      code: params.get("code"),
      state: params.get("state"),
      storedState: stored.state,
      codeVerifier: stored.codeVerifier,
    });
    const { token, expiresAt } = await authService.loginWithGoogle(profile, {
      ip: getClientIp(request),
    });
    await writeSessionCookie(token, expiresAt);
    return NextResponse.redirect(
      new URL(safeRedirectPath(stored.next), request.url),
    );
  },

  async logout(request: Request): Promise<Response> {
    await authService.logout(await readSessionToken(), {
      ip: getClientIp(request),
    });
    await clearSessionCookie();
    return new Response(null, { status: 204 });
  },

  async me(
    _request: Request,
    _context: unknown,
    { user }: ValidSession,
  ): Promise<Response> {
    return Response.json(
      { user: presentUser(user) },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  },
};
