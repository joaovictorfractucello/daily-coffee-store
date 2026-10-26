import { seo } from "@/data/copy";
import { existsInPublic } from "@/lib/files";
import { heroPhotos } from "@/lib/images";
import { menuLink, instagramLink } from "@/lib/links";
import { site } from "@/site.config";

// Dados estruturados (schema.org) que dizem ao Google o que é o negócio. CafeOrCoffeeShop é um
// tipo de LocalBusiness. Tudo vem do site.config.ts.
function buildStructuredData() {
  const heroPhoto = heroPhotos[0];

  return {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: site.name,
    description: seo.description,
    url: site.url,
    telephone: `+${site.whatsapp.phone.replace(/\D/g, "")}`,
    menu: new URL(menuLink, site.url).toString(),
    ...(existsInPublic(heroPhoto.file) && {
      image: new URL(heroPhoto.file, site.url).toString(),
    }),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${site.address.street}, ${site.address.neighborhood}`,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      addressCountry: "BR",
    },
    openingHoursSpecification: site.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.days,
      opens: hours.opensAt,
      closes: hours.closesAt,
    })),
    sameAs: [instagramLink],
  };
}

export function StructuredData() {
  // Escapa "<" para um texto dos dados nunca conseguir fechar a tag <script>.
  const json = JSON.stringify(buildStructuredData()).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
