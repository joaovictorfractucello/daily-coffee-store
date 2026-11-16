import { Header } from "@/components/Header";

export default function HomeLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header overHero />
      <main id="conteudo">{children}</main>
    </>
  );
}
