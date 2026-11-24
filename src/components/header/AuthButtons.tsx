"use client";

import { User } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useEffect } from "react";
import { headerCopy } from "@/data/copy";
import { accountLink, signInLink, signUpLink } from "@/lib/links";
import { useSessionStore } from "@/stores/session-store";

// Sem `display` aqui: quem usa decide (inline-flex ou hidden + breakpoint). Com inline-flex na base,
// ele vencia o `hidden` e o botão aparecia em telas onde devia sumir.
const baseClass =
  "h-9 cursor-pointer items-center justify-center rounded-full px-4 text-[0.8125rem] font-bold whitespace-nowrap transition-[background-color,color,scale] duration-200 active:scale-95";

const signInButtonClass = `${baseClass} border border-current/40 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10`;
// "Olá, nome" sem borda; ao passar o mouse, o mesmo fundo suave dos ícones do cabeçalho.
const greetingLinkClass =
  "ml-1 h-11 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-bold whitespace-nowrap transition-[background-color,scale] duration-200 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10 active:scale-95";
// Mesmo formato do ícone do carrinho ao lado.
const iconLinkClass =
  "size-11 place-items-center rounded-full transition-[background-color,scale] duration-200 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10 active:scale-95";
const signUpButtonClass = `${baseClass} bg-accent text-light hover:brightness-110 focus-visible:brightness-110 in-[.on-dark]:bg-light in-[.on-dark]:text-ink`;

// Só no desktop; no celular a conta fica no "Perfil" da barra de baixo.
export function AuthButtons({ iconSize }: { iconSize: number }) {
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
      <>
        {/* Tela menor: só o ícone, o mesmo do "Perfil" da barra de baixo. */}
        <Link
          href={accountLink}
          aria-label={headerCopy.profile}
          className={`${iconLinkClass} hidden lg:grid xl:hidden`}
        >
          <User aria-hidden="true" size={iconSize} />
        </Link>
        {/* Desktop largo: "Olá, nome". */}
        <Link
          href={accountLink}
          aria-label={headerCopy.profile}
          className={`${greetingLinkClass} hidden xl:inline-flex`}
        >
          <User aria-hidden="true" size={iconSize} />
          {headerCopy.greeting(user.name.split(" ")[0])}
        </Link>
      </>
    );
  }

  return (
    <div className="ml-2 hidden items-center gap-2 lg:flex">
      <Link href={signInLink} className={`${signInButtonClass} inline-flex`}>
        {headerCopy.signIn}
      </Link>
      <Link href={signUpLink} className={`${signUpButtonClass} inline-flex`}>
        {headerCopy.signUp}
      </Link>
    </div>
  );
}
