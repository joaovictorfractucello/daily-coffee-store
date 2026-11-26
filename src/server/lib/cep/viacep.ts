import "server-only";
import { z } from "zod";
import { CepUnavailableError } from "@/server/errors/delivery.errors";

const TIMEOUT_MS = 3_000;

export type CepAddress = {
  cep: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
};

// Resposta do ViaCEP validada: é dado externo. CEP inexistente volta como { "erro": "true" }
// (texto, não booleano). Rua e bairro podem vir vazios (CEP geral de cidade pequena).
const foundSchema = z.object({
  cep: z.string(),
  logradouro: z.string(),
  bairro: z.string(),
  localidade: z.string().min(1),
  uf: z.string().length(2),
});
const notFoundSchema = z.object({
  erro: z.union([z.literal(true), z.literal("true")]),
});

// Consulta o CEP (8 dígitos). Devolve null se o CEP não existe; lança CepUnavailableError se o
// serviço falhar. Chamado só pelo servidor: a cidade que define a taxa não vem do navegador.
export async function lookupCep(cep: string): Promise<CepAddress | null> {
  let payload: unknown;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    payload = await response.json();
  } catch {
    throw new CepUnavailableError();
  }

  if (notFoundSchema.safeParse(payload).success) return null;
  const found = foundSchema.safeParse(payload);
  if (!found.success) throw new CepUnavailableError();

  const { logradouro, bairro, localidade, uf } = found.data;
  return {
    cep,
    street: logradouro.trim(),
    neighborhood: bairro.trim(),
    city: localidade.trim(),
    state: uf.toUpperCase(),
  };
}
