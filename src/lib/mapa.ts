import { buscaDoMapa } from "@/lib/endereco";
import { site } from "@/site.config";

// Só aceita o embed do Google Maps (qualquer outro valor no .env, como outro site ou "javascript:",
// é ignorado em vez de virar um iframe).
function ehEmbedDoGoogle(url: URL) {
  if (url.protocol !== "https:" || url.hostname !== "www.google.com") return false;
  return url.pathname.startsWith("/maps/embed") || (url.pathname === "/maps" && url.searchParams.get("output") === "embed");
}

function urlSegura(url: string): string | null {
  if (!url) return null;
  try {
    const endereco = new URL(url);
    return ehEmbedDoGoogle(endereco) ? endereco.toString() : null;
  } catch {
    return null;
  }
}

// Mapa do Google do próprio endereço, sem precisar de chave nem de .env.
const mapaDoEndereco = `https://www.google.com/maps?q=${encodeURIComponent(buscaDoMapa)}&z=16&output=embed`;

// Se NEXT_PUBLIC_MAPA_EMBED_URL estiver preenchida e for válida, ela vence (útil para um pino exato).
export const urlMapa = urlSegura(site.mapaEmbedUrl) ?? mapaDoEndereco;
