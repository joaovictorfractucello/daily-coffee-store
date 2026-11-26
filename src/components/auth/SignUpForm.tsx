"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import {
  NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from "@/lib/auth-schemas";
import { signInLink } from "@/lib/links";
import { FormMessage, rateLimitMinutes } from "./AuthCard";
import { FormField } from "./FormField";

const copy = authCopy.signUp;

// Aviso rápido na tela, com as mesmas constantes do servidor. A validação que vale é a do servidor.
const signUpFormSchema = z.object({
  name: z.string().trim().min(2, authCopy.nameTooShort).max(NAME_MAX_LENGTH),
  email: z.string().trim().pipe(z.email(authCopy.invalidEmail)),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, authCopy.passwordTooShort(PASSWORD_MIN_LENGTH))
    .max(PASSWORD_MAX_LENGTH, authCopy.passwordTooLong(PASSWORD_MAX_LENGTH)),
});

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpFormSchema) });

  async function submit(values: SignUpFormValues) {
    setErrorText(null);
    const result = await postAuth("register", values);
    if (result.ok) return setSentTo(values.email);
    setErrorText(
      result.status === 429
        ? authCopy.rateLimited(rateLimitMinutes(result.retryAfterSeconds))
        : authCopy.genericError,
    );
  }

  // Mesma tela para e-mail novo e já cadastrado: não revela quem tem conta (SPEC §5).
  if (sentTo) {
    return (
      <div role="status" className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">{copy.sentTitle}</h2>
        <p className="text-ink-soft">{copy.sentText(sentTo)}</p>
        <Link href={signInLink} className="button button-outline-ink w-full">
          {copy.signIn}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {errorText && <FormMessage>{errorText}</FormMessage>}

      <FormField
        label={authCopy.nameLabel}
        autoComplete="name"
        registration={register("name")}
        error={errors.name?.message}
      />
      <FormField
        label={authCopy.emailLabel}
        type="email"
        autoComplete="email"
        inputMode="email"
        registration={register("email")}
        error={errors.email?.message}
      />
      <FormField
        label={authCopy.passwordLabel}
        type="password"
        autoComplete="new-password"
        hint={authCopy.passwordHint(PASSWORD_MIN_LENGTH)}
        registration={register("password")}
        error={errors.password?.message}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-accent mt-1 w-full cursor-pointer disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {copy.hasAccount}{" "}
        <Link
          href={signInLink}
          className="font-bold text-ink underline underline-offset-2"
        >
          {copy.signIn}
        </Link>
      </p>
    </form>
  );
}
