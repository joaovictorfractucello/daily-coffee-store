"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = {
  src: string;
  alt: string;
  sizes: string;
  cta: { background: string; text: string };
};

const INTERVAL_MS = 5000;

// Fotos empilhadas que se alternam com fade (só opacidade). Sem movimento reduzido, passa a cada
// 5s e pausa com a aba escondida. Com movimento reduzido, fica na primeira foto.
// A cada troca, também muda a cor do botão principal do hero e a do botão do cabeçalho enquanto ele
// está transparente (variáveis --cta-background e --cta-text, só na seção #inicio e no <header>: mudar
// a variável na raiz da página refaria o estilo de tudo, o que pesa na rolagem do celular).
// O carrossel só avança enquanto o hero está na tela, para não gastar processamento escondido.
export function HeroPhotos({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  const heroOnScreen = useRef(true);

  useEffect(() => {
    const hero = document.getElementById("inicio");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => {
      heroOnScreen.current = entry.isIntersecting;
    });
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      if (!document.hidden && heroOnScreen.current)
        setActive((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    const { background, text } = slides[active].cta;
    for (const target of [
      document.getElementById("inicio"),
      document.querySelector("header"),
    ]) {
      target?.style.setProperty("--cta-background", background);
      target?.style.setProperty("--cta-text", text);
    }
  }, [active, slides]);

  return (
    <div className="hero-photo absolute inset-0 -z-10">
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={index === active ? slide.alt : ""}
          aria-hidden={index !== active}
          fill
          sizes={slide.sizes}
          unoptimized
          loading={index === 0 ? "eager" : undefined}
          fetchPriority={index === 0 ? "high" : undefined}
          className="object-cover object-center transition-opacity duration-[1400ms] ease-in-out motion-reduce:transition-none"
          style={{ opacity: index === active ? 1 : 0 }}
        />
      ))}
    </div>
  );
}
