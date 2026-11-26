import { LockSimple } from "@phosphor-icons/react/ssr";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { authCopy } from "@/data/copy";
import { accountCardClass, accountListClass } from "./list-styles";

const copy = authCopy.account.data;

type SignInMethodsProps = { hasGoogle: boolean; hasPassword: boolean };

function Status({
  on,
  onLabel,
  offLabel,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${on ? "bg-accent/12 text-accent" : "border border-line text-ink-soft"}`}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}

export function SignInMethods({ hasGoogle, hasPassword }: SignInMethodsProps) {
  return (
    <ul className={`${accountListClass} sm:grid sm:grid-cols-2 sm:gap-5`}>
      <li className={accountCardClass}>
        <GoogleIcon size={20} />
        <span className="flex-1">{copy.google}</span>
        <Status
          on={hasGoogle}
          onLabel={copy.connected}
          offLabel={copy.notConnected}
        />
      </li>
      <li className={accountCardClass}>
        <LockSimple aria-hidden="true" size={20} className="text-ink" />
        <span className="flex-1">{copy.password}</span>
        <Status
          on={hasPassword}
          onLabel={copy.defined}
          offLabel={copy.notDefined}
        />
      </li>
    </ul>
  );
}
