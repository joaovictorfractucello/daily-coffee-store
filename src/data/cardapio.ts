// Queridinhos da casa: itens e preços de EXEMPLO (café fictício). Troque pelos itens reais do cliente.
// O cardápio completo é um PDF (veja cardapioPdfUrl em site.config.ts).
import type { ChaveImagem } from "@/lib/imagens";

export type Queridinho = {
  nome: string;
  // Até 12 palavras.
  descricao: string;
  // Em reais.
  preco: number;
  imagem: ChaveImagem;
};

// A ordem é a da página, da esquerda para a direita (no celular, da primeira para a última do carrossel).
export const queridinhos: Queridinho[] = [
  {
    nome: "Cappuccino cremoso",
    descricao: "Espresso, leite vaporizado e espuma densa. Canela, se quiser.",
    preco: 14,
    imagem: "cappuccinoCremoso",
  },
  {
    nome: "Frappé de chocolate",
    descricao: "Chocolate batido com gelo, chantilly e calda por cima.",
    preco: 18,
    imagem: "frappeDeChocolate",
  },
  {
    nome: "Pão de queijo quentinho",
    descricao: "Assado em fornadas pequenas ao longo do dia.",
    preco: 13,
    imagem: "paoDeQueijo",
  },
  {
    nome: "Croissant de manteiga",
    descricao:
      "Massa folhada na manteiga, crocante por fora e macia por dentro.",
    preco: 16,
    imagem: "croissantDeManteiga",
  },
  {
    nome: "Bolo de cenoura com chocolate",
    descricao: "Fatia alta com cobertura de chocolate que escorre.",
    preco: 15,
    imagem: "boloDeCenoura",
  },
];
