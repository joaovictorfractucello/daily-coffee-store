import { describe, expect, it } from "vitest";
import { normalizeSearchText } from "./search-text";

describe("normalizeSearchText", () => {
  it("ignores accents, case and surrounding spaces", () => {
    expect(normalizeSearchText("  Pão de QUEIJO ")).toBe("pao de queijo");
  });

  it("keeps cedilla and tilde words comparable to their plain form", () => {
    expect(normalizeSearchText("Limão")).toBe(normalizeSearchText("limao"));
    expect(normalizeSearchText("Frappé")).toBe(normalizeSearchText("frappe"));
  });
});
