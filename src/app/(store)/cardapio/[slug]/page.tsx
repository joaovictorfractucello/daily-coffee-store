import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection as waitForIncomingRequest } from "next/server";
import { Suspense } from "react";
import { MenuCategories } from "@/components/menu/MenuCategories";
import { MenuCategoriesSkeleton } from "@/components/menu/MenuCategoriesSkeleton";
import { MenuShell } from "@/components/menu/MenuShell";
import { findProduct } from "@/components/product/find-product";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductDetailsSkeleton } from "@/components/product/ProductDetailsSkeleton";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { menuPage } from "@/data/copy";
import {
  categoryFromSlug,
  categoryLabels,
  menuCategoryLink,
} from "@/lib/product-categories";

// /cardapio/cafes é uma categoria e /cardapio/cappuccino-cremoso é um produto: as duas usam esta rota.
// Por isso nenhum produto pode ter o slug de uma categoria (veja product-categories.test.ts).

async function findProductOrNotFound(slug: string) {
  await waitForIncomingRequest();
  const product = await findProduct(slug);
  if (!product) notFound();
  return product;
}

export async function generateMetadata({
  params,
}: PageProps<"/cardapio/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = categoryFromSlug(slug);

  if (category) {
    return {
      title: `${categoryLabels[category]} | Cardápio | Daily Coffee`,
      description: menuPage.description,
      alternates: { canonical: menuCategoryLink(category) },
    };
  }

  const product = await findProductOrNotFound(slug);

  return {
    title: `${product.name} | Daily Coffee`,
    description: product.description,
    alternates: { canonical: `/cardapio/${product.slug}` },
  };
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await findProductOrNotFound(slug);

  return (
    <>
      <ProductDetails product={product} />
      <Suspense fallback={null}>
        <RelatedProducts product={product} />
      </Suspense>
    </>
  );
}

async function SlugContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);

  if (!category) return <ProductContent slug={slug} />;

  return (
    <MenuShell category={category}>
      <Suspense fallback={<MenuCategoriesSkeleton />}>
        <MenuCategories category={category} />
      </Suspense>
    </MenuShell>
  );
}

export default function SlugPage({ params }: PageProps<"/cardapio/[slug]">) {
  return (
    <div className="px-4 pt-24 pb-12 sm:px-6 md:pt-28 md:pb-[4.5rem] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<ProductDetailsSkeleton />}>
          <SlugContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
