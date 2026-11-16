import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { heroPromo, labels, productPage } from "@/data/copy";
import { frappeHero } from "@/lib/images";
import { buildWhatsAppLink, menuLink } from "@/lib/links";
import { site } from "@/site.config";

function order(position: number) {
  return { "--order": position } as CSSProperties;
}

const promoWhatsAppLink = buildWhatsAppLink(
  site.whatsapp.phone,
  productPage.whatsAppMessage(heroPromo.productName),
);

// "FRAPPÉ" / "DE OREO" em duas linhas. O espaço entre as linhas mantém a frase inteira para leitor de
// tela e Google.
function HeroTitle() {
  return (
    <>
      {heroPromo.title.map((line, index) => (
        <Fragment key={line}>
          {index > 0 && " "}
          <span className="block whitespace-nowrap">{line}</span>
        </Fragment>
      ))}
    </>
  );
}

// TESTE: o hero mostra só o banner do frappé, com a mesma composição no desktop e no celular: palavra
// "FRAPPÉ" gigante e apagada ao fundo, copo grande à direita e, à esquerda dele, título, texto promocional
// (só a partir de xl) e botões. Tudo é medido em --vw e --vh: no desktop são 1vw e 1svh da tela; no celular
// são 1cqw e 1cqh do banner (que tem proporção 16:9, a mesma da composição), então ele é uma versão
// reduzida do desktop.
export function Hero() {
  return (
    <>
      <section
        id="inicio"
        aria-labelledby="hero-title"
        style={
          {
            "--cta-background": "#F6EEE4",
            "--cta-text": "#2A1D16",
          } as CSSProperties
        }
        className="on-dark relative isolate overflow-hidden bg-dark text-center text-light [--cx:68%] [--vh:1cqh] [--vw:1cqw] max-md:[container-type:size] max-md:mx-4 max-md:mt-14 max-md:aspect-[16/10] max-md:min-h-0 max-md:rounded-[1.5rem] max-md:[clip-path:inset(0_round_1.5rem)] md:min-h-svh md:[--cx:60%] md:[--vh:1svh] md:[--vw:1vw]"
      >
        <Image
          src={frappeHero.background.file}
          alt={frappeHero.background.alt}
          width={frappeHero.background.width}
          height={frappeHero.background.height}
          sizes={frappeHero.background.sizes}
          unoptimized
          priority
          className="absolute inset-0 -z-10 size-full object-cover"
        />

        {/* Palavra fantasma: gigante e bem apagada, só como textura atrás do copo (não é lida). */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[46%] left-(--cx) z-0 -translate-x-1/2 -translate-y-1/2 heading text-[min(calc(var(--vw)*32),calc(var(--vh)*52))] leading-none whitespace-nowrap text-light/12"
        >
          {heroPromo.ghostWord}
        </span>

        <Image
          src={frappeHero.cup.file}
          alt={frappeHero.cup.alt}
          width={frappeHero.cup.width}
          height={frappeHero.cup.height}
          sizes={frappeHero.cup.sizes}
          unoptimized
          priority
          className="pointer-events-none absolute top-1/2 left-(--cx) z-[1] h-[calc(var(--vh)*108)] w-auto -translate-x-1/2 -translate-y-1/2"
        />

        {/* A borda direita do bloco fica 41 vh antes do centro do copo (60% da largura): perto do respingo,
            sem entrar nele. */}
        <div className="hero-text absolute top-[46%] right-[calc(100%_-_var(--cx)_+_var(--vh)*41)] z-[2] -translate-y-1/2 text-left">
          <h1
            id="hero-title"
            className="hero-enter heading text-[min(calc(var(--vw)*10),calc(var(--vh)*17))] md:text-[min(calc(var(--vw)*6.4),calc(var(--vh)*13))]"
            style={order(1)}
          >
            <HeroTitle />
          </h1>
          <p
            className="hero-enter mt-5 mr-auto hidden max-w-[19rem] text-lg leading-snug text-light/85 xl:block"
            style={order(2)}
          >
            {heroPromo.text}
          </p>
          <div
            className="hero-enter hero-text mt-[calc(var(--vh)*5)] flex w-auto flex-col items-start gap-1.5 md:mt-8 md:gap-3 xl:flex-row"
            style={order(3)}
          >
            <a
              href={promoWhatsAppLink}
              data-cta-whatsapp=""
              target="_blank"
              rel="noopener noreferrer"
              className="button button-hero-cta px-7 text-base max-md:min-h-10 max-md:px-3.5 max-md:py-1.5 max-md:text-[0.8125rem]"
            >
              {heroPromo.button}
              <span className="sr-only"> {labels.opensWhatsApp}</span>
            </a>
            <Link
              href={menuLink}
              className="button button-outline px-7 text-base max-md:hidden"
            >
              {labels.menu}
            </Link>
          </div>
        </div>
      </section>
      {/* Espaço das bolinhas do carrossel (só no celular): o HeroPhotos desenha aqui quando o carrossel voltar. */}
      <div id="hero-dots" className="flex min-h-6 justify-center md:hidden" />
    </>
  );
}
