import { Breadcrumb } from "@/components/Breadcrumb";
import { homeLink, menuLink } from "@/lib/links";
import { menuPage } from "@/data/copy";
import type { ProductCategory } from "@/generated/prisma/enums";
import { categoryLabels } from "@/lib/product-categories";
import { CategoryNav } from "./CategoryNav";

// Título, categorias e conteúdo do cardápio. Com uma categoria ativa, uma linha acima do título mostra
// "Início > Cardápio > Doces" (o atual em negrito). Ela fica na folga acima do título (position absolute)
// para o título não mudar de lugar quando o filtro liga e desliga.
export function MenuShell({
  category,
  children,
}: {
  category?: ProductCategory;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="relative">
        {category && (
          <Breadcrumb
            items={[
              { label: menuPage.breadcrumbHome, href: homeLink },
              { label: menuPage.title, href: menuLink },
            ]}
            current={categoryLabels[category]}
            className="absolute -top-6 left-0"
          />
        )}
        <h1 className="heading-soft text-[1.625rem] md:text-[2.25rem]">
          {menuPage.title}
        </h1>
      </div>
      <p className="mt-3 max-w-[48ch] text-[1.0625rem] text-ink-soft">
        {menuPage.description}
      </p>
      <div className="mt-8">
        <CategoryNav selected={category} />
      </div>
      <div className="mt-12">{children}</div>
    </>
  );
}
