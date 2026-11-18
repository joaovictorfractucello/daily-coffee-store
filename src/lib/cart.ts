import { clampQuantity, MAX_QUANTITY } from "./quantity";

// O carrinho guarda só o id e a quantidade. Nome, foto e preço vêm sempre do servidor (ADR 010).
export type CartItem = { productId: string; quantity: number };

// Soma quantidades do mesmo produto, sem passar do limite por item. Mantém a ordem em que cada
// produto apareceu primeiro. Usado no navegador (ao adicionar) e no servidor (corpo com repetidos).
export function mergeCartItems(items: CartItem[]): CartItem[] {
  const quantityByProduct = new Map<string, number>();

  for (const { productId, quantity } of items) {
    const current = quantityByProduct.get(productId) ?? 0;
    quantityByProduct.set(productId, clampQuantity(current + quantity));
  }

  return [...quantityByProduct].map(([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

export function addCartItem(items: CartItem[], newItem: CartItem): CartItem[] {
  return mergeCartItems([...items, newItem]);
}

export function isAtQuantityLimit(items: CartItem[], productId: string) {
  return (
    items.find((item) => item.productId === productId)?.quantity ===
    MAX_QUANTITY
  );
}

export function setCartItemQuantity(
  items: CartItem[],
  productId: string,
  quantity: number,
): CartItem[] {
  return items.map((item) =>
    item.productId === productId
      ? { ...item, quantity: clampQuantity(quantity) }
      : item,
  );
}

export function removeCartItems(
  items: CartItem[],
  productIds: string[],
): CartItem[] {
  return items.filter((item) => !productIds.includes(item.productId));
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const { productId, quantity } = value as Record<string, unknown>;
  return (
    typeof productId === "string" &&
    productId.length > 0 &&
    productId.length <= 40 &&
    typeof quantity === "number"
  );
}

// O localStorage pode ter sido editado à mão ou vir de uma versão antiga: aproveita só os itens
// com o formato certo, com quantidade de 1 a 99 e sem repetidos. A validação de verdade é no servidor.
export function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return mergeCartItems(value.filter(isCartItem));
}

// Soma para mostrar na tela, com os preços que o servidor devolveu. O valor que vale para o pedido é
// sempre recalculado no servidor (cartService.quote e, na Etapa 6, o checkout).
export function sumCartLines(
  lines: { priceInCents: number; quantity: number }[],
) {
  return lines.reduce(
    (total, line) => total + line.priceInCents * line.quantity,
    0,
  );
}

export function countCartUnits(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}
