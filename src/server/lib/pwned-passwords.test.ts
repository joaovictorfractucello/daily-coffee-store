import { createHash } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkPasswordBreach } from "./pwned-passwords";

const password = "cafe com pao";
const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
const prefix = sha1.slice(0, 5);
const suffix = sha1.slice(5);

function respondWith(body: string, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(body, { status }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("checkPasswordBreach", () => {
  it("sends only the first 5 characters of the SHA-1 and asks for padding", async () => {
    const fetchSpy = respondWith("0000000000000000000000000000000000A:1");

    await checkPasswordBreach(password);

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe(`https://api.pwnedpasswords.com/range/${prefix}`);
    expect(String(url)).not.toContain(suffix);
    expect(options?.headers).toEqual({ "Add-Padding": "true" });
  });

  it("reports a breached password when the suffix appears with a count", async () => {
    respondWith(`0000000000000000000000000000000000A:3\r\n${suffix}:42\r\n`);

    expect(await checkPasswordBreach(password)).toBe("breached");
  });

  it("ignores padding lines, which carry a count of zero", async () => {
    respondWith(`${suffix}:0\r\n0000000000000000000000000000000000A:5`);

    expect(await checkPasswordBreach(password)).toBe("safe");
  });

  it("reports a safe password when the suffix is not in the range", async () => {
    respondWith("0000000000000000000000000000000000A:5");

    expect(await checkPasswordBreach(password)).toBe("safe");
  });

  it("fails open when the service answers with an error status", async () => {
    respondWith("erro", 503);

    expect(await checkPasswordBreach(password)).toBe("unavailable");
  });

  it("fails open when the request fails or times out", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("timeout"));

    expect(await checkPasswordBreach(password)).toBe("unavailable");
  });
});
