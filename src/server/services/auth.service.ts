import "server-only";
import type { LoginInput, RegisterInput } from "@/lib/auth-schemas";
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidTokenError,
} from "@/server/errors/auth.errors";
import {
  alreadyRegisteredEmail,
  verificationEmail,
} from "@/server/lib/email/auth-emails";
import { getEmailService } from "@/server/lib/email/email-service";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { logSecurityEvent } from "@/server/lib/security-log";
import { generateToken, hashToken } from "@/server/lib/tokens";
import { emailTokenRepository } from "@/server/repositories/email-token.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { rateLimitService } from "./rate-limit.service";
import { sessionService } from "./session.service";

const VERIFICATION_TOKEN_MS = 24 * 60 * 60 * 1000;

// Quem fez a requisição. O service recebe só o IP, sem saber de onde ele veio (HTTP fica no controller).
type RequestOrigin = { ip: string };

async function sendVerificationEmail(
  user: { id: string; name: string; email: string },
  now: Date,
) {
  const token = generateToken();
  await emailTokenRepository.replace({
    tokenHash: hashToken(token),
    userId: user.id,
    type: "EMAIL_VERIFICATION",
    expiresAt: new Date(now.getTime() + VERIFICATION_TOKEN_MS),
  });
  await getEmailService().send(verificationEmail(user.email, user.name, token));
}

export const authService = {
  // A resposta é sempre a mesma, com conta nova ou e-mail já cadastrado: só o e-mail enviado muda.
  async register(
    { name, email, password }: RegisterInput,
    { ip }: RequestOrigin,
    now = new Date(),
  ) {
    await rateLimitService.consume("registerPerIp", ip, now);
    // Também por endereço: impede usar o cadastro para lotar a caixa de entrada de alguém.
    await rateLimitService.consume("emailPerAddress", email, now);

    // O hash é calculado nos dois casos para o tempo de resposta não revelar se o e-mail existe.
    const passwordHash = await hashPassword(password);
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      logSecurityEvent("register_existing_email", {
        userId: existingUser.id,
        ip,
      });
      await getEmailService().send(
        alreadyRegisteredEmail(existingUser.email, existingUser.name),
      );
      return;
    }

    const user = await userRepository.create({ name, email, passwordHash });
    logSecurityEvent("register", { userId: user.id, ip });
    await sendVerificationEmail(user, now);
  },

  async verifyEmail(token: string, { ip }: RequestOrigin, now = new Date()) {
    await rateLimitService.consume("tokenPerIp", ip, now);

    const emailToken = await emailTokenRepository.findValid(
      hashToken(token),
      "EMAIL_VERIFICATION",
      now,
    );
    if (!emailToken) throw new InvalidTokenError();

    const consumed = await emailTokenRepository.consumeAndVerifyEmail(
      emailToken.id,
      emailToken.userId,
      now,
    );
    if (!consumed) throw new InvalidTokenError();
    logSecurityEvent("email_verified", { userId: emailToken.userId, ip });
  },

  // Sempre "deu certo" para quem pede: não revela se o e-mail existe ou já foi confirmado.
  async resendVerification(
    email: string,
    { ip }: RequestOrigin,
    now = new Date(),
  ) {
    await rateLimitService.consume("emailPerIp", ip, now);
    await rateLimitService.consume("emailPerAddress", email, now);

    const user = await userRepository.findByEmail(email);
    if (!user || user.emailVerifiedAt || !user.passwordHash) return;

    logSecurityEvent("verification_resent", { userId: user.id, ip });
    await sendVerificationEmail(user, now);
  },

  async login(
    { email, password }: LoginInput,
    { ip }: RequestOrigin,
    now = new Date(),
  ) {
    await rateLimitService.consume("loginPerIp", ip, now);
    await rateLimitService.consume("loginPerAccount", `${ip}|${email}`, now);

    const user = await userRepository.findByEmail(email);
    const passwordMatches = await verifyPassword(user?.passwordHash, password);

    if (!user || !passwordMatches) {
      logSecurityEvent("login_failure", { userId: user?.id, email, ip });
      throw new InvalidCredentialsError();
    }

    // Só depois da senha certa: quem não sabe a senha não descobre se a conta existe.
    if (!user.emailVerifiedAt) {
      logSecurityEvent("login_unverified", { userId: user.id, ip });
      throw new EmailNotVerifiedError();
    }

    // Sempre uma sessão nova: um id de sessão plantado antes do login não vira sessão válida.
    const session = await sessionService.create(user, now);
    logSecurityEvent("login_success", { userId: user.id, ip });
    return { user, ...session };
  },

  async logout(token: string | undefined, { ip }: RequestOrigin) {
    if (!token) return;
    await sessionService.invalidate(token);
    logSecurityEvent("logout", { ip });
  },
};
