import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailToken, User } from "@/generated/prisma/client";
import {
  BreachedPasswordError,
  EmailNotVerifiedError,
  GoogleEmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidCurrentPasswordError,
  InvalidTokenError,
  PasswordNotSetError,
  RateLimitedError,
} from "@/server/errors/auth.errors";
import { getEmailService } from "@/server/lib/email/email-service";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { checkPasswordBreach } from "@/server/lib/pwned-passwords";
import { logSecurityEvent } from "@/server/lib/security-log";
import { hashToken } from "@/server/lib/tokens";
import { emailTokenRepository } from "@/server/repositories/email-token.repository";
import { oauthAccountRepository } from "@/server/repositories/oauth-account.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { authService } from "./auth.service";
import { rateLimitService } from "./rate-limit.service";
import { sessionService } from "./session.service";

vi.mock("@/env", () => ({ env: { APP_URL: "https://loja.test" } }));
vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    create: vi.fn(),
    changePassword: vi.fn(),
  },
}));
vi.mock("@/server/repositories/email-token.repository", () => ({
  emailTokenRepository: {
    replace: vi.fn(),
    findValid: vi.fn(),
    consumeAndVerifyEmail: vi.fn(),
    consumeAndResetPassword: vi.fn(),
  },
}));
vi.mock("@/server/repositories/oauth-account.repository", () => ({
  oauthAccountRepository: {
    findUser: vi.fn(),
    hasProvider: vi.fn(),
    link: vi.fn(),
    claimUnverifiedUser: vi.fn(),
    createUser: vi.fn(),
  },
}));
vi.mock("@/server/lib/password", () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));
vi.mock("@/server/lib/email/email-service", () => {
  const emailService = { send: vi.fn() };
  return { getEmailService: () => emailService };
});
vi.mock("./rate-limit.service", () => ({
  rateLimitService: { consume: vi.fn() },
}));
vi.mock("./session.service", () => ({
  sessionService: { create: vi.fn(), invalidate: vi.fn() },
}));
vi.mock("@/server/lib/pwned-passwords", () => ({
  checkPasswordBreach: vi.fn(),
}));
vi.mock("@/server/lib/security-log", () => ({ logSecurityEvent: vi.fn() }));

const now = new Date("2026-11-20T12:00:00Z");
const origin = { ip: "203.0.113.7" };
const sentEmails = () =>
  vi.mocked(getEmailService().send).mock.calls.map(([email]) => email);

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "Ana",
    email: "ana@example.com",
    passwordHash: "hash-da-senha",
    emailVerifiedAt: new Date("2026-11-01T00:00:00Z"),
    role: "CUSTOMER",
    isDemo: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

beforeEach(() => {
  vi.mocked(hashPassword).mockResolvedValue("hash-novo");
  vi.mocked(checkPasswordBreach).mockResolvedValue("safe");
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("authService.register", () => {
  const input = {
    name: "Ana",
    email: "ana@example.com",
    password: "cafe com pao",
  };

  it("creates the user and sends the verification email with a single-use link", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue(
      makeUser({ emailVerifiedAt: null, passwordHash: "hash-novo" }),
    );

    await authService.register(input, origin, now);

    expect(userRepository.create).toHaveBeenCalledWith({
      name: "Ana",
      email: "ana@example.com",
      passwordHash: "hash-novo",
    });
    const [token] = vi.mocked(emailTokenRepository.replace).mock.calls[0];
    expect(token.type).toBe("EMAIL_VERIFICATION");
    expect(token.expiresAt).toEqual(new Date("2026-11-21T12:00:00Z"));
    const [email] = sentEmails();
    expect(email.subject).toContain("Confirme");
    expect(email.text).toContain("/verificar-email?token=");
    // O banco guarda só o hash: o token do link não pode ser o que foi salvo.
    expect(email.text).not.toContain(token.tokenHash);
  });

  it("does not create an account for an existing email and tells only the owner, by email", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

    await expect(
      authService.register(input, origin, now),
    ).resolves.toBeUndefined();

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(sentEmails()[0].subject).toContain("já tem conta");
  });

  it("hashes the password even when the email exists, so the response time does not reveal it", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

    await authService.register(input, origin, now);

    expect(hashPassword).toHaveBeenCalledWith("cafe com pao");
  });

  it("refuses a breached password before looking at the email, so it does not reveal who has an account", async () => {
    vi.mocked(checkPasswordBreach).mockResolvedValue("breached");

    await expect(
      authService.register(input, origin, now),
    ).rejects.toBeInstanceOf(BreachedPasswordError);

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(logSecurityEvent).toHaveBeenCalledWith("password_breached", {
      ip: origin.ip,
    });
  });

  it("lets the sign-up go on and logs when the breach check is unavailable", async () => {
    vi.mocked(checkPasswordBreach).mockResolvedValue("unavailable");
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(userRepository.create).mockResolvedValue(
      makeUser({ emailVerifiedAt: null, passwordHash: "hash-novo" }),
    );

    await authService.register(input, origin, now);

    expect(userRepository.create).toHaveBeenCalled();
    expect(logSecurityEvent).toHaveBeenCalledWith(
      "password_breach_check_failed",
      { ip: origin.ip },
    );
  });

  it("stops before touching the database when the rate limit is hit", async () => {
    vi.mocked(rateLimitService.consume).mockRejectedValueOnce(
      new RateLimitedError(60),
    );

    await expect(
      authService.register(input, origin, now),
    ).rejects.toBeInstanceOf(RateLimitedError);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });
});

