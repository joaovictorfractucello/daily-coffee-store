import "server-only";
import { createHash } from "node:crypto";

const RANGE_URL = "https://api.pwnedpasswords.com/range/";
const TIMEOUT_MS = 3_000;

// "unavailable": o serviço caiu, demorou ou respondeu algo estranho. Quem chama decide o que fazer.
export type PasswordBreachResult = "breached" | "safe" | "unavailable";

// Linhas no formato SUFIXO:QUANTIDADE. Com `Add-Padding` o serviço mistura linhas falsas com
// quantidade 0: só vale quem tem quantidade maior que zero.
function rangeContains(range: string, suffix: string): boolean {
  return range.split("\n").some((line) => {
    const [lineSuffix, count] = line.trim().split(":");
    return lineSuffix === suffix && Number(count) > 0;
  });
}

// k-anonymity: só os 5 primeiros caracteres do SHA-1 saem do servidor, nunca a senha nem o hash
// inteiro. O SHA-1 é exigência do protocolo do serviço, não proteção de senha (isso é o argon2id).
// Falha aberta: um terceiro fora do ar não pode travar o cadastro (SPEC §5).
export async function checkPasswordBreach(
  password: string,
): Promise<PasswordBreachResult> {
  const sha1 = createHash("sha1").update(password).digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(`${RANGE_URL}${prefix}`, {
      headers: { "Add-Padding": "true" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) return "unavailable";
    return rangeContains(await response.text(), suffix) ? "breached" : "safe";
  } catch {
    return "unavailable";
  }
}
