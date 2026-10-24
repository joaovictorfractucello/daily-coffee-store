// Todos os textos da página. Para mudar uma frase, mexa só aqui.

// Um rótulo por intenção: o pedido geral é sempre "Pedir no WhatsApp" (cabeçalho, hero, menu e barra
// fixa), o cardápio é sempre "Ver cardápio". A promoção e a faixa final têm rótulo próprio
// (veja `promocao.botao` e `ctaFinal.botao`) porque a intenção delas é outra.
export const rotulos = {
  whatsapp: "Pedir no WhatsApp",
  cardapio: "Ver cardápio",
  abreWhatsApp: "(abre o WhatsApp)",
  abreInstagram: "(abre o Instagram)",
  abreCardapio: "(abre o cardápio em PDF)",
  pularParaConteudo: "Pular para o conteúdo",
  abrirMenu: "Abrir menu",
  fecharMenu: "Fechar menu",
  voltarAoInicio: "voltar ao início",
};

export const navegacao = [
  // "Cardápio" leva à primeira seção (os queridinhos); o PDF abre pelos botões "Ver cardápio".
  { rotulo: "Cardápio", href: "#queridinhos" },
  { rotulo: "Quem somos", href: "#quem-somos" },
  { rotulo: "Localização", href: "#visitar" },
] as const;

export const seo = {
  titulo: "Daily Coffee | Cafeteria em São Paulo",
  descricao:
    "Café coado na hora, pão de queijo saindo do forno e mesa para ficar com calma. Na Rua das Acácias, 128, Vila Mariana, São Paulo.",
};

export const hero = {
  linhaTopo: "Daily Coffee",
  // Cada item é uma linha, no desktop e no celular.
  titulo: ["Seu café", "de todo dia"],
  // No celular, cada frase fica numa linha.
  linhaBase: ["Coado na hora.", "Servido com calma"],
};

export const queridinhosTextos = {
  titulo: "Mais pedidos",
};

export const promocao = {
  // Cada item é uma linha do título.
  titulo: ["Cappuccino", "com pão de queijo"],
  descricao: "O par favorito da casa: cappuccino cremoso e pão de queijo quentinho, juntos por",
  // Em reais. EXEMPLO (café fictício): troque pelo preço real do combo.
  preco: 22,
  botao: "Pedir o combo",
};

export const ctaFinal = {
  titulo: "Sua mesa está esperando",
  texto: "Passe aqui para um café ou peça pelo WhatsApp.",
  botao: "Fazer meu pedido",
};

export const quemSomos = {
  titulo: "Quem Somos",
  paragrafos: [
    "O Daily Coffee nasceu para fazer do café da manhã e da tarde uma pausa boa. Nossa missão é servir um café bem feito, coado na hora e sem pressa. Nossos valores são simples: grãos escolhidos com cuidado, ingredientes frescos e um atendimento próximo, de vizinho.",
    "Aqui o ambiente é caloroso e aconchegante: mesas de madeira, parede de tijolo, plantas na janela e a luz amarela das lâmpadas. É um lugar para ler, conversar ou só descansar. Escolha o seu canto e fique o tempo que quiser.",
  ],
  // Os 3 itens em linha embaixo do texto (ocupam o lugar da antiga faixa escura).
  fatos: [
    { titulo: "Café coado na hora", texto: "Cada xícara é feita no momento do pedido.", icone: "iconeCafe" },
    { titulo: "Aberto todos os dias", texto: "Da manhã ao fim da tarde, sem pressa.", icone: "iconeDias" },
    { titulo: "Pão de queijo saindo do forno", texto: "Fornadas pequenas ao longo do dia.", icone: "iconePao" },
  ] as const,
};

export const visitar = {
  titulo: "Venha nos visitar",
  rotuloEndereco: "Endereço",
  rotuloHorario: "Horário",
  comoChegar: "Como chegar",
  abrirMapa: "Abrir o mapa no Google Maps",
  abreMapa: "(abre o Google Maps)",
  tituloMapa: "Mapa com a localização do Daily Coffee",
};

export const rodape = {
  descricao: "Café coado na hora, pão de queijo quentinho e mesa para ficar com calma.",
  tituloNavegacao: "Navegação",
  tituloHorario: "Horário",
  tituloContato: "Contato",
  direitos: "Todos os direitos reservados.",
};
