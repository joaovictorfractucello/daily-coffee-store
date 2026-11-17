import { describe, expect, it } from "vitest";
import { seedProducts } from "../../prisma/seed-data/products";
import {
  categoryFromSlug,
  categoryOrder,
  categorySlugs,
  menuCategoryLink,
} from "./product-categories";

describe("category addresses", () => {
  it("links a category as /cardapio/<slug>", () => {
    expect(menuCategoryLink("CAFES")).toBe("/cardapio/cafes");
    expect(menuCategoryLink("BEBIDAS_GELADAS")).toBe(
      "/cardapio/bebidas-geladas",
    );
  });

  it("finds the category from its slug", () => {
    expect(categoryFromSlug("doces")).toBe("DOCES");
  });

  it("ignores a slug that is not a category", () => {
    expect(categoryFromSlug("espresso")).toBeUndefined();
    expect(categoryFromSlug(undefined)).toBeUndefined();
  });

  // /cardapio/[slug] serves categories and products. A product with a category's slug would be
  // unreachable (the category wins), so the two sets of slugs must never overlap.
  it("keeps product slugs apart from category slugs", () => {
    const categorySlugList = categoryOrder.map(
      (category) => categorySlugs[category],
    );
    const clashingSlugs = seedProducts
      .map((product) => product.slug)
      .filter((slug) => categorySlugList.includes(slug));

    expect(clashingSlugs).toEqual([]);
  });
});
