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

export const images = {
  // Foto da promoção do combo (2:1). Fora da home por enquanto: volta no hero promocional.
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

// TESTE do banner do frappé (hero): fundo e copo em camadas separadas, para o título ficar entre os dois.
// As 3 fotos de `heroPhotos` ficam registradas, mas o hero não as usa por enquanto.
export const frappeHero = {
  background: {
    file: "/images/hero/frappe-fundo.webp",
    alt: "",
    width: 2560,
    height: 1430,
    sizes: "100vw",
  },
  cup: {
    file: "/images/hero/frappe-copo.webp",
    alt: "Frappé de cookies and cream com respingo de creme e biscoitos de chocolate",
    width: 1200,
    height: 1600,
    sizes: "(min-width: 768px) 60svh, 1px",
  },
} satisfies Record<string, ImageAsset>;

export type ImageKey = keyof typeof images;