describe("authService.login", () => {
  const input = { email: "ana@example.com", password: "cafe com pao" };

  it("creates a new session when the password matches", async () => {
    const user = makeUser();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(user);
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(sessionService.create).mockResolvedValue({
      token: "token",
      expiresAt: now,
    });

    const result = await authService.login(input, origin, now);

    expect(sessionService.create).toHaveBeenCalledWith(user, now);
    expect(result.token).toBe("token");
  });

  it("limits attempts per IP and per IP + email", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(sessionService.create).mockResolvedValue({
      token: "t",
      expiresAt: now,
    });

    await authService.login(input, origin, now);

    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "loginPerIp",
      origin.ip,
      now,
    );
    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "loginPerAccount",
      `${origin.ip}|ana@example.com`,
      now,
    );
  });

  it("gives the same error for a wrong password and for an unknown email", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(false);

    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());
    await expect(authService.login(input, origin, now)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );

    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    await expect(authService.login(input, origin, now)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
    // E-mail inexistente também passa pela conferência (contra hash falso): tempo igual.
    expect(verifyPassword).toHaveBeenLastCalledWith(undefined, "cafe com pao");
    expect(sessionService.create).not.toHaveBeenCalled();
  });

  it("refuses a Google-only account (no password) with the generic error", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      makeUser({ passwordHash: null }),
    );
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(authService.login(input, origin, now)).rejects.toBeInstanceOf(
      InvalidCredentialsError,
    );
  });

  it("refuses an unverified email only after the password is right", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      makeUser({ emailVerifiedAt: null }),
    );
    vi.mocked(verifyPassword).mockResolvedValue(true);

    await expect(authService.login(input, origin, now)).rejects.toBeInstanceOf(
      EmailNotVerifiedError,
    );
    expect(sessionService.create).not.toHaveBeenCalled();
  });
});

describe("authService.verifyEmail", () => {
  const validToken: EmailToken = {
    id: "token-1",
    tokenHash: "hash",
    userId: "user-1",
    type: "EMAIL_VERIFICATION",
    expiresAt: new Date("2026-11-21T00:00:00Z"),
    usedAt: null,
    createdAt: now,
  };

  it("marks the email as verified and uses up the token", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(validToken);
    vi.mocked(emailTokenRepository.consumeAndVerifyEmail).mockResolvedValue(
      true,
    );

    await authService.verifyEmail("token", origin, now);

    expect(emailTokenRepository.consumeAndVerifyEmail).toHaveBeenCalledWith(
      "token-1",
      "user-1",
      now,
    );
  });

  it("rejects an unknown, used or expired token", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(null);

    await expect(
      authService.verifyEmail("token", origin, now),
    ).rejects.toBeInstanceOf(InvalidTokenError);
  });

  it("rejects the second of two simultaneous clicks on the same link", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(validToken);
    vi.mocked(emailTokenRepository.consumeAndVerifyEmail).mockResolvedValue(
      false,
    );

    await expect(
      authService.verifyEmail("token", origin, now),
    ).rejects.toBeInstanceOf(InvalidTokenError);
  });
});

