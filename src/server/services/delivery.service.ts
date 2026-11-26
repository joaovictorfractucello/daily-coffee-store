import "server-only";
import type { DeliveryCity } from "@/generated/prisma/client";
import { normalizeSearchText } from "@/lib/search-text";
import { CepNotFoundError } from "@/server/errors/delivery.errors";
import { type CepAddress, lookupCep } from "@/server/lib/cep/viacep";
import { deliveryCityRepository } from "@/server/repositories/delivery-city.repository";

export type DeliveryQuote = {
  address: CepAddress;
  // null: a loja não entrega nessa cidade (ADR 012).
  deliveryCity: DeliveryCity | null;
};

export const deliveryService = {
  // Endereço do CEP e a cidade atendida correspondente. A cidade vem sempre do ViaCEP e é comparada
  // sem acento e sem maiúscula ("Sao Paulo" = "São Paulo").
  async quoteByCep(cep: string): Promise<DeliveryQuote> {
    const address = await lookupCep(cep);
    if (!address) throw new CepNotFoundError();

    const cities = await deliveryCityRepository.findActiveByState(
      address.state,
    );
    const target = normalizeSearchText(address.city);
    const deliveryCity =
      cities.find((city) => normalizeSearchText(city.name) === target) ?? null;

    return { address, deliveryCity };
  },
};
