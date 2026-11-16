import {
  categoryAnchors,
  categoryLabels,
  categoryOrder,
} from "@/lib/product-categories";

export function CategoryNav() {
  return (
    <nav aria-label="Categorias do cardápio">
      <ul className="flex flex-wrap gap-2">
        {categoryOrder.map((category) => (
          <li key={category}>
            <a
              href={`#${categoryAnchors[category]}`}
              className="inline-flex min-h-11 items-center border border-line px-4 text-sm font-semibold transition-colors duration-200 hover:border-ink"
            >
              {categoryLabels[category]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
