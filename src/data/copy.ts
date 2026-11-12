// Todos os textos da página. Para mudar uma frase, mexa só aqui.

import { site } from "@/site.config";

// Um rótulo por intenção: o pedido geral é sempre "Pedir no WhatsApp" (cabeçalho, hero, menu e barra
// fixa), o cardápio é sempre "Ver cardápio". A promoção e a faixa final têm rótulo próprio
// (veja `promotion.button` e `finalCta.button`) porque a intenção delas é outra.
export const labels = {
  whatsapp: "Pedir no WhatsApp",
  menu: "Ver cardápio",
  opensWhatsApp: "(abre o WhatsApp)",
  opensInstagram: "(abre o Instagram)",
  opensMenuPdf: "(abre o cardápio em PDF)",
  skipToContent: "Pular para o conteúdo",
  openMenu: "Abrir menu",
  closeMenu: "Fechar menu",
  backToTop: "voltar ao início",
};

export const navigation = [
  // "Cardápio" leva à primeira seção (os queridinhos); o PDF abre pelos botões "Ver cardápio".
  { label: "Cardápio", href: "#queridinhos" },
  { label: "Quem somos", href: "#quem-somos" },
  { label: "Localização", href: "#visitar" },
] as const;

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

export const finalCta = {
  title: "Sua mesa está esperando",
  text: "Passe aqui para um café ou peça pelo WhatsApp.",
  button: "Fazer meu pedido",
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
