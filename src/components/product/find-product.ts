import { cache } from "react";
import { ProductNotFoundError } from "@/server/errors/product-not-found.error";
import { presentProduct } from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";
import { productSlugSchema } from "@/server/validators/product.validator";

export const findProduct = cache(async (slug: string) => {
  if (!productSlugSchema.safeParse(slug).success) return null;

  try {
    return presentProduct(await productService.getBySlug(slug));
  } catch (error) {
    if (error instanceof ProductNotFoundError) return null;
    throw error;
  }
});
