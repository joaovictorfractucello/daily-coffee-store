"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AuthButtons } from "@/components/header/AuthButtons";
import { DesktopNav } from "@/components/header/DesktopNav";
import { HeaderCartLink } from "@/components/header/HeaderCartLink";
import { HeaderSearch } from "@/components/header/HeaderSearch";
import { labels } from "@/data/copy";
import { site } from "@/site.config";

const ICON_SIZE = 22;

export function Header({ overHero = false }: { overHero?: boolean }) {
  const [scrolledPastTop, setScrolledPastTop] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Fica sólido quando o topo da página sai da tela (IntersectionObserver, sem evento de scroll).
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) =>
      setScrolledPastTop(!entry.isIntersecting),
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const solid = scrolledPastTop || !overHero;

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-8 w-px"
      />

      {/* Transparente com texto claro sobre o hero; creme com texto escuro depois de rolar. */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ease-snappy ${solid ? "text-ink" : "on-dark text-light max-md:text-ink"}`}
      >
        <div
          aria-hidden="true"
          data-visible={solid}
          className="absolute inset-0 border-b border-transparent bg-background opacity-0 transition-[opacity,border-color] duration-200 ease-snappy data-[visible=true]:border-line data-[visible=true]:opacity-100 max-md:opacity-100"
        />

        <div className="relative px-(--header-pad) py-1 [--header-pad:1rem] sm:[--header-pad:1.5rem] lg:[--header-pad:2.5rem]">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-6 md:h-14 lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/#inicio"
              aria-label={`${site.name}, ${labels.backToTop}`}
              className="flex items-center gap-2"
            >
              <Image
                src="/marca/graozinho.png"
                alt=""
                width={512}
                height={512}
                unoptimized
                className="size-6 md:size-7"
              />
              {/* Duas versões da wordmark: creme sobre o hero, marrom depois de rolar. */}
              <span className="relative block aspect-[600/173] w-[5.75rem] md:w-[6.25rem]">
                <Image
                  src="/marca/wordmark-creme.png"
                  alt=""
                  fill
                  unoptimized
                  sizes="100px"
                  className={`object-contain transition-opacity duration-200 ${solid ? "opacity-0" : "opacity-100 max-md:opacity-0"}`}
                />
                <Image
                  src="/marca/wordmark.png"
                  alt=""
                  fill
                  unoptimized
                  sizes="100px"
                  className={`object-contain transition-opacity duration-200 ${solid ? "opacity-100" : "opacity-0 max-md:opacity-100"}`}
                />
              </span>
            </Link>

            <DesktopNav />

            <div className="flex items-center justify-self-end">
              <HeaderSearch open={searchOpen} onOpenChange={setSearchOpen} />
              <HeaderCartLink iconSize={ICON_SIZE} />
              <AuthButtons />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
