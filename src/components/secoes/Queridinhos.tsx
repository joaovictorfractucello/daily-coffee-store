import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Foto } from "@/components/Foto";
import { Revelar } from "@/components/Revelar";
import { queridinhos } from "@/data/cardapio";
import { queridinhosTextos, rotulos } from "@/data/textos";
import { formatarPreco } from "@/lib/formatar";
import { imagens } from "@/lib/imagens";
import { linkCardapio } from "@/lib/links";

// Link discreto: pequeno, na cor do texto secundário, e só ganha o sublinhado e o tom escuro no hover.
const classeLinkCardapio =
  "link-linha shrink-0 items-center gap-1.5 text-sm font-semibold text-tinta-suave transition-colors duration-200 hover:text-tinta";

// No celular e no tablet os produtos formam uma faixa que se arrasta para o lado e o link
// "Ver cardápio" fica à direita do título. No desktop (lg) os 5 ficam lado a lado, e o link
// passa para uma linha própria, colado em cima do último card.
export function Queridinhos() {
  return (
    <section id="queridinhos" aria-labelledby="queridinhos-titulo" className="py-20 md:py-28 lg:px-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <Revelar className="flex items-end justify-between gap-6">
          <h2 id="queridinhos-titulo" className="titulo-suave text-[2rem] md:text-[2.5rem]">
            {queridinhosTextos.titulo}
          </h2>
          <a
            href={linkCardapio}
            target="_blank"
            rel="noopener noreferrer"
            className={`${classeLinkCardapio} inline-flex min-h-11 lg:hidden`}
          >
            {rotulos.cardapio}
            <ArrowRight aria-hidden="true" size={14} weight="bold" />
            <span className="sr-only"> {rotulos.abreCardapio}</span>
          </a>
        </Revelar>
      </div>

      {/* Faixa rolável por teclado (tabIndex) e por toque; some a barra de rolagem para ficar limpa. */}
      <div
        role="region"
        aria-label={queridinhosTextos.titulo}
        tabIndex={0}
        className="mt-10 flex gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-6 lg:mx-auto lg:mt-8 lg:grid lg:max-w-7xl lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <a
          href={linkCardapio}
          target="_blank"
          rel="noopener noreferrer"
          className={`${classeLinkCardapio} hidden lg:col-start-5 lg:row-start-1 lg:mb-3 lg:flex lg:justify-self-end`}
        >
          {rotulos.cardapio}
            <ArrowRight aria-hidden="true" size={14} weight="bold" />
          <span className="sr-only"> {rotulos.abreCardapio}</span>
        </a>

        {queridinhos.map((item, indice) => (
          <Revelar
            key={item.nome}
            atraso={indice * 0.06}
            className="w-[68vw] max-w-[17rem] shrink-0 md:w-[34vw] lg:row-start-2 lg:w-auto lg:max-w-none"
          >
            <figure className="queridinho">
              <Foto imagem={imagens[item.imagem]} className="foto-produto overflow-hidden" />
              <figcaption className="mt-4">
                <h3 className="text-base leading-snug font-bold">{item.nome}</h3>
                <p className="mt-0.5 font-semibold tabular-nums">{formatarPreco(item.preco)}</p>
                <p className="mt-2 text-[0.9375rem] leading-snug text-tinta-suave">{item.descricao}</p>
              </figcaption>
            </figure>
          </Revelar>
        ))}
      </div>
    </section>
  );
}
