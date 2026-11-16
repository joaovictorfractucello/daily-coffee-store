import Link from "next/link";
import type { PublicProduct } from "@/server/presenters/product.presenter";
import { formatPrice } from "@/lib/format";
import { ProductPhoto } from "./ProductPhoto";

type ProductCardProps = {
  product: PublicProduct;
  photoSizes: string;
};

export function ProductCard({ product, photoSizes }: ProductCardProps) {
  return (
    <Link href={`/cardapio/${product.slug}`} className="block">
      <figure className="favorite">
        <ProductPhoto
          src={product.imageUrl}
          alt={product.name}
          sizes={photoSizes}
          className="product-photo overflow-hidden"
        />
        <figcaption className="mt-4">
          <h3 className="text-base leading-snug font-bold">{product.name}</h3>
          <p className="mt-1 text-[0.9375rem] leading-snug text-ink-soft">
            {product.description}
          </p>
          <p className="mt-2 font-bold tabular-nums">
            {formatPrice(product.priceInCents)}
          </p>
        </figcaption>
      </figure>
    </Link>
  );
}