describe("authService.resendVerification", () => {
  it("sends a new link to an unverified account", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      makeUser({ emailVerifiedAt: null }),
    );

    await authService.resendVerification("ana@example.com", origin, now);

    expect(emailTokenRepository.replace).toHaveBeenCalled();
    expect(sentEmails()).toHaveLength(1);
  });

  it("silently does nothing for unknown or already verified emails", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    await authService.resendVerification("x@example.com", origin, now);

    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());
    await authService.resendVerification("ana@example.com", origin, now);

    expect(sentEmails()).toHaveLength(0);
  });
});

describe("authService.requestPasswordReset", () => {
  it("sends a 30-minute single-use link to an existing account", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(makeUser());

    await authService.requestPasswordReset("ana@example.com", origin, now);

    const [token] = vi.mocked(emailTokenRepository.replace).mock.calls[0];
    expect(token.type).toBe("PASSWORD_RESET");
    expect(token.expiresAt).toEqual(new Date("2026-11-20T12:30:00Z"));
    expect(sentEmails()[0].text).toContain("/redefinir-senha?token=");
  });

  it("also works for a Google-only account, which then gets a password", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      makeUser({ passwordHash: null }),
    );

    await authService.requestPasswordReset("ana@example.com", origin, now);

    expect(sentEmails()).toHaveLength(1);
  });

  it("silently does nothing for an unknown email (same answer for the screen)", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      authService.requestPasswordReset("x@example.com", origin, now),
    ).resolves.toBeUndefined();
    expect(sentEmails()).toHaveLength(0);
  });

  it("limits requests per IP and per email, so nobody floods an inbox", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await authService.requestPasswordReset("ana@example.com", origin, now);

    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "emailPerIp",
      origin.ip,
      now,
    );
    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "emailPerAddress",
      "ana@example.com",
      now,
    );
  });
});

describe("authService.resetPassword", () => {
  const resetToken: EmailToken = {
    id: "token-2",
    tokenHash: "hash",
    userId: "user-1",
    type: "PASSWORD_RESET",
    expiresAt: new Date("2026-11-20T12:30:00Z"),
    usedAt: null,
    createdAt: now,
  };
  const input = { token: "token", password: "nova senha longa" };

  it("stores the new hash in the same step that uses up the link and ends the sessions", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(resetToken);
    vi.mocked(emailTokenRepository.consumeAndResetPassword).mockResolvedValue(
      true,
    );

    await authService.resetPassword(input, origin, now);

    expect(hashPassword).toHaveBeenCalledWith("nova senha longa");
    expect(emailTokenRepository.consumeAndResetPassword).toHaveBeenCalledWith(
      "token-2",
      "user-1",
      "hash-novo",
      now,
    );
    expect(sessionService.create).not.toHaveBeenCalled();
  });

  it("refuses a breached password without using up the link, so the person can try another", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(resetToken);
    vi.mocked(checkPasswordBreach).mockResolvedValue("breached");

    await expect(
      authService.resetPassword(input, origin, now),
    ).rejects.toBeInstanceOf(BreachedPasswordError);

    expect(hashPassword).not.toHaveBeenCalled();
    expect(emailTokenRepository.consumeAndResetPassword).not.toHaveBeenCalled();
  });

  it("does not query the breach service for an invalid link", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(null);

    await expect(
      authService.resetPassword(input, origin, now),
    ).rejects.toBeInstanceOf(InvalidTokenError);

    expect(checkPasswordBreach).not.toHaveBeenCalled();
  });

  it("only accepts password reset links (not email verification ones)", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(null);

    await expect(
      authService.resetPassword(input, origin, now),
    ).rejects.toBeInstanceOf(InvalidTokenError);
    expect(emailTokenRepository.findValid).toHaveBeenCalledWith(
      expect.any(String),
      "PASSWORD_RESET",
      now,
    );
    expect(hashPassword).not.toHaveBeenCalled();
  });

  it("rejects a link that was used at the same time by another request", async () => {
    vi.mocked(emailTokenRepository.findValid).mockResolvedValue(resetToken);
    vi.mocked(emailTokenRepository.consumeAndResetPassword).mockResolvedValue(
      false,
    );

    await expect(
      authService.resetPassword(input, origin, now),
    ).rejects.toBeInstanceOf(InvalidTokenError);
  });
});

