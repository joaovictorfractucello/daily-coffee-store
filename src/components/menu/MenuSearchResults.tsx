import Link from "next/link";
import { ProductCard } from "@/components/products/ProductCard";
import { searchResults } from "@/data/copy";
import { menuLink } from "@/lib/links";
import { presentProduct } from "@/server/presenters/product.presenter";
import { productService } from "@/server/services/product.service";

const resultsPhotoSizes =
  "(min-width: 1280px) 300px, (min-width: 768px) 30vw, 46vw";

export async function MenuSearchResults({ term }: { term: string }) {
  const products = (await productService.list({ search: term })).map(
    presentProduct,
  );

  return (
    <section aria-labelledby="search-results-title">
      <h2
        id="search-results-title"
        className="heading-soft text-[1.125rem] md:text-[1.375rem]"
      >
        {searchResults.title(term)}
      </h2>
      <p role="status" className="mt-2 text-ink-soft">
        {products.length > 0
          ? searchResults.count(products.length)
          : searchResults.empty(term)}
      </p>
      <Link
        href={menuLink}
        className="link-underline mt-4 inline-block text-sm font-semibold"
      >
        {searchResults.seeFullMenu}
      </Link>
      <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} photoSizes={resultsPhotoSizes} />
          </li>
        ))}
      </ul>
    </section>
  );
}
