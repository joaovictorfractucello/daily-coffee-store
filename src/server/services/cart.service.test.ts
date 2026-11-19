import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/generated/prisma/client";
import { productRepository } from "@/server/repositories/product.repository";
import { cartService } from "./cart.service";

vi.mock("@/server/repositories/product.repository", () => ({
  productRepository: { findActiveByIds: vi.fn() },
}));

function makeProduct(id: string, priceInCents: number): Product {
  return {
    id,
    name: `Produto ${id}`,
    slug: `produto-${id}`,
    description: "Descrição.",
    priceInCents,
    imageUrl: `/images/produtos/${id}.webp`,
    category: "CAFES",
    isActive: true,
    isFeatured: false,
    createdAt: new Date("2026-11-18T00:00:00Z"),
    updatedAt: new Date("2026-11-18T00:00:00Z"),
  };
}

const espresso = makeProduct("espresso", 700);
const cappuccino = makeProduct("cappuccino", 1400);

describe("cartService.quote", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("prices each item with the price stored in the database", async () => {
    vi.mocked(productRepository.findActiveByIds).mockResolvedValue([
      espresso,
      cappuccino,
    ]);

    const quote = await cartService.quote([
      { productId: "cappuccino", quantity: 2 },
      { productId: "espresso", quantity: 3 },
    ]);

    expect(
      quote.items.map(({ product, quantity, lineTotalInCents }) => ({
        id: product.id,
        quantity,
        lineTotalInCents,
      })),
    ).toEqual([
      { id: "cappuccino", quantity: 2, lineTotalInCents: 2800 },
      { id: "espresso", quantity: 3, lineTotalInCents: 2100 },
    ]);
    expect(quote.subtotalInCents).toBe(4900);
    expect(quote.unavailableProductIds).toEqual([]);
  });

  it("merges repeated products, capped at 99 units, and queries each id once", async () => {
    vi.mocked(productRepository.findActiveByIds).mockResolvedValue([espresso]);

    const quote = await cartService.quote([
      { productId: "espresso", quantity: 60 },
      { productId: "espresso", quantity: 60 },
    ]);

    expect(productRepository.findActiveByIds).toHaveBeenCalledWith([
      "espresso",
    ]);
    expect(quote.items[0].quantity).toBe(99);
    expect(quote.subtotalInCents).toBe(99 * 700);
  });

  it("reports products that are inactive or do not exist", async () => {
    vi.mocked(productRepository.findActiveByIds).mockResolvedValue([espresso]);

    const quote = await cartService.quote([
      { productId: "espresso", quantity: 1 },
      { productId: "removed", quantity: 2 },
    ]);

    expect(quote.items.map((item) => item.product.id)).toEqual(["espresso"]);
    expect(quote.unavailableProductIds).toEqual(["removed"]);
    expect(quote.subtotalInCents).toBe(700);
  });

  it("returns an empty quote without querying the database", async () => {
    const quote = await cartService.quote([]);

    expect(quote).toEqual({
      items: [],
      unavailableProductIds: [],
      subtotalInCents: 0,
    });
    expect(productRepository.findActiveByIds).not.toHaveBeenCalled();
  });
});