describe("authService.logout", () => {
  it("ends the session and accepts a missing cookie", async () => {
    await authService.logout("token", origin);
    await authService.logout(undefined, origin);

    expect(sessionService.invalidate).toHaveBeenCalledTimes(1);
    expect(sessionService.invalidate).toHaveBeenCalledWith("token");
  });
});

describe("authService.loginWithGoogle", () => {
  const profile = {
    providerUserId: "google-123",
    email: "Ana@Example.com",
    emailVerified: true,
    name: "Ana Souza",
  };
  const account = { provider: "google", providerUserId: "google-123" };
  const session = { token: "token-da-sessao", expiresAt: now };

  beforeEach(() => {
    vi.mocked(oauthAccountRepository.findUser).mockResolvedValue(null);
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
    vi.mocked(sessionService.create).mockResolvedValue(session);
  });

  it("signs in the user already linked to this Google account", async () => {
    const linkedUser = makeUser();
    vi.mocked(oauthAccountRepository.findUser).mockResolvedValue(linkedUser);

    const result = await authService.loginWithGoogle(profile, origin, now);

    expect(result).toEqual({ user: linkedUser, ...session });
    expect(oauthAccountRepository.findUser).toHaveBeenCalledWith(account);
    expect(oauthAccountRepository.link).not.toHaveBeenCalled();
    expect(sessionService.create).toHaveBeenCalledWith(linkedUser, now);
  });

  it("refuses a Google email that is not verified", async () => {
    await expect(
      authService.loginWithGoogle(
        { ...profile, emailVerified: false },
        origin,
        now,
      ),
    ).rejects.toBeInstanceOf(GoogleEmailNotVerifiedError);

    expect(userRepository.findByEmail).not.toHaveBeenCalled();
    expect(oauthAccountRepository.createUser).not.toHaveBeenCalled();
    expect(sessionService.create).not.toHaveBeenCalled();
  });

  it("links Google to an existing verified account, keeping its password", async () => {
    const verifiedUser = makeUser();
    vi.mocked(userRepository.findByEmail).mockResolvedValue(verifiedUser);

    const result = await authService.loginWithGoogle(profile, origin, now);

    expect(userRepository.findByEmail).toHaveBeenCalledWith("ana@example.com");
    expect(oauthAccountRepository.link).toHaveBeenCalledWith("user-1", account);
    expect(oauthAccountRepository.claimUnverifiedUser).not.toHaveBeenCalled();
    expect(result.user).toBe(verifiedUser);
  });

  it("takes over an unverified local account, dropping its password and sessions", async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(
      makeUser({ emailVerifiedAt: null, passwordHash: "senha-do-atacante" }),
    );
    const claimedUser = makeUser({ emailVerifiedAt: now, passwordHash: null });
    vi.mocked(oauthAccountRepository.claimUnverifiedUser).mockResolvedValue(
      claimedUser,
    );

    const result = await authService.loginWithGoogle(profile, origin, now);

    expect(oauthAccountRepository.claimUnverifiedUser).toHaveBeenCalledWith(
      "user-1",
      account,
      now,
    );
    expect(oauthAccountRepository.link).not.toHaveBeenCalled();
    expect(logSecurityEvent).toHaveBeenCalledWith("google_unverified_claimed", {
      userId: "user-1",
      ip: origin.ip,
    });
    expect(sessionService.create).toHaveBeenCalledWith(claimedUser, now);
    expect(result.user).toBe(claimedUser);
  });

  it("creates a verified account without password for a new email", async () => {
    const newUser = makeUser({ passwordHash: null, emailVerifiedAt: now });
    vi.mocked(oauthAccountRepository.createUser).mockResolvedValue(newUser);

    const result = await authService.loginWithGoogle(profile, origin, now);

    expect(oauthAccountRepository.createUser).toHaveBeenCalledWith({
      ...account,
      name: "Ana Souza",
      email: "ana@example.com",
      now,
    });
    expect(result).toEqual({ user: newUser, ...session });
  });

  it("names the new account after the email when Google sends no name", async () => {
    vi.mocked(oauthAccountRepository.createUser).mockResolvedValue(makeUser());

    await authService.loginWithGoogle({ ...profile, name: "   " }, origin, now);

    expect(oauthAccountRepository.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ name: "ana" }),
    );
  });

  it("stops before touching accounts when the IP is over the limit", async () => {
    vi.mocked(rateLimitService.consume).mockRejectedValueOnce(
      new RateLimitedError(60),
    );

    await expect(
      authService.loginWithGoogle(profile, origin, now),
    ).rejects.toBeInstanceOf(RateLimitedError);

    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "loginPerIp",
      origin.ip,
      now,
    );
    expect(oauthAccountRepository.findUser).not.toHaveBeenCalled();
  });
});

