import { afterEach, describe, expect, it, vi } from "vitest";

async function robotsFor(isProductionDeployment: boolean) {
  vi.doMock("@/server/lib/deployment", () => ({ isProductionDeployment }));
  const { default: robots } = await import("./robots");
  return robots();
}

describe("robots", () => {
  afterEach(() => {
    vi.resetModules();
  });

  it("allows the site and blocks the api in production", async () => {
    expect(await robotsFor(true)).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    });
  });

  it("blocks everything outside production", async () => {
    expect(await robotsFor(false)).toEqual({
      rules: { userAgent: "*", disallow: "/" },
    });
  });
});
