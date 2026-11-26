import { authCopy } from "@/data/copy";
import { AccountIdentity } from "./AccountIdentity";
import { AccountMenu, type AccountSection } from "./AccountMenu";
import { SignOutButton } from "./SignOutButton";

type AccountShellProps = {
  user: { name: string; email: string; createdAt: Date };
  active: AccountSection;
  children: React.ReactNode;
};

// Celular: cada página é uma tela. Desktop: menu da conta à esquerda; à direita, a identidade da
// pessoa no topo e a página embaixo.
export function AccountShell({ user, active, children }: AccountShellProps) {
  return (
    <div className="mx-auto w-full max-w-[72rem] lg:grid lg:grid-cols-[16rem_minmax(0,1fr)] lg:items-start lg:gap-14">
      <aside className="hidden lg:flex lg:flex-col">
        <p className="mb-5 px-3 heading-soft text-[2rem]">
          {authCopy.account.title}
        </p>
        <AccountMenu active={active} variant="nav" />
        <div className="mt-5 border-t border-line pt-4">
          <SignOutButton className="ml-1" />
        </div>
      </aside>
      <div className="min-w-0">
        <div className="hidden lg:block">
          <AccountIdentity
            name={user.name}
            email={user.email}
            createdAt={user.createdAt}
            as={active === "home" ? "h1" : "p"}
          />
        </div>
        <div className="lg:pt-7">{children}</div>
      </div>
    </div>
  );
}

export const accountPageClass = "px-(--gutter) pt-24 pb-16 md:pt-28 md:pb-24";
