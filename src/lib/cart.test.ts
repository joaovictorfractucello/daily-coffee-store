import { describe, expect, it } from "vitest";
import {
  addCartItem,
  countCartUnits,
  isAtQuantityLimit,
  mergeCartItems,
  removeCartItems,
  sanitizeCartItems,
  setCartItemQuantity,
  sumCartLines,
} from "./cart";

describe("cart items", () => {
  it("adds a new product at the end", () => {
    const items = addCartItem([{ productId: "a", quantity: 1 }], {
      productId: "b",
      quantity: 2,
    });

    expect(items).toEqual([
      { productId: "a", quantity: 1 },
      { productId: "b", quantity: 2 },
    ]);
  });

  it("adds to the quantity of a product already in the cart", () => {
    const items = addCartItem([{ productId: "a", quantity: 2 }], {
      productId: "a",
      quantity: 3,
    });

    expect(items).toEqual([{ productId: "a", quantity: 5 }]);
  });

  it("never goes past 99 units of a product", () => {
    const items = addCartItem([{ productId: "a", quantity: 98 }], {
      productId: "a",
      quantity: 5,
    });

    expect(items).toEqual([{ productId: "a", quantity: 99 }]);
    expect(isAtQuantityLimit(items, "a")).toBe(true);
  });

  it("merges repeated products keeping the first position", () => {
    const items = mergeCartItems([
      { productId: "a", quantity: 1 },
      { productId: "b", quantity: 1 },
      { productId: "a", quantity: 2 },
    ]);

    expect(items).toEqual([
      { productId: "a", quantity: 3 },
      { productId: "b", quantity: 1 },
    ]);
  });

  it("keeps a changed quantity between 1 and 99", () => {
    const items = [{ productId: "a", quantity: 2 }];

    expect(setCartItemQuantity(items, "a", 0)).toEqual([
      { productId: "a", quantity: 1 },
    ]);
    expect(setCartItemQuantity(items, "a", 150)).toEqual([
      { productId: "a", quantity: 99 },
    ]);
  });

  it("keeps only valid items from a stored cart", () => {
    const stored = [
      { productId: "a", quantity: 2, priceInCents: 1 },
      { productId: "b", quantity: -4 },
      { productId: "a", quantity: 1 },
      { productId: 42, quantity: 1 },
      "lixo",
      null,
    ];

    expect(sanitizeCartItems(stored)).toEqual([
      { productId: "a", quantity: 3 },
      { productId: "b", quantity: 1 },
    ]);
    expect(sanitizeCartItems("não é lista")).toEqual([]);
  });

  it("removes products and counts the units left", () => {
    const items = removeCartItems(
      [
        { productId: "a", quantity: 2 },
        { productId: "b", quantity: 1 },
        { productId: "c", quantity: 4 },
      ],
      ["b"],
    );

    expect(items.map((item) => item.productId)).toEqual(["a", "c"]);
    expect(countCartUnits(items)).toBe(6);
  });

  it("sums price times quantity for the screen", () => {
    expect(
      sumCartLines([
        { priceInCents: 700, quantity: 2 },
        { priceInCents: 1400, quantity: 1 },
      ]),
    ).toBe(2800);
    expect(sumCartLines([])).toBe(0);
  });
});
