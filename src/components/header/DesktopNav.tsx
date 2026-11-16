import { CaretDown } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { headerCopy, navigation, type NavigationChild } from "@/data/copy";

const navLinkClass = "link-underline text-[0.8125rem] font-semibold";

function Dropdown({
  label,
  items,
}: {
  label: string;
  items: NavigationChild[];
}) {
  return (
    <div className="invisible absolute top-full left-0 translate-y-1 pt-4 opacity-0 transition-[opacity,translate,visibility] duration-200 ease-snappy group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <ul
        aria-label={label}
        className="min-w-52 rounded-2xl border border-line bg-background p-2 text-ink"
      >
        {items.map((item) => (
          <li key={item.href + item.label}>
            <Link
              href={item.href}
              className="block rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function DesktopNav() {
  return (
    <nav aria-label={headerCopy.mainNavigation} className="hidden lg:block">
      <ul className="flex items-center gap-8">
        {navigation.map((link) => (
          <li key={link.href + link.label} className="group relative">
            <Link
              href={link.href}
              className={`${navLinkClass} ${link.children ? "inline-flex items-center gap-1" : ""}`}
            >
              {link.label}
              {link.children && (
                <CaretDown
                  aria-hidden="true"
                  size={11}
                  weight="bold"
                  className="transition-transform duration-200 group-focus-within:rotate-180 group-hover:rotate-180"
                />
              )}
            </Link>
            {link.children && (
              <Dropdown label={link.label} items={link.children} />
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
