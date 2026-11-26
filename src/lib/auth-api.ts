// Chamadas da tela para a API de autenticação. Devolve o status e o código de erro para a tela
// escolher a mensagem; nunca mostra o texto cru do servidor.
export type AuthApiResult<Data> =
  | { ok: true; data: Data }
  | { ok: false; status: number; code?: string; retryAfterSeconds?: number };

export async function postAuth<Data = unknown>(
  path: string,
  body?: unknown,
): Promise<AuthApiResult<Data>> {
  try {
    const response = await fetch(`/api/auth/${path}`, {
      method: "POST",
      headers:
        body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload =
      response.status === 204 ? null : await response.json().catch(() => null);

    if (response.ok) return { ok: true, data: payload as Data };
    return {
      ok: false,
      status: response.status,
      code: payload?.error?.code,
      retryAfterSeconds:
        Number(response.headers.get("Retry-After")) || undefined,
    };
  } catch {
    return { ok: false, status: 0 };
  }
}
