import { site } from "@/site.config";

const fullAddress = `${site.address.street}, ${site.address.neighborhood}, ${site.address.city}, ${site.address.state}`;

// O que o Google Maps procura (mapa da página e botão "Como chegar"). Veja mapSearch em site.config.ts.
export const mapSearchQuery = site.mapSearch || fullAddress;
