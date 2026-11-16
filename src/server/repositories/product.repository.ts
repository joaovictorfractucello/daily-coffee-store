import "server-only";
import type { ProductCategory } from "@/generated/prisma/enums";
import { prisma } from "@/server/lib/prisma";

export type ProductFilters = {
  category?: ProductCategory;
  featured?: boolean;
};

const displayOrder = [
  { category: "asc" },
  { priceInCents: "asc" },
  { name: "asc" },
] as const;

export const productRepository = {
  findActive({ category, featured }: ProductFilters) {
    return prisma.product.findMany({
      where: { isActive: true, category, isFeatured: featured },
      orderBy: [...displayOrder],
    });
  },

  findActiveBySlug(slug: string) {
    return prisma.product.findFirst({ where: { slug, isActive: true } });
  },
};
