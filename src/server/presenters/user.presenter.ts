import "server-only";
import type { User } from "@/generated/prisma/client";

// Só o que a tela precisa: nunca hash de senha, datas internas ou flags.
export const presentUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export type PublicUser = ReturnType<typeof presentUser>;
