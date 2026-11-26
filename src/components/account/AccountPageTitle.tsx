import { ArrowLeft } from "@phosphor-icons/react/ssr";
import Link from "next/link";

type AccountPageTitleProps = {
  title: string;
  backHref: string;
  backLabel: string;
  intro?: string;
};

// Título das páginas internas da conta. No celular, com a seta para voltar.
export function AccountPageTitle({
  title,
  backHref,
  backLabel,
  intro,
}: AccountPageTitleProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="-ml-2 grid size-10 place-items-center rounded-full transition-colors duration-150 hover:bg-muted lg:hidden"
        >
          <ArrowLeft aria-hidden="true" size={22} />
        </Link>
        <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">{title}</h1>
      </div>
      {intro && <p className="mt-1 max-w-md text-sm text-ink-soft">{intro}</p>}
    </div>
  );
}
