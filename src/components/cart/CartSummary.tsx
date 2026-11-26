"use client";

import { CaretDown, Truck } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { rateLimitMinutes } from "@/components/auth/FormFeedback";
import { addressesCopy, cartPage, deliveryCopy as delivery } from "@/data/copy";
import { normalizeCep } from "@/lib/address-schemas";
import { apiRequest } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { menuLink } from "@/lib/links";
import type { PublicDeliveryQuote } from "@/server/presenters/delivery.presenter";

type Estimate =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; quote: PublicDeliveryQuote };

type CartSummaryProps = {
  subtotalInCents: number;
  itemCount: number;
};

const rowClass = "flex items-baseline justify-between gap-4";

// Resumo do carrinho. A entrega é só uma estimativa pelo CEP, sem login: o valor que vale é o do
// checkout (Etapa 6), calculado no servidor, onde também se escolhe entre entrega e retirada.
export function CartSummary({ subtotalInCents, itemCount }: CartSummaryProps) {
  const cepId = useId();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [cep, setCep] = useState("");
  const [estimate, setEstimate] = useState<Estimate>({ status: "idle" });

  const quote = estimate.status === "done" ? estimate.quote : null;
  const feeInCents = quote?.delivery.feeInCents ?? null;
  const delivers = quote !== null && feeInCents !== null;
  const outOfArea = quote !== null && feeInCents === null;

  async function calculate(event: FormEvent) {
    event.preventDefault();
    const digits = normalizeCep(cep);
    if (digits.length !== 8) {
      return setEstimate({ status: "error", message: delivery.cepInvalid });
    }

    setEstimate({ status: "loading" });
    const result = await apiRequest<PublicDeliveryQuote>(
      "GET",
      `/delivery/quote?cep=${digits}`,
    );
    if (result.ok) {
      if (result.data.delivery.feeInCents !== null) setOpen(false);
      return setEstimate({ status: "done", quote: result.data });
    }
    setEstimate({
      status: "error",
      message:
        result.status === 404
          ? delivery.cepNotFound
          : result.status === 429
            ? addressesCopy.rateLimited(
                rateLimitMinutes(result.retryAfterSeconds),
              )
            : delivery.cepUnavailable,
    });
  }

  function changeCep() {
    setOpen(true);
    setEstimate({ status: "idle" });
    // O campo só aparece no próximo render.
    requestAnimationFrame(() => inputRef.current?.select());
  }

  return (
    <aside
      aria-labelledby="cart-summary-title"
      className="rounded-[1rem] border border-line p-5 lg:sticky lg:top-28"
    >
      <h2 id="cart-summary-title" className="text-[1.0625rem] font-semibold">
        {cartPage.summaryTitle}
      </h2>

      {!delivers && (
        <div className="mt-4 rounded-[8px] border border-line">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
            className="flex min-h-11 w-full cursor-pointer items-center gap-2.5 px-3 text-left text-sm text-ink-soft transition-colors duration-150 hover:text-ink"
          >
            <Truck aria-hidden="true" size={18} />
            <span className="flex-1">{delivery.openCalculator}</span>
            <CaretDown
              aria-hidden="true"
              size={16}
              className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <form
              id={panelId}
              onSubmit={calculate}
              noValidate
              className="border-t border-line p-3"
            >
              <label htmlFor={cepId} className="sr-only">
                {delivery.cepLabel}
              </label>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id={cepId}
                  value={cep}
                  onChange={(event) => setCep(event.target.value)}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder={delivery.cepPlaceholder}
                  maxLength={9}
                  aria-invalid={
                    estimate.status === "error" || outOfArea || undefined
                  }
                  className="auth-input h-10 min-w-0 flex-1 rounded-[8px] border border-line px-2.5 text-[0.9375rem] text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-ink-soft/70 hover:border-ink-soft/60 focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_rgb(143_92_51/0.15)] focus-visible:outline-none aria-invalid:border-danger"
                />
                <button
                  type="submit"
                  disabled={estimate.status === "loading"}
                  className="min-h-10 w-[6.25rem] shrink-0 cursor-pointer rounded-[8px] border border-ink px-1 text-sm font-semibold transition-colors duration-150 hover:bg-muted disabled:cursor-wait disabled:opacity-60"
                >
                  {estimate.status === "loading"
                    ? delivery.calculating
                    : delivery.calculate}
                </button>
              </div>
              {estimate.status === "error" && (
                <p role="alert" className="mt-2 text-sm text-danger-ink">
                  {estimate.message}
                </p>
              )}
              {outOfArea && (
                <p role="alert" className="mt-2 text-sm text-danger-ink">
                  {delivery.unavailable(
                    `${quote.address.city} - ${quote.address.state}`,
                  )}
                </p>
              )}
            </form>
          )}
        </div>
      )}

      <dl className="mt-4 flex flex-col gap-2.5 text-sm">
        <div className={rowClass}>
          <dt className="text-ink-soft">
            {cartPage.subtotal} ({cartPage.itemCount(itemCount)})
          </dt>
          <dd className="tabular-nums">{formatPrice(subtotalInCents)}</dd>
        </div>
        <div className={rowClass}>
          <dt className="text-ink-soft">
            {delivers ? (
              <>
                {delivery.deliveryTo(quote.address.cep)}{" "}
                <button
                  type="button"
                  onClick={changeCep}
                  aria-label={delivery.changeLabel}
                  className="cursor-pointer text-ink underline underline-offset-2 transition-opacity duration-150 hover:opacity-70"
                >
                  {delivery.change}
                </button>
                <span className="block text-xs">
                  {quote.address.city} - {quote.address.state}
                </span>
              </>
            ) : (
              cartPage.delivery
            )}
          </dt>
          <dd
            className={`tabular-nums ${outOfArea ? "text-danger-ink" : delivers ? "" : "text-ink-soft"}`}
          >
            {delivers
              ? formatPrice(feeInCents)
              : outOfArea
                ? cartPage.deliveryUnavailable
                : "—"}
          </dd>
        </div>
      </dl>

      <dl
        className={`${rowClass} mt-4 border-t border-line pt-4 text-[0.9375rem]`}
      >
        <dt>{delivers ? delivery.estimatedTotal : cartPage.total}</dt>
        <dd className="text-xl font-bold tabular-nums">
          {formatPrice(subtotalInCents + (delivers ? feeInCents : 0))}
        </dd>
      </dl>
      <p className="mt-1 text-xs text-ink-soft">
        {delivers ? delivery.pickupNote : cartPage.deliveryNote}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          type="button"
          aria-disabled="true"
          title={cartPage.comingSoon}
          className="button button-accent w-full cursor-pointer"
        >
          {cartPage.checkout}
        </button>
        <Link href={menuLink} className="button button-outline-ink w-full">
          {cartPage.continueShopping}
        </Link>
      </div>
    </aside>
  );
}
