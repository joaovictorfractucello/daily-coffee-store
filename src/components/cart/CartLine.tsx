"use client";

import { Trash } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "@/components/QuantityStepper";
import { cartPage } from "@/data/copy";
import { formatPrice } from "@/lib/format";
import type { PublicProduct } from "@/server/presenters/product.presenter";

type CartLineProps = {
  product: PublicProduct;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
};

export function CartLine({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}: CartLineProps) {
  const productLink = `/cardapio/${product.slug}`;

  return (
    <li className="flex gap-4 border-b border-line py-5 first:pt-0">
      <Link
        href={productLink}
        tabIndex={-1}
        aria-hidden="true"
        className="relative aspect-square w-20 shrink-0 self-start overflow-hidden bg-muted sm:w-24"
      >
        <Image
          src={product.imageUrl}
          alt=""
          fill
          sizes="96px"
          className="object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h2 className="leading-snug font-bold">
            <Link href={productLink} className="hover:underline">
              {product.name}
            </Link>
          </h2>
          <button
            type="button"
            onClick={onRemove}
            aria-label={cartPage.remove(product.name)}
            className="-mt-2 -mr-2 inline-flex size-11 shrink-0 cursor-pointer items-center justify-center text-ink-soft transition-colors hover:text-ink"
          >
            <Trash aria-hidden="true" size={22} />
          </button>
        </div>
        <p className="text-sm text-ink-soft tabular-nums">
          {cartPage.unitPrice(formatPrice(product.priceInCents))}
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <QuantityStepper
            value={quantity}
            onChange={onQuantityChange}
            label={cartPage.quantityOf(product.name)}
          />
          <p className="font-bold tabular-nums">
            {formatPrice(product.priceInCents * quantity)}
          </p>
        </div>
      </div>
    </li>
  );
}
