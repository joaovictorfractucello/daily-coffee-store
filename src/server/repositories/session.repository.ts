import "server-only";
import { prisma } from "@/server/lib/prisma";

export const sessionRepository = {
  create(data: { id: string; userId: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  },

  findWithUser(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: { user: true },
    });
  },

  updateExpiration(id: string, expiresAt: Date) {
    return prisma.session.update({ where: { id }, data: { expiresAt } });
  },

  // deleteMany não falha quando a sessão já não existe (logout repetido).
  delete(id: string) {
    return prisma.session.deleteMany({ where: { id } });
  },
};
