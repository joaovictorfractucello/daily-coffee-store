"use client";

import { useEffect } from "react";

// As categorias do cardápio chegam depois da página (carregam do banco). Quem entra por um link com
// âncora (ex.: /cardapio#salgados) já passou do ponto em que o navegador procura o destino, então
// rolamos até ele assim que a seção aparece.
export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id)
      document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);

  return null;
}
