import { seo } from "@/data/textos";
import { existeEmPublic } from "@/lib/arquivos";
import { heroFotos } from "@/lib/imagens";
import { linkCardapio, linkInstagram } from "@/lib/links";
import { site } from "@/site.config";

// Dados estruturados (schema.org) que dizem ao Google o que é o negócio. CafeOrCoffeeShop é um
// tipo de LocalBusiness. Tudo vem do site.config.ts.
function montarDadosEstruturados() {
  const fotoHero = heroFotos[0];

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: site.nome,
    description: seo.descricao,
    url: site.url,
    telephone: `+${site.whatsapp.numero.replace(/\D/g, "")}`,
    menu: new URL(linkCardapio, site.url).toString(),
    ...(existeEmPublic(fotoHero.arquivo) && { image: new URL(fotoHero.arquivo, site.url).toString() }),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.endereco.rua}, ${site.endereco.bairro}`,
      addressLocality: site.endereco.cidade,
      addressRegion: site.endereco.estado,
      addressCountry: "BR",
    },
    openingHoursSpecification: site.horarios.map((horario) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: horario.dias,
      opens: horario.abre,
      closes: horario.fecha,
    })),
    sameAs: [linkInstagram],
  };
}

export function DadosEstruturados() {
  // Escapa "<" para um texto dos dados nunca conseguir fechar a tag <script>.
  const json = JSON.stringify(montarDadosEstruturados()).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
