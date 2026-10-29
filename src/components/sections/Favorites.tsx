import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { favorites } from "@/data/menu";
import { favoritesCopy, labels } from "@/data/copy";
import { formatPrice } from "@/lib/format";
import { images } from "@/lib/images";
import { menuLink } from "@/lib/links";

// Link discreto: pequeno, na cor do texto secundário, e só ganha o sublinhado e o tom escuro no hover.
const menuLinkClass =
  "link-underline shrink-0 items-center gap-1.5 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-ink";

// No celular e no tablet os produtos formam uma faixa que se arrasta para o lado e o link
// "Ver cardápio" fica à direita do título. No desktop (lg) os 5 ficam lado a lado, e o link
// passa para uma linha própria, colado em cima do último card.
export function Favorites() {
  return (
    <section
      id="queridinhos"
      aria-labelledby="favorites-title"
      className="py-20 md:py-28 lg:px-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-0">
        <Reveal className="flex items-end justify-between gap-6">
          <h2
            id="favorites-title"
            className="heading-soft text-[2rem] md:text-[2.5rem]"
          >
            {favoritesCopy.title}
          </h2>
          <a
            href={menuLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`${menuLinkClass} inline-flex min-h-11 lg:hidden`}
          >
            {labels.menu}
            <ArrowRight aria-hidden="true" size={14} weight="bold" />
            <span className="sr-only"> {labels.opensMenuPdf}</span>
          </a>
        </Reveal>
      </div>

      {/* Faixa rolável por teclado (tabIndex) e por toque; some a barra de rolagem para ficar limpa. */}
      <div
        role="region"
        aria-label={favoritesCopy.title}
        tabIndex={0}
        className="mt-10 flex [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-4 sm:px-6 lg:mx-auto lg:mt-8 lg:grid lg:max-w-7xl lg:grid-cols-5 lg:gap-x-6 lg:gap-y-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        <a
          href={menuLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${menuLinkClass} hidden lg:col-start-5 lg:row-start-1 lg:mb-3 lg:flex lg:justify-self-end`}
        >
          {labels.menu}
          <ArrowRight aria-hidden="true" size={14} weight="bold" />
          <span className="sr-only"> {labels.opensMenuPdf}</span>
        </a>

        {favorites.map((item, index) => (
          <Reveal
            key={item.name}
            delay={index * 0.06}
            className="w-[68vw] max-w-[17rem] shrink-0 md:w-[34vw] lg:row-start-2 lg:w-auto lg:max-w-none"
          >
            <figure className="favorite">
              <Photo
                image={images[item.image]}
                className="product-photo overflow-hidden"
              />
              <figcaption className="mt-4">
                <h3 className="text-base leading-snug font-bold">
                  {item.name}
                </h3>
                <p className="mt-0.5 font-semibold tabular-nums">
                  {formatPrice(item.priceInCents)}
                </p>
                <p className="mt-2 text-[0.9375rem] leading-snug text-ink-soft">
                  {item.description}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
