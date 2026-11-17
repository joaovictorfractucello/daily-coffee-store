import type { ProductCategory } from "@/generated/prisma/enums";
import { menuLink } from "@/lib/links";

export const categoryOrder: ProductCategory[] = [
  "CAFES",
  "BEBIDAS_GELADAS",
  "SALGADOS",
  "DOCES",
];

export const categoryLabels: Record<ProductCategory, string> = {
  CAFES: "Cafés",
  BEBIDAS_GELADAS: "Bebidas geladas",
  SALGADOS: "Salgados",
  DOCES: "Doces",
};

// Endereço público da categoria: /cardapio/cafes. Ele divide a rota /cardapio/[slug] com os produtos,
// então nenhum produto pode ter um slug igual ao de uma categoria (há um teste que garante isso).
export const categorySlugs: Record<ProductCategory, string> = {
  CAFES: "cafes",
  BEBIDAS_GELADAS: "bebidas-geladas",
  SALGADOS: "salgados",
  DOCES: "doces",
};

export function categoryFromSlug(slug: string | undefined) {
  return categoryOrder.find((category) => categorySlugs[category] === slug);
}

export function menuCategoryLink(category: ProductCategory) {
  return `${menuLink}/${categorySlugs[category]}`;
}
