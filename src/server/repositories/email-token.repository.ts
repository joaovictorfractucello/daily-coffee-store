import "server-only";
import type { EmailTokenType } from "@/generated/prisma/enums";
import { prisma } from "@/server/lib/prisma";

type NewEmailToken = {
  tokenHash: string;
  userId: string;
  type: EmailTokenType;
  expiresAt: Date;
};

export const emailTokenRepository = {
  // Um link novo invalida os anteriores do mesmo tipo que ainda não foram usados.
  async replace(token: NewEmailToken) {
    await prisma.$transaction([
      prisma.emailToken.deleteMany({
        where: { userId: token.userId, type: token.type, usedAt: null },
      }),
      prisma.emailToken.create({ data: token }),
    ]);
  },

  findValid(tokenHash: string, type: EmailTokenType, now: Date) {
    return prisma.emailToken.findFirst({
      where: { tokenHash, type, usedAt: null, expiresAt: { gt: now } },
    });
  },

  // Uso único: o updateMany só marca se ainda estiver livre. Dois cliques ao mesmo tempo no mesmo
  // link: só um passa (count 1), o outro recebe count 0.
  async consumeAndVerifyEmail(tokenId: string, userId: string, now: Date) {
    return prisma.$transaction(async (transaction) => {
      const { count } = await transaction.emailToken.updateMany({
        where: { id: tokenId, usedAt: null },
        data: { usedAt: now },
      });
      if (count === 0) return false;
      await transaction.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: now },
      });
      return true;
    });
  },

  // Tudo ou nada: marca o link como usado, grava a senha nova, confirma o e-mail (quem abriu o link
  // provou acesso a ele) e apaga todas as sessões, inclusive uma que tenha sido roubada.
  async consumeAndResetPassword(
    tokenId: string,
    userId: string,
    passwordHash: string,
    now: Date,
  ) {
    return prisma.$transaction(async (transaction) => {
      const { count } = await transaction.emailToken.updateMany({
        where: { id: tokenId, usedAt: null },
        data: { usedAt: now },
      });
      if (count === 0) return false;

      const user = await transaction.user.findUniqueOrThrow({
        where: { id: userId },
        select: { emailVerifiedAt: true },
      });
      await transaction.user.update({
        where: { id: userId },
        data: { passwordHash, emailVerifiedAt: user.emailVerifiedAt ?? now },
      });
      await transaction.session.deleteMany({ where: { userId } });
      await transaction.emailToken.deleteMany({
        where: { userId, type: "PASSWORD_RESET", usedAt: null },
      });
      return true;
    });
  },
};
