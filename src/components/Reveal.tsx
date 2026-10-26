"use client";

import { LazyMotion } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

// O "m" é a versão mínima do componente; os recursos de animação chegam depois, sem
// bloquear a primeira carga da página.
const loadFeatures = () =>
  import("@/lib/motion-features").then((mod) => mod.default);

type RevealProps = {
  children: ReactNode;
  className?: string;
  // Em segundos. Escalona blocos lado a lado (colunas).
  delay?: number;
};

// Revela o conteúdo uma vez, quando ele entra na tela. "transform" em texto (e não "y") para o
// Motion animar fora da thread principal. Movimento reduzido e falta de JavaScript ficam no CSS
// (regra [data-reveal] no globals.css e <noscript> no layout).
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <m.div
        data-reveal=""
        className={className}
        initial={{ opacity: 0, transform: "translateY(16px)" }}
        whileInView={{ opacity: 1, transform: "translateY(0px)" }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.5, delay: delay, ease: [0.23, 1, 0.32, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  );
}
