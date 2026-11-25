import { afterEach, describe, expect, it, vi } from "vitest";
import { OAuthCallbackError } from "@/server/errors/auth.errors";
import { logSecurityEvent } from "@/server/lib/security-log";
import { withRedirectOnError } from "./with-redirect-on-error";

vi.mock("@/server/lib/security-log", () => ({ logSecurityEvent: vi.fn() }));

const request = new Request("https://loja.test/api/auth/google/callback", {
  headers: { "x-real-ip": "203.0.113.7" },
});
const options = {
  redirectTo: "/entrar?erro=google",
  failureEvent: "google_login_failure",
} as const;

afterEach(() => {
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("withRedirectOnError", () => {
  it("returns the handler response when nothing fails", async () => {
    const response = new Response(null, { status: 204 });
    const handler = withRedirectOnError(async () => response, options);

    expect(await handler(request, {})).toBe(response);
    expect(logSecurityEvent).not.toHaveBeenCalled();
  });

  it("redirects a domain error to the page and logs only its code", async () => {
    const handler = withRedirectOnError(async () => {
      throw new OAuthCallbackError();
    }, options);

    const response = await handler(request, {});

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://loja.test/entrar?erro=google",
    );
    expect(logSecurityEvent).toHaveBeenCalledWith("google_login_failure", {
      ip: "203.0.113.7",
      reason: "OAUTH_CALLBACK_FAILED",
    });
  });

  it("also redirects an unexpected error, logging it for investigation", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const handler = withRedirectOnError(async () => {
      throw new Error("banco fora do ar");
    }, options);

    const response = await handler(request, {});

    expect(response.headers.get("location")).toBe(
      "https://loja.test/entrar?erro=google",
    );
    expect(consoleError).toHaveBeenCalled();
    expect(logSecurityEvent).toHaveBeenCalledWith("google_login_failure", {
      ip: "203.0.113.7",
      reason: "INTERNAL_ERROR",
    });
  });
});
