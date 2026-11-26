import { describe, expect, it } from "vitest";
import { addressInputSchema, cepField, formatCep } from "./address-schemas";

describe("cepField", () => {
  it("accepts a CEP with or without the dash and keeps only the digits", () => {
    expect(cepField.parse("09010-000")).toBe("09010000");
    expect(cepField.parse(" 09010000 ")).toBe("09010000");
  });

  it("refuses anything that is not a CEP", () => {
    for (const value of [
      "0901000",
      "090100000",
      "09010-00a",
      "",
      "abcde-fgh",
    ]) {
      expect(cepField.safeParse(value).success).toBe(false);
    }
  });
});

describe("addressInputSchema", () => {
  const valid = {
    cep: "09010-000",
    street: "Rua Coronel Oliveira Lima",
    number: "100",
    complement: "",
    neighborhood: "Centro",
  };

  it("drops fields the person does not fill (city comes from the server)", () => {
    const parsed = addressInputSchema.parse({
      ...valid,
      city: "São Paulo",
      deliveryCityId: "x",
    });

    expect(parsed).toEqual({
      cep: "09010000",
      street: "Rua Coronel Oliveira Lima",
      number: "100",
      complement: undefined,
      neighborhood: "Centro",
      label: "OTHER",
      customLabel: undefined,
    });
  });

  it("accepts only the known labels", () => {
    expect(addressInputSchema.parse({ ...valid, label: "HOME" }).label).toBe(
      "HOME",
    );
    expect(
      addressInputSchema.safeParse({ ...valid, label: "SCHOOL" }).success,
    ).toBe(false);
    expect(
      addressInputSchema.safeParse({ ...valid, customLabel: "a".repeat(31) })
        .success,
    ).toBe(false);
  });

  it("refuses fields over the size limit", () => {
    expect(
      addressInputSchema.safeParse({ ...valid, number: "1".repeat(11) })
        .success,
    ).toBe(false);
  });
});

describe("formatCep", () => {
  it("adds the dash", () => {
    expect(formatCep("09010000")).toBe("09010-000");
  });
});
