"use client";

import { DotsThreeVertical, MapPin, Plus } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  emptyStateScreenClass,
  StateIllustration,
} from "@/components/StateIllustration";
import { FormMessage } from "@/components/auth/FormFeedback";
import { addressesCopy as copy } from "@/data/copy";
import { MAX_ADDRESSES_PER_USER } from "@/lib/address-schemas";
import { apiRequest } from "@/lib/api-client";
import { formatPrice } from "@/lib/format";
import { editAddressLink, newAddressLink } from "@/lib/links";
import type { PublicAddress } from "@/server/presenters/address.presenter";
import { addressLabelIcons, addressTitle } from "./address-label";

const actionClass =
  "cursor-pointer text-sm font-bold transition-opacity duration-150 hover:opacity-70 disabled:cursor-wait disabled:opacity-50";
const menuItemClass =
  "block w-full cursor-pointer px-4 py-2.5 text-left text-[0.9375rem] font-semibold transition-colors duration-150 hover:bg-muted disabled:cursor-wait disabled:opacity-50";

type ActionsMenuProps = {
  address: PublicAddress;
  title: string;
  busy: boolean;
  onMakeDefault: () => void;
  onRemove: () => void;
};

// Menu "⋯" da linha: botão que abre uma lista de ações. Fecha com Esc, clique fora ou ao escolher.
function ActionsMenu({
  address,
  title,
  busy,
  onMakeDefault,
  onRemove,
}: ActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function closeOnOutside(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const choose = (action: () => void) => () => {
    setOpen(false);
    action();
  };

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-label={copy.actions(title)}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="-mr-2 flex size-10 cursor-pointer items-center justify-center rounded-full text-ink-soft transition-colors duration-150 hover:bg-muted hover:text-ink"
      >
        <DotsThreeVertical aria-hidden="true" size={22} weight="bold" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-10 mt-1 min-w-44 overflow-hidden rounded-[12px] border border-line bg-background py-1 shadow-[0_8px_24px_rgb(43_30_23/0.12)]">
          <Link href={editAddressLink(address.id)} className={menuItemClass}>
            {copy.edit}
          </Link>
          {!address.isDefault && (
            <button
              type="button"
              disabled={busy}
              onClick={choose(onMakeDefault)}
              className={menuItemClass}
            >
              {copy.makeDefault}
            </button>
          )}
          <button
            type="button"
            onClick={choose(onRemove)}
            className={`${menuItemClass} text-danger-ink`}
          >
            {copy.remove}
          </button>
        </div>
      )}
    </div>
  );
}

// Miniatura de mapa do card: ilustração genérica, a mesma em todos. O mapa real do endereço exigiria
// mandar o endereço a um serviço de mapas (custo e dado pessoal saindo para terceiro).
function AddressMapThumb() {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-muted sm:size-20"
    >
      <Image
        src="/images/enderecos/mapa.webp"
        alt=""
        fill
        sizes="80px"
        className="object-cover"
      />
      <MapPin
        size={26}
        weight="fill"
        className="relative text-accent drop-shadow-[0_2px_2px_rgb(43_30_23/0.25)]"
      />
    </span>
  );
}

function AddressRow({ address }: { address: PublicAddress }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const Icon = addressLabelIcons[address.label];
  const title = addressTitle(address);
  const street = `${address.street}, ${address.number}`;
  // Com apelido, a rua vai para a segunda linha; sem apelido, ela já é o título.
  const detail =
    title === street
      ? address.complement
      : [street, address.complement].filter(Boolean).join(" · ");

  async function run(request: Promise<{ ok: boolean }>) {
    setBusy(true);
    setFailed(false);
    const result = await request;
    setBusy(false);
    if (!result.ok) return setFailed(true);
    setConfirming(false);
    router.refresh();
  }

  return (
    <li className="rounded-[1rem] border border-line p-3 text-[0.9375rem]">
      <div className="flex items-start gap-3">
        <AddressMapThumb />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="flex min-w-0 items-center gap-1.5 font-bold">
            <Icon aria-hidden="true" size={17} className="shrink-0" />
            <span className="truncate">{title}</span>
            {address.isDefault && (
              <span className="ml-0.5 shrink-0 rounded-full bg-accent/12 px-2 py-0.5 text-xs font-bold text-accent">
                {copy.default}
              </span>
            )}
          </p>
          {detail && (
            <p className="mt-0.5 truncate text-sm text-ink-soft">{detail}</p>
          )}
          <p className="truncate text-sm text-ink-soft">
            {address.neighborhood}, {address.city} - {address.state}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {copy.deliveryFee(formatPrice(address.deliveryFeeInCents))}
          </p>
        </div>
        <ActionsMenu
          address={address}
          title={title}
          busy={busy}
          onMakeDefault={() =>
            run(apiRequest("POST", `/addresses/${address.id}/default`))
          }
          onRemove={() => setConfirming(true)}
        />
      </div>

      {failed && (
        <div className="mt-3 border-t border-line pt-3">
          <FormMessage>{copy.genericError}</FormMessage>
        </div>
      )}

      {confirming && (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
          <span className="text-sm">{copy.confirmRemove}</span>
          <span className="flex shrink-0 items-center gap-4">
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(apiRequest("DELETE", `/addresses/${address.id}`))
              }
              className={`${actionClass} text-danger-ink`}
            >
              {copy.confirmYes}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirming(false)}
              className={actionClass}
            >
              {copy.confirmNo}
            </button>
          </span>
        </div>
      )}
    </li>
  );
}

export function AddressList({ addresses }: { addresses: PublicAddress[] }) {
  if (addresses.length === 0) {
    return (
      <div
        className={`flex flex-col items-center px-6 py-8 text-center ${emptyStateScreenClass.tall}`}
      >
        <StateIllustration name="addressesEmpty" />
        <p className="mt-5 text-lg font-bold">{copy.emptyTitle}</p>
        <p className="mt-1 max-w-xs text-sm text-ink-soft">{copy.emptyText}</p>
        <Link
          href={newAddressLink}
          className="button button-accent mt-6 w-full sm:w-auto"
        >
          <Plus aria-hidden="true" size={18} />
          {copy.add}
        </Link>
      </div>
    );
  }

  const atLimit = addresses.length >= MAX_ADDRESSES_PER_USER;

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {addresses.map((address) => (
          <AddressRow key={address.id} address={address} />
        ))}
      </ul>
      {atLimit ? (
        <FormMessage tone="info">{copy.limitReached}</FormMessage>
      ) : (
        <Link
          href={newAddressLink}
          className="button button-accent w-full sm:w-auto sm:self-start"
        >
          <Plus aria-hidden="true" size={18} />
          {copy.add}
        </Link>
      )}
    </div>
  );
}
