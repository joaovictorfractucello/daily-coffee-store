import "server-only";
import type { Role } from "@/generated/prisma/enums";
import {
  ForbiddenError,
  UnauthenticatedError,
} from "@/server/errors/auth.errors";
import {
  readSessionToken,
  writeSessionCookie,
} from "@/server/lib/session-cookie";
import {
  sessionService,
  type ValidSession,
} from "@/server/services/session.service";

type AuthOptions = { roles?: Role[] };

// Envolve o controller, no estilo do Express: valida a sessão no banco e o papel. Sem sessão → 401;
// papel errado → 403. Falha fechado: qualquer dúvida vira erro, nunca acesso.
export function withAuth<Req extends Request, Context>(
  handler: (
    request: Req,
    context: Context,
    auth: ValidSession,
  ) => Promise<Response>,
  { roles }: AuthOptions = {},
) {
  return async (request: Req, context: Context): Promise<Response> => {
    const token = await readSessionToken();
    const session = token ? await sessionService.validate(token) : null;
    if (!token || !session) throw new UnauthenticatedError();
    if (roles && !roles.includes(session.user.role)) throw new ForbiddenError();

    if (session.renewed) await writeSessionCookie(token, session.expiresAt);
    return handler(request, context, session);
  };
}
