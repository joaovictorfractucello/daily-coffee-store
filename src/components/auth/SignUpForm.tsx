"use client";

import { Envelope, LockSimple, User } from "@phosphor-icons/react/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { signInLink } from "@/lib/links";
import { FormMessage, rateLimitMinutes } from "./FormFeedback";
import { FormField, isMissing } from "./FormField";
import { GoogleSignInButton } from "./GoogleSignInButton";
import {
  emailFormField,
  nameFormField,
  newPasswordFormField,
} from "./form-schemas";

const copy = authCopy.signUp;

// "Repetir a senha" é só da tela: o servidor recebe apenas a senha. O erro de diferença aparece no
// campo de repetir, que é onde a pessoa vai corrigir.
const signUpFormSchema = z
  .object({
    name: nameFormField,
    email: emailFormField,
    password: newPasswordFormField,
    confirmPassword: z.string().min(1, authCopy.confirmPasswordRequired),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: authCopy.passwordsDontMatch,
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpFormSchema>;

export function SignUpForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({ resolver: zodResolver(signUpFormSchema) });
  const values = useWatch({ control });

  async function submit({ name, email, password }: SignUpFormValues) {
    setErrorText(null);
    const result = await postAuth("register", { name, email, password });
    if (result.ok) return setSentTo(email);
    if (result.code === "PASSWORD_BREACHED") {
      return setError("password", { message: authCopy.passwordBreached });
    }
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
        <Link
          href={signInLink}
          className="button button-outline-ink w-full rounded-[999px]"
        >
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

      <GoogleSignInButton />

      <FormField
        label={authCopy.nameLabel}
        autoComplete="name"
        icon={User}
        placeholder={authCopy.namePlaceholder}
        registration={register("name")}
        error={errors.name?.message}
        missing={isMissing(errors.name, values.name)}
      />
      <FormField
        label={authCopy.emailLabel}
        type="email"
        autoComplete="email"
        icon={Envelope}
        placeholder={authCopy.emailPlaceholder}
        inputMode="email"
        registration={register("email")}
        error={errors.email?.message}
        missing={isMissing(errors.email, values.email)}
      />
      <FormField
        label={authCopy.passwordLabel}
        type="password"
        autoComplete="new-password"
        icon={LockSimple}
        placeholder={authCopy.newPasswordPlaceholder}
        registration={register("password")}
        error={errors.password?.message}
        missing={isMissing(errors.password, values.password)}
      />
      <FormField
        label={authCopy.confirmPasswordLabel}
        type="password"
        autoComplete="new-password"
        icon={LockSimple}
        placeholder={authCopy.confirmPasswordPlaceholder}
        registration={register("confirmPassword")}
        error={errors.confirmPassword?.message}
        missing={isMissing(errors.confirmPassword, values.confirmPassword)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-accent mt-1 w-full cursor-pointer rounded-[999px] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {copy.hasAccount}{" "}
        <Link
          href={signInLink}
          className="font-bold text-ink transition-colors duration-150 hover:text-accent"
        >
          {copy.signIn}
        </Link>
      </p>
    </form>
  );
}
