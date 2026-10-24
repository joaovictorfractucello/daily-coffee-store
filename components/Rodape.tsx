import { InstagramLogo, MapPin, WhatsappLogo } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { navegacao, rodape, rotulos } from "@/data/textos";
import { formatarHora, formatarTelefone } from "@/lib/formatar";
import { linkInstagram, linkWhatsAppCafe } from "@/lib/links";
import { site } from "@/site.config";

const classeTitulo = "text-sm font-bold";
const classeLink = "block py-1.5 text-sm text-tinta-suave transition-colors duration-200 hover:text-tinta";
const classeIcone = "mt-0.5 shrink-0 text-destaque";

// Rodapé claro e compacto, na mesma largura do cabeçalho. A marca tem o mesmo tamanho da do cabeçalho.
export function Rodape() {
  const { endereco } = site;

  return (
    // No celular, o espaço extra embaixo evita que a barra fixa do WhatsApp cubra o rodapé.
    <footer className="border-t border-linha px-4 pb-24 sm:px-6 md:pb-0 lg:px-10">
      <div className="mx-auto max-w-7xl py-10 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.5fr_1fr_1fr_1.4fr] md:gap-x-10">
          <div className="col-span-2 md:col-span-1">
            <a
              href="#inicio"
              aria-label={`${site.nome}, ${rotulos.voltarAoInicio}`}
              className="inline-flex items-center gap-2"
            >
              <Image src="/marca/graozinho.png" alt="" width={512} height={512} unoptimized className="size-6 md:size-7" />
              <span className="relative block aspect-[600/173] w-[5.75rem] md:w-[6.25rem]">
                <Image src="/marca/wordmark.png" alt="" fill unoptimized sizes="100px" className="object-contain" />
              </span>
            </a>
            <p className="mt-4 max-w-[30ch] text-sm text-tinta-suave">{rodape.descricao}</p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className={classeTitulo}>{rodape.tituloNavegacao}</h2>
            <ul className="mt-2">
              {navegacao.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={classeLink}>
                    {link.rotulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={classeTitulo}>{rodape.tituloHorario}</h2>
            <dl className="mt-2 text-sm text-tinta-suave">
              {site.horarios.map((horario) => (
                <div key={horario.rotulo} className="py-1.5">
                  <dt>{horario.rotulo}</dt>
                  <dd className="tabular-nums">
                    {formatarHora(horario.abre)} às {formatarHora(horario.fecha)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h2 className={classeTitulo}>{rodape.tituloContato}</h2>
            <ul className="mt-2">
              <li>
                <a
                  href={linkWhatsAppCafe}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${classeLink} flex items-start gap-2.5`}
                >
                  <WhatsappLogo aria-hidden="true" size={18} className={classeIcone} />
                  <span className="tabular-nums">{formatarTelefone(site.whatsapp.numero)}</span>
                  <span className="sr-only"> {rotulos.abreWhatsApp}</span>
                </a>
              </li>
              <li>
                <a
                  href={linkInstagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${classeLink} flex items-start gap-2.5`}
                >
                  <InstagramLogo aria-hidden="true" size={18} className={classeIcone} />@{site.instagram.usuario}
                  <span className="sr-only"> {rotulos.abreInstagram}</span>
                </a>
              </li>
              <li>
                <address className="flex items-start gap-2.5 py-1.5 text-sm text-tinta-suave not-italic">
                  <MapPin aria-hidden="true" size={18} className={classeIcone} />
                  <span>
                    {endereco.rua}
                    <br />
                    {endereco.bairro}, {endereco.cidade}, {endereco.estado}
                  </span>
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-linha pt-5 text-xs text-tinta-suave">
          <p>
            © {site.nome}. {rodape.direitos}
          </p>
        </div>
      </div>
    </footer>
  );
}
