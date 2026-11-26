"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { PASSWORD_MAX_LENGTH } from "@/lib/auth-schemas";
import { signUpLink } from "@/lib/links";
import { safeRedirectPath } from "@/lib/safe-redirect";
import type { PublicUser } from "@/server/presenters/user.presenter";
import { useSessionStore } from "@/stores/session-store";
import { FormMessage, rateLimitMinutes } from "./AuthCard";
import { FormField } from "./FormField";

const copy = authCopy.signIn;

// Aviso rápido na tela. A validação que vale é a do servidor.
const signInFormSchema = z.object({
  email: z.string().trim().pipe(z.email(authCopy.invalidEmail)),
  password: z
    .string()
    .min(1, authCopy.passwordRequired)
    .max(PASSWORD_MAX_LENGTH, authCopy.passwordTooLong(PASSWORD_MAX_LENGTH)),
});

type SignInFormValues = z.infer<typeof signInFormSchema>;

type Feedback =
  | { kind: "error"; text: string }
  | { kind: "notVerified"; email: string }
  | { kind: "resent" }
  | null;

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useSessionStore((state) => state.signIn);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({ resolver: zodResolver(signInFormSchema) });

  async function submit(values: SignInFormValues) {
    setFeedback(null);
    const result = await postAuth<{ user: PublicUser }>("login", values);

    if (result.ok) {
      signIn(result.data.user);
      router.replace(safeRedirectPath(searchParams.get("next")));
      router.refresh();
      return;
    }
    if (result.code === "EMAIL_NOT_VERIFIED") {
      setFeedback({ kind: "notVerified", email: values.email });
    } else if (result.code === "INVALID_CREDENTIALS") {
      setFeedback({ kind: "error", text: copy.invalidCredentials });
    } else if (result.status === 429) {
      setFeedback({
        kind: "error",
        text: authCopy.rateLimited(rateLimitMinutes(result.retryAfterSeconds)),
      });
    } else {
      setFeedback({ kind: "error", text: authCopy.genericError });
    }
  }

  async function resendVerification(email: string) {
    const result = await postAuth("resend-verification", { email });
    setFeedback(
      result.ok
        ? { kind: "resent" }
        : {
            kind: "error",
            text: authCopy.rateLimited(
              rateLimitMinutes(result.retryAfterSeconds),
            ),
          },
    );
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      noValidate
      className="flex flex-col gap-5"
    >
      {feedback?.kind === "error" && <FormMessage>{feedback.text}</FormMessage>}
      {feedback?.kind === "resent" && (
        <FormMessage tone="info">{copy.resent}</FormMessage>
      )}
      {feedback?.kind === "notVerified" && (
        <FormMessage tone="info">
          {copy.notVerified}{" "}
          <button
            type="button"
            onClick={() => resendVerification(feedback.email)}
            className="cursor-pointer font-bold underline underline-offset-2"
          >
            {copy.resend}
          </button>
        </FormMessage>
      )}

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
        autoComplete="current-password"
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
        {copy.noAccount}{" "}
        <Link
          href={signUpLink}
          className="font-bold text-ink underline underline-offset-2"
        >
          {copy.createAccount}
        </Link>
      </p>
    </form>
  );
}
