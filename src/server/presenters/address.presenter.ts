import "server-only";
import type { Address, DeliveryCity } from "@/generated/prisma/client";
import { formatCep } from "@/lib/address-schemas";

type AddressWithCity = Address & { deliveryCity: DeliveryCity };

// Só o que a tela usa: sem userId, datas ou o id interno da cidade.
export const presentAddress = (address: AddressWithCity) => ({
  id: address.id,
  label: address.label,
  customLabel: address.customLabel,
  cep: formatCep(address.cep),
  street: address.street,
  number: address.number,
  complement: address.complement,
  neighborhood: address.neighborhoodName,
  city: address.city,
  state: address.state,
  isDefault: address.isDefault,
  deliveryFeeInCents: address.deliveryCity.deliveryFeeInCents,
});

export type PublicAddress = ReturnType<typeof presentAddress>;
