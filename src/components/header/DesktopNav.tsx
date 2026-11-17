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
    <div className="invisible absolute top-full left-0 translate-y-1 pt-7 opacity-0 transition-[opacity,translate,visibility] duration-200 ease-snappy group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <ul
        aria-label={label}
        className="min-w-52 rounded-[1.25rem] border border-line bg-background p-2 text-ink shadow-[0_16px_40px_-12px_rgb(43_30_23/0.35)] in-[.on-dark]:border-light/20 in-[.on-dark]:bg-dark/40 in-[.on-dark]:text-light in-[.on-dark]:backdrop-blur-xl"
      >
        {items.map((item) => (
          <li key={item.href + item.label}>
            <Link
              href={item.href}
              className="block rounded-[0.875rem] px-3 py-2.5 text-[0.8125rem] font-semibold transition-colors duration-150 hover:bg-current/5 focus-visible:bg-current/5 focus-visible:outline-none [.on-dark_&]:hover:bg-current/10 [.on-dark_&]:focus-visible:bg-current/10"
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
    <nav
      aria-label={headerCopy.mainNavigation}
      className="hidden transition-opacity duration-200 lg:block"
    >
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
