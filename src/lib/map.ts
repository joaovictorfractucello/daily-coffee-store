import { mapSearchQuery } from "@/lib/address";
import { site } from "@/site.config";

// Só aceita o embed do Google Maps (qualquer outro valor no .env, como outro site ou "javascript:",
// é ignorado em vez de virar um iframe).
function isGoogleEmbed(url: URL) {
  if (url.protocol !== "https:" || url.hostname !== "www.google.com")
    return false;
  return (
    url.pathname.startsWith("/maps/embed") ||
    (url.pathname === "/maps" && url.searchParams.get("output") === "embed")
  );
}

function safeUrl(url: string): string | null {
  if (!url) return null;
  try {
    const parsedUrl = new URL(url);
    return isGoogleEmbed(parsedUrl) ? parsedUrl.toString() : null;
  } catch {
    return null;
  }
}

// Mapa do Google do próprio endereço, sem precisar de chave nem de .env.
const addressMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapSearchQuery)}&z=16&output=embed`;

// Se NEXT_PUBLIC_MAP_EMBED_URL estiver preenchida e for válida, ela vence (útil para um pino exato).
export const mapUrl = safeUrl(site.mapEmbedUrl) ?? addressMapUrl;
