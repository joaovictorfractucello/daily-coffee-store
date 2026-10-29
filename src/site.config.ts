// Dados do café. Para usar este projeto com outro cliente, troque os valores deste arquivo.
// Tudo marcado com EXEMPLO precisa ser substituído antes de publicar.

export type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type OpeningHours = {
  // Texto que aparece na página.
  label: string;
  // Dias em inglês porque é o formato do schema.org (dados para o Google).
  days: Weekday[];
  // Formato 24h "HH:MM".
  opensAt: `${number}:${number}`;
  closesAt: `${number}:${number}`;
};

export type SiteConfig = {
  name: string;
  // Endereço final do site, sem barra no fim. Usado nos metadados e no JSON-LD.
  url: `https://${string}`;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  openingHours: OpeningHours[];
  instagram: {
    username: string;
  };
  whatsapp: {
    // Só dígitos, com DDI e DDD: é o formato que o wa.me aceita.
    phone: string;
    message: string;
    comboMessage: string;
  };
  // URL do "Incorporar um mapa" do Google Maps. Vem do .env (veja .env.example).
  mapEmbedUrl: string;
  // O que o mapa do Google procura. Vazio: usa o endereço completo acima (o certo para um cliente
  // real). Na demonstração o endereço é fictício e o Google não o encontra, então ela busca só o bairro.
  mapSearch: string;
  // Endereço do cardápio em PDF, aberto numa aba nova (sem baixar). Pode ser um arquivo do
  // próprio site ("/cardapio.pdf", em public/) ou um link completo (ex.: Google Drive no formato
  // "https://drive.google.com/file/d/ID/view", que abre no visualizador do Google sem baixar).
  menuPdfUrl: string;
};

export const site: SiteConfig = {
  name: "Daily Coffee",
  url: "https://daily-coffee-store.vercel.app",
  // EXEMPLO: endereço fictício. A rua é real (para o mapa do Google mostrar a região certa), mas o número
  // 450 foi inventado. Num cliente real, troque por todo o endereço do café.
  address: {
    street: "Rua Capitão Macedo, 450",
    neighborhood: "Vila Mariana",
    city: "São Paulo",
    state: "SP",
  },
  openingHours: [
    {
      label: "Seg a Sex",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opensAt: "07:00",
      closesAt: "19:00",
    },
    {
      label: "Sáb e Dom",
      days: ["Saturday", "Sunday"],
      opensAt: "08:00",
      closesAt: "18:00",
    },
  ],
  // EXEMPLO: o perfil @dailycoffee pode existir e ser de outra pessoa.
  instagram: {
    username: "dailycoffee",
  },
  // EXEMPLO: este número pode ser de uma pessoa real. Troque antes de publicar.
  whatsapp: {
    phone: "5511999999999",
    message: "Oi! Vim pelo site do Daily Coffee.",
    // Mensagem do botão da promoção.
    comboMessage: "Oi! Quero o combo de cappuccino com pão de queijo.",
  },
  mapEmbedUrl: process.env.NEXT_PUBLIC_MAP_EMBED_URL ?? "",
  // EXEMPLO: só a rua, para o mapa não apontar para um comércio real que tenha o número inventado.
  // Apague (deixe "") num cliente real, para o mapa e o "Como chegar" usarem o endereço completo.
  mapSearch: "Rua Capitão Macedo, Vila Mariana, São Paulo, SP",
  // EXEMPLO: PDF de demonstração gerado com o cardápio fictício. Troque pelo cardápio real.
  menuPdfUrl: "/cardapio.pdf",
};
