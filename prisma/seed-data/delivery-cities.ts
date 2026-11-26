import type { Prisma } from "../../src/generated/prisma/client";

// Área de entrega (ADR 012): cidade de São Paulo e as 7 cidades do ABC. A taxa sobe com a distância
// da loja (Vila Mariana). Nomes exatamente como o ViaCEP devolve.
export const seedDeliveryCities: Prisma.DeliveryCityCreateInput[] = [
  { name: "São Paulo", state: "SP", deliveryFeeInCents: 600 },
  { name: "São Caetano do Sul", state: "SP", deliveryFeeInCents: 800 },
  { name: "Santo André", state: "SP", deliveryFeeInCents: 1000 },
  { name: "São Bernardo do Campo", state: "SP", deliveryFeeInCents: 1000 },
  { name: "Diadema", state: "SP", deliveryFeeInCents: 1000 },
  { name: "Mauá", state: "SP", deliveryFeeInCents: 1200 },
  { name: "Ribeirão Pires", state: "SP", deliveryFeeInCents: 1400 },
  { name: "Rio Grande da Serra", state: "SP", deliveryFeeInCents: 1500 },
];
