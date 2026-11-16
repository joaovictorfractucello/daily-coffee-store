import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryNav } from "@/components/menu/CategoryNav";
import { MenuContent } from "@/components/menu/MenuContent";
import { MenuCategoriesSkeleton } from "@/components/menu/MenuCategoriesSkeleton";
import { menuPage } from "@/data/copy";

export const metadata: Metadata = {
  title: menuPage.metaTitle,
  description: menuPage.description,
  alternates: { canonical: "/cardapio" },
};

export default function MenuPage({ searchParams }: PageProps<"/cardapio">) {
  return (
    <div className="px-4 pt-24 pb-20 sm:px-6 md:pt-28 md:pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <h1 className="heading-soft text-[1.625rem] md:text-[2.25rem]">
          {menuPage.title}
        </h1>
        <p className="mt-3 max-w-[48ch] text-[1.0625rem] text-ink-soft">
          {menuPage.description}
        </p>
        <div className="mt-8">
          <CategoryNav />
        </div>
        <div className="mt-12">
          <Suspense fallback={<MenuCategoriesSkeleton />}>
            <MenuContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
