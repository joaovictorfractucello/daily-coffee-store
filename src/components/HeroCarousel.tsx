"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { heroCopy } from "@/data/copy";

type HeroSlide = { name: string; content: ReactNode };

const INTERVAL_MS = 6000;

// Alterna os banners do hero. Os banners ficam empilhados na mesma célula e só o ativo aparece e recebe
// foco (os outros ficam `inert`). A contagem pausa com a aba escondida ou o hero fora da tela, e não
// roda para quem pediu menos movimento.
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  // Sobe a cada toque numa bolinha para reiniciar a contagem.
  const [manualChanges, setManualChanges] = useState(0);
  const heroOnScreen = useRef(true);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
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
  }, [slides.length, manualChanges]);

  return (
    <div className="relative">
      <div ref={heroRef} id="inicio" className="grid">
        {slides.map((slide, index) => (
          <div
            key={slide.name}
            inert={index !== active}
            aria-hidden={index !== active}
            className="transition-opacity duration-700 ease-in-out [grid-area:1/1] motion-reduce:transition-none"
            style={{ opacity: index === active ? 1 : 0 }}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div
          role="group"
          aria-label={heroCopy.dotsLabel}
          className="absolute inset-x-0 bottom-2 z-10 flex justify-center md:bottom-5"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.name}
              type="button"
              aria-label={heroCopy.showPhoto(index + 1)}
              aria-current={index === active}
              onClick={() => {
                setActive(index);
                setManualChanges((count) => count + 1);
              }}
              className="grid size-6 cursor-pointer place-items-center"
            >
              <span
                aria-hidden="true"
                className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${index === active ? "w-5 bg-light" : "w-2 bg-light/40"}`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
