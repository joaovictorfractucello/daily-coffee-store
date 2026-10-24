"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = {
  src: string;
  alt: string;
  sizes: string;
  cta: { fundo: string; texto: string };
};

const INTERVALO_MS = 5000;

// Fotos empilhadas que se alternam com fade (só opacidade). Sem movimento reduzido, passa a cada
// 5s e pausa com a aba escondida. Com movimento reduzido, fica na primeira foto.
// A cada troca, também muda a cor do botão principal do hero e a do botão do cabeçalho enquanto ele
// está transparente (variáveis --cta-fundo e --cta-texto, só na seção #inicio e no <header>: mudar
// a variável na raiz da página refaria o estilo de tudo, o que pesa na rolagem do celular).
// O carrossel só avança enquanto o hero está na tela, para não gastar processamento escondido.
export function HeroFotos({ slides }: { slides: Slide[] }) {
  const [ativo, setAtivo] = useState(0);
  const heroNaTela = useRef(true);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    const observador = new IntersectionObserver(([entrada]) => {
      heroNaTela.current = entrada.isIntersecting;
    });
    observador.observe(hero);
    return () => observador.disconnect();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (!document.hidden && heroNaTela.current)
        setAtivo((atual) => (atual + 1) % slides.length);
    }, INTERVALO_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const { fundo, texto } = slides[ativo].cta;
    for (const alvo of [
      document.getElementById("inicio"),
      document.querySelector("header"),
    ]) {
      alvo?.style.setProperty("--cta-fundo", fundo);
      alvo?.style.setProperty("--cta-texto", texto);
    }
  }, [ativo, slides]);

  return (
    <div className="hero-foto absolute inset-0 -z-10">
      {slides.map((slide, indice) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={indice === ativo ? slide.alt : ""}
          aria-hidden={indice !== ativo}
          fill
          sizes={slide.sizes}
          unoptimized
          loading={indice === 0 ? "eager" : undefined}
          fetchPriority={indice === 0 ? "high" : undefined}
          className="object-cover object-center transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none"
          style={{ opacity: indice === ativo ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
