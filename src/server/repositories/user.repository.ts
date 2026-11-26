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
};
