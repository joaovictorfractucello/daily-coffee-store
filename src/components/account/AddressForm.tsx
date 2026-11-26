"use client";

import {
  Buildings,
  Hash,
  MapPin,
  MapTrifold,
  Signpost,
  Tag,
} from "@phosphor-icons/react/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { FormMessage, rateLimitMinutes } from "@/components/auth/FormFeedback";
import { FormField, isMissing } from "@/components/auth/FormField";
import { addressesCopy as copy, deliveryCopy } from "@/data/copy";
import {
  ADDRESS_LABELS,
  ADDRESS_LIMITS,
  normalizeCep,
} from "@/lib/address-schemas";
import { apiRequest } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { accountAddressesLink } from "@/lib/links";
import type { PublicAddress } from "@/server/presenters/address.presenter";
import type { PublicDeliveryQuote } from "@/server/presenters/delivery.presenter";
import { addressLabelIcons } from "./address-label";

const required = (label: string, max: number) =>
  z.string().trim().min(1, copy.required(label)).max(max, copy.tooLong(max));

// Aviso rápido na tela; a validação que vale é a do servidor (src/lib/address-schemas.ts).
const addressFormSchema = z.object({
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, deliveryCopy.cepInvalid),
  street: required(copy.streetLabel, ADDRESS_LIMITS.street),
  number: required(copy.numberLabel, ADDRESS_LIMITS.number),
  complement: z
    .string()
    .trim()
    .max(ADDRESS_LIMITS.complement, copy.tooLong(ADDRESS_LIMITS.complement)),
  neighborhood: required(copy.neighborhoodLabel, ADDRESS_LIMITS.neighborhood),
  label: z.enum(ADDRESS_LABELS),
  customLabel: z
    .string()
    .trim()
    .max(ADDRESS_LIMITS.customLabel, copy.tooLong(ADDRESS_LIMITS.customLabel)),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; city: string; state: string; feeInCents: number | null };

