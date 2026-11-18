"use client";

import { Check } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuantityStepper } from "@/components/QuantityStepper";
import { productPage } from "@/data/copy";
import { isAtQuantityLimit } from "@/lib/cart";
import { cartLink } from "@/lib/links";
import { MIN_QUANTITY } from "@/lib/quantity";
import { useCartStore } from "@/stores/cart-store";

const FEEDBACK_DURATION_MS = 2000;

type AddFeedback = "added" | "limitReached" | null;

// Quantidade + botões de compra. O carrinho guarda só o id e a quantidade (ADR 010).
export function ProductPurchase({ productId }: { productId: string }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(MIN_QUANTITY);
  const [feedback, setFeedback] = useState<AddFeedback>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
    return () => clearTimeout(timer);
  }, [feedback]);

  function addToCart() {
    addItem({ productId, quantity });
    const { items } = useCartStore.getState();
    setFeedback(isAtQuantityLimit(items, productId) ? "limitReached" : "added");
  }

  function buyNow() {
    addItem({ productId, quantity });
    router.push(cartLink);
  }

  return (
    <div className="mt-6">
      <p id="product-quantity-label" className="text-sm font-bold">
        {productPage.quantity}
      </p>
      <QuantityStepper
        value={quantity}
        onChange={setQuantity}
        labelledBy="product-quantity-label"
        className="mt-2"
      />

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <button
          type="button"
          onClick={addToCart}
          className="button button-accent w-full cursor-pointer lg:flex-1"
        >
          {feedback === "added" && (
            <Check aria-hidden="true" size={18} weight="bold" />
          )}
          {feedback === "added" ? productPage.added : productPage.addToCart}
        </button>
        <button
          type="button"
          onClick={buyNow}
          className="button button-outline-ink w-full cursor-pointer lg:flex-1"
        >
          {productPage.buyNow}
        </button>
      </div>

      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-ink-soft">
        {feedback === "added" && (
          <span className="sr-only">{productPage.added}</span>
        )}
        {feedback === "limitReached" && productPage.limitReached}
      </p>
    </div>
  );
}
