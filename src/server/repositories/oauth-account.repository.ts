import "server-only";
import { prisma } from "@/server/lib/prisma";

type ProviderAccount = { provider: string; providerUserId: string };

type NewOAuthUser = ProviderAccount & {
  name: string;
  email: string;
  now: Date;
};

export const oauthAccountRepository = {
  async findUser({ provider, providerUserId }: ProviderAccount) {
    const account = await prisma.oAuthAccount.findUnique({
      where: { provider_providerUserId: { provider, providerUserId } },
      include: { user: true },
    });
    return account?.user ?? null;
  },

  link(userId: string, { provider, providerUserId }: ProviderAccount) {
    return prisma.oAuthAccount.create({
      data: { userId, provider, providerUserId },
    });
  },

  // Conta local nunca confirmada + Google com e-mail verificado (pre-hijacking, SPEC §5): o Google
  // provou quem é o dono do e-mail. A senha que alguém cadastrou antes e as sessões abertas somem
  // junto, na mesma transação.
  claimUnverifiedUser(
    userId: string,
    { provider, providerUserId }: ProviderAccount,
    now: Date,
  ) {
    return prisma.$transaction(async (transaction) => {
      await transaction.oAuthAccount.create({
        data: { userId, provider, providerUserId },
      });
      await transaction.session.deleteMany({ where: { userId } });
      return transaction.user.update({
        where: { id: userId },
        data: { emailVerifiedAt: now, passwordHash: null },
      });
    });
  },

  createUser({ provider, providerUserId, name, email, now }: NewOAuthUser) {
    return prisma.user.create({
      data: {
        name,
        email,
        emailVerifiedAt: now,
        oauthAccounts: { create: { provider, providerUserId } },
      },
    });
  },
};
