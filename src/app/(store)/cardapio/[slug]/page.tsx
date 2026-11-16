import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection as waitForIncomingRequest } from "next/server";
import { Suspense } from "react";
import { findProduct } from "@/components/product/find-product";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductDetailsSkeleton } from "@/components/product/ProductDetailsSkeleton";

async function findProductOrNotFound(params: Promise<{ slug: string }>) {
  await waitForIncomingRequest();
  const product = await findProduct((await params).slug);
  if (!product) notFound();
  return product;
}

export async function generateMetadata({
  params,
}: PageProps<"/cardapio/[slug]">): Promise<Metadata> {
  const product = await findProductOrNotFound(params);

  return {
    title: `${product.name} | Daily Coffee`,
    description: product.description,
    alternates: { canonical: `/cardapio/${product.slug}` },
  };
}

async function ProductContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return <ProductDetails product={await findProductOrNotFound(params)} />;
}

export default function ProductPage({ params }: PageProps<"/cardapio/[slug]">) {
  return (
    <div className="px-4 pt-24 pb-20 sm:px-6 md:pt-28 md:pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<ProductDetailsSkeleton />}>
          <ProductContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
