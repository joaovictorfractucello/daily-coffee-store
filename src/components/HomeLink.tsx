"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { homeLink } from "@/lib/links";

type HomeLinkProps = Omit<ComponentProps<typeof Link>, "href">;

// Link para a home (logos e "Início"). Vindo de outra página, o Next já abre a home no topo. Já
// estando na home não há para onde navegar: o toque só sobe até o topo, como nos apps. (Deixar o Next
// "navegar" para a mesma página cancelaria a rolagem suave.) Lê o caminho na hora do clique, e não
// com usePathname, para não exigir Suspense em volta.
export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  return (
    <Link
      href={homeLink}
      onClick={(event) => {
        onClick?.(event);
        if (window.location.pathname !== homeLink) return;
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      {...props}
    />
  );
}
