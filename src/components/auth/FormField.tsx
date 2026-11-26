"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react/ssr";
import { useId, useState, type InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { authCopy } from "@/data/copy";

type FormFieldProps = {
  label: string;
  registration: UseFormRegisterReturn;
  error?: string;
  hint?: string;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "autoComplete" | "inputMode"
>;

const inputClass =
  "h-12 w-full rounded-[8px] border border-line bg-background px-4 text-base text-ink transition-colors placeholder:text-ink-soft/70 hover:border-ink-soft focus-visible:border-ink focus-visible:outline-none aria-invalid:border-[#b3261e]";

export function FormField({
  label,
  registration,
  error,
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
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={isPassword && passwordVisible ? "text" : type}
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
            {passwordVisible ? (
              <EyeSlash aria-hidden="true" size={20} />
            ) : (
              <Eye aria-hidden="true" size={20} />
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
        <p id={`${id}-error`} className="mt-1.5 text-sm text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}
