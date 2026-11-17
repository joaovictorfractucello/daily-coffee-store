// Todos os textos da página. Para mudar uma frase, mexa só aqui.

import {
  categoryAnchors,
  categoryLabels,
  categoryOrder,
} from "@/lib/product-categories";
import { menuLink } from "@/lib/links";
import { site } from "@/site.config";

// Um rótulo por intenção: o pedido geral é sempre "Pedir no WhatsApp" (cabeçalho, hero, menu e barra
// fixa), o cardápio é sempre "Ver cardápio". A promoção tem rótulo próprio (`promotion.button`)
// porque a intenção dela é outra.
export const labels = {
  whatsapp: "Pedir no WhatsApp",
  menu: "Ver cardápio",
  opensWhatsApp: "(abre o WhatsApp)",
  opensInstagram: "(abre o Instagram)",
  skipToContent: "Pular para o conteúdo",
  backToTop: "voltar ao início",
};

export type NavigationChild = { label: string; href: string };

export type NavigationLink = {
  label: string;
  href: string;
  children?: NavigationChild[];
};

const categoryLinks: NavigationChild[] = categoryOrder.map((category) => ({
  label: categoryLabels[category],
  href: `${menuLink}#${categoryAnchors[category]}`,
}));

export const navigation: NavigationLink[] = [
  { label: "Cardápio", href: menuLink, children: categoryLinks },
  { label: "Sobre nós", href: "/sobre#quem-somos" },
  { label: "Localização", href: "/sobre#visitar" },
];

export const headerCopy = {
  mainNavigation: "Principal",
  searchLabel: "Buscar produtos",
  searchPlaceholder: "Cafés, Salgados, Doces...",
  openSearch: "Abrir busca",
  submitSearch: "Buscar produtos",
  closeSearch: "Fechar busca",
  profile: "Minha conta",
  signIn: "Entrar",
  signUp: "Cadastrar",
  basket: "Carrinho",
  comingSoon: "Em breve",
};

export const bottomNavCopy = {
  label: "Navegação do celular",
  home: "Início",
  menu: "Cardápio",
  orders: "Pedidos",
  profile: "Perfil",
  comingSoon: "Em breve",
};

export const seo = {
  title: "Daily Coffee | Cafeteria em São Paulo",
  description: `Café coado na hora, pão de queijo saindo do forno e mesa para ficar com calma. Na ${site.address.street}, ${site.address.neighborhood}, ${site.address.city}.`,
};

export const hero = {
  topLine: "Daily Coffee",
  // Cada item é uma linha, no desktop e no celular.
  title: ["Seu café", "de todo dia"],
  // No celular, cada frase fica numa linha.
  baseLine: ["Coado na hora.", "Servido com calma"],
};

// TESTE do hero promocional do frappé (substitui `hero` por enquanto).
export const heroPromo = {
  // Cada item é uma linha do título.
  title: ["Frappé", "de Oreo"],
  // Palavra gigante e apagada atrás do copo (decorativa, no desktop).
  ghostWord: "Frappé",
  text: "Gelado, cremoso e cheio de pedaços de biscoito, coberto com chantilly e calda de chocolate.",
  button: "Pedir o Frappé",
  productName: "Frappé de Oreo",
};

// TESTE do segundo banner promocional: torta de limão (mesma composição do frappé).
export const tartPromo = {
  title: ["Torta", "de Limão"],
  ghostWord: "Limão",
  text: "Massa amanteigada, creme cítrico de limão e merengue maçaricado na hora.",
  button: "Pedir a Torta",
  productName: "Torta de limão",
};

// TESTE do terceiro banner promocional: cold brew.
export const coldBrewPromo = {
  title: ["Cold", "Brew"],
  ghostWord: "Brew",
  text: "Extraído a frio por 16 horas. Menos ácido, mais doce.",
  button: "Pedir o Cold Brew",
  productName: "Cold brew",
};

export const heroCopy = {
  dotsLabel: "Fotos de destaque",
  showPhoto: (position: number) => `Mostrar foto ${position}`,
};

export const categoriesCopy = {
  title: "Categorias do cardápio",
};

export const favoritesCopy = {
  title: "Mais pedidos",
};

export const promotion = {
  // Cada item é uma linha do título.
  title: ["Cappuccino", "com pão de queijo"],
  description:
    "O par favorito da casa: cappuccino cremoso e pão de queijo quentinho, juntos por",
  // EXEMPLO (café fictício): troque pelo preço real do combo.
  priceInCents: 2200,
  button: "Pedir o combo",
};

export const aboutUs = {
  title: "Quem Somos",
  paragraphs: [
    "O Daily Coffee nasceu para fazer do café da manhã e da tarde uma pausa boa. Nossa missão é servir um café bem feito, coado na hora e sem pressa. Nossos valores são simples: grãos escolhidos com cuidado, ingredientes frescos e um atendimento próximo, de vizinho.",
    "Aqui o ambiente é caloroso e aconchegante: mesas de madeira, parede de tijolo, plantas na janela e a luz amarela das lâmpadas. É um lugar para ler, conversar ou só descansar. Escolha o seu canto e fique o tempo que quiser.",
  ],
  // Os 3 itens em linha embaixo do texto (ocupam o lugar da antiga faixa escura).
  facts: [
    {
      title: "Café coado na hora",
      text: "Cada xícara é feita no momento do pedido.",
      icon: "coffeeIcon",
    },
    {
      title: "Aberto todos os dias",
      text: "Da manhã ao fim da tarde, sem pressa.",
      icon: "daysIcon",
    },
    {
      title: "Pão de queijo saindo do forno",
      text: "Fornadas pequenas ao longo do dia.",
      icon: "breadIcon",
    },
  ] as const,
};

export const visit = {
  title: "Venha nos visitar",
  addressLabel: "Endereço",
  hoursLabel: "Horário",
  directions: "Como chegar",
  openMap: "Abrir o mapa no Google Maps",
  opensMap: "(abre o Google Maps)",
  mapTitle: "Mapa com a localização do Daily Coffee",
};

export const footer = {
  description:
    "Café coado na hora, pão de queijo quentinho e mesa para ficar com calma.",
  navigationTitle: "Navegação",
  hoursTitle: "Horário",
  contactTitle: "Contato",
  rights: "Todos os direitos reservados.",
};

export const aboutPage = {
  metaTitle: "Sobre nós | Daily Coffee",
  title: "Sobre o Daily Coffee",
  description:
    "Conheça o Daily Coffee: nossa história, o ambiente, o endereço e o horário de funcionamento.",
};

export const menuPage = {
  metaTitle: "Cardápio | Daily Coffee",
  title: "Cardápio",
  description:
    "Cafés, bebidas geladas, salgados e doces feitos para comer com calma.",
};

export const searchResults = {
  title: (term: string) => `Resultados para “${term}”`,
  count: (total: number) =>
    total === 1 ? "1 produto encontrado" : `${total} produtos encontrados`,
  empty: (term: string) => `Nenhum produto encontrado para “${term}”.`,
  seeFullMenu: "Ver cardápio completo",
};

export const productPage = {
  backToMenu: "Voltar ao cardápio",
  whatsAppMessage: (productName: string) => `Oi! Quero pedir: ${productName}.`,
};
