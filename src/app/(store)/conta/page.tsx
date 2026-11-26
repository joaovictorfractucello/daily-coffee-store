import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountHeader } from "@/components/account/AccountHeader";
import { AccountMenu } from "@/components/account/AccountMenu";
import {
  AccountShell,
  accountPageClass,
} from "@/components/account/AccountShell";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { NoOrdersBanner } from "@/components/account/NoOrdersBanner";
import { SignOutButton } from "@/components/account/SignOutButton";
import { authCopy } from "@/data/copy";
import { accountLink, signInLinkReturningTo } from "@/lib/links";
import { getSignedInUser } from "@/server/lib/current-user";

const copy = authCopy.account;

export const metadata: Metadata = {
  title: copy.metaTitle,
  robots: { index: false, follow: false },
};

// Lê o cookie da requisição: só este trecho é gerado na hora; a moldura da página é pré-renderizada.
async function SignedInAccount() {
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(accountLink));

  return (
    <AccountShell user={user} active="home">
      <div className="flex flex-col gap-7">
        <AccountHeader
          name={user.name}
          email={user.email}
          className="lg:hidden"
        />
        <NoOrdersBanner />
        <section className="flex flex-col gap-3 lg:hidden">
          <h2 className="heading-soft text-[1.125rem] md:text-[1.375rem]">
            {copy.menuTitle}
          </h2>
          <AccountMenu />
        </section>
        <SignOutButton className="self-center lg:hidden" />
      </div>
    </AccountShell>
  );
}

export default function AccountPage() {
  return (
    <div className={accountPageClass}>
      <Suspense fallback={<AccountSkeleton />}>
        <SignedInAccount />
      </Suspense>
    </div>
  );
}
