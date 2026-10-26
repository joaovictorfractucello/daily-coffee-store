import { InstagramLogo, MapPin, WhatsappLogo } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import { navigation, footer, labels } from "@/data/copy";
import { formatTime, formatPhone } from "@/lib/format";
import { instagramLink, whatsAppLink } from "@/lib/links";
import { site } from "@/site.config";

const titleClass = "text-sm font-bold";
const linkClass =
  "block py-1.5 text-sm text-ink-soft transition-colors duration-200 hover:text-ink";
const iconClass = "mt-0.5 shrink-0 text-accent";

// Rodapé claro e compacto, na mesma largura do cabeçalho. A marca tem o mesmo tamanho da do cabeçalho.
export function Footer() {
  const { address } = site;

  return (
    // No celular, o espaço extra embaixo evita que a barra fixa do WhatsApp cubra o rodapé.
    <footer className="border-t border-line px-4 pb-24 sm:px-6 md:pb-0 lg:px-10">
      <div className="mx-auto max-w-7xl py-10 md:py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[1.5fr_1fr_1fr_1.4fr] md:gap-x-10">
          <div className="col-span-2 md:col-span-1">
            <a
              href="#inicio"
              aria-label={`${site.name}, ${labels.backToTop}`}
              className="inline-flex items-center gap-2"
            >
              <Image
                src="/marca/graozinho.png"
                alt=""
                width={512}
                height={512}
                unoptimized
                className="size-6 md:size-7"
              />
              <span className="relative block aspect-[600/173] w-[5.75rem] md:w-[6.25rem]">
                <Image
                  src="/marca/wordmark.png"
                  alt=""
                  fill
                  unoptimized
                  sizes="100px"
                  className="object-contain"
                />
              </span>
            </a>
            <p className="mt-4 max-w-[30ch] text-sm text-ink-soft">
              {footer.description}
            </p>
          </div>

          <nav aria-label="Rodapé">
            <h2 className={titleClass}>{footer.navigationTitle}</h2>
            <ul className="mt-2">
              {navigation.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkClass}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={titleClass}>{footer.hoursTitle}</h2>
            <dl className="mt-2 text-sm text-ink-soft">
              {site.openingHours.map((hours) => (
                <div key={hours.label} className="py-1.5">
                  <dt>{hours.label}</dt>
                  <dd className="tabular-nums">
                    {formatTime(hours.opensAt)} às {formatTime(hours.closesAt)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h2 className={titleClass}>{footer.contactTitle}</h2>
            <ul className="mt-2">
              <li>
                <a
                  href={whatsAppLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} flex items-start gap-2.5`}
                >
                  <WhatsappLogo
                    aria-hidden="true"
                    size={18}
                    className={iconClass}
                  />
                  <span className="tabular-nums">
                    {formatPhone(site.whatsapp.phone)}
                  </span>
                  <span className="sr-only"> {labels.opensWhatsApp}</span>
                </a>
              </li>
              <li>
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} flex items-start gap-2.5`}
                >
                  <InstagramLogo
                    aria-hidden="true"
                    size={18}
                    className={iconClass}
                  />
                  @{site.instagram.username}
                  <span className="sr-only"> {labels.opensInstagram}</span>
                </a>
              </li>
              <li>
                <address className="flex items-start gap-2.5 py-1.5 text-sm text-ink-soft not-italic">
                  <MapPin aria-hidden="true" size={18} className={iconClass} />
                  <span>
                    {address.street}
                    <br />
                    {address.neighborhood}, {address.city}, {address.state}
                  </span>
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-5 text-xs text-ink-soft">
          <p>
            © {site.name}. {footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