describe("authService.signInMethods", () => {
  it("reports a password and a linked Google account", async () => {
    vi.mocked(oauthAccountRepository.hasProvider).mockResolvedValue(true);

    const methods = await authService.signInMethods(makeUser());

    expect(methods).toEqual({ hasPassword: true, hasGoogle: true });
    expect(oauthAccountRepository.hasProvider).toHaveBeenCalledWith(
      "user-1",
      "google",
    );
  });

  it("reports no password for an account taken over by Google", async () => {
    vi.mocked(oauthAccountRepository.hasProvider).mockResolvedValue(true);

    const methods = await authService.signInMethods(
      makeUser({ passwordHash: null }),
    );

    expect(methods).toEqual({ hasPassword: false, hasGoogle: true });
  });
});

describe("authService.changePassword", () => {
  const input = {
    currentPassword: "senha atual",
    newPassword: "nova senha longa",
  };
  const sessionToken = "token-da-sessao";

  it("checks the current password, stores the new hash, keeps this session and warns by email", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true);
    const user = makeUser();

    await authService.changePassword(
      input,
      { user, sessionToken },
      origin,
      now,
    );

    expect(verifyPassword).toHaveBeenCalledWith("hash-da-senha", "senha atual");
    expect(checkPasswordBreach).toHaveBeenCalledWith("nova senha longa");
    expect(userRepository.changePassword).toHaveBeenCalledWith(
      "user-1",
      "hash-novo",
      hashToken(sessionToken),
    );
    expect(logSecurityEvent).toHaveBeenCalledWith("password_changed", {
      userId: "user-1",
      ip: origin.ip,
    });
    expect(sentEmails()[0].subject).toContain("foi alterada");
  });

  it("keeps the new password when the warning email fails", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(getEmailService().send).mockRejectedValueOnce(new Error("smtp"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      authService.changePassword(
        input,
        { user: makeUser(), sessionToken },
        origin,
        now,
      ),
    ).resolves.toBeUndefined();

    expect(userRepository.changePassword).toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "password_changed_email_failed",
      "Error",
    );
    consoleError.mockRestore();
  });

  it("refuses a wrong current password and changes nothing", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(false);

    await expect(
      authService.changePassword(
        input,
        { user: makeUser(), sessionToken },
        origin,
        now,
      ),
    ).rejects.toBeInstanceOf(InvalidCurrentPasswordError);

    expect(userRepository.changePassword).not.toHaveBeenCalled();
    expect(logSecurityEvent).toHaveBeenCalledWith("password_change_failure", {
      userId: "user-1",
      ip: origin.ip,
    });
    expect(sentEmails()).toHaveLength(0);
  });

  it("does not accept a change for an account without a password (Google only)", async () => {
    await expect(
      authService.changePassword(
        input,
        { user: makeUser({ passwordHash: null }), sessionToken },
        origin,
        now,
      ),
    ).rejects.toBeInstanceOf(PasswordNotSetError);

    expect(verifyPassword).not.toHaveBeenCalled();
    expect(userRepository.changePassword).not.toHaveBeenCalled();
  });

  it("refuses a breached new password", async () => {
    vi.mocked(verifyPassword).mockResolvedValue(true);
    vi.mocked(checkPasswordBreach).mockResolvedValue("breached");

    await expect(
      authService.changePassword(
        input,
        { user: makeUser(), sessionToken },
        origin,
        now,
      ),
    ).rejects.toBeInstanceOf(BreachedPasswordError);

    expect(userRepository.changePassword).not.toHaveBeenCalled();
  });

  it("limits attempts per account before checking the password", async () => {
    vi.mocked(rateLimitService.consume).mockRejectedValueOnce(
      new RateLimitedError(60),
    );

    await expect(
      authService.changePassword(
        input,
        { user: makeUser(), sessionToken },
        origin,
        now,
      ),
    ).rejects.toBeInstanceOf(RateLimitedError);

    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "passwordChangePerUser",
      "user-1",
      now,
    );
    expect(verifyPassword).not.toHaveBeenCalled();
  });
});
