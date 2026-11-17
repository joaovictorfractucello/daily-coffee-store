import { FileText } from "@phosphor-icons/react/ssr";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { menuPage, productPage } from "@/data/copy";
import { formatPrice } from "@/lib/format";
import { homeLink, menuLink } from "@/lib/links";
import { categoryLabels, menuCategoryLink } from "@/lib/product-categories";
import type { PublicProduct } from "@/server/presenters/product.presenter";
import { ProductPurchase } from "./ProductPurchase";

const detailPhotoSizes = "(min-width: 768px) 50vw, 100vw";

export function ProductDetails({ product }: { product: PublicProduct }) {
  return (
    <>
      <Breadcrumb
        items={[
          { label: menuPage.breadcrumbHome, href: homeLink },
          { label: menuPage.title, href: menuLink },
          {
            label: categoryLabels[product.category],
            href: menuCategoryLink(product.category),
          },
        ]}
        current={product.name}
        className="mb-6"
      />
      <article className="grid gap-8 md:grid-cols-2 md:items-start md:gap-12">
        <ProductPhoto
          src={product.imageUrl}
          alt={product.name}
          sizes={detailPhotoSizes}
          priority
        />
        <div>
          <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl font-bold tabular-nums">
            {formatPrice(product.priceInCents)}
          </p>
          <ProductPurchase />
          <section
            aria-labelledby="product-description-title"
            className="mt-8 border-y border-line py-5"
          >
            <h2
              id="product-description-title"
              className="flex items-center gap-3 font-bold"
            >
              <FileText aria-hidden="true" size={22} />
              {productPage.descriptionTitle}
            </h2>
            <p className="mt-3 max-w-[44ch] text-[1.0625rem] text-ink-soft">
              {product.description}
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
