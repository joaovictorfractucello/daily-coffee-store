"use client";

import { SignOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authCopy } from "@/data/copy";
import { postAuth } from "@/lib/auth-api";
import { homeLink } from "@/lib/links";
import { useSessionStore } from "@/stores/session-store";

const copy = authCopy.account;

export function SignOutButton({ className = "" }: { className?: string }) {
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
    <button
      type="button"
      onClick={handleSignOut}
      disabled={signingOut}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-[8px] px-2 py-2 text-[0.9375rem] font-bold text-danger-ink transition-opacity duration-150 hover:opacity-80 disabled:cursor-wait disabled:opacity-60 ${className}`}
    >
      <SignOut aria-hidden="true" size={18} />
      {signingOut ? copy.signingOut : copy.signOut}
    </button>
  );
}
