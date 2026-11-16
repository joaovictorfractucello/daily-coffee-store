import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { labels, productPage } from "@/data/copy";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppLink, menuLink } from "@/lib/links";
import { categoryAnchors, categoryLabels } from "@/lib/product-categories";
import { site } from "@/site.config";
import type { PublicProduct } from "@/server/presenters/product.presenter";

const detailPhotoSizes = "(min-width: 768px) 50vw, 100vw";

export function ProductDetails({ product }: { product: PublicProduct }) {
  const orderLink = buildWhatsAppLink(
    site.whatsapp.phone,
    productPage.whatsAppMessage(product.name),
  );

  return (
    <article className="grid gap-8 md:grid-cols-2 md:items-start md:gap-12">
      <ProductPhoto
        src={product.imageUrl}
        alt={product.name}
        sizes={detailPhotoSizes}
        priority
      />
      <div>
        <Link
          href={`${menuLink}#${categoryAnchors[product.category]}`}
          className="eyebrow text-xs text-ink-soft"
        >
          {categoryLabels[product.category]}
        </Link>
        <h1 className="mt-3 heading-soft text-[1.5rem] md:text-[2rem]">
          {product.name}
        </h1>
        <p className="mt-3 text-xl font-semibold tabular-nums">
          {formatPrice(product.priceInCents)}
        </p>
        <p className="mt-5 max-w-[44ch] text-[1.0625rem] text-ink-soft">
          {product.description}
        </p>
        <a
          href={orderLink}
          data-cta-whatsapp=""
          target="_blank"
          rel="noopener noreferrer"
          className="button button-accent mt-8 w-full sm:w-auto"
        >
          {labels.whatsapp}
          <span className="sr-only"> {labels.opensWhatsApp}</span>
        </a>
        <Link
          href={menuLink}
          className="link-underline mt-8 flex w-fit items-center gap-1.5 text-sm font-semibold text-ink-soft"
        >
          <ArrowLeft aria-hidden="true" size={14} weight="bold" />
          {productPage.backToMenu}
        </Link>
      </div>
    </article>
  );
}
