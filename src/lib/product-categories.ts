import type { ProductCategory } from "@/generated/prisma/enums";

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

export const categoryAnchors: Record<ProductCategory, string> = {
  CAFES: "cafes",
  BEBIDAS_GELADAS: "bebidas-geladas",
  SALGADOS: "salgados",
  DOCES: "doces",
};
