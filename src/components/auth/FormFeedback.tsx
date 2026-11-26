import type { ReactNode } from "react";

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
      className={`rounded-[8px] px-4 py-3 text-sm ${tone === "error" ? "bg-danger/8 text-danger-ink" : "bg-muted text-ink"}`}
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
