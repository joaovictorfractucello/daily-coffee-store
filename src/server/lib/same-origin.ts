import "server-only";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function hostOf(origin: string): string | null {
  try {
    return new URL(origin).host;
  } catch {
    return null;
  }
}

// Defesa contra CSRF além do sameSite: todo navegador manda o cabeçalho Origin em requisições de
// escrita feitas por outro site. Comparamos com o Host da própria requisição, que o navegador da
// vítima preenche com o nosso endereço (o site atacante não consegue trocá-lo). Sem Origin (Postman,
// curl, servidor) passa: ali não existe cookie do navegador da vítima para ser usado.
export function isCrossSiteWrite(
  method: string,
  originHeader: string | null,
  requestHost: string | null,
): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return false;
  if (!originHeader) return false;
  return !requestHost || hostOf(originHeader) !== requestHost;
}
