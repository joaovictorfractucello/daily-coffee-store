import { connection as waitForIncomingRequest } from "next/server";
import { ProductCard } from "@/components/products/ProductCard";
import {
  categoryAnchors,
  categoryLabels,
  categoryOrder,
} from "@/lib/product-categories";
import {
  presentProduct,
  type PublicProduct,
} from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";
import { ScrollToHash } from "./ScrollToHash";

const menuPhotoSizes =
  "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 62vw";

function groupByCategory(products: PublicProduct[]) {
  return categoryOrder
    .map((category) => ({
      category,
      products: products.filter((product) => product.category === category),
    }))
    .filter((group) => group.products.length > 0);
}

export async function MenuCategories() {
  await waitForIncomingRequest();
  const products = (await productService.list()).map(presentProduct);

  const groups = groupByCategory(products).map(({ category, products }) => (
    <section
      key={category}
      id={categoryAnchors[category]}
      aria-labelledby={`${categoryAnchors[category]}-title`}
      className="scroll-mt-4 pt-12 first:pt-0"
    >
      <h2
        id={`${categoryAnchors[category]}-title`}
        className="heading-soft text-[1.125rem] md:text-[1.375rem]"
      >
        {categoryLabels[category]}
      </h2>
      <ul className="-mx-4 mt-6 flex [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:grid md:grid-cols-3 md:gap-x-6 md:gap-y-10 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {products.map((product) => (
          <li
            key={product.id}
            className="w-[62vw] max-w-[15rem] shrink-0 md:w-auto md:max-w-none"
          >
            <ProductCard product={product} photoSizes={menuPhotoSizes} />
          </li>
        ))}
      </ul>
    </section>
  ));

  return (
    <>
      <ScrollToHash />
      {groups}
    </>
  );
}
