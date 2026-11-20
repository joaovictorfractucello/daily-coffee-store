import { type NextRequest, NextResponse } from "next/server";
import { isCrossSiteWrite } from "@/server/lib/same-origin";
import { logSecurityEvent } from "@/server/lib/security-log";

// Roda antes das rotas da API. Só checagens leves (SPEC §4): aqui, recusar escrita vinda de outro site.
export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (isCrossSiteWrite(request.method, origin, host)) {
    logSecurityEvent("cross_site_request_blocked");
    return NextResponse.json(
      { error: { code: "FORBIDDEN_ORIGIN", message: "Origem não permitida." } },
      { status: 403 },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
