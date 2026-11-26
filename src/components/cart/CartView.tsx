"use client";

import { ShoppingCart } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cartPage } from "@/data/copy";
import { countCartUnits, sumCartLines } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { menuLink } from "@/lib/links";
import type { PublicProduct } from "@/server/presenters/product.presenter";
import { useCartHydrated, useCartStore } from "@/stores/cart-store";
import { CartLine } from "./CartLine";
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
      <div role="alert" className="py-10 text-center">
        <p className="font-bold">{cartPage.error}</p>
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
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-14">
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

      <aside
        aria-labelledby="cart-summary-title"
        className="rounded-[1.25rem] border border-line p-5 lg:sticky lg:top-28"
      >
        <h2
          id="cart-summary-title"
          className="heading-soft text-[1.125rem] md:text-[1.375rem]"
        >
          {cartPage.summaryTitle}
        </h2>
        <dl className="mt-4 flex items-baseline justify-between gap-4">
          <dt className="text-[0.9375rem] text-ink-soft">
            {cartPage.subtotal} ({cartPage.itemCount(countCartUnits(items))})
          </dt>
          <dd className="text-lg font-bold tabular-nums">
            {formatPrice(subtotalInCents)}
          </dd>
        </dl>
        <p className="mt-2 text-sm text-ink-soft">{cartPage.deliveryNote}</p>
        <button
          type="button"
          aria-disabled="true"
          title={cartPage.comingSoon}
          className="button button-accent mt-5 w-full cursor-pointer"
        >
          {cartPage.checkout}
        </button>
      </aside>
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
    <div className="flex flex-col items-center py-12 text-center">
      {showUnavailableNotice && <UnavailableNotice />}
      <ShoppingCart aria-hidden="true" size={48} className="text-ink-soft" />
      <p className="mt-4 text-lg font-bold">{cartPage.emptyTitle}</p>
      <p className="mt-1 text-ink-soft">{cartPage.emptyText}</p>
      <Link href={menuLink} className="button button-accent mt-6">
        {cartPage.seeMenu}
      </Link>
    </div>
  );
}
