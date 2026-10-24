import type { Metadata, Viewport } from "next";
import { BarraWhatsApp } from "@/components/BarraWhatsApp";
import { Cabecalho } from "@/components/Cabecalho";
import { DadosEstruturados } from "@/components/DadosEstruturados";
import { Rodape } from "@/components/Rodape";
import { rotulos, seo } from "@/data/textos";
import { existeEmPublic } from "@/lib/arquivos";
import { heroFotos } from "@/lib/imagens";
import { site } from "@/site.config";
import { fonteTexto, fonteTitulo } from "./fonts";
import "./globals.css";

// Função (e não constante) para a checagem da foto rodar a cada geração da página.
export async function generateMetadata(): Promise<Metadata> {
  const fotoHero = heroFotos[0];
  const temFotoHero = existeEmPublic(fotoHero.arquivo);

  return {
    metadataBase: new URL(site.url),
    title: seo.titulo,
    description: seo.descricao,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      url: "/",
      siteName: site.nome,
      title: seo.titulo,
      description: seo.descricao,
      // Sem a foto do hero, nenhuma imagem de compartilhamento é declarada.
      images: temFotoHero
        ? [
            {
              url: fotoHero.arquivo,
              width: fotoHero.largura,
              height: fotoHero.altura,
              alt: fotoHero.alt,
            },
          ]
        : undefined,
    },
    twitter: { card: temFotoHero ? "summary_large_image" : "summary" },
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
      className={`${fonteTitulo.variable} ${fonteTexto.variable}`}
    >
      <body>
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-escuro focus:px-5 focus:py-3 focus:font-bold focus:text-claro"
        >
          {rotulos.pularParaConteudo}
        </a>
        <Cabecalho />
        <main id="conteudo">{children}</main>
        <Rodape />
        <BarraWhatsApp />
        <DadosEstruturados />
        {/* Sem JavaScript, o conteúdo que seria revelado ao rolar aparece direto. */}
        <noscript>
          <style>
            {"[data-revelar]{opacity:1!important;transform:none!important}"}
          </style>
        </noscript>
      </body>
    </html>
  );
}
