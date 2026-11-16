import { ArrowRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { connection as waitForIncomingRequest } from "next/server";
import { Suspense } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductCardSkeleton } from "@/components/products/ProductCardSkeleton";
import { Reveal } from "@/components/Reveal";
import { favoritesCopy, labels } from "@/data/copy";
import { menuLink } from "@/lib/links";
import { presentProduct } from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";

// Link discreto: pequeno, na cor do texto secundário, e só ganha o sublinhado e o tom escuro no hover.
const menuLinkClass =
  "shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-ink";

const cardWidthClass = "min-w-0 md:w-[34vw] md:shrink-0 lg:w-auto";

const favoritePhotoSizes =
  "(min-width: 1280px) 380px, (min-width: 768px) 30vw, 92vw";

const FEATURED_COUNT = 5;

async function FeaturedProducts() {
  await waitForIncomingRequest();
  const products = await productService.list({ featured: true });

  return products.map((product, index) => (
    <Reveal key={product.id} delay={index * 0.06} className={cardWidthClass}>
      <ProductCard
        product={presentProduct(product)}
        photoSizes={favoritePhotoSizes}
      />
    </Reveal>
  ));
}

function FeaturedProductsSkeleton() {
  return Array.from({ length: FEATURED_COUNT }, (_, index) => (
    <div key={index} className={cardWidthClass}>
      <ProductCardSkeleton />
    </div>
  ));
}

// No celular os produtos ficam em grade de 2 por linha; no tablet, numa faixa que se arrasta para o
// lado; no desktop (lg) os 5 ficam lado a lado. O link "Ver cardápio" fica à direita do título em
// todos os tamanhos.
export function Favorites() {
  return (
    <section
      id="queridinhos"
      aria-labelledby="favorites-title"
      className="py-12 md:py-[4.5rem] lg:px-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <Reveal className="flex items-baseline justify-between gap-6">
          <h2
            id="favorites-title"
            className="heading-soft text-[1.25rem] md:text-[1.75rem]"
          >
            {favoritesCopy.title}
          </h2>
          <Link
            href={menuLink}
            className={`${menuLinkClass} inline-flex min-h-11`}
          >
            {labels.menu}
            <ArrowRight aria-hidden="true" size={14} weight="bold" />
          </Link>
        </Reveal>
      </div>

      {/* Faixa rolável por teclado (tabIndex) e por toque; some a barra de rolagem para ficar limpa. */}
      <div
        role="region"
        aria-label={favoritesCopy.title}
        tabIndex={0}
        className="mt-10 grid [scrollbar-width:none] grid-cols-2 gap-x-4 gap-y-8 px-4 pb-4 sm:px-6 md:flex md:gap-4 md:overflow-x-auto lg:mx-auto lg:grid lg:max-w-7xl lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <Suspense fallback={<FeaturedProductsSkeleton />}>
          <FeaturedProducts />
        </Suspense>
      </div>
    </section>
  );
}
