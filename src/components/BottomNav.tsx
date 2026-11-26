"use client";

import { BookOpen, House, Receipt, User } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useEffect, useRef, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { bottomNavCopy } from "@/data/copy";
import { accountLink, menuLink, signInLink, signUpLink } from "@/lib/links";

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
  const onAccount = [accountLink, signInLink, signUpLink].some((link) =>
    pathname.startsWith(link),
  );
  const wantsHomeAtTop = useRef(false);

  // O Next mantém a posição de rolagem da página que ficou guardada e o Início abria no meio (nas
  // categorias). Depois que a home aparece, forçamos o topo. O frame de espera deixa o Next terminar
  // de restaurar a posição antes.
  useEffect(() => {
    if (!onHome || !wantsHomeAtTop.current) return;
    wantsHomeAtTop.current = false;
    const frame = requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "instant" }),
    );
    return () => cancelAnimationFrame(frame);
  }, [onHome]);

  return (
    <nav
      aria-label={bottomNavCopy.label}
      className="bottom-nav fixed inset-x-0 bottom-0 z-40 border-t border-line bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        <li className="contents">
          <Link
            href="/"
            onClick={() => {
              wantsHomeAtTop.current = true;
              window.scrollTo({ top: 0, behavior: "instant" });
            }}
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
            <BookOpen
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
          {/* Sem sessão, a /conta leva ao login e volta para cá depois. */}
          <Link
            href={accountLink}
            aria-current={onAccount ? "page" : undefined}
            className={`${itemClass} ${onAccount ? "text-accent" : "text-ink-soft"}`}
          >
            <User
              aria-hidden="true"
              size={24}
              weight={onAccount ? "fill" : "regular"}
            />
            {bottomNavCopy.profile}
          </Link>
        </li>
      </ul>
    </nav>
  );
}
