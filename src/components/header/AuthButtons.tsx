import { headerCopy } from "@/data/copy";

const baseClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-4 text-[0.8125rem] font-bold whitespace-nowrap transition-[background-color,color,scale] duration-200 active:scale-95";

export const signInButtonClass = `${baseClass} border border-current/40 hover:bg-current/5 focus-visible:bg-current/5 in-[.on-dark]:hover:bg-current/10 in-[.on-dark]:focus-visible:bg-current/10`;
export const signUpButtonClass = `${baseClass} bg-accent text-light hover:brightness-110 focus-visible:brightness-110 in-[.on-dark]:bg-light in-[.on-dark]:text-ink`;

export function AuthButtons() {
  return (
    <div className="ml-2 hidden items-center gap-2 lg:flex">
      <button
        type="button"
        aria-disabled="true"
        title={headerCopy.comingSoon}
        className={signInButtonClass}
      >
        {headerCopy.signIn}
      </button>
      <button
        type="button"
        aria-disabled="true"
        title={headerCopy.comingSoon}
        className={signUpButtonClass}
      >
        {headerCopy.signUp}
      </button>
    </div>
  );
}
