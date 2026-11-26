import { Briefcase, House, MapPin } from "@phosphor-icons/react/ssr";
import type { Icon } from "@phosphor-icons/react";
import { addressesCopy as copy } from "@/data/copy";
import type { AddressLabelValue } from "@/lib/address-schemas";
import type { PublicAddress } from "@/server/presenters/address.presenter";

export const addressLabelIcons: Record<AddressLabelValue, Icon> = {
  HOME: House,
  WORK: Briefcase,
  OTHER: MapPin,
};

// "Outro" sem nome mostra a rua como título, como nos apps de entrega.
export function addressTitle(address: PublicAddress) {
  if (address.label !== "OTHER") return copy.labels[address.label];
  return address.customLabel ?? `${address.street}, ${address.number}`;
}
