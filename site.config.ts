// Dados do café. Para usar este projeto com outro cliente, troque os valores deste arquivo.
// Tudo marcado com EXEMPLO precisa ser substituído antes de publicar.

export type DiaDaSemana =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type Horario = {
  // Texto que aparece na página.
  rotulo: string;
  // Dias em inglês porque é o formato do schema.org (dados para o Google).
  dias: DiaDaSemana[];
  // Formato 24h "HH:MM".
  abre: `${number}:${number}`;
  fecha: `${number}:${number}`;
};

export type SiteConfig = {
  nome: string;
  // Endereço final do site, sem barra no fim. Usado nos metadados e no JSON-LD.
  url: `https://${string}`;
  endereco: {
    rua: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  horarios: Horario[];
  instagram: {
    usuario: string;
  };
  whatsapp: {
    // Só dígitos, com DDI e DDD: é o formato que o wa.me aceita.
    numero: string;
    mensagem: string;
    mensagemCombo: string;
  };
  // URL do "Incorporar um mapa" do Google Maps. Vem do .env (veja .env.example).
  mapaEmbedUrl: string;
  // O que o mapa do Google procura. Vazio: usa o endereço completo acima (o certo para um cliente
  // real). Na demonstração o endereço é fictício e o Google não o encontra, então ela busca só o bairro.
  mapaBusca: string;
  // Endereço do cardápio em PDF, aberto numa aba nova (sem baixar). Pode ser um arquivo do
  // próprio site ("/cardapio.pdf", em public/) ou um link completo (ex.: Google Drive no formato
  // "https://drive.google.com/file/d/ID/view", que abre no visualizador do Google sem baixar).
  cardapioPdfUrl: string;
};

export const site: SiteConfig = {
  nome: "Daily Coffee",
  // EXEMPLO: example.com é um domínio reservado para exemplos. Troque pelo domínio do cliente.
  url: "https://www.example.com",
  // EXEMPLO: endereço fictício. A rua é real (para o mapa do Google mostrar a região certa), mas o número
  // 450 foi inventado. Num cliente real, troque por todo o endereço do café.
  endereco: {
    rua: "Rua Capitão Macedo, 450",
    bairro: "Vila Mariana",
    cidade: "São Paulo",
    estado: "SP",
  },
  horarios: [
    {
      rotulo: "Seg a Sex",
      dias: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      abre: "07:00",
      fecha: "19:00",
    },
    {
      rotulo: "Sáb e Dom",
      dias: ["Saturday", "Sunday"],
      abre: "08:00",
      fecha: "18:00",
    },
  ],
  // EXEMPLO: o perfil @dailycoffee pode existir e ser de outra pessoa.
  instagram: {
    usuario: "dailycoffee",
  },
  // EXEMPLO: este número pode ser de uma pessoa real. Troque antes de publicar.
  whatsapp: {
    numero: "5511999999999",
    mensagem: "Oi! Vim pelo site do Daily Coffee.",
    // Mensagem do botão da promoção.
    mensagemCombo: "Oi! Quero o combo de cappuccino com pão de queijo.",
  },
  mapaEmbedUrl: process.env.NEXT_PUBLIC_MAPA_EMBED_URL ?? "",
  // EXEMPLO: só a rua, para o mapa não apontar para um comércio real que tenha o número inventado.
  // Apague (deixe "") num cliente real, para o mapa e o "Como chegar" usarem o endereço completo.
  mapaBusca: "Rua Capitão Macedo, Vila Mariana, São Paulo, SP",
  // EXEMPLO: PDF de demonstração gerado com o cardápio fictício. Troque pelo cardápio real.
  cardapioPdfUrl: "/cardapio.pdf",
};
