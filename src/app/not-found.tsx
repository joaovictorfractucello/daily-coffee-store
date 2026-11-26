import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { SiteChrome } from "@/components/SiteChrome";
import { StateIllustration } from "@/components/StateIllustration";
import { notFoundPage as copy } from "@/data/copy";
import { homeLink, menuLink } from "@/lib/links";

export const metadata: Metadata = {
  title: copy.metaTitle,
  robots: { index: false, follow: true },
};

// Atende link inexistente e os notFound() das páginas (produto, endereço). Fica fora do grupo
// (store), então monta o cabeçalho e o rodapé da loja por conta própria.
export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="conteudo"
        className="flex flex-col items-center px-(--gutter) pt-28 pb-16 text-center max-md:min-h-svh max-md:justify-center md:pt-36 md:pb-24"
      >
        <StateIllustration name="notFound" size={176} />
        <h1 className="mt-6 heading-soft text-[1.5rem] md:text-[2rem]">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-sm text-ink-soft">{copy.text}</p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
          <Link href={menuLink} className="button button-accent">
            {copy.seeMenu}
          </Link>
          <Link href={homeLink} className="button button-outline-ink">
            {copy.backHome}
          </Link>
        </div>
      </main>
      <SiteChrome />
    </>
  );
}
