"use client";

import { Minus, Plus } from "@phosphor-icons/react/ssr";
import { productPage } from "@/data/copy";
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from "@/lib/quantity";

const stepButtonClass =
  "inline-flex size-11 cursor-pointer items-center justify-center transition-colors duration-200 hover:bg-current/5 focus-visible:bg-current/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

type QuantityStepperProps = {
  value: number;
  onChange: (quantity: number) => void;
  // Nome do grupo para o leitor de tela: id de um texto visível ou um rótulo próprio.
  labelledBy?: string;
  label?: string;
  className?: string;
};

// Quantidade de 1 a 99 (página do produto e carrinho). O limite aqui é só da tela: o servidor valida de novo.
export function QuantityStepper({
  value,
  onChange,
  labelledBy,
  label,
  className = "",
}: QuantityStepperProps) {
  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={label}
      className={`inline-flex items-center rounded-[8px] border border-line ${className}`}
    >
      <button
        type="button"
        aria-label={productPage.decreaseQuantity}
        disabled={value <= MIN_QUANTITY}
        onClick={() => onChange(clampQuantity(value - 1))}
        className={`${stepButtonClass} rounded-l-[8px]`}
      >
        <Minus aria-hidden="true" size={16} weight="bold" />
      </button>
      <output
        aria-live="polite"
        className="min-w-10 text-center font-bold tabular-nums"
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={productPage.increaseQuantity}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(clampQuantity(value + 1))}
        className={`${stepButtonClass} rounded-r-[8px]`}
      >
        <Plus aria-hidden="true" size={16} weight="bold" />
      </button>
    </div>
  );
}
