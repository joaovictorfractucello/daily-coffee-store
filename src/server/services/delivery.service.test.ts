import { afterEach, describe, expect, it, vi } from "vitest";
import type { DeliveryCity } from "@/generated/prisma/client";
import { CepNotFoundError } from "@/server/errors/delivery.errors";
import { lookupCep } from "@/server/lib/cep/viacep";
import { deliveryCityRepository } from "@/server/repositories/delivery-city.repository";
import { deliveryService } from "./delivery.service";

vi.mock("@/server/lib/cep/viacep", () => ({ lookupCep: vi.fn() }));
vi.mock("@/server/repositories/delivery-city.repository", () => ({
  deliveryCityRepository: { findActiveByState: vi.fn() },
}));

const now = new Date("2026-11-26T12:00:00Z");

function city(name: string, deliveryFeeInCents: number): DeliveryCity {
  return {
    id: `city-${name}`,
    name,
    state: "SP",
    deliveryFeeInCents,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
}

const address = (cityName: string) => ({
  cep: "09010000",
  street: "Rua Coronel Oliveira Lima",
  neighborhood: "Centro",
  city: cityName,
  state: "SP",
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("deliveryService.quoteByCep", () => {
  it("finds the served city and its fee", async () => {
    vi.mocked(lookupCep).mockResolvedValue(address("Santo André"));
    vi.mocked(deliveryCityRepository.findActiveByState).mockResolvedValue([
      city("São Paulo", 600),
      city("Santo André", 1000),
    ]);

    const quote = await deliveryService.quoteByCep("09010000");

    expect(quote.deliveryCity?.deliveryFeeInCents).toBe(1000);
    expect(deliveryCityRepository.findActiveByState).toHaveBeenCalledWith("SP");
  });

  it("matches the city name without accents or case", async () => {
    vi.mocked(lookupCep).mockResolvedValue(address("SAO PAULO"));
    vi.mocked(deliveryCityRepository.findActiveByState).mockResolvedValue([
      city("São Paulo", 600),
    ]);

    const quote = await deliveryService.quoteByCep("01303000");

    expect(quote.deliveryCity?.name).toBe("São Paulo");
  });

  it("returns no delivery city outside the delivery area", async () => {
    vi.mocked(lookupCep).mockResolvedValue(address("Campinas"));
    vi.mocked(deliveryCityRepository.findActiveByState).mockResolvedValue([
      city("São Paulo", 600),
    ]);

    const quote = await deliveryService.quoteByCep("13010000");

    expect(quote.deliveryCity).toBeNull();
    expect(quote.address.city).toBe("Campinas");
  });

  it("refuses a CEP that does not exist", async () => {
    vi.mocked(lookupCep).mockResolvedValue(null);

    await expect(deliveryService.quoteByCep("99999999")).rejects.toBeInstanceOf(
      CepNotFoundError,
    );
    expect(deliveryCityRepository.findActiveByState).not.toHaveBeenCalled();
  });
});
