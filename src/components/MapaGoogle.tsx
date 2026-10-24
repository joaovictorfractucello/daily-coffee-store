"use client";

import { useEffect, useState } from "react";

// O mapa do Google é pesado. Em vez de carregar quando o visitante chega na seção (o que trava a
// rolagem no celular), ele carrega logo depois que a página termina de carregar.
export function MapaGoogle({ src, titulo }: { src: string; titulo: string }) {
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let espera: number | undefined;
    const agendar = () => {
      espera = window.setTimeout(() => setPronto(true), 2500);
    };

    if (document.readyState === "complete") agendar();
    else window.addEventListener("load", agendar, { once: true });

    return () => {
      window.removeEventListener("load", agendar);
      window.clearTimeout(espera);
    };
  }, []);

  if (!pronto) return null;

  return (
    <iframe
      src={src}
      title={titulo}
      referrerPolicy="no-referrer-when-downgrade"
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 h-full w-full border-0"
    />
  );
}
