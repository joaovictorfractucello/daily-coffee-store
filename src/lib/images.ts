// Registro de todos os espaços de imagem do site. Cada foto aparece sozinha quando o arquivo
// existir em public/ com o caminho abaixo (veja IMAGENS.md). Se a foto mudar, ajuste o alt.

export type ImageAsset = {
  // Caminho a partir de public/.
  file: `/images/${string}.${"webp" | "jpg" | "png"}`;
  alt: string;
  width: number;
  height: number;
  // Largura que a foto ocupa na tela, para o navegador baixar o tamanho certo.
  sizes: string;
};

const favoriteSizes =
  "(min-width: 1280px) 380px, (min-width: 768px) 30vw, 92vw";

export const images = {
  creamyCappuccino: {
    file: "/images/queridinhos/cappuccino-cremoso.webp",
    alt: "Cappuccino com desenho de folha na espuma, em xícara de cerâmica sobre mesa de madeira",
    width: 1080,
    height: 1080,
    sizes: favoriteSizes,
  },
  chocolateFrappe: {
    file: "/images/queridinhos/frappe-de-chocolate.webp",
    alt: "Frappé de chocolate com chantilly e calda escorrendo, em copo transparente com tampa de domo",
    width: 1080,
    height: 1080,
    sizes: favoriteSizes,
  },
  cheeseBread: {
    file: "/images/queridinhos/pao-de-queijo.webp",
    alt: "Pães de queijo dourados, recém-saídos do forno, em uma cesta forrada com pano",
    width: 1080,
    height: 1080,
    sizes: favoriteSizes,
  },
  butterCroissant: {
    file: "/images/queridinhos/croissant-de-manteiga.webp",
    alt: "Croissant de manteiga dourado e folhado, partido ao meio sobre prato de cerâmica",
    width: 1080,
    height: 1080,
    sizes: favoriteSizes,
  },
  carrotCake: {
    file: "/images/queridinhos/bolo-de-cenoura.webp",
    alt: "Fatia de bolo de cenoura com cobertura de chocolate escorrendo pela lateral",
    width: 1080,
    height: 1080,
    sizes: favoriteSizes,
  },
  // Faixa promocional em largura total da tela. A foto é 2:1 e aparece cortada em 10:3 (veja Promotion.tsx).
  // O texto promocional entra depois por cima, então a imagem é sem texto.
  promotionCombo: {
    file: "/images/promocao/combo-cappuccino-pao-de-queijo.webp",
    alt: "Combo de cappuccino com desenho na espuma e cesta de pães de queijo quentinhos, sobre mesa de madeira escura",
    width: 2000,
    height: 1000,
    sizes: "100vw",
  },
  ambience: {
    file: "/images/quem-somos/ambiente.webp",
    alt: "Cantinho aconchegante do café, com mesas de madeira, plantas, prateleira com xícaras e luz quente de janela",
    width: 1600,
    height: 1000,
    sizes: "(min-width: 1280px) 740px, (min-width: 768px) 58vw, 92vw",
  },
  // Faixa final de chamada para ação (largura total, texto centralizado por cima; imagem sem texto).
  finalCta: {
    file: "/images/cta/mesa-esperando.webp",
    alt: "Fundo desfocado e acolhedor de café, com luz quente e mesa de madeira",
    width: 2000,
    height: 1000,
    sizes: "100vw",
  },
  // Ícones dos 3 itens do Quem somos (PNG com fundo transparente, 256 x 256).
  coffeeIcon: {
    file: "/images/icones/cafe-coado.png",
    alt: "",
    width: 256,
    height: 256,
    sizes: "64px",
  },
  daysIcon: {
    file: "/images/icones/aberto-todos-os-dias.png",
    alt: "",
    width: 256,
    height: 256,
    sizes: "64px",
  },
  breadIcon: {
    file: "/images/icones/pao-de-queijo.png",
    alt: "",
    width: 256,
    height: 256,
    sizes: "64px",
  },
} satisfies Record<string, ImageAsset>;

// Cor do botão principal do hero em cada foto (muda junto com a troca de imagem), perto do sabor e
// viva o bastante para se destacar do fundo da foto. O texto passa no contraste AA (mínimo 4,5:1):
// chocolate 4,9, caramelo 3,4 (escolha do cliente: mais claro, abaixo do 4,5 recomendado; para passar, use #A8630F) e morango 5,3.
export type HeroPhoto = ImageAsset & {
  cta: { background: string; text: string };
};

// Fotos do hero, na ordem em que se alternam. Paisagem; o produto fica no centro,
// então o corte lateral no celular preserva o copo.
export const heroPhotos: HeroPhoto[] = [
  {
    file: "/images/hero/chocolate-marrom.webp",
    alt: "Copo de milkshake de chocolate com chantilly e calda escorrendo, sobre fundo marrom",
    width: 2560,
    height: 1430,
    sizes: "100vw",
    cta: { background: "#8F5C33", text: "#F6EEE4" },
  },
  {
    file: "/images/hero/caramel.webp",
    alt: "Copo de frappé de caramelo com chantilly, canela e grãos de café, sobre fundo dourado",
    width: 2560,
    height: 1429,
    sizes: "100vw",
    cta: { background: "#C47A1A", text: "#FFFFFF" },
  },
  {
    file: "/images/hero/strawberry.webp",
    alt: "Copo de milkshake de morango com chantilly e morangos frescos, sobre fundo rosa",
    width: 2560,
    height: 1463,
    sizes: "100vw",
    cta: { background: "#C81E52", text: "#FFF8EF" },
  },
];

export type ImageKey = keyof typeof images;
