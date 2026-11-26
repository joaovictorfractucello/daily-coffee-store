import "server-only";
import type { AddressLabel } from "@/generated/prisma/enums";
import { prisma } from "@/server/lib/prisma";

export type AddressData = {
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhoodName: string;
  city: string;
  state: string;
  deliveryCityId: string;
  label: AddressLabel;
  customLabel: string | null;
};

const withDeliveryCity = { deliveryCity: true } as const;

// Toda consulta filtra pelo dono (userId) na própria query: endereço de outra pessoa simplesmente
// não é encontrado (IDOR).
export const addressRepository = {
  listByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      include: withDeliveryCity,
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  findOwned(userId: string, id: string) {
    return prisma.address.findFirst({
      where: { id, userId },
      include: withDeliveryCity,
    });
  },

  countByUser(userId: string) {
    return prisma.address.count({ where: { userId } });
  },

  create(userId: string, data: AddressData, isDefault: boolean) {
    return prisma.address.create({
      data: { ...data, userId, isDefault },
      include: withDeliveryCity,
    });
  },

  update(id: string, data: AddressData) {
    return prisma.address.update({
      where: { id },
      data,
      include: withDeliveryCity,
    });
  },

  // Numa transação: sempre um único padrão por pessoa.
  async setDefault(userId: string, id: string) {
    const [, address] = await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
        include: withDeliveryCity,
      }),
    ]);
    return address;
  },

  // Apaga e, se era o padrão, promove o mais recente que sobrou. Tudo numa transação.
  async remove(userId: string, id: string, wasDefault: boolean) {
    await prisma.$transaction(async (transaction) => {
      await transaction.address.delete({ where: { id } });
      if (!wasDefault) return;
      const next = await transaction.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await transaction.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    });
  },
};
