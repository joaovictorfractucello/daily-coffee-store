import type { CartItem } from "@/lib/cart";
import type { PublicCartQuote } from "@/server/presenters/cart.presenter";

export async function fetchCartQuote(
  items: CartItem[],
  signal: AbortSignal,
): Promise<PublicCartQuote> {
  const response = await fetch("/api/cart/quote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
    signal,
  });
  if (!response.ok) throw new Error(`Cart quote failed: ${response.status}`);
  return response.json();
}
