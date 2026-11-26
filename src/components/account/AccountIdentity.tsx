import { CalendarBlank, EnvelopeSimple } from "@phosphor-icons/react/ssr";
import { authCopy } from "@/data/copy";
import { initialsOf } from "./initials";

type AccountIdentityProps = {
  name: string;
  email: string;
  createdAt: Date;
  as?: "h1" | "p";
};

const monthAndYear = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
});

// Topo do conteúdo da conta no desktop: foto de iniciais, nome completo e dados da conta.
export function AccountIdentity({
  name,
  email,
  createdAt,
  as: Heading = "p",
}: AccountIdentityProps) {
  return (
    <div className="flex items-center gap-5 border-b border-line pb-7">
      <span
        aria-hidden="true"
        className="grid size-20 shrink-0 place-items-center rounded-full bg-muted text-[1.625rem] font-bold text-accent"
      >
        {initialsOf(name)}
      </span>
      <div className="min-w-0">
        <Heading className="heading-soft text-[2rem]">{name}</Heading>
        <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <EnvelopeSimple aria-hidden="true" size={16} />
            <span className="truncate">{email}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarBlank aria-hidden="true" size={16} />
            {authCopy.account.memberSince(monthAndYear.format(createdAt))}
          </span>
        </div>
      </div>
    </div>
  );
}
