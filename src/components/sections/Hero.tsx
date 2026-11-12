import { Fragment, type CSSProperties } from "react";
import { HeroPhotos } from "@/components/HeroPhotos";
import { hero, labels } from "@/data/copy";
import { existsInPublic } from "@/lib/files";
import { heroPhotos } from "@/lib/images";
import { menuLink, whatsAppLink } from "@/lib/links";

function order(position: number) {
  return { "--order": position } as CSSProperties;
}

// "SEU CAFÉ" / "DE TODO DIA." em duas linhas, no desktop e no celular.
// O espaço entre as linhas mantém a frase inteira para leitor de tela e Google.
function HeroTitle() {
  return (
    <>
      {hero.title.map((line, index) => (
        <Fragment key={line}>
          {index > 0 && " "}
          <span className="block">{line}</span>
        </Fragment>
      ))}
    </>
  );
}

export function Hero() {
  // Só entram as fotos que existem em public/. Sem nenhuma, o fundo é chocolate liso.
  const slides = heroPhotos
    .filter((photo) => existsInPublic(photo.file))
    .map((photo) => ({
      src: photo.file,
      alt: photo.alt,
      sizes: photo.sizes,
      cta: photo.cta,
    }));

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      // A cor do botão principal começa na da primeira foto e muda com o carrossel (HeroPhotos).
      style={
        slides.length > 0
          ? ({
              "--cta-background": slides[0].cta.background,
              "--cta-text": slides[0].cta.text,
            } as CSSProperties)
          : undefined
      }
      className="on-dark relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-dark px-4 pt-12 pb-10 text-center text-light md:pt-14"
    >
      {slides.length > 0 && (
        <>
          <HeroPhotos slides={slides} />
          {/* Camada escura neutra para o texto passar no contraste AA (as fotos de caramelo e morango
              são claras), e faixa no topo para o menu transparente ficar legível. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-black/30"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-[140px] bg-linear-to-b from-black/55 to-transparent"
          />
        </>
      )}

      <div className="hero-text">
        <p
          className="hero-enter pl-[0.3em] eyebrow text-[0.8125rem] tracking-[0.3em] md:text-sm"
          style={order(0)}
        >
          {hero.topLine}
        </p>
        <h1
          id="hero-title"
          className="hero-enter mt-5 heading text-[clamp(3rem,17vw,4.5rem)] md:mt-6 md:text-[clamp(4rem,min(12vw,16dvh),10rem)]"
          style={order(1)}
        >
          <HeroTitle />
        </h1>
        <p
          className="hero-enter mt-6 pl-[0.3em] eyebrow text-[0.8125rem] tracking-[0.3em] md:mt-8 md:text-sm"
          style={order(2)}
        >
          {hero.baseLine.map((phrase, index) => (
            <Fragment key={phrase}>
              {index > 0 && " "}
              <span className="block md:inline">{phrase}</span>
            </Fragment>
          ))}
        </p>
      </div>

      <div
        className="hero-enter hero-text mt-10 flex w-full flex-col items-center gap-3 md:mt-12 md:flex-row md:justify-center md:gap-4"
        style={order(3)}
      >
        <a
          href={whatsAppLink}
          data-cta-whatsapp=""
          target="_blank"
          rel="noopener noreferrer"
          className="button button-hero-cta w-full max-w-xs md:w-auto md:max-w-none"
        >
          {labels.whatsapp}
          <span className="sr-only"> {labels.opensWhatsApp}</span>
        </a>
        <a
          href={menuLink}
          target="_blank"
          rel="noopener noreferrer"
          className="button button-outline w-full max-w-xs md:w-auto md:max-w-none"
        >
          {labels.menu}
          <span className="sr-only"> {labels.opensMenuPdf}</span>
        </a>
      </div>
    </section>
  );
}
