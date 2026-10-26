"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { navigation, labels } from "@/data/copy";
import { whatsAppLink } from "@/lib/links";
import { site } from "@/site.config";

export function Header() {
  const [scrolledPastTop, setScrolledPastTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButtonRef.current?.focus();
  }, []);

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

  useEffect(() => {
    if (!menuOpen) return;

    const drawerLinks = Array.from(
      drawerRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
    );
    drawerLinks[0]?.focus();
    document.body.style.overflow = "hidden";

    // O botão do menu (que vira X) fica acima da gaveta, então entra na volta do foco.
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
        return;
      }
      if (event.key !== "Tab") return;

      const cycle = [menuButtonRef.current, ...drawerLinks].filter(
        (el): el is HTMLElement => el !== null,
      );
      const index = cycle.indexOf(document.activeElement as HTMLElement);
      if (index === -1) {
        event.preventDefault();
        cycle[0]?.focus();
      } else if (event.shiftKey && index === 0) {
        event.preventDefault();
        cycle[cycle.length - 1]?.focus();
      } else if (!event.shiftKey && index === cycle.length - 1) {
        event.preventDefault();
        cycle[0]?.focus();
      }
    }

    // Se a tela virar desktop com o menu aberto (ex.: girar o tablet), fecha.
    const desktopQuery = window.matchMedia("(min-width: 48rem)");
    function closeOnDesktop(event: MediaQueryListEvent) {
      if (event.matches) setMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeydown);
    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => {
      document.removeEventListener("keydown", handleKeydown);
      desktopQuery.removeEventListener("change", closeOnDesktop);
      document.body.style.overflow = "";
    };
  }, [menuOpen, closeMenu]);

  const solid = scrolledPastTop;
  // O botão do menu fica fora do header: escuro quando está sobre o fundo creme (header sólido ou gaveta).
  const darkButton = solid || menuOpen;

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-8 w-px"
      />

      {/* Transparente com texto claro sobre o hero; creme com texto escuro depois de rolar. */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ease-snappy ${solid ? "text-ink" : "on-dark text-light"}`}
      >
        <div
          aria-hidden="true"
          data-visible={solid}
          className="absolute inset-0 border-b border-line bg-background opacity-0 transition-opacity duration-200 ease-snappy data-[visible=true]:opacity-100"
        />

        <div className="relative px-4 sm:px-6 lg:px-10">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-6 md:h-14">
            <a
              href="#inicio"
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
                  className={`object-contain transition-opacity duration-200 ${solid ? "opacity-0" : "opacity-100"}`}
                />
                <Image
                  src="/marca/wordmark.png"
                  alt=""
                  fill
                  unoptimized
                  sizes="100px"
                  className={`object-contain transition-opacity duration-200 ${solid ? "opacity-100" : "opacity-0"}`}
                />
              </span>
            </a>

            <nav aria-label="Principal" className="hidden md:block">
              <ul className="flex items-center gap-7">
                {navigation.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="link-underline text-[0.8125rem] font-semibold"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`button ${solid ? "button-accent" : "button-hero-cta"} hidden min-h-9 px-4 py-1.5 text-[0.8125rem] md:inline-flex`}
            >
              {labels.whatsapp}
              <span className="sr-only"> {labels.opensWhatsApp}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Botão do menu: fixo e acima da gaveta, no mesmo lugar do cabeçalho. As barras viram um X. */}
      <button
        ref={menuButtonRef}
        type="button"
        onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
        data-open={menuOpen}
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label={menuOpen ? labels.closeMenu : labels.openMenu}
        className={`hamburger fixed top-0.5 right-[5px] z-[47] grid size-11 place-items-center transition-colors duration-200 active:scale-95 sm:right-[13px] md:hidden ${darkButton ? "text-ink" : "text-light focus-visible:outline-light"}`}
      >
        <span className="hamburger-bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Overlay que escurece a página inteira, inclusive o cabeçalho. */}
      <div
        aria-hidden="true"
        data-open={menuOpen}
        onClick={closeMenu}
        className="drawer-overlay fixed inset-0 z-[45] bg-black/50 md:hidden"
      />

      <div
        id="mobile-menu"
        ref={drawerRef}
        data-open={menuOpen}
        className="drawer fixed inset-y-0 right-0 z-[46] flex w-[min(80vw,18rem)] flex-col bg-background px-6 pt-20 pb-8 md:hidden"
      >
        <nav aria-label="Menu do celular">
          <ul>
            {navigation.map((link, index) => (
              <li
                key={link.href}
                className="drawer-item"
                style={{ "--i": index } as CSSProperties}
              >
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-lg font-semibold"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={whatsAppLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuOpen(false)}
          className="button button-accent drawer-item mt-auto w-full px-4"
          style={{ "--i": navigation.length } as CSSProperties}
        >
          {labels.whatsapp}
          <span className="sr-only"> {labels.opensWhatsApp}</span>
        </a>
      </div>
    </>
  );
}
