import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimitedError } from "@/server/errors/auth.errors";
import { rateLimitRepository } from "@/server/repositories/rate-limit.repository";
import { rateLimitService } from "./rate-limit.service";

vi.mock("@/server/repositories/rate-limit.repository", () => ({
  rateLimitRepository: { increment: vi.fn(), deleteExpired: vi.fn() },
}));
vi.mock("@/server/lib/security-log", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/lib/security-log")>()),
  logSecurityEvent: vi.fn(),
}));

const now = new Date("2026-11-20T12:00:00Z");

function attemptsSoFar(
  count: number,
  resetAt = new Date("2026-11-20T12:15:00Z"),
) {
  vi.mocked(rateLimitRepository.increment).mockResolvedValue({
    count,
    resetAt,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("rateLimitService.consume", () => {
  it("lets the attempts up to the limit through", async () => {
    attemptsSoFar(5);

    await expect(
      rateLimitService.consume(
        "loginPerAccount",
        "1.2.3.4|ana@example.com",
        now,
      ),
    ).resolves.toBeUndefined();
  });

  it("blocks the attempt after the limit and says when to try again", async () => {
    attemptsSoFar(6);

    const error = await rateLimitService
      .consume("loginPerAccount", "1.2.3.4|ana@example.com", now)
      .catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(RateLimitedError);
    expect((error as RateLimitedError).retryAfterSeconds).toBe(15 * 60);
  });

  it("uses a window of the rule's size and never stores the identifier in plain text", async () => {
    attemptsSoFar(1);

    await rateLimitService.consume(
      "loginPerAccount",
      "1.2.3.4|ana@example.com",
      now,
    );

    const [key, , resetAt] = vi.mocked(rateLimitRepository.increment).mock
      .calls[0];
    expect(key).toMatch(/^loginPerAccount:[0-9a-f]{16}$/);
    expect(key).not.toContain("ana");
    expect(resetAt).toEqual(new Date("2026-11-20T12:15:00Z"));
  });

  it("keeps separate counters for different rules and identifiers", async () => {
    attemptsSoFar(1);

    await rateLimitService.consume("loginPerIp", "1.2.3.4", now);
    await rateLimitService.consume("loginPerIp", "5.6.7.8", now);
    await rateLimitService.consume("registerPerIp", "1.2.3.4", now);

    const keys = vi
      .mocked(rateLimitRepository.increment)
      .mock.calls.map(([key]) => key);
    expect(new Set(keys).size).toBe(3);
  });
});
