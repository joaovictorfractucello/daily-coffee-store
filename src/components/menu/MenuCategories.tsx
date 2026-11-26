import { connection as waitForIncomingRequest } from "next/server";
import { ProductCard } from "@/components/products/ProductCard";
import type { ProductCategory } from "@/generated/prisma/enums";
import {
  categoryLabels,
  categoryOrder,
  categorySlugs,
} from "@/lib/product-categories";
import {
  presentProduct,
  type PublicProduct,
} from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";

const menuPhotoSizes =
  "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 62vw";
const isolatedPhotoSizes =
  "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 46vw";

// Cardápio completo: cada categoria é uma fileira que rola de lado no celular.
const carouselListClass =
  "-mx-(--gutter) mt-6 flex [scrollbar-width:none] gap-4 overflow-x-auto px-(--gutter) pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden";
const carouselItemClass =
  "w-[62vw] max-w-[15rem] shrink-0 md:w-auto md:max-w-none";

// Uma categoria só: grade em todas as telas (2 colunas no celular).
const isolatedListClass =
  "mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4";

function groupByCategory(
  products: PublicProduct[],
  onlyCategory: ProductCategory | undefined,
) {
  return categoryOrder
    .filter((category) => !onlyCategory || category === onlyCategory)
    .map((category) => ({
      category,
      products: products.filter((product) => product.category === category),
    }))
    .filter((group) => group.products.length > 0);
}

export async function MenuCategories({
  category: onlyCategory,
}: {
  category?: ProductCategory;
}) {
  await waitForIncomingRequest();
  const products = (await productService.list()).map(presentProduct);

  return groupByCategory(products, onlyCategory).map(
    ({ category, products }) => (
      <section
        key={category}
        aria-labelledby={`${categorySlugs[category]}-title`}
        className="pt-12 first:pt-0"
      >
        <h2
          id={`${categorySlugs[category]}-title`}
          className="heading-soft text-[1.125rem] md:text-[1.375rem]"
        >
          {categoryLabels[category]}
        </h2>
        <ul className={onlyCategory ? isolatedListClass : carouselListClass}>
          {products.map((product) => (
            <li
              key={product.id}
              className={onlyCategory ? undefined : carouselItemClass}
            >
              <ProductCard
                product={product}
                photoSizes={onlyCategory ? isolatedPhotoSizes : menuPhotoSizes}
              />
            </li>
          ))}
        </ul>
      </section>
    ),
  );
}
