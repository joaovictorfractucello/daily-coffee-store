import "server-only";
import { prisma } from "@/server/lib/prisma";

export const healthRepository = {
  async ping() {
    await prisma.$queryRaw`SELECT 1`;
  },
};
