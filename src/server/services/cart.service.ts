import "server-only";
import type { Product } from "@/generated/prisma/client";
import { mergeCartItems, type CartItem } from "@/lib/cart";
import { productRepository } from "@/server/repositories/product.repository";

export type CartQuoteItem = {
  product: Product;
  quantity: number;
  lineTotalInCents: number;
};

export type CartQuote = {
  items: CartQuoteItem[];
  unavailableProductIds: string[];
  subtotalInCents: number;
};

// Confere o carrinho do navegador e calcula os valores. O preço vem sempre do banco: o navegador só
// manda ids e quantidades. O checkout (Etapa 6) reaproveita este cálculo.
export const cartService = {
  async quote(cartItems: CartItem[]): Promise<CartQuote> {
    const mergedItems = mergeCartItems(cartItems);
    if (mergedItems.length === 0) {
      return { items: [], unavailableProductIds: [], subtotalInCents: 0 };
    }

    const products = await productRepository.findActiveByIds(
      mergedItems.map((item) => item.productId),
    );
    const productById = new Map(
      products.map((product) => [product.id, product]),
    );

    const items: CartQuoteItem[] = [];
    const unavailableProductIds: string[] = [];

    for (const { productId, quantity } of mergedItems) {
      const product = productById.get(productId);
      if (!product) {
        unavailableProductIds.push(productId);
        continue;
      }
      items.push({
        product,
        quantity,
        lineTotalInCents: product.priceInCents * quantity,
      });
    }

    const subtotalInCents = items.reduce(
      (total, item) => total + item.lineTotalInCents,
      0,
    );

    return { items, unavailableProductIds, subtotalInCents };
  },
};
