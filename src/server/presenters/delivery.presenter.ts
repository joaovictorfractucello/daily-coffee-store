import "server-only";
import { formatCep } from "@/lib/address-schemas";
import type { DeliveryQuote } from "@/server/services/delivery.service";

export const presentDeliveryQuote = ({
  address,
  deliveryCity,
}: DeliveryQuote) => ({
  address: { ...address, cep: formatCep(address.cep) },
  delivery: {
    available: deliveryCity !== null,
    city: address.city,
    feeInCents: deliveryCity?.deliveryFeeInCents ?? null,
  },
});

export type PublicDeliveryQuote = ReturnType<typeof presentDeliveryQuote>;
