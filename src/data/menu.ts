// Queridinhos da casa: itens e preços de EXEMPLO (café fictício). Troque pelos itens reais do cliente.
// O cardápio completo é um PDF (veja menuPdfUrl em site.config.ts).
import type { ImageKey } from "@/lib/images";

export type Favorite = {
  name: string;
  // Até 12 palavras.
  description: string;
  priceInCents: number;
  image: ImageKey;
};

// A ordem é a da página, da esquerda para a direita (no celular, da primeira para a última do carrossel).
export const favorites: Favorite[] = [
  {
    name: "Cappuccino cremoso",
    description:
      "Espresso, leite vaporizado e espuma densa. Canela, se quiser.",
    priceInCents: 1400,
    image: "creamyCappuccino",
  },
  {
    name: "Frappé de chocolate",
    description: "Chocolate batido com gelo, chantilly e calda por cima.",
    priceInCents: 1800,
    image: "chocolateFrappe",
  },
  {
    name: "Pão de queijo quentinho",
    description: "Assado em fornadas pequenas ao longo do dia.",
    priceInCents: 1300,
    image: "cheeseBread",
  },
  {
    name: "Croissant de manteiga",
    description:
      "Massa folhada na manteiga, crocante por fora e macia por dentro.",
    priceInCents: 1600,
    image: "butterCroissant",
  },
  {
    name: "Bolo de cenoura com chocolate",
    description: "Fatia alta com cobertura de chocolate que escorre.",
    priceInCents: 1500,
    image: "carrotCake",
  },
];
