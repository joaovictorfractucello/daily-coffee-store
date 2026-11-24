"use client";

import { LockSimple } from "@phosphor-icons/react/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth-schemas";
import { forgotPasswordLink, signInLink } from "@/lib/links";
import { useSessionStore } from "@/stores/session-store";
import { FormMessage, rateLimitMinutes } from "./FormFeedback";
import { FormField, isMissing } from "./FormField";
import { newPasswordFormField } from "./form-schemas";

const copy = authCopy.resetPassword;

const resetPasswordFormSchema = z.object({ password: newPasswordFormField });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

type Status = "editing" | "done" | "invalid";

// O formulário com senha exige um clique para enviar: robôs que abrem o link do e-mail não gastam
// o token, porque abrir a página não faz nada sozinho.
export function ResetPasswordForm() {
  const token = useSearchParams().get("token");
  const signOut = useSessionStore((state) => state.signOut);
  const [status, setStatus] = useState<Status>("editing");
  const [errorText, setErrorText] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
  });
  const values = useWatch({ control });

  async function submit({ password }: ResetPasswordFormValues) {
    setErrorText(null);
    const result = await postAuth("reset-password", { token, password });
    if (result.ok) {
      // O servidor encerrou todas as sessões, inclusive a deste navegador, se houver.
      signOut();
      return setStatus("done");
    }
    if (result.status === 400) return setStatus("invalid");
    setErrorText(
      result.status === 429
        ? authCopy.rateLimited(rateLimitMinutes(result.retryAfterSeconds))
        : authCopy.genericError,
    );
  }

  if (!token) return <FormMessage>{copy.missingToken}</FormMessage>;

  if (status === "done") {
    return (
      <div className="flex flex-col gap-4">
        <div role="status">
          <h2 className="text-lg font-bold">{copy.successTitle}</h2>
          <p className="mt-1 text-ink-soft">{copy.successText}</p>
        </div>
        <Link
          href={signInLink}
          className="button button-accent w-full rounded-[999px]"
        >
          {copy.goToSignIn}
        </Link>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="flex flex-col gap-4">
        <FormMessage>{copy.invalid}</FormMessage>
        <Link
          href={forgotPasswordLink}
          className="button button-accent w-full rounded-[999px]"
        >
          {copy.requestNewLink}
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
        label={copy.newPasswordLabel}
        type="password"
        autoComplete="new-password"
        icon={LockSimple}
        placeholder={authCopy.newPasswordPlaceholder}
        hint={authCopy.passwordHint(PASSWORD_MIN_LENGTH)}
        registration={register("password")}
        error={errors.password?.message}
        missing={isMissing(errors.password, values.password)}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-accent mt-1 w-full cursor-pointer rounded-[999px] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}
