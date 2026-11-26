import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimitedError } from "@/server/errors/auth.errors";
import { rateLimitService } from "@/server/services/rate-limit.service";
import { withRateLimit } from "./with-rate-limit";

vi.mock("@/server/services/rate-limit.service", () => ({
  rateLimitService: { consume: vi.fn() },
}));

const request = new Request("https://loja.test/api/cart/quote", {
  method: "POST",
  headers: { "x-real-ip": "203.0.113.7" },
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("withRateLimit", () => {
  it("counts the call by IP and runs the handler", async () => {
    const response = new Response(null, { status: 204 });
    const handler = vi.fn().mockResolvedValue(response);

    const result = await withRateLimit("quotePerIp", handler)(request, {});

    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "quotePerIp",
      "203.0.113.7",
    );
    expect(result).toBe(response);
  });

  it("does not run the handler when the limit is exceeded", async () => {
    vi.mocked(rateLimitService.consume).mockRejectedValueOnce(
      new RateLimitedError(30),
    );
    const handler = vi.fn();

    await expect(
      withRateLimit("quotePerIp", handler)(request, {}),
    ).rejects.toBeInstanceOf(RateLimitedError);
    expect(handler).not.toHaveBeenCalled();
  });
});
