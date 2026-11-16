import { Header } from "@/components/Header";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
    </>
  );
}
