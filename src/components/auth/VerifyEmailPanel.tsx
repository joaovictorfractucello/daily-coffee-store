"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { StateIllustration } from "@/components/StateIllustration";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { signInLink } from "@/lib/links";
import { FormMessage, rateLimitMinutes } from "./FormFeedback";

const copy = authCopy.verifyEmail;

type Status = "idle" | "submitting" | "verified" | "invalid" | "failed";

// Confirma com um botão, e não ao abrir o link: robôs de e-mail (Outlook, antivírus) abrem os
// links sozinhos para procurar vírus e gastariam o token de uso único antes da pessoa.
export function VerifyEmailPanel() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState(authCopy.genericError);

  async function confirm() {
    setStatus("submitting");
    const result = await postAuth("verify-email", { token });
    if (result.ok) return setStatus("verified");
    if (result.status === 400) return setStatus("invalid");
    setErrorText(
      result.status === 429
        ? authCopy.rateLimited(rateLimitMinutes(result.retryAfterSeconds))
        : authCopy.genericError,
    );
    setStatus("failed");
  }

  if (!token) return <FormMessage>{copy.missingToken}</FormMessage>;

  if (status === "verified" || status === "invalid") {
    return (
      <div className="flex flex-col items-center gap-4">
        <StateIllustration
          name={status === "verified" ? "allSet" : "linkExpired"}
          size={128}
        />
        {status === "verified" ? (
          <div role="status" className="text-center">
            <h2 className="text-lg font-bold">{copy.successTitle}</h2>
            <p className="mt-1 text-ink-soft">{copy.successText}</p>
          </div>
        ) : (
          <FormMessage>{copy.invalid}</FormMessage>
        )}
        <Link
          href={signInLink}
          className="button button-accent w-full rounded-[999px]"
        >
          {copy.goToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {status === "failed" && <FormMessage>{errorText}</FormMessage>}
      <p className="text-ink-soft">{copy.text}</p>
      <button
        type="button"
        onClick={confirm}
        disabled={status === "submitting"}
        className="button button-accent w-full cursor-pointer rounded-[999px] disabled:cursor-wait disabled:opacity-70"
      >
        {status === "submitting" ? copy.submitting : copy.submit}
      </button>
    </div>
  );
}
