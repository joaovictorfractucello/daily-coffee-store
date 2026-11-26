import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart/CartView";
import { cartPage } from "@/data/copy";
import { menuLink } from "@/lib/links";

// Página pessoal: o conteúdo vem do navegador de cada um e não serve para a busca.
export const metadata: Metadata = {
  title: cartPage.metaTitle,
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="px-(--gutter) pt-24 pb-12 md:pt-28 md:pb-[4.5rem]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">
            {cartPage.title}
          </h1>
          <Link
            href={menuLink}
            className="hidden text-[0.9375rem] font-semibold underline-offset-4 hover:underline sm:inline"
          >
            {cartPage.continueShopping}
          </Link>
        </div>
        <CartView />
      </div>
    </div>
  );
}
