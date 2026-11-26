// Para onde voltar depois do login (`?next=`). Só caminhos internos: um `next=https://site-falso.com`
// ou `next=//site-falso.com` levaria o usuário, recém-logado e confiante, para fora (open redirect).
export function safeRedirectPath(next: unknown, fallback = "/"): string {
  if (typeof next !== "string") return fallback;
  const isInternalPath =
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.startsWith("/\\") &&
    !/[\u0000-\u001f]/.test(next);
  return isInternalPath ? next : fallback;
}
