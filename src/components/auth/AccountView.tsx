"use client";

import { SignOut } from "@phosphor-icons/react/ssr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { homeLink } from "@/lib/links";
import type { PublicUser } from "@/server/presenters/user.presenter";
import { useSessionStore } from "@/stores/session-store";

const copy = authCopy.account;
const cardClass = "mt-6 rounded-[1.25rem] border border-line p-6";

export function AccountView({ user }: { user: PublicUser }) {
  const router = useRouter();
  const signOut = useSessionStore((state) => state.signOut);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await postAuth("logout");
    signOut();
    router.replace(homeLink);
    router.refresh();
  }

  return (
    <>
      <dl className={`${cardClass} flex flex-col gap-4`}>
        <div>
          <dt className="text-sm text-ink-soft">{copy.name}</dt>
          <dd className="font-bold">{user.name}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">{copy.email}</dt>
          <dd className="font-bold break-all">{user.email}</dd>
        </div>
      </dl>
      <button
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
        className="button button-outline-ink mt-4 w-full cursor-pointer disabled:cursor-wait disabled:opacity-70"
      >
        <SignOut aria-hidden="true" size={18} />
        {signingOut ? copy.signingOut : copy.signOut}
      </button>
    </>
  );
}

export function AccountViewSkeleton() {
  return (
    <div
      aria-hidden="true"
      className={`${cardClass} flex animate-pulse flex-col gap-4`}
    >
      <div className="h-10 w-2/3 rounded-[8px] bg-muted" />
      <div className="h-10 w-full rounded-[8px] bg-muted" />
    </div>
  );
}
