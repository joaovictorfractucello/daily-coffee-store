"use client";

import { useEffect, useState } from "react";
import { labels } from "@/data/copy";
import { whatsAppLink } from "@/lib/links";

// Barra fixa na base do celular. Fica escondida enquanto outro botão de WhatsApp da página (os que
// têm o atributo data-cta-whatsapp: hero, faixa promocional e faixa final) está à vista, para nunca
// haver dois botões de pedido na tela ao mesmo tempo.
export function WhatsAppBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const targets = document.querySelectorAll("[data-cta-whatsapp]");
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) onScreen.add(entry.target);
          else onScreen.delete(entry.target);
        }
        setVisible(onScreen.size === 0);
      },
      { rootMargin: "-56px 0px 0px 0px" },
    ); // ignora a faixa coberta pelo cabeçalho fixo
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-visible={visible}
      inert={!visible}
      className="whatsapp-bar fixed inset-x-0 bottom-0 z-30 md:hidden"
    >
      <a
        href={whatsAppLink}
        target="_blank"
        rel="noopener noreferrer"
        className="button button-accent min-h-14 w-full rounded-none pb-[calc(0.875rem+env(safe-area-inset-bottom))]"
      >
        {labels.whatsapp}
        <span className="sr-only"> {labels.opensWhatsApp}</span>
      </a>
    </div>
  );
}
