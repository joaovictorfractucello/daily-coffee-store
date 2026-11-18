"use client";

import { Minus, Plus } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { productPage } from "@/data/copy";
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from "@/lib/quantity";

const stepButtonClass =
  "inline-flex size-11 items-center justify-center transition-colors duration-200 hover:bg-current/5 focus-visible:bg-current/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

// Quantidade + botões de compra. O carrinho e a compra ainda não existem (Etapa 3): os dois botões ficam
// prontos, no mesmo padrão dos botões "em breve" do cabeçalho, e a quantidade só muda na tela. Quando o
// carrinho entrar, é aqui que o produto e a quantidade passam a ser enviados a ele.
export function ProductPurchase() {
  const [quantity, setQuantity] = useState(MIN_QUANTITY);

  return (
    <div className="mt-6">
      <p id="product-quantity-label" className="text-sm font-bold">
        {productPage.quantity}
      </p>
      <div
        role="group"
        aria-labelledby="product-quantity-label"
        className="mt-2 inline-flex items-center rounded-[8px] border border-line"
      >
        <button
          type="button"
          aria-label={productPage.decreaseQuantity}
          disabled={quantity <= MIN_QUANTITY}
          onClick={() => setQuantity(clampQuantity(quantity - 1))}
          className={`${stepButtonClass} rounded-l-[8px]`}
        >
          <Minus aria-hidden="true" size={16} weight="bold" />
        </button>
        <output
          aria-live="polite"
          className="min-w-12 text-center font-bold tabular-nums"
        >
          {quantity}
        </output>
        <button
          type="button"
          aria-label={productPage.increaseQuantity}
          disabled={quantity >= MAX_QUANTITY}
          onClick={() => setQuantity(clampQuantity(quantity + 1))}
          className={`${stepButtonClass} rounded-r-[8px]`}
        >
          <Plus aria-hidden="true" size={16} weight="bold" />
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 lg:flex-row">
        <button
          type="button"
          aria-disabled="true"
          title={productPage.comingSoon}
          className="button button-accent w-full cursor-pointer lg:flex-1"
        >
          {productPage.addToCart}
        </button>
        <button
          type="button"
          aria-disabled="true"
          title={productPage.comingSoon}
          className="button button-outline-ink w-full cursor-pointer lg:flex-1"
        >
          {productPage.buyNow}
        </button>
      </div>
    </div>
  );
}
