import Link from "next/link";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { Reveal } from "@/components/Reveal";
import { categoriesCopy } from "@/data/copy";
import {
  categoryLabels,
  categoryOrder,
  menuCategoryLink,
} from "@/lib/product-categories";
import type { ProductCategory } from "@/generated/prisma/enums";

// Ilustração de cada categoria (veja IMAGENS.md). Estática: a home não consulta o banco para os atalhos.
const categoryPhotos: Record<ProductCategory, string> = {
  CAFES: "/images/categorias/cafes.webp",
  BEBIDAS_GELADAS: "/images/categorias/bebidas-geladas.webp",
  SALGADOS: "/images/categorias/salgados.webp",
  DOCES: "/images/categorias/doces.webp",
};

const categoryPhotoSizes =
  "(min-width: 1280px) 240px, (min-width: 1024px) 18vw, 23vw";

// Atalhos para o cardápio, logo abaixo do hero: sempre os 4 lado a lado (no celular, fotos pequenas e rótulo que pode quebrar em 2 linhas).
export function Categories() {
  return (
    <section
      aria-labelledby="categories-title"
      className="px-4 pt-8 sm:px-6 md:pt-16 lg:px-10"
    >
      <h2 id="categories-title" className="sr-only">
        {categoriesCopy.title}
      </h2>
      {/* No desktop, cada card tem a largura de uma coluna dos produtos (5 colunas, gap de 1,5rem):
          4 colunas + 3 gaps = 80% da largura menos 0,3rem. Centralizado. */}
      <ul className="mx-auto grid max-w-7xl grid-cols-4 gap-x-3 sm:gap-x-4 lg:w-[calc(80%-0.3rem)] lg:max-w-[calc(64rem-0.3rem)] lg:gap-x-6">
        {categoryOrder.map((category, index) => (
          <li key={category}>
            <Reveal delay={index * 0.06}>
              <Link
                href={menuCategoryLink(category)}
                className="favorite block"
              >
                <ProductPhoto
                  src={categoryPhotos[category]}
                  alt=""
                  sizes={categoryPhotoSizes}
                  className="product-photo overflow-hidden rounded-[1.25rem]"
                />
                <span className="mt-2 block text-center text-[0.8125rem] leading-tight font-bold sm:mt-3 sm:text-base">
                  {categoryLabels[category]}
                </span>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
