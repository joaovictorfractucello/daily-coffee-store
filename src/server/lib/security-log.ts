import "server-only";
import { createHash } from "node:crypto";

export type SecurityEvent =
  | "register"
  | "register_existing_email"
  | "email_verified"
  | "verification_resent"
  | "login_success"
  | "login_failure"
  | "login_unverified"
  | "logout"
  | "password_reset_requested"
  | "password_reset_completed"
  | "google_login"
  | "google_linked"
  | "google_unverified_claimed"
  | "google_login_failure"
  | "password_breached"
  | "password_breach_check_failed"
  | "rate_limited"
  | "cross_site_request_blocked";

type SecurityLogDetails = {
  userId?: string;
  email?: string;
  ip?: string;
  rule?: string;
  // Código do erro numa falha (ex.: OAUTH_CALLBACK_FAILED). Nunca a mensagem crua de um terceiro.
  reason?: string;
};

// Identifica sem expor: o mesmo e-mail ou IP sempre gera o mesmo código, então dá para seguir um
// ataque no log sem guardar o dado pessoal.
export function fingerprint(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

// Quem, o quê, quando e resultado. Nunca senha, token ou cookie.
export function logSecurityEvent(
  event: SecurityEvent,
  { userId, email, ip, rule, reason }: SecurityLogDetails = {},
) {
  console.info(
    JSON.stringify({
      type: "security",
      event,
      at: new Date().toISOString(),
      userId,
      email: email && fingerprint(email),
      ip: ip && fingerprint(ip),
      rule,
      reason,
    }),
  );
}
