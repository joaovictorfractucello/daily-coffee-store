import "server-only";
import type { User } from "@/generated/prisma/client";
import type { Role } from "@/generated/prisma/enums";
import { generateToken, hashToken } from "@/server/lib/tokens";
import { sessionRepository } from "@/server/repositories/session.repository";

const DAY_MS = 24 * 60 * 60 * 1000;
const CUSTOMER_SESSION_MS = 30 * DAY_MS;
const RENEW_WHEN_LESS_THAN_MS = 15 * DAY_MS;
// Sessão de admin roubada faz mais estrago: dura um expediente e não se renova sozinha.
const STAFF_SESSION_MS = 8 * 60 * 60 * 1000;

const isStaff = (role: Role) => role === "ADMIN" || role === "DEMO_ADMIN";

export type ValidSession = {
  user: User;
  expiresAt: Date;
  // Preenchido quando a validade foi estendida: quem tem acesso ao cookie deve regravá-lo.
  renewed: boolean;
};

export const sessionService = {
  // O token vai para o cookie; o banco guarda só o hash dele.
  async create(user: Pick<User, "id" | "role">, now = new Date()) {
    const token = generateToken();
    const lifetime = isStaff(user.role)
      ? STAFF_SESSION_MS
      : CUSTOMER_SESSION_MS;
    const expiresAt = new Date(now.getTime() + lifetime);
    await sessionRepository.create({
      id: hashToken(token),
      userId: user.id,
      expiresAt,
    });
    return { token, expiresAt };
  },

  async validate(
    token: string,
    { now = new Date(), renew = true } = {},
  ): Promise<ValidSession | null> {
    const sessionId = hashToken(token);
    const session = await sessionRepository.findWithUser(sessionId);
    if (!session) return null;

    if (session.expiresAt <= now) {
      await sessionRepository.delete(sessionId);
      return null;
    }

    const remainingMs = session.expiresAt.getTime() - now.getTime();
    const shouldRenew =
      renew &&
      !isStaff(session.user.role) &&
      remainingMs < RENEW_WHEN_LESS_THAN_MS;
    if (!shouldRenew) {
      return {
        user: session.user,
        expiresAt: session.expiresAt,
        renewed: false,
      };
    }

    const expiresAt = new Date(now.getTime() + CUSTOMER_SESSION_MS);
    await sessionRepository.updateExpiration(sessionId, expiresAt);
    return { user: session.user, expiresAt, renewed: true };
  },

  async invalidate(token: string) {
    await sessionRepository.delete(hashToken(token));
  },
};
