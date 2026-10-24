import { Foto } from "@/components/Foto";
import { Revelar } from "@/components/Revelar";
import { quemSomos } from "@/data/textos";
import { imagens } from "@/lib/imagens";

// Texto à esquerda e uma foto larga do ambiente à direita (no celular, a foto vem depois do texto).
// Embaixo, 3 itens em linha, cada um com um ícone, separados por uma linha fina (sem caixas).
export function QuemSomos() {
  return (
    <section id="quem-somos" aria-labelledby="quem-somos-titulo" className="px-4 pb-20 sm:px-6 md:pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-x-12">
          <Revelar className="md:col-span-5">
            <h2 id="quem-somos-titulo" className="titulo-suave text-[2rem] md:text-[2.5rem]">
              {quemSomos.titulo}
            </h2>
            <div className="mt-5 flex max-w-[44ch] flex-col gap-4 text-[1.0625rem] text-tinta-suave">
              {quemSomos.paragrafos.map((paragrafo) => (
                <p key={paragrafo}>{paragrafo}</p>
              ))}
            </div>
          </Revelar>

          <Revelar atraso={0.08} className="md:col-span-7">
            <Foto imagem={imagens.ambiente} className="overflow-hidden" />
          </Revelar>
        </div>

        <Revelar atraso={0.12} className="mt-14 md:mt-16">
          <ul className="grid gap-8 border-t border-linha pt-8 md:grid-cols-3 md:gap-x-10">
            {quemSomos.fatos.map((fato) => (
              <li key={fato.titulo} className="flex items-start gap-4">
                <Foto
                  imagem={imagens[fato.icone]}
                  proporcaoPropria
                  className="size-14 shrink-0 md:size-16"
                  imgClassName="object-contain"
                />
                <div>
                  <h3 className="font-bold">{fato.titulo}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-snug text-tinta-suave">{fato.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </Revelar>
      </div>
    </section>
  );
}
