import { z } from "zod";

// Regras dos campos de endereço, usadas pela tela (aviso rápido) e pelo servidor (a que vale).
export const ADDRESS_LIMITS = {
  street: 120,
  number: 10,
  complement: 60,
  neighborhood: 80,
  customLabel: 30,
} as const;

// Mesma lista do enum AddressLabel do Prisma (a tela não importa o cliente do banco).
export const ADDRESS_LABELS = ["HOME", "WORK", "OTHER"] as const;
export type AddressLabelValue = (typeof ADDRESS_LABELS)[number];

// Teto de endereços por pessoa (tela e servidor): contra abuso, ninguém precisa de mais para pedir café.
export const MAX_ADDRESSES_PER_USER = 10;

// Aceita "09010-000" ou "09010000" e devolve só os 8 dígitos.
export const normalizeCep = (cep: string) => cep.replace(/\D/g, "");

export const formatCep = (cep: string) =>
  cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;

export const cepField = z
  .string()
  .trim()
  .regex(/^\d{5}-?\d{3}$/)
  .transform(normalizeCep);

const text = (max: number) => z.string().trim().min(1).max(max);

// Só os campos que a pessoa preenche. Cidade e UF não entram: vêm do ViaCEP, no servidor.
export const addressInputSchema = z.object({
  cep: cepField,
  street: text(ADDRESS_LIMITS.street),
  number: text(ADDRESS_LIMITS.number),
  complement: z
    .string()
    .trim()
    .max(ADDRESS_LIMITS.complement)
    .optional()
    .transform((value) => value || undefined),
  neighborhood: text(ADDRESS_LIMITS.neighborhood),
  label: z.enum(ADDRESS_LABELS).default("OTHER"),
  customLabel: z
    .string()
    .trim()
    .max(ADDRESS_LIMITS.customLabel)
    .optional()
    .transform((value) => value || undefined),
});

export const cepQuerySchema = z.object({ cep: cepField });

export type AddressInput = z.infer<typeof addressInputSchema>;
