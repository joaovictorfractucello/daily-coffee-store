import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { aboutUs } from "@/data/copy";
import { images } from "@/lib/images";

// Texto à esquerda e uma foto larga do ambiente à direita (no celular, a foto vem depois do texto).
// Embaixo, 3 itens em linha, cada um com um ícone, separados por uma linha fina (sem caixas).
export function AboutUs() {
  return (
    <section
      id="quem-somos"
      aria-labelledby="about-us-title"
      className="px-4 pb-20 sm:px-6 md:pb-28 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-12 md:items-center md:gap-x-12">
          <Reveal className="md:col-span-5">
            <h2
              id="about-us-title"
              className="heading-soft text-[2rem] md:text-[2.5rem]"
            >
              {aboutUs.title}
            </h2>
            <div className="mt-5 flex max-w-[44ch] flex-col gap-4 text-[1.0625rem] text-ink-soft">
              {aboutUs.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-7">
            <Photo image={images.ambience} className="overflow-hidden" />
          </Reveal>
        </div>

        <Reveal delay={0.12} className="mt-14 md:mt-16">
          <ul className="grid gap-8 border-t border-line pt-8 md:grid-cols-3 md:gap-x-10">
            {aboutUs.facts.map((fact) => (
              <li key={fact.title} className="flex items-start gap-4">
                <Photo
                  image={images[fact.icon]}
                  customAspectRatio
                  className="size-14 shrink-0 md:size-16"
                  imgClassName="object-contain"
                />
                <div>
                  <h3 className="font-bold">{fact.title}</h3>
                  <p className="mt-1 text-[0.9375rem] leading-snug text-ink-soft">
                    {fact.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
