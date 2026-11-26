import { ArrowRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { connection as waitForIncomingRequest } from "next/server";
import { ProductCard } from "@/components/products/ProductCard";
import { productPage } from "@/data/copy";
import { categoryLabels, menuCategoryLink } from "@/lib/product-categories";
import {
  presentProduct,
  type PublicProduct,
} from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";

const relatedPhotoSizes = "(min-width: 640px) 240px, 62vw";

// Outros produtos da mesma categoria, em uma fileira que rola de lado.
export async function RelatedProducts({ product }: { product: PublicProduct }) {
  await waitForIncomingRequest();
  const related = (await productService.listRelated(product)).map(
    presentProduct,
  );
  if (related.length === 0) return null;

  return (
    <section aria-labelledby="related-products-title" className="mt-16">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="related-products-title"
          className="heading-soft text-[1.125rem] md:text-[1.375rem]"
        >
          {productPage.relatedTitle}
        </h2>
        <Link
          href={menuCategoryLink(product.category)}
          className="link-underline inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold"
        >
          {productPage.seeCategory(categoryLabels[product.category])}
          <ArrowRight aria-hidden="true" size={14} weight="bold" />
        </Link>
      </div>
      <ul className="-mx-(--gutter) mt-6 flex [scrollbar-width:none] gap-4 overflow-x-auto px-(--gutter) pb-2 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
        {related.map((relatedProduct) => (
          <li
            key={relatedProduct.id}
            className="w-[62vw] max-w-[15rem] shrink-0 sm:w-60"
          >
            <ProductCard
              product={relatedProduct}
              photoSizes={relatedPhotoSizes}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
