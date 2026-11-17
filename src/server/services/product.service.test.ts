import { afterEach, describe, expect, it, vi } from "vitest";
import type { Product } from "@/generated/prisma/client";
import { ProductNotFoundError } from "@/server/errors/product-not-found.error";
import { productRepository } from "@/server/repositories/product.repository";
import { productService } from "./product.service";

vi.mock("@/server/repositories/product.repository", () => ({
  productRepository: { findActive: vi.fn(), findActiveBySlug: vi.fn() },
}));

const cappuccino: Product = {
  id: "prod_1",
  name: "Cappuccino cremoso",
  slug: "cappuccino-cremoso",
  description: "Espresso, leite vaporizado e espuma densa.",
  priceInCents: 1400,
  imageUrl: "/images/queridinhos/cappuccino-cremoso.webp",
  category: "CAFES",
  isActive: true,
  isFeatured: true,
  createdAt: new Date("2026-11-13T00:00:00Z"),
  updatedAt: new Date("2026-11-13T00:00:00Z"),
};

describe("productService.list", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("passes the filters to the repository", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([cappuccino]);

    const products = await productService.list({
      category: "CAFES",
      featured: true,
    });

    expect(productRepository.findActive).toHaveBeenCalledWith({
      category: "CAFES",
      featured: true,
    });
    expect(products).toEqual([cappuccino]);
  });

  it("lists everything when no filter is given", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([]);

    await productService.list();

    expect(productRepository.findActive).toHaveBeenCalledWith({});
  });
});

describe("productService.list with search", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const cheeseBread: Product = {
    ...cappuccino,
    id: "prod_2",
    name: "Pão de queijo quentinho",
    slug: "pao-de-queijo-quentinho",
    description: "Assado em fornadas pequenas ao longo do dia.",
    category: "SALGADOS",
  };

  it("finds products ignoring accents and case", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([
      cappuccino,
      cheeseBread,
    ]);

    await expect(productService.list({ search: "PAO" })).resolves.toEqual([
      cheeseBread,
    ]);
  });

  it("also searches the description", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([
      cappuccino,
      cheeseBread,
    ]);

    await expect(productService.list({ search: "espuma" })).resolves.toEqual([
      cappuccino,
    ]);
  });

  it("returns an empty list when nothing matches", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([cappuccino]);

    await expect(productService.list({ search: "sushi" })).resolves.toEqual([]);
  });

  it("does not send the search term to the repository", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([]);

    await productService.list({ category: "DOCES", search: "bolo" });

    expect(productRepository.findActive).toHaveBeenCalledWith({
      category: "DOCES",
    });
  });
});

describe("productService.listRelated", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  const espresso: Product = {
    ...cappuccino,
    id: "prod_3",
    name: "Espresso",
    slug: "espresso",
    isFeatured: false,
  };

  it("lists the other products of the same category", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([
      cappuccino,
      espresso,
    ]);

    const related = await productService.listRelated({
      slug: "cappuccino-cremoso",
      category: "CAFES",
    });

    expect(productRepository.findActive).toHaveBeenCalledWith({
      category: "CAFES",
    });
    expect(related).toEqual([espresso]);
  });

  it("returns an empty list when the product is alone in its category", async () => {
    vi.mocked(productRepository.findActive).mockResolvedValue([cappuccino]);

    await expect(
      productService.listRelated({
        slug: "cappuccino-cremoso",
        category: "CAFES",
      }),
    ).resolves.toEqual([]);
  });
});

describe("productService.getBySlug", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("returns the active product", async () => {
    vi.mocked(productRepository.findActiveBySlug).mockResolvedValue(cappuccino);

    await expect(
      productService.getBySlug("cappuccino-cremoso"),
    ).resolves.toEqual(cappuccino);
  });

  it("throws ProductNotFoundError when the product does not exist or is inactive", async () => {
    vi.mocked(productRepository.findActiveBySlug).mockResolvedValue(null);

    await expect(productService.getBySlug("nao-existe")).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });
});
