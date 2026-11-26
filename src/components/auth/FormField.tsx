"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/ssr";
import {
  useId,
  useState,
  type ComponentType,
  type InputHTMLAttributes,
} from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { authCopy } from "@/data/copy";

type FieldIcon = ComponentType<{
  size?: number;
  className?: string;
  "aria-hidden"?: "true";
}>;

type FormFieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  // Ícone dentro do campo, à esquerda: ajuda a reconhecer o campo de relance.
  icon: FieldIcon;
  error?: string;
  // true quando a pessoa tentou enviar com o campo vazio: mostra o asterisco de obrigatório.
  missing?: boolean;
  hint?: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "autoComplete" | "inputMode" | "placeholder"
>;

// Fundo e preenchimento automático do navegador ficam na classe auth-input (globals.css).
const inputClass =
  "auth-input h-12 w-full rounded-[8px] border border-line pr-4 pl-11 text-base text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-ink-soft/70 hover:border-ink-soft/60 focus-visible:border-accent focus-visible:shadow-[0_0_0_4px_rgb(143_92_51/0.15)] focus-visible:outline-none aria-invalid:border-danger aria-invalid:focus-visible:shadow-[0_0_0_4px_rgb(179_38_30/0.12)]";

export function FormField({
  label,
  registration,
  icon: Icon,
  error,
  missing = false,
  hint,
  type = "text",
  ...inputProps
}: FormFieldProps) {
  const id = useId();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold">
        {label}
        {missing && (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> ({authCopy.required})</span>
          </>
        )}
      </label>
      <div className="relative mt-1.5">
        <Icon
          aria-hidden="true"
          size={20}
          className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-soft/70"
        />
        <input
          id={id}
          type={isPassword && passwordVisible ? "text" : type}
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`${inputClass} ${isPassword ? "pr-12" : ""}`}
          {...inputProps}
          {...registration}
        />
        {/* Ver a senha reduz erro de digitação (NIST 800-63B recomenda permitir). */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((visible) => !visible)}
            aria-label={
              passwordVisible ? authCopy.hidePassword : authCopy.showPassword
            }
            aria-pressed={passwordVisible}
            className="absolute inset-y-0 right-0 inline-flex w-12 cursor-pointer items-center justify-center text-ink-soft transition-colors hover:text-ink"
          >
            {/* O ícone mostra o estado atual: olho riscado = senha escondida. */}
            {passwordVisible ? (
              <Eye aria-hidden="true" size={20} />
            ) : (
              <EyeSlash aria-hidden="true" size={20} />
            )}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

// O campo está vazio depois de uma tentativa de envio (tem erro e nada digitado).
export function isMissing(error: unknown, value: string | undefined) {
  return Boolean(error) && !value?.trim();
}
