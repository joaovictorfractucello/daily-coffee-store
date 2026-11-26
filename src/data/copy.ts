// Todos os textos da página. Para mudar uma frase, mexa só aqui.

import {
  categoryLabels,
  categoryOrder,
  menuCategoryLink,
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
  href: menuCategoryLink(category),
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
  basketWithCount: (units: number) =>
    units === 0
      ? "Carrinho, vazio"
      : `Carrinho, ${units} ${units === 1 ? "item" : "itens"}`,
  comingSoon: "Em breve",
  greeting: (firstName: string) => `Olá, ${firstName}`,
};

export const authCopy = {
  backToStore: "Voltar para a loja",
  emailLabel: "E-mail",
  passwordLabel: "Senha",
  nameLabel: "Nome",
  emailPlaceholder: "seu@email.com",
  passwordPlaceholder: "Digite sua senha",
  newPasswordPlaceholder: "Crie uma senha",
  namePlaceholder: "Como podemos te chamar?",
  showPassword: "Mostrar senha",
  hidePassword: "Esconder senha",
  required: "obrigatório",
  emailRequired: "Digite seu e-mail.",
  invalidEmail: "Digite um e-mail válido, como nome@email.com.",
  newPasswordRequired: "Crie uma senha.",
  continueWithGoogle: "Continuar com o Google",
  or: "ou",
  googleFailed:
    "Não foi possível entrar com o Google. Tente de novo ou use e-mail e senha.",
  confirmPasswordLabel: "Repita a senha",
  confirmPasswordPlaceholder: "Digite a senha de novo",
  confirmPasswordRequired: "Repita a senha.",
  passwordsDontMatch: "As senhas não são iguais.",
  nameTooShort: "Digite seu nome.",
  passwordRequired: "Digite sua senha.",
  passwordTooShort: (min: number) =>
    `A senha precisa ter pelo menos ${min} caracteres.`,
  passwordTooLong: (max: number) =>
    `A senha pode ter no máximo ${max} caracteres.`,
  passwordBreached:
    "Essa senha já apareceu em vazamentos de dados. Escolha outra.",
  genericError: "Não foi possível concluir agora. Tente de novo em instantes.",
  rateLimited: (minutes: number) =>
    `Muitas tentativas. Tente de novo em ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.`,

  signIn: {
    metaTitle: "Entrar",
    title: "Entrar",
    subtitle: "Entre para pedir seu café e acompanhar seus pedidos.",
    submit: "Entrar",
    submitting: "Entrando...",
    invalidCredentials: "E-mail ou senha incorretos. Confira e tente de novo.",
    notVerified:
      "Confirme seu e-mail para entrar. Enviamos um link quando você se cadastrou.",
    resend: "Reenviar link",
    resent:
      "Se houver uma conta aguardando confirmação, enviamos um novo link.",
    noAccount: "Ainda não tem conta?",
    createAccount: "Criar conta",
    forgotPassword: "Esqueci minha senha",
  },

  signUp: {
    metaTitle: "Criar conta",
    title: "Criar uma conta",
    subtitle: "Crie sua conta em menos de um minuto e peça pelo site.",
    submit: "Criar minha conta",
    submitting: "Criando...",
    sentTitle: "Quase lá! Confira seu e-mail",
    sentText: (email: string) =>
      `Enviamos um link para ${email}. Abra o e-mail e confirme para entrar. Não chegou? Veja o spam.`,
    hasAccount: "Já tem conta?",
    signIn: "Entrar",
  },

  verifyEmail: {
    metaTitle: "Confirmar e-mail",
    title: "Só falta confirmar",
    text: "Toque no botão abaixo para confirmar seu e-mail e ativar sua conta.",
    submit: "Confirmar e-mail",
    submitting: "Confirmando...",
    successTitle: "E-mail confirmado!",
    successText: "Sua conta está pronta. Agora é só entrar.",
    invalid:
      "Este link é inválido, já foi usado ou expirou. Tente entrar: se o e-mail ainda não estiver confirmado, dá para pedir um link novo.",
    missingToken: "O link está incompleto. Abra de novo o link do e-mail.",
    goToSignIn: "Ir para o login",
  },

  forgotPassword: {
    metaTitle: "Esqueci minha senha",
    title: "Esqueceu a senha?",
    subtitle:
      "Acontece. Digite seu e-mail e enviamos um link para você criar uma nova.",
    submit: "Enviar link",
    submitting: "Enviando...",
    sentTitle: "Confira seu e-mail",
    sentText: (email: string) =>
      `Se existir uma conta com ${email}, enviamos um link para criar uma nova senha. Ele vale por 30 minutos. Não chegou? Veja o spam.`,
    backToSignIn: "Voltar para o login",
  },

  resetPassword: {
    metaTitle: "Criar nova senha",
    title: "Crie uma nova senha",
    subtitle:
      "Ao salvar, você sai de todos os aparelhos e entra de novo com ela.",
    newPasswordLabel: "Nova senha",
    submit: "Salvar nova senha",
    submitting: "Salvando...",
    successTitle: "Senha alterada!",
    successText: "Pronto. Agora é só entrar com a senha nova.",
    invalid:
      "Este link é inválido, já foi usado ou expirou. Peça um novo na tela de login, em “Esqueci minha senha”.",
    missingToken: "O link está incompleto. Abra de novo o link do e-mail.",
    requestNewLink: "Pedir novo link",
    goToSignIn: "Ir para o login",
  },

  account: {
    metaTitle: "Minha conta",
    title: "Minha conta",
    greeting: (firstName: string) => `Olá, ${firstName}`,
    memberSince: (monthAndYear: string) => `Cliente desde ${monthAndYear}`,
    menuTitle: "Sua conta",
    personalData: "Dados pessoais",
    orders: "Meus pedidos",
    addresses: "Endereços",
    about: "Sobre a Daily Coffee",
    comingSoon: "Em breve",
    noOrdersTitle: "Seu primeiro café está a um toque",
    noOrdersText: "Você ainda não fez pedidos.",
    seeMenu: "Ver cardápio",
    signOut: "Sair da conta",
    signingOut: "Saindo...",
    backToAccount: "Voltar para a conta",
    data: {
      metaTitle: "Dados pessoais",
      title: "Dados pessoais",
      yourData: "Seus dados",
      name: "Nome",
      email: "E-mail",
      signInMethods: "Formas de entrar",
      google: "Google",
      password: "Senha",
      connected: "Conectado",
      notConnected: "Não conectado",
      defined: "Definida",
      notDefined: "Não definida",
      changePassword: "Alterar senha",
      createPassword: "Criar senha",
      editSoon: "Em breve dá para editar seus dados por aqui.",
      signInMethodsHint: "Como você acessa a sua conta.",
    },
    password: {
      metaTitle: "Alterar senha",
      title: "Alterar senha",
      intro:
        "Por segurança, confirme a senha atual. Depois da troca, os outros aparelhos saem da conta.",
      currentLabel: "Senha atual",
      currentPlaceholder: "Digite a senha atual",
      newLabel: "Nova senha",
      forgotCurrent: "Esqueci a senha atual",
      submit: "Salvar nova senha",
      submitting: "Salvando...",
      invalidCurrent: "A senha atual não confere.",
      notSet:
        "Sua conta entra só pelo Google. Para criar uma senha, use o link que enviamos por e-mail.",
      doneTitle: "Senha alterada",
      doneText:
        "Pronto! Os outros aparelhos saíram da conta e enviamos um aviso para o seu e-mail.",
      backToData: "Voltar para os dados",
    },
  },
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
  productSlug: "frappe-de-oreo",
};

