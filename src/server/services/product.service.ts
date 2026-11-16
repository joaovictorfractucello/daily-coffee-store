import "server-only";
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

  async getBySlug(slug: string) {
    const product = await productRepository.findActiveBySlug(slug);
    if (!product) throw new ProductNotFoundError();
    return product;
  },
};
