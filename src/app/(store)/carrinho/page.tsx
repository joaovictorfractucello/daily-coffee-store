import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { cartPage } from "@/data/copy";

// Página pessoal: o conteúdo vem do navegador de cada um e não serve para a busca.
export const metadata: Metadata = {
  title: cartPage.metaTitle,
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="px-4 pt-24 pb-12 sm:px-6 md:pt-28 md:pb-[4.5rem] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 heading-soft text-[1.5rem] md:text-[2rem]">
          {cartPage.title}
        </h1>
        <CartView />
      </div>
    </div>
  );
}
