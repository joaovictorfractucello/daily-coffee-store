"use client";

import { ShoppingCart } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { headerCopy } from "@/data/copy";
import { countCartUnits } from "@/lib/cart";
import { cartLink } from "@/lib/links";
import { useCartHydrated, useCartStore } from "@/stores/cart-store";

const cartLinkClass =
  "relative grid size-11 place-items-center rounded-full transition-[background-color,scale] duration-200 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10 active:scale-95";

// O número só aparece depois de ler o localStorage: o servidor não conhece o carrinho.
export function HeaderCartLink({ iconSize }: { iconSize: number }) {
  const hydrated = useCartHydrated();
  const units = useCartStore((state) => countCartUnits(state.items));
  const visibleUnits = hydrated ? units : 0;

  return (
    <Link
      href={cartLink}
      aria-label={headerCopy.basketWithCount(visibleUnits)}
      className={cartLinkClass}
    >
      <ShoppingCart aria-hidden="true" size={iconSize} />
      {visibleUnits > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-1 right-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-[999px] bg-accent px-1 text-[0.625rem] leading-none font-bold text-light tabular-nums"
        >
          {visibleUnits > 99 ? "99+" : visibleUnits}
        </span>
      )}
    </Link>
  );
}
