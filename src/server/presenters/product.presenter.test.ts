import { describe, expect, it } from "vitest";
import type { Product } from "@/generated/prisma/client";
import { presentProduct } from "./product.presenter";

const product: Product = {
  id: "prod_1",
  name: "Cold brew",
  slug: "cold-brew",
  description: "Extraído a frio por 16 horas.",
  priceInCents: 1600,
  imageUrl: "/images/produtos/cold-brew.webp",
  category: "BEBIDAS_GELADAS",
  isActive: true,
  isFeatured: false,
  createdAt: new Date("2026-11-13T00:00:00Z"),
  updatedAt: new Date("2026-11-13T00:00:00Z"),
};

describe("presentProduct", () => {
  it("exposes only the public fields", () => {
    expect(presentProduct(product)).toEqual({
      id: "prod_1",
      name: "Cold brew",
      slug: "cold-brew",
      description: "Extraído a frio por 16 horas.",
      priceInCents: 1600,
      imageUrl: "/images/produtos/cold-brew.webp",
      category: "BEBIDAS_GELADAS",
      isFeatured: false,
    });
  });

  it("never exposes internal fields", () => {
    const presented = presentProduct(product);

    expect(presented).not.toHaveProperty("isActive");
    expect(presented).not.toHaveProperty("createdAt");
    expect(presented).not.toHaveProperty("updatedAt");
  });
});
