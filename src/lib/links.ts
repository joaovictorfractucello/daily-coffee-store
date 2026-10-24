import { buscaDoMapa } from "@/lib/endereco";
import { site } from "@/site.config";

export function linkWhatsApp(numero: string, mensagem: string) {
  const soDigitos = numero.replace(/\D/g, "");
  return `https://wa.me/${soDigitos}?text=${encodeURIComponent(mensagem)}`;
}

export const linkWhatsAppCafe = linkWhatsApp(
  site.whatsapp.numero,
  site.whatsapp.mensagem,
);

export const linkWhatsAppCombo = linkWhatsApp(
  site.whatsapp.numero,
  site.whatsapp.mensagemCombo,
);

export const linkCardapio = site.cardapioPdfUrl;

export const linkInstagram = `https://www.instagram.com/${site.instagram.usuario}/`;

// Abre o Google Maps já com o endereço (busca), pronto para traçar a rota.
export const linkComoChegar = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buscaDoMapa)}`;
