import "server-only";

// Na Vercel, `x-real-ip` e `x-forwarded-for` são escritos pela própria plataforma: o valor que o
// cliente manda nesses cabeçalhos é substituído, então não dá para fingir outro IP.
export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const forwardedFor = request.headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
