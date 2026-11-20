import "server-only";
import type { EmailMessage, EmailService } from "./email-service";

// Só para desenvolvimento local sem Gmail configurado: mostra o e-mail no terminal do `npm run dev`
// para dar para clicar no link. O texto tem o link com o token, por isso nunca roda na Vercel
// (o env.ts exige as credenciais do Gmail lá).
export class ConsoleEmailService implements EmailService {
  async send({ to, subject, text }: EmailMessage): Promise<void> {
    console.info(
      `\n──── E-mail (não enviado: Gmail não configurado) ────\nPara: ${to}\nAssunto: ${subject}\n\n${text}\n─────────────────────────────────────────────────────\n`,
    );
  }
}
