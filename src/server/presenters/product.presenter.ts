import "server-only";
import type { Product } from "@/generated/prisma/client";

export type PublicProduct = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "priceInCents"
  | "imageUrl"
  | "category"
  | "isFeatured"
>;

export function presentProduct(product: Product): PublicProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    priceInCents: product.priceInCents,
    imageUrl: product.imageUrl,
    category: product.category,
    isFeatured: product.isFeatured,
  };
}
