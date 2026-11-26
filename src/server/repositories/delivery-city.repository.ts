import "server-only";
import { prisma } from "@/server/lib/prisma";

export const deliveryCityRepository = {
  // Poucas cidades por UF: a comparação sem acento é feita no service.
  findActiveByState(state: string) {
    return prisma.deliveryCity.findMany({ where: { state, isActive: true } });
  },
};
