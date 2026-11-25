import { describe, expect, it, vi } from "vitest";
import { OAuthCallbackError } from "@/server/errors/auth.errors";
import { googleOAuth, isMatchingState } from "./google-oauth";

vi.mock("@/env", () => ({
  env: {
    APP_URL: "https://loja.test",
    GOOGLE_CLIENT_ID: "client-id",
    GOOGLE_CLIENT_SECRET: "client-secret",
  },
}));

describe("isMatchingState", () => {
  it("accepts the state stored in this browser", () => {
    expect(isMatchingState("abc123", "abc123")).toBe(true);
  });

  it("refuses a different, missing or empty state", () => {
    expect(isMatchingState("abc123", "abc124")).toBe(false);
    expect(isMatchingState("abc", "abc123")).toBe(false);
    expect(isMatchingState(null, "abc123")).toBe(false);
    expect(isMatchingState("abc123", undefined)).toBe(false);
    expect(isMatchingState("", "")).toBe(false);
  });
});

describe("googleOAuth.createAuthorization", () => {
  it("asks Google for the basic scopes with PKCE and our callback URL", () => {
    const { url, state } = googleOAuth.createAuthorization();

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("state")).toBe(state);
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://loja.test/api/auth/google/callback",
    );
  });
});

describe("googleOAuth.fetchProfile", () => {
  it("refuses the callback before calling Google when the state does not match", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      googleOAuth.fetchProfile({
        code: "codigo",
        state: "forjado",
        storedState: "original",
        codeVerifier: "verifier",
      }),
    ).rejects.toBeInstanceOf(OAuthCallbackError);

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
