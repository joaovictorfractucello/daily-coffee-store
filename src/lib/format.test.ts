import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

const NON_BREAKING_SPACE = / /g;
const normalizeSpaces = (text: string) => text.replace(NON_BREAKING_SPACE, " ");

describe("formatPrice", () => {
  it("formats cents as reais", () => {
    expect(normalizeSpaces(formatPrice(1400))).toBe("R$ 14,00");
  });

  it("formats zero", () => {
    expect(normalizeSpaces(formatPrice(0))).toBe("R$ 0,00");
  });

  it("uses thousands separator and keeps the cents", () => {
    expect(normalizeSpaces(formatPrice(123456))).toBe("R$ 1.234,56");
  });
});