// TESTE do segundo banner promocional: torta de limão (mesma composição do frappé).
export const tartPromo = {
  title: ["Torta", "de Limão"],
  ghostWord: "Limão",
  text: "Massa amanteigada, creme cítrico de limão e merengue maçaricado na hora.",
  button: "Pedir a Torta",
  productSlug: "torta-de-limao",
};

// TESTE do terceiro banner promocional: cold brew.
export const coldBrewPromo = {
  title: ["Cold", "Brew"],
  ghostWord: "Brew",
  text: "Extraído a frio por 16 horas. Menos ácido, mais doce.",
  button: "Pedir o Cold Brew",
  productSlug: "cold-brew",
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
  breadcrumbHome: "Início",
  description:
    "Cafés, bebidas geladas, salgados e doces feitos para comer com calma.",
};

export const errorPage = {
  title: "Ops, algo deu errado",
  text: "Não conseguimos carregar esta página. Tente de novo em instantes.",
  retry: "Tentar de novo",
  backHome: "Voltar ao início",
};

export const notFoundPage = {
  metaTitle: "Página não encontrada",
  title: "Essa página se perdeu",
  text: "O link pode estar errado ou a página mudou de lugar.",
  seeMenu: "Ver cardápio",
  backHome: "Voltar ao início",
};

export const searchResults = {
  title: (term: string) => `Resultados para “${term}”`,
  count: (total: number) =>
    total === 1 ? "1 produto encontrado" : `${total} produtos encontrados`,
  empty: (term: string) => `Nenhum produto encontrado para “${term}”.`,
  seeFullMenu: "Ver cardápio completo",
};

