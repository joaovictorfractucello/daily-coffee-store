import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailToken, User } from "@/generated/prisma/client";
import {
  EmailNotVerifiedError,
  InvalidCredentialsError,
  InvalidTokenError,
  RateLimitedError,
} from "@/server/errors/auth.errors";
import { getEmailService } from "@/server/lib/email/email-service";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { emailTokenRepository } from "@/server/repositories/email-token.repository";
import { userRepository } from "@/server/repositories/user.repository";
import { authService } from "./auth.service";
import { rateLimitService } from "./rate-limit.service";
import { sessionService } from "./session.service";

vi.mock("@/env", () => ({ env: { APP_URL: "https://loja.test" } }));
vi.mock("@/server/repositories/user.repository", () => ({
  userRepository: { findByEmail: vi.fn(), create: vi.fn() },
}));
vi.mock("@/server/repositories/email-token.repository", () => ({
  emailTokenRepository: {
    replace: vi.fn(),
    findValid: vi.fn(),
    consumeAndVerifyEmail: vi.fn(),
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

describe("authService.logout", () => {
  it("ends the session and accepts a missing cookie", async () => {
    await authService.logout("token", origin);
    await authService.logout(undefined, origin);

    expect(sessionService.invalidate).toHaveBeenCalledTimes(1);
    expect(sessionService.invalidate).toHaveBeenCalledWith("token");
  });
});
