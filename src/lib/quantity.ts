export const MIN_QUANTITY = 1;
export const MAX_QUANTITY = 99;

// Mantém a quantidade inteira e dentro dos limites. Isto é só a regra da interface: quando o carrinho
// existir, o servidor valida a quantidade de novo (nunca confia no front-end).
export function clampQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, Math.trunc(quantity)));
}
