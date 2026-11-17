import { describe, expect, it } from "vitest";
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from "./quantity";

describe("clampQuantity", () => {
  it("keeps a valid quantity", () => {
    expect(clampQuantity(3)).toBe(3);
  });

  it("never goes below the minimum", () => {
    expect(clampQuantity(0)).toBe(MIN_QUANTITY);
    expect(clampQuantity(-5)).toBe(MIN_QUANTITY);
  });

  it("never goes above the maximum", () => {
    expect(clampQuantity(MAX_QUANTITY + 1)).toBe(MAX_QUANTITY);
  });

  it("drops the decimal part", () => {
    expect(clampQuantity(2.9)).toBe(2);
  });

  it("falls back to the minimum for values that are not numbers", () => {
    expect(clampQuantity(Number.NaN)).toBe(MIN_QUANTITY);
    expect(clampQuantity(Number.POSITIVE_INFINITY)).toBe(MIN_QUANTITY);
  });
});
