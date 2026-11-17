import Link from "next/link";
import type { ProductCategory } from "@/generated/prisma/enums";
import { menuLink } from "@/lib/links";
import {
  categoryLabels,
  categoryOrder,
  menuCategoryLink,
} from "@/lib/product-categories";

// Clicar em uma categoria mostra só os produtos dela; clicar de novo na ativa volta para todos.
export function CategoryNav({ selected }: { selected?: ProductCategory }) {
  return (
    <nav aria-label="Categorias do cardápio">
      {/* Celular: uma linha só (rola de lado se a tela for muito estreita). A partir do sm, pode quebrar linha. */}
      <ul className="flex [scrollbar-width:none] gap-1.5 overflow-x-auto sm:flex-wrap sm:gap-2 [&::-webkit-scrollbar]:hidden">
        {categoryOrder.map((category) => {
          const isSelected = category === selected;
          return (
            <li key={category} className="shrink-0">
              <Link
                href={isSelected ? menuLink : menuCategoryLink(category)}
                scroll={false}
                aria-current={isSelected ? "true" : undefined}
                className={`inline-flex min-h-11 items-center rounded-[999px] border px-2.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 sm:px-4 sm:text-sm md:min-h-10 ${
                  isSelected
                    ? "border-ink bg-ink text-background"
                    : "border-line hover:border-ink hover:bg-current/5 focus-visible:bg-current/5"
                }`}
              >
                {categoryLabels[category]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
