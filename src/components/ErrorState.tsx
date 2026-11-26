"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StateIllustration } from "@/components/StateIllustration";
import { errorPage as copy } from "@/data/copy";
import { homeLink } from "@/lib/links";

type ErrorStateProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

// Conteúdo dos error.tsx da loja e da home. Mensagem genérica para a pessoa; o detalhe fica no
// console (e no log do servidor, pelo digest).
export function ErrorState({ error, reset }: ErrorStateProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      role="alert"
      className="flex flex-col items-center px-(--gutter) pt-28 pb-16 text-center max-md:min-h-svh max-md:justify-center md:pt-36 md:pb-24"
    >
      <StateIllustration name="error" size={176} />
      <h1 className="mt-6 heading-soft text-[1.5rem] md:text-[2rem]">
        {copy.title}
      </h1>
      <p className="mt-2 max-w-sm text-ink-soft">{copy.text}</p>
      <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="button button-accent cursor-pointer"
        >
          {copy.retry}
        </button>
        <Link href={homeLink} className="button button-outline-ink">
          {copy.backHome}
        </Link>
      </div>
    </div>
  );
}
