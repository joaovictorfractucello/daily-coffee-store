import { CtaFinal } from "@/components/secoes/CtaFinal";
import { Hero } from "@/components/secoes/Hero";
import { QuemSomos } from "@/components/secoes/QuemSomos";
import { Promocao } from "@/components/secoes/Promocao";
import { Queridinhos } from "@/components/secoes/Queridinhos";
import { Visitar } from "@/components/secoes/Visitar";

export default function Home() {
  return (
    <>
      <Hero />
      <Queridinhos />
      <Promocao />
      <QuemSomos />
      <Visitar />
      <CtaFinal />
    </>
  );
}
