"use client";

import { Minus, Plus } from "@phosphor-icons/react/ssr";
import { productPage } from "@/data/copy";
import { clampQuantity, MAX_QUANTITY, MIN_QUANTITY } from "@/lib/quantity";

const stepButtonClass =
  "inline-flex cursor-pointer items-center justify-center transition-colors duration-200 hover:bg-current/5 focus-visible:bg-current/5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent";

// "md": página do produto, ao lado do botão grande de adicionar. "sm": carrinho, junto do texto.
const sizes = {
  md: {
    group: "rounded-[8px]",
    button: "size-11",
    left: "rounded-l-[8px]",
    right: "rounded-r-[8px]",
    value: "min-w-10 font-bold",
    icon: 16,
  },
  sm: {
    group: "rounded-full",
    button: "size-8",
    left: "rounded-l-full",
    right: "rounded-r-full",
    value: "min-w-7 text-[0.9375rem] font-semibold",
    icon: 14,
  },
} as const;

type QuantityStepperProps = {
  value: number;
  onChange: (quantity: number) => void;
  // Nome do grupo para o leitor de tela: id de um texto visível ou um rótulo próprio.
  labelledBy?: string;
  label?: string;
  size?: keyof typeof sizes;
  className?: string;
};

// Quantidade de 1 a 99 (página do produto e carrinho). O limite aqui é só da tela: o servidor valida de novo.
export function QuantityStepper({
  value,
  onChange,
  labelledBy,
  label,
  size = "md",
  className = "",
}: QuantityStepperProps) {
  const style = sizes[size];

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={label}
      className={`inline-flex items-center border border-line ${style.group} ${className}`}
    >
      <button
        type="button"
        aria-label={productPage.decreaseQuantity}
        disabled={value <= MIN_QUANTITY}
        onClick={() => onChange(clampQuantity(value - 1))}
        className={`${stepButtonClass} ${style.button} ${style.left}`}
      >
        <Minus aria-hidden="true" size={style.icon} weight="bold" />
      </button>
      <output
        aria-live="polite"
        className={`text-center tabular-nums ${style.value}`}
      >
        {value}
      </output>
      <button
        type="button"
        aria-label={productPage.increaseQuantity}
        disabled={value >= MAX_QUANTITY}
        onClick={() => onChange(clampQuantity(value + 1))}
        className={`${stepButtonClass} ${style.button} ${style.right}`}
      >
        <Plus aria-hidden="true" size={style.icon} weight="bold" />
      </button>
    </div>
  );
}
