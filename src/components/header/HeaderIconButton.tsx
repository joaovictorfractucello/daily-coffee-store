import type { ReactNode } from "react";
import { headerCopy } from "@/data/copy";

const headerIconButtonClass =
  "grid size-11 place-items-center rounded-full transition-[background-color,scale] duration-200 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10 active:scale-95";

type HeaderIconButtonProps = {
  label: string;
  children: ReactNode;
};

export function HeaderIconButton({ label, children }: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      aria-disabled="true"
      aria-label={`${label} (${headerCopy.comingSoon.toLowerCase()})`}
      title={headerCopy.comingSoon}
      className={`${headerIconButtonClass} cursor-pointer`}
    >
      {children}
    </button>
  );
}
