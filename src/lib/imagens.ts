// Registro de todos os espaços de imagem do site. Cada foto aparece sozinha quando o arquivo
// existir em public/ com o caminho abaixo (veja IMAGENS.md). Se a foto mudar, ajuste o alt.

export type Imagem = {
  // Caminho a partir de public/.
  arquivo: `/images/${string}.${"webp" | "jpg" | "png"}`;
  alt: string;
  largura: number;
  altura: number;
  // Largura que a foto ocupa na tela, para o navegador baixar o tamanho certo.
  sizes: string;
};

const sizesQueridinho =
  "(min-width: 1280px) 380px, (min-width: 768px) 30vw, 92vw";

export const imagens = {
  cappuccinoCremoso: {
    arquivo: "/images/queridinhos/cappuccino-cremoso.webp",
    alt: "Cappuccino com desenho de folha na espuma, em xícara de cerâmica sobre mesa de madeira",
    largura: 1080,
    altura: 1080,
    sizes: sizesQueridinho,
  },
  frappeDeChocolate: {
    arquivo: "/images/queridinhos/frappe-de-chocolate.webp",
    alt: "Frappé de chocolate com chantilly e calda escorrendo, em copo transparente com tampa de domo",
    largura: 1080,
    altura: 1080,
    sizes: sizesQueridinho,
  },
  paoDeQueijo: {
    arquivo: "/images/queridinhos/pao-de-queijo.webp",
    alt: "Pães de queijo dourados, recém-saídos do forno, em uma cesta forrada com pano",
    largura: 1080,
    altura: 1080,
    sizes: sizesQueridinho,
  },
  croissantDeManteiga: {
    arquivo: "/images/queridinhos/croissant-de-manteiga.webp",
    alt: "Croissant de manteiga dourado e folhado, partido ao meio sobre prato de cerâmica",
    largura: 1080,
    altura: 1080,
    sizes: sizesQueridinho,
  },
  boloDeCenoura: {
    arquivo: "/images/queridinhos/bolo-de-cenoura.webp",
    alt: "Fatia de bolo de cenoura com cobertura de chocolate escorrendo pela lateral",
    largura: 1080,
    altura: 1080,
    sizes: sizesQueridinho,
  },
  // Faixa promocional em largura total da tela. A foto é 2:1 e aparece cortada em 10:3 (veja Promocao.tsx).
  // O texto promocional entra depois por cima, então a imagem é sem texto.
  promocaoCombo: {
    arquivo: "/images/promocao/combo-cappuccino-pao-de-queijo.webp",
    alt: "Combo de cappuccino com desenho na espuma e cesta de pães de queijo quentinhos, sobre mesa de madeira escura",
    largura: 2000,
    altura: 1000,
    sizes: "100vw",
  },
  ambiente: {
    arquivo: "/images/quem-somos/ambiente.webp",
    alt: "Cantinho aconchegante do café, com mesas de madeira, plantas, prateleira com xícaras e luz quente de janela",
    largura: 1600,
    altura: 1000,
    sizes: "(min-width: 1280px) 740px, (min-width: 768px) 58vw, 92vw",
  },
  // Faixa final de chamada para ação (largura total, texto centralizado por cima; imagem sem texto).
  ctaFinal: {
    arquivo: "/images/cta/mesa-esperando.webp",
    alt: "Fundo desfocado e acolhedor de café, com luz quente e mesa de madeira",
    largura: 2000,
    altura: 1000,
    sizes: "100vw",
  },
  // Ícones dos 3 itens do Quem somos (PNG com fundo transparente, 256 x 256).
  iconeCafe: {
    arquivo: "/images/icones/cafe-coado.png",
    alt: "",
    largura: 256,
    altura: 256,
    sizes: "64px",
  },
  iconeDias: {
    arquivo: "/images/icones/aberto-todos-os-dias.png",
    alt: "",
    largura: 256,
    altura: 256,
    sizes: "64px",
  },
  iconePao: {
    arquivo: "/images/icones/pao-de-queijo.png",
    alt: "",
    largura: 256,
    altura: 256,
    sizes: "64px",
  },
} satisfies Record<string, Imagem>;

// Cor do botão principal do hero em cada foto (muda junto com a troca de imagem), perto do sabor e
// viva o bastante para se destacar do fundo da foto. O texto passa no contraste AA (mínimo 4,5:1):
// chocolate 4,9, caramelo 3,4 (escolha do cliente: mais claro, abaixo do 4,5 recomendado; para passar, use #A8630F) e morango 5,3.
export type HeroFoto = Imagem & { cta: { fundo: string; texto: string } };

// Fotos do hero, na ordem em que se alternam. Paisagem; o produto fica no centro,
// então o corte lateral no celular preserva o copo.
export const heroFotos: HeroFoto[] = [
  {
    arquivo: "/images/hero/chocolate-marrom.webp",
    alt: "Copo de milkshake de chocolate com chantilly e calda escorrendo, sobre fundo marrom",
    largura: 2560,
    altura: 1430,
    sizes: "100vw",
    cta: { fundo: "#8F5C33", texto: "#F6EEE4" },
  },
  {
    arquivo: "/images/hero/caramel.webp",
    alt: "Copo de frappé de caramelo com chantilly, canela e grãos de café, sobre fundo dourado",
    largura: 2560,
    altura: 1429,
    sizes: "100vw",
    cta: { fundo: "#C47A1A", texto: "#FFFFFF" },
  },
  {
    arquivo: "/images/hero/strawberry.webp",
    alt: "Copo de milkshake de morango com chantilly e morangos frescos, sobre fundo rosa",
    largura: 2560,
    altura: 1463,
    sizes: "100vw",
    cta: { fundo: "#C81E52", texto: "#FFF8EF" },
  },
];

export type ChaveImagem = keyof typeof imagens;
