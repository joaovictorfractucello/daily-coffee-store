import { afterEach, describe, expect, it, vi } from "vitest";
import { healthRepository } from "@/server/repositories/health.repository";
import { healthService } from "./health.service";

vi.mock("@/server/repositories/health.repository", () => ({
  healthRepository: { ping: vi.fn() },
}));

describe("healthService.check", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns ok when the repository answers", async () => {
    vi.mocked(healthRepository.ping).mockResolvedValue(undefined);

    await expect(healthService.check()).resolves.toEqual({ status: "ok" });
  });

  it("returns error without details when the repository fails", async () => {
    vi.mocked(healthRepository.ping).mockRejectedValue(
      new Error("connection to ep-secret-host refused"),
    );
    vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await healthService.check();

    expect(result).toEqual({ status: "error" });
    expect(JSON.stringify(result)).not.toContain("ep-secret-host");
  });
});
