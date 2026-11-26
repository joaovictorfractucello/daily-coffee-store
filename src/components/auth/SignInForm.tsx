"use client";

import { Envelope, LockSimple } from "@phosphor-icons/react/ssr";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import {
  forgotPasswordLink,
  GOOGLE_ERROR_PARAM,
  signUpLink,
} from "@/lib/links";
import { safeRedirectPath } from "@/lib/safe-redirect";
import type { PublicUser } from "@/server/presenters/user.presenter";
import { useSessionStore } from "@/stores/session-store";
import { FormMessage, rateLimitMinutes } from "./FormFeedback";
import { FormField, isMissing } from "./FormField";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { currentPasswordFormField, emailFormField } from "./form-schemas";

const copy = authCopy.signIn;

const signInFormSchema = z.object({
  email: emailFormField,
  password: currentPasswordFormField,
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({ resolver: zodResolver(signInFormSchema) });
  const values = useWatch({ control });
  const next = searchParams.get("next");
  // Volta do Google com falha: o motivo fica no log do servidor, aqui só o aviso genérico.
  const googleFailed = searchParams.get("erro") === GOOGLE_ERROR_PARAM;

  async function submit(values: SignInFormValues) {
    setFeedback(null);
    const result = await postAuth<{ user: PublicUser }>("login", values);

    if (result.ok) {
      signIn(result.data.user);
      router.replace(safeRedirectPath(next));
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
      {googleFailed && !feedback && (
        <FormMessage>{authCopy.googleFailed}</FormMessage>
      )}
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
        autoComplete="current-password"
        icon={LockSimple}
        placeholder={authCopy.passwordPlaceholder}
        registration={register("password")}
        error={errors.password?.message}
        missing={isMissing(errors.password, values.password)}
      />
      <Link
        href={forgotPasswordLink}
        className="-mt-2 self-end text-sm text-ink-soft transition-colors duration-150 hover:text-ink"
      >
        {copy.forgotPassword}
      </Link>

      <button
        type="submit"
        disabled={isSubmitting}
        className="button button-accent mt-1 w-full cursor-pointer rounded-[999px] disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>

      <GoogleSignInButton next={next} />

      <p className="text-center text-sm text-ink-soft">
        {copy.noAccount}{" "}
        <Link
          href={signUpLink}
          className="font-bold text-ink transition-colors duration-150 hover:text-accent"
        >
          {copy.createAccount}
        </Link>
      </p>
    </form>
  );
}
