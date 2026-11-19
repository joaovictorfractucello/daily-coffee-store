"use client";

import { useEffect, useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addCartItem,
  removeCartItems,
  sanitizeCartItems,
  setCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

const CART_STORAGE_KEY = "daily-coffee-cart";

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItems: (productIds: string[]) => void;
};

// Carrinho no navegador (ADR 010): só ids e quantidades, salvos no localStorage. As regras ficam em
// src/lib/cart.ts; aqui só o estado. A leitura do localStorage espera o componente montar
// (skipHydration), para o HTML do servidor e o primeiro desenho no navegador serem iguais.
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set(({ items }) => ({ items: addCartItem(items, item) })),
      setQuantity: (productId, quantity) =>
        set(({ items }) => ({
          items: setCartItemQuantity(items, productId, quantity),
        })),
      removeItems: (productIds) =>
        set(({ items }) => ({ items: removeCartItems(items, productIds) })),
    }),
    {
      name: CART_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items }) => ({ items }),
      merge: (persisted, current) => ({
        ...current,
        items: sanitizeCartItems((persisted as { items?: unknown })?.items),
      }),
      skipHydration: true,
    },
  ),
);

const subscribeToHydration = (onChange: () => void) =>
  useCartStore.persist.onFinishHydration(onChange);
const hasHydrated = () => useCartStore.persist.hasHydrated();
const notHydratedOnServer = () => false;

// Lê o localStorage na primeira montagem e diz se já leu. Quem mostra o carrinho (contador, página)
// espera o `true` para não desenhar um carrinho vazio que logo muda. Também relê quando outra aba
// muda o carrinho, para uma aba não sobrescrever a outra.
export function useCartHydrated() {
  useEffect(() => {
    if (!useCartStore.persist.hasHydrated()) useCartStore.persist.rehydrate();

    const rehydrateFromOtherTab = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) useCartStore.persist.rehydrate();
    };
    window.addEventListener("storage", rehydrateFromOtherTab);
    return () => window.removeEventListener("storage", rehydrateFromOtherTab);
  }, []);

  return useSyncExternalStore(
    subscribeToHydration,
    hasHydrated,
    notHydratedOnServer,
  );
}
