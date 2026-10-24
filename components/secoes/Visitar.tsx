import { MapPin } from "@phosphor-icons/react/ssr";
import { Fragment } from "react";
import { MapaGoogle } from "@/components/MapaGoogle";
import { Revelar } from "@/components/Revelar";
import { visitar } from "@/data/textos";
import { formatarHora } from "@/lib/formatar";
import { linkComoChegar } from "@/lib/links";
import { urlMapa } from "@/lib/mapa";
import { site } from "@/site.config";

// Mapa do Google. O mapa em si fica travado (não arrasta nem dá zoom dentro da página) e um link por
// cima dele abre o Google Maps numa aba nova, no mesmo lugar do botão "Como chegar".
function Mapa() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-reserva md:aspect-auto md:h-full md:min-h-[22rem]">
      <MapaGoogle src={urlMapa} titulo={visitar.tituloMapa} />
      <a href={linkComoChegar} target="_blank" rel="noopener noreferrer" className="absolute inset-0">
        <span className="sr-only">
          {visitar.abrirMapa} {visitar.abreMapa}
        </span>
      </a>
    </div>
  );
}
// Informações à esquerda (endereço, horário e "Como chegar") e mapa à direita. No celular, o mapa vem primeiro.
export function Visitar() {
  const { endereco } = site;

  return (
    <section id="visitar" aria-labelledby="visitar-titulo" className="scroll-mt-12 px-4 pb-20 sm:px-6 md:scroll-mt-16 md:pb-28 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Revelar>
          <h2 id="visitar-titulo" className="titulo-suave text-[2rem] md:text-[2.5rem]">
            {visitar.titulo}
          </h2>
        </Revelar>

        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:gap-x-12">
          <Revelar atraso={0.06} className="order-2 md:order-1 md:col-span-5">
            <div className="flex flex-col gap-7">
              <div>
                <h3 className="font-bold">{visitar.rotuloEndereco}</h3>
                <address className="mt-2 text-[1.0625rem] text-tinta-suave not-italic">
                  {endereco.rua}
                  <br />
                  {endereco.bairro}, {endereco.cidade}, {endereco.estado}
                </address>
              </div>

              <div>
                <h3 className="font-bold">{visitar.rotuloHorario}</h3>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[1.0625rem] text-tinta-suave">
                  {site.horarios.map((horario) => (
                    <Fragment key={horario.rotulo}>
                      <dt>{horario.rotulo}</dt>
                      <dd className="tabular-nums">
                        {formatarHora(horario.abre)} às {formatarHora(horario.fecha)}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              </div>

              <a
                href={linkComoChegar}
                target="_blank"
                rel="noopener noreferrer"
                className="botao botao-destaque w-full self-start sm:w-auto"
              >
                <MapPin aria-hidden="true" size={20} weight="bold" />
                {visitar.comoChegar}
                <span className="sr-only"> {visitar.abreMapa}</span>
              </a>
            </div>
          </Revelar>

          <Revelar atraso={0.12} className="order-1 md:order-2 md:col-span-7">
            <Mapa />
          </Revelar>
        </div>
      </div>
    </section>
  );
}
