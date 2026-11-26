import { afterEach, describe, expect, it, vi } from "vitest";
import { CepUnavailableError } from "@/server/errors/delivery.errors";
import { lookupCep } from "./viacep";

function respondWith(body: unknown, status = 200) {
  return vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(JSON.stringify(body), { status }));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("lookupCep", () => {
  it("maps the ViaCEP fields to the address", async () => {
    const fetchSpy = respondWith({
      cep: "09010-000",
      logradouro: "Rua Coronel Oliveira Lima ",
      bairro: "Centro",
      localidade: "Santo André",
      uf: "sp",
    });

    expect(await lookupCep("09010000")).toEqual({
      cep: "09010000",
      street: "Rua Coronel Oliveira Lima",
      neighborhood: "Centro",
      city: "Santo André",
      state: "SP",
    });
    expect(fetchSpy.mock.calls[0][0]).toBe(
      "https://viacep.com.br/ws/09010000/json/",
    );
  });

  it("returns null for a CEP that does not exist (erro as text or boolean)", async () => {
    respondWith({ erro: "true" });
    expect(await lookupCep("99999999")).toBeNull();

    vi.restoreAllMocks();
    respondWith({ erro: true });
    expect(await lookupCep("99999999")).toBeNull();
  });

  it("keeps a CEP without street (general CEP of a small city)", async () => {
    respondWith({
      cep: "09450-000",
      logradouro: "",
      bairro: "",
      localidade: "Rio Grande da Serra",
      uf: "SP",
    });

    const address = await lookupCep("09450000");

    expect(address?.street).toBe("");
    expect(address?.city).toBe("Rio Grande da Serra");
  });

  it("treats an unexpected response as unavailable", async () => {
    respondWith({ cidade: "Santo André" });

    await expect(lookupCep("09010000")).rejects.toBeInstanceOf(
      CepUnavailableError,
    );
  });

  it("treats an error status as unavailable", async () => {
    respondWith({}, 500);

    await expect(lookupCep("09010000")).rejects.toBeInstanceOf(
      CepUnavailableError,
    );
  });

  it("treats a network failure or timeout as unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("timeout"));

    await expect(lookupCep("09010000")).rejects.toBeInstanceOf(
      CepUnavailableError,
    );
  });
});
