import "server-only";
import {
  type AddressInput,
  MAX_ADDRESSES_PER_USER,
} from "@/lib/address-schemas";
import {
  AddressLimitError,
  AddressNotFoundError,
  DeliveryUnavailableError,
} from "@/server/errors/delivery.errors";
import {
  type AddressData,
  addressRepository,
} from "@/server/repositories/address.repository";
import { deliveryService } from "./delivery.service";
import { rateLimitService } from "./rate-limit.service";

// Consulta o CEP de novo no servidor: cidade e UF vêm do ViaCEP, nunca da tela. Fora da área, não
// salva (ADR 012). Rua, número, complemento e bairro são os que a pessoa digitou ou corrigiu.
async function toAddressData(input: AddressInput): Promise<AddressData> {
  const { address, deliveryCity } = await deliveryService.quoteByCep(input.cep);
  if (!deliveryCity) throw new DeliveryUnavailableError();

  return {
    cep: input.cep,
    street: input.street,
    number: input.number,
    complement: input.complement ?? null,
    neighborhoodName: input.neighborhood,
    city: address.city,
    state: address.state,
    deliveryCityId: deliveryCity.id,
    label: input.label,
    // Nome livre só vale para "Outro": Casa e Trabalho já têm nome.
    customLabel: input.label === "OTHER" ? (input.customLabel ?? null) : null,
  };
}

async function findOwnedOrFail(userId: string, id: string) {
  const address = await addressRepository.findOwned(userId, id);
  // 404, e não 403: não revela que o endereço existe (é de outra pessoa).
  if (!address) throw new AddressNotFoundError();
  return address;
}

export const addressService = {
  list(userId: string) {
    return addressRepository.listByUser(userId);
  },

  get(userId: string, id: string) {
    return findOwnedOrFail(userId, id);
  },

  async create(userId: string, input: AddressInput) {
    await rateLimitService.consume("addressWritePerUser", userId);
    const count = await addressRepository.countByUser(userId);
    if (count >= MAX_ADDRESSES_PER_USER) throw new AddressLimitError();

    const data = await toAddressData(input);
    // O primeiro endereço vira o padrão: o checkout sempre tem um para sugerir.
    return addressRepository.create(userId, data, count === 0);
  },

  async update(userId: string, id: string, input: AddressInput) {
    await rateLimitService.consume("addressWritePerUser", userId);
    await findOwnedOrFail(userId, id);
    const data = await toAddressData(input);
    return addressRepository.update(id, data);
  },

  async setDefault(userId: string, id: string) {
    await findOwnedOrFail(userId, id);
    return addressRepository.setDefault(userId, id);
  },

  async remove(userId: string, id: string) {
    const address = await findOwnedOrFail(userId, id);
    await addressRepository.remove(userId, id, address.isDefault);
  },
};
