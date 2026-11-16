import { describe, expect, it } from "vitest";
import { ValidationError } from "@/server/errors/validation.error";
import { parseInput } from "./parse-input";
import {
  productListQuerySchema,
  productSearchTermSchema,
  productSlugSchema,
} from "./product.validator";

describe("productListQuerySchema", () => {
  it("accepts an empty query", () => {
    expect(parseInput(productListQuerySchema, {})).toEqual({});
  });

  it("accepts a known category and turns featured into a boolean", () => {
    expect(
      parseInput(productListQuerySchema, {
        category: "BEBIDAS_GELADAS",
        featured: "true",
      }),
    ).toEqual({ category: "BEBIDAS_GELADAS", featured: true });

    expect(parseInput(productListQuerySchema, { featured: "false" })).toEqual({
      featured: false,
    });
  });

  it.each([
    { category: "BEBIDAS" },
    { category: "cafes" },
    { featured: "yes" },
  ])("rejects %o with ValidationError", (query) => {
    expect(() => parseInput(productListQuerySchema, query)).toThrow(
      ValidationError,
    );
  });
});

describe("search term", () => {
  it("accepts a trimmed q in the list query", () => {
    expect(parseInput(productListQuerySchema, { q: "  pão " })).toEqual({
      q: "pão",
    });
  });

  it("rejects a q longer than 60 characters", () => {
    expect(() =>
      parseInput(productListQuerySchema, { q: "a".repeat(61) }),
    ).toThrow(ValidationError);
  });

  it("requires a non-empty term for the search page", () => {
    expect(parseInput(productSearchTermSchema, " espresso ")).toBe("espresso");
    expect(productSearchTermSchema.safeParse("   ").success).toBe(false);
  });
});

describe("productSlugSchema", () => {
  it("accepts a slug made of lowercase words and hyphens", () => {
    expect(parseInput(productSlugSchema, "pao-de-queijo-quentinho")).toBe(
      "pao-de-queijo-quentinho",
    );
  });

  it.each(["Pão-de-Queijo", "../etc", "-espresso", "a".repeat(121)])(
    "rejects %s with ValidationError",
    (slug) => {
      expect(() => parseInput(productSlugSchema, slug)).toThrow(
        ValidationError,
      );
    },
  );
});
