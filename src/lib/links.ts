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

export const homeLink = "/";

export const menuLink = "/cardapio";

export const productLink = (slug: string) => `${menuLink}/${slug}`;

export const cartLink = "/carrinho";

export const signInLink = "/entrar";

export const signUpLink = "/cadastro";

export const accountLink = "/conta";

export const accountDataLink = "/conta/dados";

export const accountPasswordLink = "/conta/senha";

export const aboutLink = "/sobre";

export const forgotPasswordLink = "/esqueci-senha";

// Começa o login com o Google (rota da API, aberta como navegação comum, não por fetch).
export const googleSignInLink = (next?: string | null) =>
  next
    ? `/api/auth/google?next=${encodeURIComponent(next)}`
    : "/api/auth/google";

// Para onde o retorno do Google manda quando algo falha: o login mostra o aviso.
export const GOOGLE_ERROR_PARAM = "google";
export const googleSignInFailedPath = `${signInLink}?erro=${GOOGLE_ERROR_PARAM}`;

// Login que volta para a página de origem depois de entrar.
export const signInLinkReturningTo = (path: string) =>
  `${signInLink}?next=${encodeURIComponent(path)}`;

export const instagramLink = `https://www.instagram.com/${site.instagram.username}/`;

// Abre o Google Maps já com o endereço (busca), pronto para traçar a rota.
export const directionsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearchQuery)}`;
