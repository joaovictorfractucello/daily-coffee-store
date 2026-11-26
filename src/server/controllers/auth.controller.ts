import "server-only";
import {
  emailOnlySchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenSchema,
} from "@/lib/auth-schemas";
import { getClientIp } from "@/server/lib/client-ip";
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
