import type { ReactNode } from "react";

// Moldura das telas de login e cadastro: cartão estreito e centralizado.
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="px-4 pt-24 pb-16 sm:px-6 md:pt-32 md:pb-24">
      <div className="mx-auto w-full max-w-md rounded-[1.25rem] border border-line p-6 sm:p-8">
        <h1 className="heading-soft text-[1.5rem] md:text-[1.75rem]">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-ink-soft">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

// Mensagem de erro ou aviso do formulário, anunciada pelo leitor de tela.
export function FormMessage({
  tone = "error",
  children,
}: {
  tone?: "error" | "info";
  children: ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[8px] px-4 py-3 text-sm ${tone === "error" ? "bg-[#b3261e]/8 text-[#8c1d18]" : "bg-muted text-ink"}`}
    >
      {children}
    </p>
  );
}

// Mesmo tamanho do formulário enquanto ele carrega: a página não pula.
export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div aria-hidden="true" className="flex animate-pulse flex-col gap-5">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index}>
          <div className="h-5 w-16 rounded-[8px] bg-muted" />
          <div className="mt-1.5 h-12 rounded-[8px] bg-muted" />
        </div>
      ))}
      <div className="mt-1 h-12 rounded-[8px] bg-muted" />
    </div>
  );
}

export function rateLimitMinutes(retryAfterSeconds = 60) {
  return Math.max(1, Math.ceil(retryAfterSeconds / 60));
}
