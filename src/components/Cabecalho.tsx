"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { navegacao, rotulos } from "@/data/textos";
import { linkWhatsAppCafe } from "@/lib/links";
import { site } from "@/site.config";

export function Cabecalho() {
  const [passouDoTopo, setPassouDoTopo] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const sentinelaRef = useRef<HTMLDivElement>(null);
  const gavetaRef = useRef<HTMLDivElement>(null);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);

  const fecharMenu = useCallback(() => {
    setMenuAberto(false);
    botaoMenuRef.current?.focus();
  }, []);

  // Fica sólido quando o topo da página sai da tela (IntersectionObserver, sem evento de scroll).
  useEffect(() => {
    const sentinela = sentinelaRef.current;
    if (!sentinela) return;

    const observador = new IntersectionObserver(([entrada]) =>
      setPassouDoTopo(!entrada.isIntersecting),
    );
    observador.observe(sentinela);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (!menuAberto) return;

    const linksDaGaveta = Array.from(
      gavetaRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? [],
    );
    linksDaGaveta[0]?.focus();
    document.body.style.overflow = "hidden";

    // O botão do menu (que vira X) fica acima da gaveta, então entra na volta do foco.
    function tratarTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        fecharMenu();
        return;
      }
      if (evento.key !== "Tab") return;

      const ciclo = [botaoMenuRef.current, ...linksDaGaveta].filter(
        (el): el is HTMLElement => el !== null,
      );
      const indice = ciclo.indexOf(document.activeElement as HTMLElement);
      if (indice === -1) {
        evento.preventDefault();
        ciclo[0]?.focus();
      } else if (evento.shiftKey && indice === 0) {
        evento.preventDefault();
        ciclo[ciclo.length - 1]?.focus();
      } else if (!evento.shiftKey && indice === ciclo.length - 1) {
        evento.preventDefault();
        ciclo[0]?.focus();
      }
    }

    // Se a tela virar desktop com o menu aberto (ex.: girar o tablet), fecha.
    const telaDesktop = window.matchMedia("(min-width: 48rem)");
    function fecharNoDesktop(evento: MediaQueryListEvent) {
      if (evento.matches) setMenuAberto(false);
    }

    document.addEventListener("keydown", tratarTeclado);
    telaDesktop.addEventListener("change", fecharNoDesktop);
    return () => {
      document.removeEventListener("keydown", tratarTeclado);
      telaDesktop.removeEventListener("change", fecharNoDesktop);
      document.body.style.overflow = "";
    };
  }, [menuAberto, fecharMenu]);

  const solido = passouDoTopo;
  // O botão do menu fica fora do header: escuro quando está sobre o fundo creme (header sólido ou gaveta).
  const botaoEscuro = solido || menuAberto;

  return (
    <>
      <div
        ref={sentinelaRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 h-8 w-px"
      />

      {/* Transparente com texto claro sobre o hero; creme com texto escuro depois de rolar. */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-200 ease-saida ${solido ? "text-tinta" : "sobre-escuro text-claro"}`}
      >
        <div
          aria-hidden="true"
          data-visivel={solido}
          className="absolute inset-0 border-b border-linha bg-fundo opacity-0 transition-opacity duration-200 ease-saida data-[visivel=true]:opacity-100"
        />

        <div className="relative px-4 sm:px-6 lg:px-10">
          <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-6 md:h-14">
            <a
              href="#inicio"
              aria-label={`${site.nome}, ${rotulos.voltarAoInicio}`}
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
                  className={`object-contain transition-opacity duration-200 ${solido ? "opacity-0" : "opacity-100"}`}
                />
                <Image
                  src="/marca/wordmark.png"
                  alt=""
                  fill
                  unoptimized
                  sizes="100px"
                  className={`object-contain transition-opacity duration-200 ${solido ? "opacity-100" : "opacity-0"}`}
                />
              </span>
            </a>

            <nav aria-label="Principal" className="hidden md:block">
              <ul className="flex items-center gap-7">
                {navegacao.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="link-linha text-[0.8125rem] font-semibold"
                    >
                      {link.rotulo}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <a
              href={linkWhatsAppCafe}
              target="_blank"
              rel="noopener noreferrer"
              className={`botao ${solido ? "botao-destaque" : "botao-cta-hero"} hidden min-h-9 px-4 py-1.5 text-[0.8125rem] md:inline-flex`}
            >
              {rotulos.whatsapp}
              <span className="sr-only"> {rotulos.abreWhatsApp}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Botão do menu: fixo e acima da gaveta, no mesmo lugar do cabeçalho. As barras viram um X. */}
      <button
        ref={botaoMenuRef}
        type="button"
        onClick={() => (menuAberto ? fecharMenu() : setMenuAberto(true))}
        data-aberto={menuAberto}
        aria-expanded={menuAberto}
        aria-controls="menu-celular"
        aria-label={menuAberto ? rotulos.fecharMenu : rotulos.abrirMenu}
        className={`hamburguer fixed top-0.5 right-[5px] z-[47] grid size-11 place-items-center transition-colors duration-200 active:scale-95 sm:right-[13px] md:hidden ${botaoEscuro ? "text-tinta" : "text-claro focus-visible:outline-claro"}`}
      >
        <span className="hamburguer-barras" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {/* Overlay que escurece a página inteira, inclusive o cabeçalho. */}
      <div
        aria-hidden="true"
        data-aberto={menuAberto}
        onClick={fecharMenu}
        className="gaveta-overlay fixed inset-0 z-[45] bg-black/50 md:hidden"
      />

      <div
        id="menu-celular"
        ref={gavetaRef}
        data-aberto={menuAberto}
        className="gaveta fixed inset-y-0 right-0 z-[46] flex w-[min(80vw,18rem)] flex-col bg-fundo px-6 pt-20 pb-8 md:hidden"
      >
        <nav aria-label="Menu do celular">
          <ul>
            {navegacao.map((link, indice) => (
              <li
                key={link.href}
                className="gaveta-item"
                style={{ "--i": indice } as CSSProperties}
              >
                <a
                  href={link.href}
                  onClick={() => setMenuAberto(false)}
                  className="block py-3 text-lg font-semibold"
                >
                  {link.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a
          href={linkWhatsAppCafe}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMenuAberto(false)}
          className="botao botao-destaque gaveta-item mt-auto w-full px-4"
          style={{ "--i": navegacao.length } as CSSProperties}
        >
          {rotulos.whatsapp}
          <span className="sr-only"> {rotulos.abreWhatsApp}</span>
        </a>
      </div>
    </>
  );
}
