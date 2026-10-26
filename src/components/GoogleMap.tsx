"use client";

import { useEffect, useState } from "react";

// O mapa do Google é pesado. Em vez de carregar quando o visitante chega na seção (o que trava a
// rolagem no celular), ele carrega logo depois que a página termina de carregar.
export function GoogleMap({ src, title }: { src: string; title: string }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;
    const schedule = () => {
      timeoutId = window.setTimeout(() => setReady(true), 2500);
    };

    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      window.removeEventListener("load", schedule);
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;

  return (
    <iframe
      src={src}
      title={title}
      referrerPolicy="no-referrer-when-downgrade"
      tabIndex={-1}
      className="pointer-events-none absolute inset-0 h-full w-full border-0"
    />
  );
}
