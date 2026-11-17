import "server-only";
import type { ProductCategory } from "@/generated/prisma/enums";
import { ProductNotFoundError } from "@/server/errors/product-not-found.error";
import { normalizeSearchText } from "@/lib/search-text";
import {
  productRepository,
  type ProductFilters,
} from "@/server/repositories/product.repository";

export type ProductListFilters = ProductFilters & { search?: string };

export const productService = {
  async list({ search, ...filters }: ProductListFilters = {}) {
    const products = await productRepository.findActive(filters);
    if (!search) return products;

    const term = normalizeSearchText(search);
    return products.filter((product) =>
      normalizeSearchText(`${product.name} ${product.description}`).includes(
        term,
      ),
    );
  },

  // Relacionados = outros produtos ativos da mesma categoria (o próprio produto fica de fora).
  async listRelated({
    slug,
    category,
  }: {
    slug: string;
    category: ProductCategory;
  }) {
    const products = await productRepository.findActive({ category });
    return products.filter((product) => product.slug !== slug);
  },

  async getBySlug(slug: string) {
    const product = await productRepository.findActiveBySlug(slug);
    if (!product) throw new ProductNotFoundError();
    return product;
  },
};
