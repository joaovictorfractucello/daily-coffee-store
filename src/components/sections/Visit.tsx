import { MapPin } from "@phosphor-icons/react/ssr";
import { Fragment } from "react";
import { GoogleMap } from "@/components/GoogleMap";
import { Reveal } from "@/components/Reveal";
import { visit } from "@/data/copy";
import { formatTime } from "@/lib/format";
import { directionsLink } from "@/lib/links";
import { mapUrl } from "@/lib/map";
import { site } from "@/site.config";

// Mapa do Google. O mapa em si fica travado (não arrasta nem dá zoom dentro da página) e um link por
// cima dele abre o Google Maps numa aba nova, no mesmo lugar do botão "Como chegar".
function MapPreview() {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto md:h-full md:min-h-[22rem]">
      <GoogleMap src={mapUrl} title={visit.mapTitle} />
      <a
        href={directionsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0"
      >
        <span className="sr-only">
          {visit.openMap} {visit.opensMap}
        </span>
      </a>
    </div>
  );
}
// Informações à esquerda (endereço, horário e "Como chegar") e mapa à direita. No celular, o mapa vem primeiro.
export function Visit() {
  const { address } = site;

  return (
    <section
      id="visitar"
      aria-labelledby="visit-title"
      className="scroll-mt-12 px-4 pb-20 sm:px-6 md:scroll-mt-16 md:pb-28 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <h2
            id="visit-title"
            className="heading-soft text-[2rem] md:text-[2.5rem]"
          >
            {visit.title}
          </h2>
        </Reveal>

        <div className="mt-8 grid gap-8 md:mt-10 md:grid-cols-12 md:gap-x-12">
          <Reveal delay={0.06} className="order-2 md:order-1 md:col-span-5">
            <div className="flex flex-col gap-7">
              <div>
                <h3 className="font-bold">{visit.addressLabel}</h3>
                <address className="mt-2 text-[1.0625rem] text-ink-soft not-italic">
                  {address.street}
                  <br />
                  {address.neighborhood}, {address.city}, {address.state}
                </address>
              </div>

              <div>
                <h3 className="font-bold">{visit.hoursLabel}</h3>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[1.0625rem] text-ink-soft">
                  {site.openingHours.map((hours) => (
                    <Fragment key={hours.label}>
                      <dt>{hours.label}</dt>
                      <dd className="tabular-nums">
                        {formatTime(hours.opensAt)} às{" "}
                        {formatTime(hours.closesAt)}
                      </dd>
                    </Fragment>
                  ))}
                </dl>
              </div>

              <a
                href={directionsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-accent w-full self-start sm:w-auto"
              >
                <MapPin aria-hidden="true" size={20} weight="bold" />
                {visit.directions}
                <span className="sr-only"> {visit.opensMap}</span>
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="order-1 md:order-2 md:col-span-7">
            <MapPreview />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
