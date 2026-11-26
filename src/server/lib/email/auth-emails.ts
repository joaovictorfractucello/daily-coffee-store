import "server-only";
import { env } from "@/env";
import { site } from "@/site.config";
import type { EmailMessage } from "./email-service";

// O nome vem do cadastro (dado do usuário): escapado antes de entrar no HTML do e-mail, senão um
// nome como "<a href=...>" viraria um link falso dentro de um e-mail legítimo da loja.
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const appLink = (path: string) => `${env.APP_URL}${path}`;

function buildEmail(
  to: string,
  subject: string,
  paragraphs: string[],
  action: { label: string; url: string },
): EmailMessage {
  const text = [
    ...paragraphs,
    `${action.label}: ${action.url}`,
    `— ${site.name}`,
  ].join("\n\n");
  const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#2b1e17">
${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n")}
<p><a href="${escapeHtml(action.url)}" style="display:inline-block;padding:12px 20px;background:#8b5a33;color:#fff;text-decoration:none;border-radius:8px">${escapeHtml(action.label)}</a></p>
<p style="color:#6b5a4e;font-size:14px">— ${escapeHtml(site.name)}</p>
</div>`;
  return { to, subject, text, html };
}

export function verificationEmail(to: string, name: string, token: string) {
  return buildEmail(
    to,
    `Confirme seu e-mail no ${site.name}`,
    [
      `Olá, ${name}!`,
      "Falta só confirmar seu e-mail para começar a pedir. O link vale por 24 horas.",
      "Se você não criou esta conta, ignore este e-mail.",
    ],
    {
      label: "Confirmar e-mail",
      url: appLink(`/verificar-email?token=${encodeURIComponent(token)}`),
    },
  );
}

// Cadastro com e-mail que já tem conta: a tela responde igual ao cadastro novo (não revela quem
// tem conta) e só o dono do e-mail fica sabendo, por aqui.
export function alreadyRegisteredEmail(to: string, name: string) {
  return buildEmail(
    to,
    `Você já tem conta no ${site.name}`,
    [
      `Olá, ${name}!`,
      "Alguém tentou criar uma conta com este e-mail, mas você já tem uma. Se foi você, é só entrar. Esqueceu a senha? Dá para criar uma nova na tela de login.",
      "Se não foi você, ignore este e-mail: nada mudou na sua conta.",
    ],
    { label: "Entrar", url: appLink("/entrar") },
  );
}
