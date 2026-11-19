import { describe, expect, it } from "vitest";
import { ValidationError } from "@/server/errors/validation.error";
import { cartQuoteSchema, MAX_CART_LINES } from "./cart.validator";
import { parseInput } from "./parse-input";

const productId = "cmhy1n2xk0000abcd1234efgh";

function quoteWith(items: unknown) {
  return () => parseInput(cartQuoteSchema, { items });
}

describe("cartQuoteSchema", () => {
  it("accepts ids and quantities and drops any other field", () => {
    expect(
      parseInput(cartQuoteSchema, {
        items: [{ productId, quantity: 2, priceInCents: 1 }],
      }),
    ).toEqual({ items: [{ productId, quantity: 2 }] });
  });

  it("accepts an empty cart", () => {
    expect(parseInput(cartQuoteSchema, { items: [] })).toEqual({ items: [] });
  });

  it.each([0, 100, 1.5, "2"])("rejects the quantity %s", (quantity) => {
    expect(quoteWith([{ productId, quantity }])).toThrow(ValidationError);
  });

  it("rejects an id that is not in the product id format", () => {
    expect(quoteWith([{ productId: "'; drop table", quantity: 1 }])).toThrow(
      ValidationError,
    );
  });

  it("rejects a cart with too many lines", () => {
    const items = Array.from({ length: MAX_CART_LINES + 1 }, () => ({
      productId,
      quantity: 1,
    }));

    expect(quoteWith(items)).toThrow(ValidationError);
  });

  it("rejects a body without items", () => {
    expect(() => parseInput(cartQuoteSchema, {})).toThrow(ValidationError);
    expect(() => parseInput(cartQuoteSchema, null)).toThrow(ValidationError);
  });
});
