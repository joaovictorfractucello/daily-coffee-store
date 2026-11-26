import { z } from "zod";

// Regras dos campos de autenticação, usadas pelo formulário (aviso rápido na tela) e pelo servidor
// (a validação que vale). Senha sem regra de maiúscula, número e símbolo: NIST 800-63B (SPEC §5).
export const PASSWORD_MIN_LENGTH = 8;
// Limite também protege o servidor: o hash de uma "senha" de 1 MB gastaria CPU à toa.
export const PASSWORD_MAX_LENGTH = 128;
export const NAME_MAX_LENGTH = 80;
const EMAIL_MAX_LENGTH = 254;
// Tokens dos links de e-mail: 32 bytes em base64url = 43 caracteres.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const emailField = z
  .string()
  .trim()
  .max(EMAIL_MAX_LENGTH)
  .pipe(z.email())
  .transform(normalizeEmail);

export const newPasswordField = z
  .string()
  .min(PASSWORD_MIN_LENGTH)
  .max(PASSWORD_MAX_LENGTH);

const nameField = z.string().trim().min(2).max(NAME_MAX_LENGTH);

export const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: newPasswordField,
});

// No login a senha só precisa existir: a regra de tamanho mínimo pode mudar sem travar contas antigas.
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export const emailOnlySchema = z.object({ email: emailField });

const tokenField = z.string().regex(TOKEN_PATTERN);

export const tokenSchema = z.object({ token: tokenField });

export const resetPasswordSchema = z.object({
  token: tokenField,
  password: newPasswordField,
});

// Troca logado: a senha atual só precisa existir (a regra de tamanho vale para a nova).
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  newPassword: newPasswordField,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