export function AddressForm({ address }: { address?: PublicAddress }) {
  const router = useRouter();
  const [result, setResult] = useState<{ cep: string; lookup: Lookup }>();
  const [errorText, setErrorText] = useState<string | null>(null);
  // CEP já preenchido ao editar: a consulta mostra cidade e taxa, sem sobrescrever o que foi salvo.
  const keepFieldsFor = useRef(address ? normalizeCep(address.cep) : null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      cep: address?.cep ?? "",
      street: address?.street ?? "",
      number: address?.number ?? "",
      complement: address?.complement ?? "",
      neighborhood: address?.neighborhood ?? "",
      label: address?.label ?? "OTHER",
      customLabel: address?.customLabel ?? "",
    },
  });
  const values = useWatch({ control });
  const cepDigits = normalizeCep(values.cep ?? "");
  // O resultado guarda de qual CEP ele é: CEP incompleto é "idle"; CEP novo sem resultado ainda é
  // "loading". Assim o efeito só grava estado quando a resposta chega.
  const lookup: Lookup =
    cepDigits.length !== 8
      ? { status: "idle" }
      : result?.cep === cepDigits
        ? result.lookup
        : { status: "loading" };

  useEffect(() => {
    if (cepDigits.length !== 8) return;

    const controller = new AbortController();
    const finish = (value: Lookup) =>
      setResult({ cep: cepDigits, lookup: value });
    fetch(`/api/delivery/quote?cep=${cepDigits}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404) {
          return finish({ status: "error", message: deliveryCopy.cepNotFound });
        }
        if (!response.ok) {
          return finish({
            status: "error",
            message: deliveryCopy.cepUnavailable,
          });
        }
        const quote = (await response.json()) as PublicDeliveryQuote;
        finish({
          status: "done",
          city: quote.address.city,
          state: quote.address.state,
          feeInCents: quote.delivery.feeInCents,
        });
        if (keepFieldsFor.current === cepDigits) return;
        keepFieldsFor.current = null;
        // CEP geral de cidade pequena vem sem rua: aí a pessoa digita.
        setValue("street", quote.address.street, { shouldValidate: false });
        setValue("neighborhood", quote.address.neighborhood, {
          shouldValidate: false,
        });
      })
      .catch((error: unknown) => {
        if ((error as Error).name === "AbortError") return;
        finish({ status: "error", message: deliveryCopy.cepUnavailable });
      });
    return () => controller.abort();
  }, [cepDigits, setValue]);

  const outOfArea = lookup.status === "done" && lookup.feeInCents === null;

  async function submit(form: AddressFormValues) {
    setErrorText(null);
    if (lookup.status !== "done" || outOfArea) return;

    const body = {
      ...form,
      complement: form.complement || undefined,
      customLabel:
        form.label === "OTHER" ? form.customLabel || undefined : undefined,
    };
    const result = address
      ? await apiRequest("PATCH", `/addresses/${address.id}`, body)
      : await apiRequest("POST", "/addresses", body);

    if (result.ok) {
      router.push(accountAddressesLink);
      router.refresh();
      return;
    }
    if (result.code === "CEP_NOT_FOUND") {
      return setError("cep", { message: deliveryCopy.cepNotFound });
    }
    setErrorText(
      result.code === "DELIVERY_UNAVAILABLE"
        ? copy.outOfArea
        : result.code === "ADDRESS_LIMIT"
          ? copy.limitReached
          : result.status === 429
            ? copy.rateLimited(rateLimitMinutes(result.retryAfterSeconds))
            : copy.genericError,
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex max-w-xl flex-col gap-5"
    >
      {errorText && <FormMessage>{errorText}</FormMessage>}

      <div className="flex flex-col gap-2">
        <FormField
          label={deliveryCopy.cepLabel}
          autoComplete="postal-code"
          inputMode="numeric"
          icon={MapPin}
          placeholder={deliveryCopy.cepPlaceholder}
          registration={register("cep")}
          error={errors.cep?.message}
          missing={isMissing(errors.cep, values.cep)}
        />
        <CepStatus lookup={lookup} />
      </div>

      <FormField
        label={copy.streetLabel}
        autoComplete="address-line1"
        icon={Signpost}
        placeholder={copy.streetPlaceholder}
        registration={register("street")}
        error={errors.street?.message}
        missing={isMissing(errors.street, values.street)}
      />
      <div className="grid gap-5 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <FormField
          label={copy.numberLabel}
          inputMode="numeric"
          icon={Hash}
          placeholder={copy.numberPlaceholder}
          registration={register("number")}
          error={errors.number?.message}
          missing={isMissing(errors.number, values.number)}
        />
        <FormField
          label={copy.complementLabel}
          autoComplete="address-line2"
          icon={Buildings}
          placeholder={copy.complementPlaceholder}
          registration={register("complement")}
          error={errors.complement?.message}
        />
      </div>
      <FormField
        label={copy.neighborhoodLabel}
        icon={MapTrifold}
        placeholder={copy.neighborhoodPlaceholder}
        registration={register("neighborhood")}
        error={errors.neighborhood?.message}
        missing={isMissing(errors.neighborhood, values.neighborhood)}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-bold">{copy.labelLegend}</legend>
        <div className="flex flex-wrap gap-2">
          {ADDRESS_LABELS.map((label) => {
            const Icon = addressLabelIcons[label];
            return (
              <label
                key={label}
                className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-[0.9375rem] font-semibold transition-colors duration-150 hover:border-ink-soft/60 has-checked:border-ink has-checked:bg-ink has-checked:text-light has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
              >
                <input
                  type="radio"
                  value={label}
                  className="sr-only"
                  {...register("label")}
                />
                <Icon aria-hidden="true" size={18} />
                {copy.labels[label]}
              </label>
            );
          })}
        </div>
      </fieldset>
      {values.label === "OTHER" && (
        <FormField
          label={copy.customLabelLabel}
          icon={Tag}
          placeholder={copy.customLabelPlaceholder}
          registration={register("customLabel")}
          error={errors.customLabel?.message}
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting || lookup.status !== "done" || outOfArea}
        className="button button-accent mt-1 w-full cursor-pointer rounded-[999px] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:self-start"
      >
        {isSubmitting ? copy.saving : copy.save}
      </button>
    </form>
  );
}

// Cidade e taxa da consulta do CEP. A cidade não é campo: é a do ViaCEP e define a taxa.
function CepStatus({ lookup }: { lookup: Lookup }) {
  if (lookup.status === "idle") return null;
  if (lookup.status === "loading") {
    return (
      <p role="status" className="text-sm text-ink-soft">
        {deliveryCopy.looking}
      </p>
    );
  }
  if (lookup.status === "error") {
    return <FormMessage>{lookup.message}</FormMessage>;
  }
  const city = `${lookup.city} - ${lookup.state}`;
  return lookup.feeInCents === null ? (
    <FormMessage>{deliveryCopy.unavailable(city)}</FormMessage>
  ) : (
    <FormMessage tone="info">
      {deliveryCopy.available(city, formatPrice(lookup.feeInCents))}
    </FormMessage>
  );
}
