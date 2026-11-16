"use client";

import { Coffee, House, Receipt, User } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import type { ComponentType } from "react";
import { usePathname } from "next/navigation";
import { bottomNavCopy } from "@/data/copy";
import { menuLink } from "@/lib/links";

const itemClass =
  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[0.6875rem] font-semibold transition-[color,scale] duration-200 active:scale-95";

function ComingSoonItem({
  label,
  icon: Icon,
}: {
  label: string;
  icon: ComponentType<{
    size?: number;
    "aria-hidden"?: "true";
  }>;
}) {
  return (
    <button
      type="button"
      aria-disabled="true"
      title={bottomNavCopy.comingSoon}
      className={`${itemClass} cursor-default text-ink-soft`}
    >
      <Icon aria-hidden="true" size={24} />
      {label}
      <span className="sr-only">
        {" "}
        ({bottomNavCopy.comingSoon.toLowerCase()})
      </span>
    </button>
  );
}

// Mesma barra, sem links, enquanto o BottomNav espera o caminho da página (usePathname precisa de Suspense).
export function BottomNavFallback() {
  return (
    <div
      aria-hidden="true"
      className="bottom-nav fixed inset-x-0 bottom-0 z-40 h-14 border-t border-line bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    />
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const onMenu = pathname.startsWith(menuLink);
  const onHome = pathname === "/";

  return (
    <nav
      aria-label={bottomNavCopy.label}
      className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        <li className="contents">
          <Link
            href="/"
            aria-current={onHome ? "page" : undefined}
            className={`${itemClass} ${onHome ? "text-accent" : "text-ink-soft"}`}
          >
            <House
              aria-hidden="true"
              size={24}
              weight={onHome ? "fill" : "regular"}
            />
            {bottomNavCopy.home}
          </Link>
        </li>
        <li className="contents">
          <Link
            href={menuLink}
            aria-current={onMenu ? "page" : undefined}
            className={`${itemClass} ${onMenu ? "text-accent" : "text-ink-soft"}`}
          >
            <Coffee
              aria-hidden="true"
              size={24}
              weight={onMenu ? "fill" : "regular"}
            />
            {bottomNavCopy.menu}
          </Link>
        </li>
        <li className="contents">
          <ComingSoonItem label={bottomNavCopy.orders} icon={Receipt} />
        </li>
        <li className="contents">
          <ComingSoonItem label={bottomNavCopy.profile} icon={User} />
        </li>
      </ul>
    </nav>
  );
}
