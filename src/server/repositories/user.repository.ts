import "server-only";
import { prisma } from "@/server/lib/prisma";

type NewUser = { name: string; email: string; passwordHash: string };

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create({ name, email, passwordHash }: NewUser) {
    return prisma.user.create({ data: { name, email, passwordHash } });
  },

  // Troca de senha logado, numa transação: grava o hash novo, encerra as outras sessões (mantém a
  // de quem trocou) e invalida links de redefinição pendentes, que ainda trocariam a senha.
  async changePassword(
    userId: string,
    passwordHash: string,
    keepSessionId: string,
  ) {
    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
      prisma.session.deleteMany({
        where: { userId, id: { not: keepSessionId } },
      }),
      prisma.emailToken.deleteMany({
        where: { userId, type: "PASSWORD_RESET", usedAt: null },
      }),
    ]);
  },
};
