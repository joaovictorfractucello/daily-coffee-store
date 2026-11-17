import { CaretRight } from "@phosphor-icons/react/ssr";
import Link from "next/link";

export type BreadcrumbItem = { label: string; href: string };

// Início > Cardápio > Cafés: os itens são links e o último (a página atual) fica em negrito, sem link.
// Em nome muito longo, o último item é cortado com reticências para a linha não quebrar.
export function Breadcrumb({
  items,
  current,
  className = "",
}: {
  items: BreadcrumbItem[];
  current: string;
  className?: string;
}) {
  return (
    <nav
      aria-label="Você está em"
      className={`text-xs text-ink-soft ${className}`}
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item) => (
          <li key={item.href} className="flex shrink-0 items-center gap-1.5">
            <Link
              href={item.href}
              scroll={false}
              className="underline-offset-4 hover:text-ink hover:underline"
            >
              {item.label}
            </Link>
            <CaretRight aria-hidden="true" size={10} weight="bold" />
          </li>
        ))}
        <li aria-current="page" className="min-w-0 truncate font-bold text-ink">
          {current}
        </li>
      </ol>
    </nav>
  );
}