export const productPage = {
  quantity: "Quantidade",
  decreaseQuantity: "Diminuir quantidade",
  increaseQuantity: "Aumentar quantidade",
  addToCart: "Adicionar ao carrinho",
  added: "Adicionado ao carrinho",
  limitReached: "Limite de 99 por item",
  buyNow: "Comprar agora",
  descriptionTitle: "Descrição",
  relatedTitle: "Produtos relacionados",
  seeCategory: (categoryName: string) => `Ver ${categoryName}`,
};

export const deliveryCopy = {
  cepLabel: "CEP",
  cepPlaceholder: "00000-000",
  cepInvalid: "Digite um CEP com 8 números.",
  cepNotFound: "Não encontramos esse CEP.",
  cepUnavailable: "Não foi possível consultar o CEP agora. Tente de novo.",
  looking: "Consultando o CEP...",
  available: (city: string, fee: string) => `Entregamos em ${city}: ${fee}`,
  unavailable: (city: string) =>
    `Ainda não entregamos em ${city}. Você pode retirar no balcão.`,
  calculateTitle: "Calcular entrega",
  calculate: "Calcular",
  calculating: "Calculando...",
  deliveryTo: (cep: string) => `Entrega em ${cep}`,
  openCalculator: "Calcular entrega",
  change: "trocar",
  changeLabel: "Trocar o CEP da entrega",
  estimatedTotal: "Total estimado",
  pickupNote: "Retirada no balcão: sem taxa.",
};

export const addressesCopy = {
  metaTitle: "Endereços",
  title: "Endereços",
  intro: "Onde você recebe seus pedidos. Entregamos em São Paulo e no ABC.",
  add: "Adicionar endereço",
  emptyTitle: "Nenhum endereço salvo",
  emptyText: "Cadastre onde você quer receber seu café.",
  default: "Padrão",
  deliveryFee: (fee: string) => `Entrega: ${fee}`,
  labels: { HOME: "Casa", WORK: "Trabalho", OTHER: "Outro" },
  labelLegend: "Salvar como",
  customLabelLabel: "Nome do endereço",
  customLabelPlaceholder: "Casa da mãe, academia (opcional)",
  actions: (title: string) => `Ações do endereço ${title}`,
  edit: "Editar",
  makeDefault: "Tornar padrão",
  remove: "Apagar",
  confirmRemove: "Apagar este endereço?",
  confirmYes: "Sim, apagar",
  confirmNo: "Cancelar",
  limitReached: "Você chegou ao limite de 10 endereços.",
  backToAddresses: "Voltar para os endereços",
  newTitle: "Novo endereço",
  editTitle: "Editar endereço",
  streetLabel: "Rua",
  streetPlaceholder: "Nome da rua",
  numberLabel: "Número",
  numberPlaceholder: "123",
  complementLabel: "Complemento",
  complementPlaceholder: "Apto, bloco (opcional)",
  neighborhoodLabel: "Bairro",
  neighborhoodPlaceholder: "Seu bairro",
  cityLabel: "Cidade",
  required: (label: string) => `Preencha ${label.toLowerCase()}.`,
  tooLong: (max: number) => `Use no máximo ${max} caracteres.`,
  save: "Salvar endereço",
  saving: "Salvando...",
  outOfArea: "Ainda não entregamos nessa cidade. Você pode retirar no balcão.",
  genericError: "Não foi possível salvar agora. Tente de novo em instantes.",
  rateLimited: (minutes: number) =>
    `Muitas tentativas. Tente de novo em ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.`,
};

export const cartPage = {
  title: "Carrinho",
  metaTitle: "Carrinho | Daily Coffee",
  loading: "Carregando o carrinho",
  emptyTitle: "Seu carrinho está vazio",
  emptyText: "Escolha um café, um salgado ou um doce no cardápio.",
  seeMenu: "Ver cardápio",
  unitPrice: (price: string) => `${price} cada`,
  remove: (productName: string) => `Remover ${productName} do carrinho`,
  quantityOf: (productName: string) => `Quantidade de ${productName}`,
  summaryTitle: "Resumo do pedido",
  subtotal: "Subtotal",
  delivery: "Entrega",
  deliveryUnavailable: "Indisponível",
  total: "Total",
  deliveryNote: "Entrega ou retirada você escolhe ao finalizar.",
  checkout: "Finalizar pedido",
  continueShopping: "Continuar comprando",
  comingSoon: "Em breve",
  unavailable:
    "Alguns produtos não estão mais disponíveis e saíram do carrinho.",
  error: "Não foi possível carregar o carrinho.",
  retry: "Tentar de novo",
  itemCount: (units: number) => (units === 1 ? "1 item" : `${units} itens`),
};
