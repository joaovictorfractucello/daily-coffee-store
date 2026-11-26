import { Header } from "@/components/Header";
import { SiteChrome } from "@/components/SiteChrome";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
      <SiteChrome />
    </>
  );
}
