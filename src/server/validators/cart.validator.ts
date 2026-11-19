import "server-only";
import { z } from "zod";
import { MAX_QUANTITY, MIN_QUANTITY } from "@/lib/quantity";

// O cardápio tem poucos produtos. O limite evita um corpo gigante que force consultas pesadas.
export const MAX_CART_LINES = 50;

const cartItemSchema = z.object({
  productId: z.cuid().max(40),
  quantity: z.int().min(MIN_QUANTITY).max(MAX_QUANTITY),
});

// Só ids e quantidades. Qualquer outro campo (como um preço) é descartado pelo Zod.
export const cartQuoteSchema = z.object({
  items: z.array(cartItemSchema).max(MAX_CART_LINES),
});
