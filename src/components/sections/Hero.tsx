import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import {
  coldBrewPromo,
  heroPromo,
  labels,
  productPage,
  tartPromo,
} from "@/data/copy";
import {
  coldBrewHero,
  frappeHero,
  tartHero,
  type ImageAsset,
} from "@/lib/images";
import { buildWhatsAppLink, menuLink } from "@/lib/links";
import { site } from "@/site.config";

function order(position: number) {
  return { "--order": position } as CSSProperties;
}

type Promo = typeof heroPromo;

type HeroBanner = {
  promo: Promo;
  images: { background: ImageAsset; cup: ImageAsset };
  // Altura da arte em unidades de --vh. Cada arte tem uma proporção, então a altura muda para o
  // texto ter a mesma folga em volta. Fica escrita por inteiro para o Tailwind enxergar a classe.
  artClass: string;
};

const heroBanners = {
  frappe: {
    promo: heroPromo,
    images: frappeHero,
    artClass: "h-[calc(var(--vh)*108)]",
  },
  tart: {
    promo: tartPromo,
    images: tartHero,
    artClass: "h-[calc(var(--vh)*96)]",
  },
  coldBrew: {
    promo: coldBrewPromo,
    images: coldBrewHero,
    artClass:
      "max-md:top-[46%] max-md:h-[calc(var(--vh)*96)] md:top-[calc(4.5rem_+_var(--vh)*39)] md:h-[calc(var(--vh)*78)]",
  },
} satisfies Record<string, HeroBanner>;

export type HeroBannerName = keyof typeof heroBanners;

// "FRAPPÉ" / "DE OREO" em duas linhas. O espaço entre as linhas mantém a frase inteira para leitor de
// tela e Google.
function HeroTitle({ promo }: { promo: Promo }) {
  return (
    <>
      {promo.title.map((line, index) => (
        <Fragment key={line}>
          {index > 0 && " "}
          <span className="block whitespace-nowrap">{line}</span>
        </Fragment>
      ))}
    </>
  );
}

// TESTE: banner promocional com a mesma composição no desktop e no celular: palavra gigante e apagada
// centrada ao fundo, arte do produto grande à direita e, à esquerda dela, título, texto promocional (só a
// partir de xl) e botões. Tudo é medido em --vw e --vh: no desktop são 1vw e 1svh da tela; no celular são
// 1cqw e 1cqh do banner, então ele é uma versão reduzida do desktop.
export function Hero({ banner }: { banner: HeroBannerName }) {
  const { promo, images, artClass } = heroBanners[banner];
  const promoWhatsAppLink = buildWhatsAppLink(
    site.whatsapp.phone,
    productPage.whatsAppMessage(promo.productName),
  );

  const titleId = `hero-title-${banner}`;

  return (
    <>
      <section
        aria-labelledby={titleId}
        style={
          {
            "--cta-background": "#F6EEE4",
            "--cta-text": "#2A1D16",
          } as CSSProperties
        }
        className="on-dark relative isolate overflow-hidden bg-dark text-center text-light [--cx:68%] [--vh:1cqh] [--vw:1cqw] max-md:[container-type:size] max-md:mx-(--gutter) max-md:mt-14 max-md:aspect-[16/10] max-md:min-h-0 max-md:rounded-[1.5rem] max-md:[clip-path:inset(0_round_1.5rem)] md:min-h-svh md:[--cx:60%] md:[--vh:1svh] md:[--vw:1vw]"
      >
        <Image
          src={images.background.file}
          alt={images.background.alt}
          width={images.background.width}
          height={images.background.height}
          sizes={images.background.sizes}
          unoptimized
          priority
          className="absolute inset-0 -z-10 size-full object-cover"
        />

        {/* Palavra fantasma: gigante e bem apagada, centrada no banner, só como textura (não é lida). */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-[46%] left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 heading text-[min(calc(var(--vw)*32),calc(var(--vh)*52))] leading-none whitespace-nowrap text-light/12"
        >
          {promo.ghostWord}
        </span>

        <Image
          src={images.cup.file}
          alt={images.cup.alt}
          width={images.cup.width}
          height={images.cup.height}
          sizes={images.cup.sizes}
          unoptimized
          priority
          className={`pointer-events-none absolute top-1/2 left-(--cx) z-[1] w-auto -translate-x-1/2 -translate-y-1/2 ${artClass}`}
        />

        {/* Celular: o bloco começa a 6% da borda esquerda do banner (margem). Desktop: a borda direita do bloco
            fica 41 vh antes do centro da arte (60% da largura), perto do respingo, sem entrar nele. */}
        <div className="hero-text absolute top-[46%] left-[6%] z-[2] -translate-y-1/2 text-left md:right-[calc(100%_-_var(--cx)_+_var(--vh)*41)] md:left-auto">
          <h1
            id={titleId}
            className="hero-enter heading text-[min(calc(var(--vw)*10),calc(var(--vh)*17))] md:text-[min(calc(var(--vw)*6.4),calc(var(--vh)*13))]"
            style={order(1)}
          >
            <HeroTitle promo={promo} />
          </h1>
          <p
            className="hero-enter mt-5 mr-auto hidden max-w-[19rem] text-lg leading-snug text-light/85 xl:block"
            style={order(2)}
          >
            {promo.text}
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
              {promo.button}
              <span className="sr-only"> {labels.opensWhatsApp}</span>
            </a>
            <Link
              href={menuLink}
              className="button button-outline px-7 text-base max-xl:hidden"
            >
              {labels.menu}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
