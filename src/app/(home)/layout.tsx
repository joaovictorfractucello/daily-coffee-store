import { Header } from "@/components/Header";
import { SiteChrome } from "@/components/SiteChrome";

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header overHero />
      <main id="conteudo">{children}</main>
      <SiteChrome />
    </>
  );
}
