import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DeliveryCity } from "@/generated/prisma/client";
import {
  AddressLimitError,
  AddressNotFoundError,
  DeliveryUnavailableError,
} from "@/server/errors/delivery.errors";
import { RateLimitedError } from "@/server/errors/auth.errors";
import { addressRepository } from "@/server/repositories/address.repository";
import { MAX_ADDRESSES_PER_USER } from "@/lib/address-schemas";
import { addressService } from "./address.service";
import { deliveryService } from "./delivery.service";
import { rateLimitService } from "./rate-limit.service";

vi.mock("@/server/repositories/address.repository", () => ({
  addressRepository: {
    listByUser: vi.fn(),
    findOwned: vi.fn(),
    countByUser: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    setDefault: vi.fn(),
    remove: vi.fn(),
  },
}));
vi.mock("./delivery.service", () => ({
  deliveryService: { quoteByCep: vi.fn() },
}));
vi.mock("./rate-limit.service", () => ({
  rateLimitService: { consume: vi.fn() },
}));

const now = new Date("2026-11-26T12:00:00Z");
const santoAndre: DeliveryCity = {
  id: "city-sa",
  name: "Santo André",
  state: "SP",
  deliveryFeeInCents: 1000,
  isActive: true,
  createdAt: now,
  updatedAt: now,
};

// A tela manda só o que a pessoa preenche; a cidade vem do ViaCEP, no servidor.
const input = {
  cep: "09010000",
  street: "Rua Coronel Oliveira Lima",
  number: "100",
  complement: undefined,
  neighborhood: "Centro",
  label: "HOME" as const,
  customLabel: undefined,
};

function quote(cityName: string, deliveryCity: DeliveryCity | null) {
  vi.mocked(deliveryService.quoteByCep).mockResolvedValue({
    address: {
      cep: "09010000",
      street: "Rua Coronel Oliveira Lima",
      neighborhood: "Centro",
      city: cityName,
      state: "SP",
    },
    deliveryCity,
  });
}

const owned = (overrides = {}) =>
  ({ id: "addr-1", userId: "user-1", isDefault: false, ...overrides }) as never;

beforeEach(() => {
  vi.mocked(addressRepository.countByUser).mockResolvedValue(0);
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("addressService.create", () => {
  it("saves the city and state from ViaCEP and makes the first address the default", async () => {
    quote("Santo André", santoAndre);

    await addressService.create("user-1", input);

    expect(addressRepository.create).toHaveBeenCalledWith(
      "user-1",
      {
        cep: "09010000",
        street: "Rua Coronel Oliveira Lima",
        number: "100",
        complement: null,
        neighborhoodName: "Centro",
        city: "Santo André",
        state: "SP",
        deliveryCityId: "city-sa",
        label: "HOME",
        customLabel: null,
      },
      true,
    );
  });

  it("keeps the custom name only for the OTHER label", async () => {
    quote("Santo André", santoAndre);

    await addressService.create("user-1", {
      ...input,
      label: "WORK",
      customLabel: "Escritório",
    });
    await addressService.create("user-1", {
      ...input,
      label: "OTHER",
      customLabel: "Casa da mãe",
    });

    const [work, other] = vi.mocked(addressRepository.create).mock.calls;
    expect(work[1]).toMatchObject({ label: "WORK", customLabel: null });
    expect(other[1]).toMatchObject({
      label: "OTHER",
      customLabel: "Casa da mãe",
    });
  });

  it("does not make later addresses the default", async () => {
    quote("Santo André", santoAndre);
    vi.mocked(addressRepository.countByUser).mockResolvedValue(2);

    await addressService.create("user-1", input);

    expect(vi.mocked(addressRepository.create).mock.calls[0][2]).toBe(false);
  });

  it("refuses an address outside the delivery area and saves nothing", async () => {
    quote("Campinas", null);

    await expect(addressService.create("user-1", input)).rejects.toBeInstanceOf(
      DeliveryUnavailableError,
    );
    expect(addressRepository.create).not.toHaveBeenCalled();
  });

  it("stops at the address limit before calling ViaCEP", async () => {
    vi.mocked(addressRepository.countByUser).mockResolvedValue(
      MAX_ADDRESSES_PER_USER,
    );

    await expect(addressService.create("user-1", input)).rejects.toBeInstanceOf(
      AddressLimitError,
    );
    expect(deliveryService.quoteByCep).not.toHaveBeenCalled();
  });

  it("limits writes per account", async () => {
    vi.mocked(rateLimitService.consume).mockRejectedValueOnce(
      new RateLimitedError(60),
    );

    await expect(addressService.create("user-1", input)).rejects.toBeInstanceOf(
      RateLimitedError,
    );
    expect(rateLimitService.consume).toHaveBeenCalledWith(
      "addressWritePerUser",
      "user-1",
    );
    expect(deliveryService.quoteByCep).not.toHaveBeenCalled();
  });
});

describe("addressService (someone else's address)", () => {
  beforeEach(() => {
    vi.mocked(addressRepository.findOwned).mockResolvedValue(null);
  });

  it("answers not found on update, without touching it", async () => {
    await expect(
      addressService.update("intruder", "addr-1", input),
    ).rejects.toBeInstanceOf(AddressNotFoundError);
    expect(addressRepository.findOwned).toHaveBeenCalledWith(
      "intruder",
      "addr-1",
    );
    expect(addressRepository.update).not.toHaveBeenCalled();
  });

  it("answers not found on set default and delete", async () => {
    await expect(
      addressService.setDefault("intruder", "addr-1"),
    ).rejects.toBeInstanceOf(AddressNotFoundError);
    await expect(
      addressService.remove("intruder", "addr-1"),
    ).rejects.toBeInstanceOf(AddressNotFoundError);
    expect(addressRepository.setDefault).not.toHaveBeenCalled();
    expect(addressRepository.remove).not.toHaveBeenCalled();
  });
});

describe("addressService.update", () => {
  it("checks the CEP again and refuses a move out of the area", async () => {
    vi.mocked(addressRepository.findOwned).mockResolvedValue(owned());
    quote("Campinas", null);

    await expect(
      addressService.update("user-1", "addr-1", { ...input, cep: "13010000" }),
    ).rejects.toBeInstanceOf(DeliveryUnavailableError);
    expect(addressRepository.update).not.toHaveBeenCalled();
  });
});

describe("addressService.remove", () => {
  it("tells the repository when the removed address was the default", async () => {
    vi.mocked(addressRepository.findOwned).mockResolvedValue(
      owned({ isDefault: true }),
    );

    await addressService.remove("user-1", "addr-1");

    expect(addressRepository.remove).toHaveBeenCalledWith(
      "user-1",
      "addr-1",
      true,
    );
  });
});
