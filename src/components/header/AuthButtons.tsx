"use client";

import { UserCircle } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useEffect } from "react";
import { headerCopy } from "@/data/copy";
import { accountLink, signInLink, signUpLink } from "@/lib/links";
import { useSessionStore } from "@/stores/session-store";

const baseClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-4 text-[0.8125rem] font-bold whitespace-nowrap transition-[background-color,color,scale] duration-200 active:scale-95";

const signInButtonClass = `${baseClass} border border-current/40 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10`;
const signUpButtonClass = `${baseClass} bg-accent text-light hover:brightness-110 focus-visible:brightness-110 in-[.on-dark]:bg-light in-[.on-dark]:text-ink`;

// Só no desktop; no celular a conta fica no "Perfil" da barra de baixo.
export function AuthButtons() {
  const { status, user, load } = useSessionStore();

  useEffect(() => {
    load();
  }, [load]);

  // Espaço do mesmo tamanho enquanto pergunta ao servidor: o cabeçalho não pula.
  if (status === "loading") {
    return (
      <div
        aria-hidden="true"
        className="ml-2 hidden h-9 w-[11.5rem] lg:block"
      />
    );
  }

  if (status === "signedIn") {
    return (
      <Link
        href={accountLink}
        aria-label={headerCopy.profile}
        className={`${signInButtonClass} ml-2 hidden gap-1.5 lg:inline-flex`}
      >
        <UserCircle aria-hidden="true" size={20} />
        {headerCopy.greeting(user.name.split(" ")[0])}
      </Link>
    );
  }

  return (
    <div className="ml-2 hidden items-center gap-2 lg:flex">
      <Link href={signInLink} className={signInButtonClass}>
        {headerCopy.signIn}
      </Link>
      <Link href={signUpLink} className={signUpButtonClass}>
        {headerCopy.signUp}
      </Link>
    </div>
  );
}
