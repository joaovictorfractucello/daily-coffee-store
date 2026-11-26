import { afterEach, describe, expect, it, vi } from "vitest";
import type { User } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import {
  ForbiddenError,
  UnauthenticatedError,
} from "@/server/errors/auth.errors";
import {
  readSessionToken,
  writeSessionCookie,
} from "@/server/lib/session-cookie";
import { sessionService } from "@/server/services/session.service";
import { withAuth } from "./with-auth";

vi.mock("@/server/lib/session-cookie", () => ({
  readSessionToken: vi.fn(),
  writeSessionCookie: vi.fn(),
}));
vi.mock("@/server/services/session.service", () => ({
  sessionService: { validate: vi.fn() },
}));

const expiresAt = new Date("2026-12-20T00:00:00Z");
const request = new Request("https://loja.test/api/auth/me");

function signedInAs(role: Role, renewed = false) {
  vi.mocked(readSessionToken).mockResolvedValue("token");
  vi.mocked(sessionService.validate).mockResolvedValue({
    user: { id: "user-1", role } as User,
    expiresAt,
    renewed,
  });
}

const okHandler = vi.fn(async () => new Response("ok"));

afterEach(() => {
  vi.clearAllMocks();
});

describe("withAuth", () => {
  it("rejects a request without a session cookie (401)", async () => {
    vi.mocked(readSessionToken).mockResolvedValue(undefined);

    await expect(withAuth(okHandler)(request, {})).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
    expect(okHandler).not.toHaveBeenCalled();
  });

  it("rejects an invalid or expired session (401)", async () => {
    vi.mocked(readSessionToken).mockResolvedValue("token");
    vi.mocked(sessionService.validate).mockResolvedValue(null);

    await expect(withAuth(okHandler)(request, {})).rejects.toBeInstanceOf(
      UnauthenticatedError,
    );
  });

  it("rejects a role that is not allowed (403)", async () => {
    signedInAs("CUSTOMER");

    await expect(
      withAuth(okHandler, { roles: ["ADMIN"] })(request, {}),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(okHandler).not.toHaveBeenCalled();
  });

  it("calls the handler with the session when everything is right", async () => {
    signedInAs("ADMIN");

    const response = await withAuth(okHandler, { roles: ["ADMIN"] })(
      request,
      {},
    );

    expect(await response.text()).toBe("ok");
    expect(okHandler).toHaveBeenCalledWith(
      request,
      {},
      expect.objectContaining({ expiresAt }),
    );
  });

  it("rewrites the cookie only when the session was renewed", async () => {
    signedInAs("CUSTOMER", true);
    await withAuth(okHandler)(request, {});
    expect(writeSessionCookie).toHaveBeenCalledWith("token", expiresAt);

    vi.clearAllMocks();
    signedInAs("CUSTOMER", false);
    await withAuth(okHandler)(request, {});
    expect(writeSessionCookie).not.toHaveBeenCalled();
  });
});
