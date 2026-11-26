import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { hashToken } from "@/server/lib/tokens";
import { sessionRepository } from "@/server/repositories/session.repository";
import { sessionService } from "./session.service";

vi.mock("@/server/repositories/session.repository", () => ({
  sessionRepository: {
    create: vi.fn(),
    findWithUser: vi.fn(),
    updateExpiration: vi.fn(),
    delete: vi.fn(),
  },
}));

const now = new Date("2026-11-20T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;
const inDays = (days: number) => new Date(now.getTime() + days * DAY_MS);

function makeUser(role: Role = "CUSTOMER"): User {
  return {
    id: "user-1",
    name: "Ana",
    email: "ana@example.com",
    passwordHash: "hash",
    emailVerifiedAt: now,
    role,
    isDemo: false,
    createdAt: now,
    updatedAt: now,
  };
}

function storedSession(expiresAt: Date, role: Role = "CUSTOMER") {
  vi.mocked(sessionRepository.findWithUser).mockResolvedValue({
    id: "hash",
    userId: "user-1",
    expiresAt,
    createdAt: now,
    user: makeUser(role),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("sessionService.create", () => {
  it("stores only the hash of the token that goes to the cookie", async () => {
    const { token } = await sessionService.create(makeUser(), now);

    const [saved] = vi.mocked(sessionRepository.create).mock.calls[0];
    expect(saved.id).toBe(hashToken(token));
    expect(saved.id).not.toBe(token);
  });

  it("lasts 30 days for customers and 8 hours for staff", async () => {
    const customer = await sessionService.create(makeUser("CUSTOMER"), now);
    const admin = await sessionService.create(makeUser("ADMIN"), now);
    const demoAdmin = await sessionService.create(makeUser("DEMO_ADMIN"), now);

    expect(customer.expiresAt).toEqual(inDays(30));
    expect(admin.expiresAt).toEqual(new Date("2026-11-20T20:00:00Z"));
    expect(demoAdmin.expiresAt).toEqual(new Date("2026-11-20T20:00:00Z"));
  });
});

describe("sessionService.validate", () => {
  it("returns null for an unknown token", async () => {
    vi.mocked(sessionRepository.findWithUser).mockResolvedValue(null);

    await expect(sessionService.validate("token", { now })).resolves.toBeNull();
  });

  it("deletes and rejects an expired session", async () => {
    storedSession(new Date(now.getTime() - 1));

    await expect(sessionService.validate("token", { now })).resolves.toBeNull();
    expect(sessionRepository.delete).toHaveBeenCalledWith(hashToken("token"));
  });

  it("keeps a customer session with more than 15 days left as it is", async () => {
    storedSession(inDays(20));

    const session = await sessionService.validate("token", { now });

    expect(session).toMatchObject({ renewed: false, expiresAt: inDays(20) });
    expect(sessionRepository.updateExpiration).not.toHaveBeenCalled();
  });

  it("renews a customer session with less than 15 days left for 30 more days", async () => {
    storedSession(inDays(10));

    const session = await sessionService.validate("token", { now });

    expect(session).toMatchObject({ renewed: true, expiresAt: inDays(30) });
    expect(sessionRepository.updateExpiration).toHaveBeenCalledWith(
      hashToken("token"),
      inDays(30),
    );
  });

  it("never renews a staff session", async () => {
    storedSession(new Date(now.getTime() + 60_000), "ADMIN");

    const session = await sessionService.validate("token", { now });

    expect(session?.renewed).toBe(false);
    expect(sessionRepository.updateExpiration).not.toHaveBeenCalled();
  });

  it("can skip the renewal when the caller cannot rewrite the cookie", async () => {
    storedSession(inDays(10));

    const session = await sessionService.validate("token", {
      now,
      renew: false,
    });

    expect(session?.renewed).toBe(false);
    expect(sessionRepository.updateExpiration).not.toHaveBeenCalled();
  });
});
