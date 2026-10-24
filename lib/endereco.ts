import { site } from "@/site.config";

const enderecoCompleto = `${site.endereco.rua}, ${site.endereco.bairro}, ${site.endereco.cidade}, ${site.endereco.estado}`;

// O que o Google Maps procura (mapa da página e botão "Como chegar"). Veja mapaBusca em site.config.ts.
export const buscaDoMapa = site.mapaBusca || enderecoCompleto;
