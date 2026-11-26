import type { Icon } from "@phosphor-icons/react";

type ReadOnlyFieldProps = {
  label: string;
  icon: Icon;
  children: React.ReactNode;
};

// Dado da conta no formato dos campos do login e do cadastro (rótulo em cima, caixa embaixo), mas
// só para leitura: quando a edição chegar, vira um campo de verdade sem mudar o layout.
export function ReadOnlyField({
  label,
  icon: IconComponent,
  children,
}: ReadOnlyFieldProps) {
  return (
    <div>
      <dt className="mb-2 text-sm font-bold">{label}</dt>
      <dd className="flex h-12 min-w-0 items-center gap-3 rounded-[8px] border border-line px-4 text-[0.9375rem]">
        <IconComponent
          aria-hidden="true"
          size={18}
          className="shrink-0 text-ink-soft"
        />
        <span className="truncate">{children}</span>
      </dd>
    </div>
  );
}
