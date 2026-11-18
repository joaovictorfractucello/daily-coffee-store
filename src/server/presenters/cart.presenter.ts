import "server-only";
import type { CartQuote } from "@/server/services/cart.service";
import { presentProduct, type PublicProduct } from "./product.presenter";

export type PublicCartQuote = {
  items: {
    product: PublicProduct;
    quantity: number;
    lineTotalInCents: number;
  }[];
  unavailableProductIds: string[];
  subtotalInCents: number;
};

export function presentCartQuote(quote: CartQuote): PublicCartQuote {
  return {
    items: quote.items.map(({ product, quantity, lineTotalInCents }) => ({
      product: presentProduct(product),
      quantity,
      lineTotalInCents,
    })),
    unavailableProductIds: quote.unavailableProductIds,
    subtotalInCents: quote.subtotalInCents,
  };
}
