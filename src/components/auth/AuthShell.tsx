import Image from "next/image";
import type { ReactNode } from "react";
import { authCopy } from "@/data/copy";
import { HomeLink } from "@/components/HomeLink";
import { site } from "@/site.config";

const ambiencePhoto = "/images/quem-somos/ambiente.webp";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

// Moldura das telas de login e cadastro.
// Celular: a foto do café numa faixa curta no topo e o formulário subindo por cima dela, com os
// cantos de cima arredondados. Desktop: a foto escurecida ao fundo e o formulário num painel no centro.
// O logo, dentro do formulário, é o caminho de volta para a loja.
export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-svh flex-col lg:relative lg:isolate lg:items-center lg:justify-center lg:px-6 lg:py-12">
      <div
        aria-hidden="true"
        className="relative h-32 shrink-0 overflow-hidden bg-dark sm:h-40 lg:absolute lg:inset-0 lg:-z-10 lg:h-auto"
      >
        <Image
          src={ambiencePhoto}
          alt=""
          fill
          priority
          sizes="100vw"
          className="auth-photo object-cover object-[50%_35%]"
        />
        <div className="absolute inset-0 bg-dark/15 lg:bg-dark/70" />
      </div>

      <div className="relative -mt-6 flex-1 rounded-t-[1.5rem] bg-background px-5 pt-7 pb-10 sm:px-10 lg:mt-0 lg:w-full lg:max-w-[28rem] lg:flex-none lg:rounded-[1.5rem] lg:p-10 lg:shadow-[0_30px_80px_-30px_rgb(20_12_8/0.7)]">
        <div className="mx-auto w-full max-w-[28rem] lg:max-w-none">
          <div className="flex justify-center">
            <BrandLink />
          </div>
          <h1 className="mt-8 text-center heading-soft text-[1.75rem] md:text-[2rem]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-ink-soft">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function BrandLink() {
  return (
    <HomeLink
      aria-label={`${site.name}, ${authCopy.backToStore.toLowerCase()}`}
      className="inline-flex items-center gap-2"
    >
      <Image
        src="/marca/graozinho.png"
        alt=""
        width={512}
        height={512}
        unoptimized
        className="size-7"
      />
      <span className="relative block aspect-[600/173] w-[6.25rem]">
        <Image
          src="/marca/wordmark.png"
          alt=""
          fill
          unoptimized
          sizes="100px"
          className="object-contain"
        />
      </span>
    </HomeLink>
  );
}
