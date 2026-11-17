import type { Metadata } from "next";
import { Suspense } from "react";
import { MenuContent } from "@/components/menu/MenuContent";
import { MenuCategoriesSkeleton } from "@/components/menu/MenuCategoriesSkeleton";
import { MenuShell } from "@/components/menu/MenuShell";
import { menuPage } from "@/data/copy";

export const metadata: Metadata = {
  title: menuPage.metaTitle,
  description: menuPage.description,
  alternates: { canonical: "/cardapio" },
};

export default function MenuPage({ searchParams }: PageProps<"/cardapio">) {
  return (
    <div className="px-4 pt-24 pb-12 sm:px-6 md:pt-28 md:pb-[4.5rem] lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Suspense
          fallback={
            <MenuShell>
              <MenuCategoriesSkeleton />
            </MenuShell>
          }
        >
          <MenuContent searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
