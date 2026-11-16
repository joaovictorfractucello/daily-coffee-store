"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { heroCopy } from "@/data/copy";

type Slide = {
  src: string;
  alt: string;
  sizes: string;
  cta: { background: string; text: string };
};

const INTERVAL_MS = 5000;

function subscribeToNothing() {
  return () => {};
}

export function HeroPhotos({ slides }: { slides: Slide[] }) {
  const [active, setActive] = useState(0);
  // Sobe a cada toque numa bolinha para reiniciar a contagem dos 5 segundos.
  const [manualChanges, setManualChanges] = useState(0);
  // Elemento das bolinhas (no Hero, fora do banner). No servidor é nulo; no cliente, o elemento.
  const dotsContainer = useSyncExternalStore(
    subscribeToNothing,
    () => document.getElementById("hero-dots"),
    () => null,
  );
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
  }, [slides.length, manualChanges]);

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

  const dots =
    dotsContainer && slides.length > 1
      ? createPortal(
          <div role="group" aria-label={heroCopy.dotsLabel} className="flex">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={heroCopy.showPhoto(index + 1)}
                aria-current={index === active}
                onClick={() => {
                  setActive(index);
                  setManualChanges((count) => count + 1);
                }}
                className="grid size-6 place-items-center"
              >
                <span
                  aria-hidden="true"
                  className={`block h-2 rounded-full transition-[width,background-color] duration-300 ${index === active ? "w-5 bg-accent" : "w-2 bg-accent/30"}`}
                />
              </button>
            ))}
          </div>,
          dotsContainer,
        )
      : null;

  return (
    <>
      <div className="hero-photo absolute inset-0 -z-10 max-md:overflow-hidden max-md:rounded-[1.5rem]">
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
      {dots}
    </>
  );
}
