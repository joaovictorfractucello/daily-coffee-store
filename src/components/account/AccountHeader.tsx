import { authCopy } from "@/data/copy";
import { initialsOf } from "./initials";

type AccountHeaderProps = {
  name: string;
  email: string;
  className?: string;
};

const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] ?? name;

export function AccountHeader({
  name,
  email,
  className = "",
}: AccountHeaderProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <span
        aria-hidden="true"
        className="grid size-20 place-items-center rounded-full bg-muted text-[1.5rem] font-bold text-accent"
      >
        {initialsOf(name)}
      </span>
      <div className="mt-3 w-full min-w-0">
        <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">
          {authCopy.account.greeting(firstNameOf(name))}
        </h1>
        <p
          title={email}
          className="mt-0.5 text-[0.9375rem] break-all text-ink-soft"
        >
          {email}
        </p>
      </div>
    </div>
  );
}
