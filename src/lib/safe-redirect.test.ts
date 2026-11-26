import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "./safe-redirect";

describe("safeRedirectPath", () => {
  it("accepts internal paths, with query string", () => {
    expect(safeRedirectPath("/conta")).toBe("/conta");
    expect(safeRedirectPath("/cardapio?q=cafe")).toBe("/cardapio?q=cafe");
  });

  it.each([
    "https://site-falso.com",
    "//site-falso.com",
    "/\\site-falso.com",
    "javascript:alert(1)",
    "conta",
    "/\nhttps://site-falso.com",
  ])("falls back to the home for %j", (next) => {
    expect(safeRedirectPath(next)).toBe("/");
  });

  it("falls back for missing or non-text values", () => {
    expect(safeRedirectPath(undefined)).toBe("/");
    expect(safeRedirectPath(null, "/conta")).toBe("/conta");
    expect(safeRedirectPath(["/conta"])).toBe("/");
  });
});
