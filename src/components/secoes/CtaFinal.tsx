import { Foto } from "@/components/Foto";
import { Revelar } from "@/components/Revelar";
import { ctaFinal, rotulos } from "@/data/textos";
import { imagens } from "@/lib/imagens";
import { linkWhatsAppCafe } from "@/lib/links";

// Faixa final em largura total, baixa, com o texto centralizado por cima da foto. Mesmo padrão do
// banner promocional, mas com outra imagem. A foto recebe 25% de escurecimento e um escurecimento
// extra só atrás do texto (centro), para o contraste passar sem apagar a foto nas bordas.
// Só o texto aparece com animação: animar a imagem de largura total pesa e trava a rolagem no celular.
export function CtaFinal() {
  return (
    <section aria-labelledby="cta-final-titulo" className="pb-20 md:pb-28">
      <div className="relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Foto
            imagem={imagens.ctaFinal}
            proporcaoPropria
            qualidade={90}
            className="size-full"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-black/25 bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.35),transparent_70%)]"
        />

        <div className="flex min-h-[20rem] flex-col items-center justify-center px-4 py-14 text-center text-claro md:aspect-[4/1] md:min-h-0 md:py-0">
          <Revelar className="flex w-full flex-col items-center">
            <h2
              id="cta-final-titulo"
              className="titulo-suave text-[2rem] [text-shadow:0_1px_14px_rgb(0_0_0/0.35)] md:text-[3rem]"
            >
              {ctaFinal.titulo}
            </h2>
            <p className="mt-3 max-w-[40ch] text-[1.0625rem] [text-shadow:0_1px_12px_rgb(0_0_0/0.4)] md:text-lg">
              {ctaFinal.texto}
            </p>
            <a
              href={linkWhatsAppCafe}
              data-cta-whatsapp=""
              target="_blank"
              rel="noopener noreferrer"
              className="botao botao-destaque mt-6 w-full max-w-xs md:w-auto md:focus-visible:outline-claro"
            >
              {ctaFinal.botao}
              <span className="sr-only"> {rotulos.abreWhatsApp}</span>
            </a>
          </Revelar>
        </div>
      </div>
    </section>
  );
}
