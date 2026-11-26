"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  emptyStateScreenClass,
  StateIllustration,
} from "@/components/StateIllustration";
import { cartPage } from "@/data/copy";
import { countCartUnits, sumCartLines } from "@/lib/cart";
import { menuLink } from "@/lib/links";
import type { PublicProduct } from "@/server/presenters/product.presenter";
import { useCartHydrated, useCartStore } from "@/stores/cart-store";
import { CartLine } from "./CartLine";
import { CartSummary } from "./CartSummary";
import { CartSkeleton } from "./CartSkeleton";
import { fetchCartQuote } from "./fetch-cart-quote";

type LoadedProducts = { key: string; byId: Map<string, PublicProduct> };

// A lista do servidor é pedida de novo só quando muda o conjunto de produtos (não a cada clique na
// quantidade). Os totais da tela usam o preço que o servidor devolveu; o pedido recalcula tudo lá.
export function CartView() {
  const hydrated = useCartHydrated();
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItems = useCartStore((state) => state.removeItems);

  const [loaded, setLoaded] = useState<LoadedProducts | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [showUnavailableNotice, setShowUnavailableNotice] = useState(false);

  const productsKey = items.map((item) => item.productId).join(",");

  useEffect(() => {
    if (!hydrated || productsKey === "") return;

    const controller = new AbortController();
    fetchCartQuote(useCartStore.getState().items, controller.signal)
      .then((quote) => {
        const byId = new Map(
          quote.items.map(({ product }) => [product.id, product]),
        );
        setLoaded({ key: productsKey, byId });
        setFailedKey(null);
        if (quote.unavailableProductIds.length > 0) {
          setShowUnavailableNotice(true);
          removeItems(quote.unavailableProductIds);
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error(error);
        setFailedKey(productsKey);
      });

    return () => controller.abort();
  }, [hydrated, productsKey, attempt, removeItems]);

  if (!hydrated) return <CartSkeleton />;

  if (items.length === 0) {
    return <EmptyCart showUnavailableNotice={showUnavailableNotice} />;
  }

  if (failedKey === productsKey) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center py-10 text-center"
      >
        <StateIllustration name="error" />
        <p className="mt-4 font-bold text-danger-ink">{cartPage.error}</p>
        <button
          type="button"
          onClick={() => setAttempt((count) => count + 1)}
          className="button button-outline-ink mt-5 cursor-pointer"
        >
          {cartPage.retry}
        </button>
      </div>
    );
  }

  // Ao remover um item, a lista anterior ainda serve: todos os produtos que sobraram já estão nela.
  const lines = items.flatMap((item) => {
    const product = loaded?.byId.get(item.productId);
    return product ? [{ product, quantity: item.quantity }] : [];
  });
  if (lines.length < items.length) return <CartSkeleton />;

  const subtotalInCents = sumCartLines(
    lines.map(({ product, quantity }) => ({
      priceInCents: product.priceInCents,
      quantity,
    })),
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-start lg:gap-10">
      <div>
        {showUnavailableNotice && <UnavailableNotice />}
        <ul>
          {lines.map(({ product, quantity }) => (
            <CartLine
              key={product.id}
              product={product}
              quantity={quantity}
              onQuantityChange={(next) => setQuantity(product.id, next)}
              onRemove={() => removeItems([product.id])}
            />
          ))}
        </ul>
      </div>

      <CartSummary
        subtotalInCents={subtotalInCents}
        itemCount={countCartUnits(items)}
      />
    </div>
  );
}

function UnavailableNotice() {
  return (
    <p
      role="status"
      className="mb-5 border border-line bg-muted px-4 py-3 text-sm"
    >
      {cartPage.unavailable}
    </p>
  );
}

function EmptyCart({
  showUnavailableNotice,
}: {
  showUnavailableNotice: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center py-12 text-center ${emptyStateScreenClass.short}`}
    >
      {showUnavailableNotice && <UnavailableNotice />}
      <StateIllustration name="cartEmpty" />
      <p className="mt-4 text-lg font-bold">{cartPage.emptyTitle}</p>
      <p className="mt-1 text-ink-soft">{cartPage.emptyText}</p>
      <Link href={menuLink} className="button button-accent mt-6">
        {cartPage.seeMenu}
      </Link>
    </div>
  );
}
