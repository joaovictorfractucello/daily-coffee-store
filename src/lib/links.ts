import { mapSearchQuery } from "@/lib/address";
import { site } from "@/site.config";

export function buildWhatsAppLink(phone: string, message: string) {
  const digitsOnly = phone.replace(/\D/g, "");
  return `https://wa.me/${digitsOnly}?text=${encodeURIComponent(message)}`;
}

export const whatsAppLink = buildWhatsAppLink(
  site.whatsapp.phone,
  site.whatsapp.message,
);

export const comboWhatsAppLink = buildWhatsAppLink(
  site.whatsapp.phone,
  site.whatsapp.comboMessage,
);

export const menuLink = site.menuPdfUrl;

export const instagramLink = `https://www.instagram.com/${site.instagram.username}/`;

// Abre o Google Maps já com o endereço (busca), pronto para traçar a rota.
export const directionsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;
