import { Fragment, type CSSProperties } from "react";
import { HeroFotos } from "@/components/HeroFotos";
import { hero, rotulos } from "@/data/textos";
import { existeEmPublic } from "@/lib/arquivos";
import { heroFotos } from "@/lib/imagens";
import { linkCardapio, linkWhatsAppCafe } from "@/lib/links";

function ordem(posicao: number) {
  return { "--ordem": posicao } as CSSProperties;
}

// "SEU CAFÉ" / "DE TODO DIA." em duas linhas, no desktop e no celular.
// O espaço entre as linhas mantém a frase inteira para leitor de tela e Google.
function TituloHero() {
  return (
    <>
      {hero.titulo.map((linha, indice) => (
        <Fragment key={linha}>
          {indice > 0 && " "}
          <span className="block">{linha}</span>
        </Fragment>
      ))}
    </>
  );
}

export function Hero() {
  // Só entram as fotos que existem em public/. Sem nenhuma, o fundo é chocolate liso.
  const slides = heroFotos
    .filter((foto) => existeEmPublic(foto.arquivo))
    .map((foto) => ({ src: foto.arquivo, alt: foto.alt, sizes: foto.sizes, cta: foto.cta }));

  return (
    <section
      id="inicio"
      aria-labelledby="hero-titulo"
      // A cor do botão principal começa na da primeira foto e muda com o carrossel (HeroFotos).
      style={slides.length > 0 ? ({ "--cta-fundo": slides[0].cta.fundo, "--cta-texto": slides[0].cta.texto } as CSSProperties) : undefined}
      className="sobre-escuro relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden bg-escuro px-4 pt-12 pb-10 text-center text-claro md:pt-14"
    >
      {slides.length > 0 && (
        <>
          <HeroFotos slides={slides} />
          {/* Camada escura neutra para o texto passar no contraste AA (as fotos de caramelo e morango
              são claras), e faixa no topo para o menu transparente ficar legível. */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/30" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-10 h-[140px] bg-linear-to-b from-black/55 to-transparent" />
        </>
      )}

      <div className="hero-texto">
        <p className="hero-entra rotulo pl-[0.3em] text-[0.8125rem] tracking-[0.3em] md:text-sm" style={ordem(0)}>
          {hero.linhaTopo}
        </p>
        <h1
          id="hero-titulo"
          className="hero-entra titulo mt-5 text-[clamp(3rem,17vw,4.5rem)] md:mt-6 md:text-[clamp(4rem,min(12vw,16dvh),10rem)]"
          style={ordem(1)}
        >
          <TituloHero />
        </h1>
        <p className="hero-entra rotulo mt-6 pl-[0.3em] text-[0.8125rem] tracking-[0.3em] md:mt-8 md:text-sm" style={ordem(2)}>
          {hero.linhaBase.map((frase, indice) => (
            <Fragment key={frase}>
              {indice > 0 && " "}
              <span className="block md:inline">{frase}</span>
            </Fragment>
          ))}
        </p>
      </div>

      <div
        className="hero-entra hero-texto mt-10 flex w-full flex-col items-center gap-3 md:mt-12 md:flex-row md:justify-center md:gap-4"
        style={ordem(3)}
      >
        <a
          href={linkWhatsAppCafe}
          data-cta-whatsapp=""
          target="_blank"
          rel="noopener noreferrer"
          className="botao botao-cta-hero w-full max-w-xs md:w-auto md:max-w-none"
        >
          {rotulos.whatsapp}
          <span className="sr-only"> {rotulos.abreWhatsApp}</span>
        </a>
        <a
          href={linkCardapio}
          target="_blank"
          rel="noopener noreferrer"
          className="botao botao-contorno w-full max-w-xs md:w-auto md:max-w-none"
        >
          {rotulos.cardapio}
          <span className="sr-only"> {rotulos.abreCardapio}</span>
        </a>
      </div>
    </section>
  );
}
