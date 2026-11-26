import "server-only";
import { env } from "@/env";
import { ConsoleEmailService } from "./console-email-service";
import { GmailEmailService } from "./gmail-email-service";

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

// O resto do sistema só conhece esta interface (SPEC §4, "Serviços externos"): trocar o Gmail pelo
// Resend no futuro é escrever outra implementação.
export interface EmailService {
  send(message: EmailMessage): Promise<void>;
}

function createEmailService(): EmailService {
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    return new GmailEmailService(env.GMAIL_USER, env.GMAIL_APP_PASSWORD);
  }
  // Na Vercel o env.ts já exige as credenciais; aqui só chega o desenvolvimento local sem Gmail.
  return new ConsoleEmailService();
}

let emailService: EmailService | undefined;

export function getEmailService(): EmailService {
  emailService ??= createEmailService();
  return emailService;
}
