import { notFound } from "next/navigation";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppError, type ErrorKind } from "./app-error";
import { withErrorHandler } from "./error-handler";

const request = new Request("http://localhost/api/anything");

const handlerThrowing = (error: unknown) =>
  withErrorHandler(async () => {
    throw error;
  });

describe("withErrorHandler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the handler response when nothing is thrown", async () => {
    const handler = withErrorHandler(async () => Response.json({ ok: true }));

    const response = await handler(request, undefined);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it.each<[ErrorKind, number]>([
    ["NOT_FOUND", 404],
    ["CONFLICT", 409],
    ["VALIDATION", 400],
    ["UNAUTHORIZED", 401],
    ["FORBIDDEN", 403],
  ])("maps AppError kind %s to status %i", async (kind, expectedStatus) => {
    const error = new AppError({
      message: "Produto não encontrado.",
      code: "PRODUCT_NOT_FOUND",
      kind,
    });

    const response = await handlerThrowing(error)(request, undefined);

    expect(response.status).toBe(expectedStatus);
    await expect(response.json()).resolves.toEqual({
      error: { code: "PRODUCT_NOT_FOUND", message: "Produto não encontrado." },
    });
  });

  it("hides internal details of unknown errors and logs them", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    const secret = new Error("password=hunter2 failed at db.internal");

    const response = await handlerThrowing(secret)(request, undefined);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: { code: "INTERNAL_ERROR", message: "Erro interno." },
    });
    expect(JSON.stringify(body)).not.toContain("hunter2");
    expect(logError).toHaveBeenCalledWith(secret);
  });

  it("lets Next.js internal errors pass through", async () => {
    const logError = vi.spyOn(console, "error").mockImplementation(() => {});
    const handler = withErrorHandler(async () => notFound());

    await expect(handler(request, undefined)).rejects.toBeDefined();
    expect(logError).not.toHaveBeenCalled();
  });
});
