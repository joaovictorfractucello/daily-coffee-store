"use client";

import { useEffect, useState } from "react";
import { rotulos } from "@/data/textos";
import { linkWhatsAppCafe } from "@/lib/links";

// Barra fixa na base do celular. Fica escondida enquanto outro botão de WhatsApp da página (os que
// têm o atributo data-cta-whatsapp: hero, faixa promocional e faixa final) está à vista, para nunca
// haver dois botões de pedido na tela ao mesmo tempo.
export function BarraWhatsApp() {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const alvos = document.querySelectorAll("[data-cta-whatsapp]");
    const naTela = new Set<Element>();
    const observador = new IntersectionObserver((entradas) => {
      for (const entrada of entradas) {
        if (entrada.isIntersecting) naTela.add(entrada.target);
        else naTela.delete(entrada.target);
      }
      setVisivel(naTela.size === 0);
    }, { rootMargin: "-56px 0px 0px 0px" }); // ignora a faixa coberta pelo cabeçalho fixo
    alvos.forEach((alvo) => observador.observe(alvo));
    return () => observador.disconnect();
  }, []);

  return (
    <div data-visivel={visivel} inert={!visivel} className="barra-whatsapp fixed inset-x-0 bottom-0 z-30 md:hidden">
      <a
        href={linkWhatsAppCafe}
        target="_blank"
        rel="noopener noreferrer"
        className="botao botao-destaque min-h-14 w-full rounded-none pb-[calc(0.875rem+env(safe-area-inset-bottom))]"
      >
        {rotulos.whatsapp}
        <span className="sr-only"> {rotulos.abreWhatsApp}</span>
      </a>
    </div>
  );
}
