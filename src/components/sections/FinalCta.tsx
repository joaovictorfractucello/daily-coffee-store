import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { finalCta, labels } from "@/data/copy";
import { images } from "@/lib/images";
import { whatsAppLink } from "@/lib/links";

// Faixa final em largura total, baixa, com o texto centralizado por cima da foto. Mesmo padrão do
// banner promocional, mas com outra imagem. A foto recebe 25% de escurecimento e um escurecimento
// extra só atrás do texto (centro), para o contraste passar sem apagar a foto nas bordas.
// Só o texto aparece com animação: animar a imagem de largura total pesa e trava a rolagem no celular.
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="pb-20 md:pb-28">
      <div className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Photo
            image={images.finalCta}
            customAspectRatio
            quality={90}
            className="size-full"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/25 bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.35),transparent_70%)]"
        />

        <div className="flex min-h-[20rem] flex-col items-center justify-center px-4 py-14 text-center text-light md:aspect-[4/1] md:min-h-0 md:py-0">
          <Reveal className="flex w-full flex-col items-center">
            <h2
              id="final-cta-title"
              className="heading-soft text-[2rem] [text-shadow:0_1px_14px_rgb(0_0_0/0.35)] md:text-[3rem]"
            >
              {finalCta.title}
            </h2>
            <p className="mt-3 max-w-[40ch] text-[1.0625rem] [text-shadow:0_1px_12px_rgb(0_0_0/0.4)] md:text-lg">
              {finalCta.text}
            </p>
            <a
              href={whatsAppLink}
              data-cta-whatsapp=""
              target="_blank"
              rel="noopener noreferrer"
              className="button button-accent mt-6 w-full max-w-xs md:w-auto md:focus-visible:outline-light"
            >
              {finalCta.button}
              <span className="sr-only"> {labels.opensWhatsApp}</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
