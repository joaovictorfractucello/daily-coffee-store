"use client";

import { Envelope } from "@phosphor-icons/react/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { StateIllustration } from "@/components/StateIllustration";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { signInLink } from "@/lib/links";
import { FormMessage, rateLimitMinutes } from "./FormFeedback";
import { FormField, isMissing } from "./FormField";
import { emailFormField } from "./form-schemas";

const copy = authCopy.forgotPassword;

const forgotPasswordFormSchema = z.object({ email: emailFormField });

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
  });
  const values = useWatch({ control });

  async function submit(values: ForgotPasswordFormValues) {
    setErrorText(null);
    const result = await postAuth("forgot-password", values);
    if (result.ok) return setSentTo(values.email);
    setErrorText(
      result.status === 429
        ? authCopy.rateLimited(rateLimitMinutes(result.retryAfterSeconds))
        : authCopy.genericError,
    );
  }

  // "Se existir uma conta": a mesma resposta para qualquer e-mail, sem revelar quem tem conta.
  if (sentTo) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-4 text-center"
      >
        <StateIllustration name="emailSent" size={128} />
        <h2 className="text-lg font-bold">{copy.sentTitle}</h2>
        <p className="text-ink-soft">{copy.sentText(sentTo)}</p>
        <Link
          href={signInLink}
          className="button button-outline-ink w-full rounded-[999px]"
        >
          {copy.backToSignIn}
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-accent mt-1 w-full cursor-pointer rounded-[999px] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>

      <Link
        href={signInLink}
        className="text-center text-sm font-bold text-ink transition-colors duration-150 hover:text-accent"
      >
        {copy.backToSignIn}
      </Link>
    </form>
  );
}
