import type { Metadata, Viewport } from "next";
import { WhatsAppBar } from "@/components/WhatsAppBar";
import { Header } from "@/components/Header";
import { StructuredData } from "@/components/StructuredData";
import { Footer } from "@/components/Footer";
import { labels, seo } from "@/data/copy";
import { existsInPublic } from "@/lib/files";
import { heroPhotos } from "@/lib/images";
import { isProductionDeployment } from "@/server/lib/deployment";
import { site } from "@/site.config";
import { textFont, headingFont } from "./fonts";
import "./globals.css";

// Função (e não constante) para a checagem da foto rodar a cada geração da página.
export async function generateMetadata(): Promise<Metadata> {
  const heroPhoto = heroPhotos[0];
  const hasHeroPhoto = existsInPublic(heroPhoto.file);

  return {
    metadataBase: new URL(site.url),
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/" },
    robots: isProductionDeployment
      ? undefined
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      siteName: site.name,
      title: seo.title,
      description: seo.description,
      // Sem a foto do hero, nenhuma imagem de compartilhamento é declarada.
      images: hasHeroPhoto
        ? [
            {
              url: heroPhoto.file,
              width: heroPhoto.width,
              height: heroPhoto.height,
              alt: heroPhoto.alt,
            },
          ]
        : undefined,
    },
    twitter: { card: hasHeroPhoto ? "summary_large_image" : "summary" },
  };
}

export const viewport: Viewport = {
  themeColor: "#2a1d16",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${headingFont.variable} ${textFont.variable}`}
    >
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-dark focus:px-5 focus:py-3 focus:font-bold focus:text-light"
        >
          {labels.skipToContent}
        </a>
        <Header />
        <main id="conteudo">{children}</main>
        <Footer />
        <WhatsAppBar />
        <StructuredData />
        {/* Sem JavaScript, o conteúdo que seria revelado ao rolar aparece direto. */}
        <noscript>
          <style>
            {"[data-reveal]{opacity:1!important;transform:none!important}"}
          </style>
        </noscript>
      </body>
    </html>
  );
}
