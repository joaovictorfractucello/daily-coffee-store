import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { site } from "@/site.config";
import type { EmailMessage, EmailService } from "./email-service";

export class GmailEmailService implements EmailService {
  private readonly transporter: Transporter;
  private readonly from: string;

  constructor(user: string, appPassword: string) {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: appPassword },
    });
    this.from = `"${site.name}" <${user}>`;
  }

  async send({ to, subject, text, html }: EmailMessage): Promise<void> {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject,
      text,
      html,
    });
  }
}
