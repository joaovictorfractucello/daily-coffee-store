"use client";

import { create } from "zustand";
import type { PublicUser } from "@/server/presenters/user.presenter";

type SessionState =
  | { status: "loading"; user: null }
  | { status: "guest"; user: null }
  | { status: "signedIn"; user: PublicUser };

type SessionStore = SessionState & {
  load: () => Promise<void>;
  signIn: (user: PublicUser) => void;
  signOut: () => void;
};

let loading: Promise<void> | undefined;

// Quem está logado, para o cabeçalho. O cookie é httpOnly (o JavaScript não lê), então a tela
// pergunta ao servidor (GET /api/auth/me). Ler o cookie no servidor deixaria todas as páginas
// dinâmicas e sem pré-renderização. Isto é só para exibir: a permissão é sempre checada no servidor.
export const useSessionStore = create<SessionStore>()((set) => ({
  status: "loading",
  user: null,
  load: () => {
    loading ??= fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return set({ status: "guest", user: null });
        const { user } = (await response.json()) as { user: PublicUser };
        set({ status: "signedIn", user });
      })
      .catch(() => set({ status: "guest", user: null }));
    return loading;
  },
  signIn: (user) => set({ status: "signedIn", user }),
  signOut: () => set({ status: "guest", user: null }),
}));
