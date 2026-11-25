import "server-only";
import {
  NAME_MAX_LENGTH,
  normalizeEmail,
  type LoginInput,
  type RegisterInput,
  type ResetPasswordInput,
} from "@/lib/auth-schemas";
import type { EmailTokenType } from "@/generated/prisma/enums";
import {
  EmailNotVerifiedError,
  GoogleEmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidTokenError,
} from "@/server/errors/auth.errors";
import {
  alreadyRegisteredEmail,
  passwordResetEmail,
  verificationEmail,
} from "@/server/lib/email/auth-emails";
import { getEmailService } from "@/server/lib/email/email-service";
import type { GoogleProfile } from "@/server/lib/oauth/google-oauth";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { logSecurityEvent } from "@/server/lib/security-log";
import { generateToken, hashToken } from "@/server/lib/tokens";
import { emailTokenRepository } from "@/server/repositories/email-token.repository";
import { oauthAccountRepository } from "@/server/repositories/oauth-account.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { rateLimitService } from "./rate-limit.service";
import { sessionService } from "./session.service";

const VERIFICATION_TOKEN_MS = 24 * 60 * 60 * 1000;
// Link que troca a senha vale pouco: se o e-mail vazar depois, já não serve.
const PASSWORD_RESET_TOKEN_MS = 30 * 60 * 1000;

const GOOGLE_PROVIDER = "google";

// Quem fez a requisição. O service recebe só o IP, sem saber de onde ele veio (HTTP fica no controller).
type RequestOrigin = { ip: string };

// Cria o link de uso único (invalida o anterior do mesmo tipo) e devolve o token para o e-mail.
async function createEmailToken(
  userId: string,
  type: EmailTokenType,
  lifetimeMs: number,
  now: Date,
) {
  const token = generateToken();
  await emailTokenRepository.replace({
    tokenHash: hashToken(token),
    userId,
    type,
    expiresAt: new Date(now.getTime() + lifetimeMs),
  });
  return token;
}

async function sendVerificationEmail(
  user: { id: string; name: string; email: string },
  now: Date,
) {
  const token = await createEmailToken(
    user.id,
    "EMAIL_VERIFICATION",
    VERIFICATION_TOKEN_MS,
    now,
  );
  await getEmailService().send(verificationEmail(user.email, user.name, token));
}

// Nome para a conta nova. Se o Google não mandar, usa o começo do e-mail ("ana" em ana@email.com).
function nameFromGoogle(name: string | undefined, email: string) {
  const trimmedName = name?.trim();
  return (trimmedName || email.split("@")[0]).slice(0, NAME_MAX_LENGTH);
}

// Encontra ou cria a conta de quem voltou do Google, seguindo as regras de vínculo da SPEC §5.
async function findOrCreateGoogleUser(
  profile: GoogleProfile,
  ip: string,
  now: Date,
) {
  const account = {
    provider: GOOGLE_PROVIDER,
    providerUserId: profile.providerUserId,
  };

  const linkedUser = await oauthAccountRepository.findUser(account);
  if (linkedUser) return linkedUser;

  // Daqui em diante o e-mail decide de quem é a conta, então ele precisa ser verificado pelo Google.
  if (!profile.emailVerified) throw new GoogleEmailNotVerifiedError();

  const email = normalizeEmail(profile.email);
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser?.emailVerifiedAt) {
    await oauthAccountRepository.link(existingUser.id, account);
    logSecurityEvent("google_linked", { userId: existingUser.id, ip });
    return existingUser;
  }

  if (existingUser) {
    const claimedUser = await oauthAccountRepository.claimUnverifiedUser(
      existingUser.id,
      account,
      now,
    );
    logSecurityEvent("google_unverified_claimed", {
      userId: existingUser.id,
      ip,
    });
    return claimedUser;
  }

  const newUser = await oauthAccountRepository.createUser({
    ...account,
    name: nameFromGoogle(profile.name, email),
    email,
    now,
  });
  logSecurityEvent("register", { userId: newUser.id, ip });
  return newUser;
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

  // Sempre "deu certo" para quem pede: não revela se o e-mail tem conta. Vale também para conta só
  // do Google, que assim ganha uma senha.
  async requestPasswordReset(
    email: string,
    { ip }: RequestOrigin,
    now = new Date(),
  ) {
    await rateLimitService.consume("emailPerIp", ip, now);
    await rateLimitService.consume("emailPerAddress", email, now);

    const user = await userRepository.findByEmail(email);
    if (!user) return;

    const token = await createEmailToken(
      user.id,
      "PASSWORD_RESET",
      PASSWORD_RESET_TOKEN_MS,
      now,
    );
    logSecurityEvent("password_reset_requested", { userId: user.id, ip });
    await getEmailService().send(
      passwordResetEmail(user.email, user.name, token),
    );
  },

  // Não cria sessão: quem redefine entra de novo com a senha nova (o link do e-mail não vira login).
  async resetPassword(
    { token, password }: ResetPasswordInput,
    { ip }: RequestOrigin,
    now = new Date(),
  ) {
    await rateLimitService.consume("tokenPerIp", ip, now);

    const emailToken = await emailTokenRepository.findValid(
      hashToken(token),
      "PASSWORD_RESET",
      now,
    );
    if (!emailToken) throw new InvalidTokenError();

    const passwordHash = await hashPassword(password);
    const consumed = await emailTokenRepository.consumeAndResetPassword(
      emailToken.id,
      emailToken.userId,
      passwordHash,
      now,
    );
    if (!consumed) throw new InvalidTokenError();
    logSecurityEvent("password_reset_completed", {
      userId: emailToken.userId,
      ip,
    });
  },

  // Mesmo limite por IP do login com senha: o retorno do Google também cria sessão.
  async loginWithGoogle(
    profile: GoogleProfile,
    { ip }: RequestOrigin,
    now = new Date(),
  ) {
    await rateLimitService.consume("loginPerIp", ip, now);

    const user = await findOrCreateGoogleUser(profile, ip, now);
    // Sessão nova, como no login com senha. No caso da conta tomada, as antigas já foram apagadas.
    const session = await sessionService.create(user, now);
    logSecurityEvent("google_login", { userId: user.id, ip });
    return { user, ...session };
  },

  async logout(token: string | undefined, { ip }: RequestOrigin) {
    if (!token) return;
    await sessionService.invalidate(token);
    logSecurityEvent("logout", { ip });
  },
};
