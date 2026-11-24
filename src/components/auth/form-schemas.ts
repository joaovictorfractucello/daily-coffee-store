import { z } from "zod";
import { authCopy } from "@/data/copy";
import {
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth-schemas";

// Campos dos formulários, com mensagens em português e as mesmas constantes do servidor. É só aviso
// rápido na tela: a validação que vale é a do servidor (src/lib/auth-schemas.ts).
export const emailFormField = z
  .string()
  .trim()
  .min(1, authCopy.emailRequired)
  .pipe(z.email(authCopy.invalidEmail));

export const nameFormField = z
  .string()
  .trim()
  .min(2, authCopy.nameTooShort)
  .max(NAME_MAX_LENGTH);

export const newPasswordFormField = z
  .string()
  .min(1, authCopy.newPasswordRequired)
  .min(PASSWORD_MIN_LENGTH, authCopy.passwordTooShort(PASSWORD_MIN_LENGTH))
  .max(PASSWORD_MAX_LENGTH, authCopy.passwordTooLong(PASSWORD_MAX_LENGTH));

export const currentPasswordFormField = z
  .string()
  .min(1, authCopy.passwordRequired)
  .max(PASSWORD_MAX_LENGTH, authCopy.passwordTooLong(PASSWORD_MAX_LENGTH));
