import { Fragment } from "react";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { promotion, labels } from "@/data/copy";
import { formatPrice } from "@/lib/format";
import { images } from "@/lib/images";
import { comboWhatsAppLink } from "@/lib/links";

// Faixa promocional em largura total da tela, baixa (não é um banner de hero). A foto de origem é
// 2:1 e aqui aparece cortada em 10:3 no desktop e 16:9 no celular. O corte desce a 70% da altura
// para manter os produtos inteiros, e no celular foca o lado direito.
// Desktop: o texto fica por cima da foto, à esquerda, sobre uma sombra neutra para dar contraste.
// Celular: a faixa é baixa demais para o texto, então ele vem logo abaixo da foto, sobre o creme.
// Só o texto aparece com animação: animar a imagem de largura total pesa e trava a rolagem no celular.
export function Promotion() {
  return (
    <section aria-labelledby="promotion-title" className="pb-20 md:pb-28">
      <div className="relative">
        <Photo
          image={images.promotionCombo}
          customAspectRatio
          quality={90}
          className="aspect-[16/9] w-full overflow-hidden md:aspect-[10/3]"
          imgClassName="object-right md:object-[center_70%]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-linear-to-r from-black/65 via-black/35 to-transparent md:block"
        />

        <div className="px-4 pt-6 sm:px-6 md:absolute md:inset-0 md:flex md:items-center md:px-0 md:pt-0 lg:px-10">
          <div className="mx-auto w-full max-w-7xl md:text-light">
            <Reveal>
              <h2
                id="promotion-title"
                className="heading text-[2.5rem] leading-[1.12] md:text-[clamp(2.5rem,4vw,3.75rem)] md:[text-shadow:0_1px_14px_rgb(0_0_0/0.35)]"
              >
                {promotion.title.map((line, index) => (
                  <Fragment key={line}>
                    {index > 0 && " "}
                    <span className="block">{line}</span>
                  </Fragment>
                ))}
              </h2>
              <p className="mt-4 max-w-[34ch] text-[1.0625rem] md:text-lg md:[text-shadow:0_1px_12px_rgb(0_0_0/0.4)]">
                {promotion.description}{" "}
                <strong className="font-bold">
                  {formatPrice(promotion.priceInCents)}
                </strong>
                .
              </p>
              <a
                href={comboWhatsAppLink}
                data-cta-whatsapp=""
                target="_blank"
                rel="noopener noreferrer"
                className="button button-accent mt-6 w-full md:w-auto md:focus-visible:outline-light"
              >
                {promotion.button}
                <span className="sr-only"> {labels.opensWhatsApp}</span>
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
