import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  AccountView,
  AccountViewSkeleton,
} from "@/components/auth/AccountView";
import { authCopy } from "@/data/copy";
import { accountLink, signInLinkReturningTo } from "@/lib/links";
import { getSignedInUser } from "@/server/lib/current-user";
import { presentUser } from "@/server/presenters/user.presenter";

export const metadata: Metadata = {
  title: authCopy.account.metaTitle,
  robots: { index: false, follow: false },
};

// Lê o cookie da requisição: só este trecho é gerado na hora; a moldura da página é pré-renderizada.
async function SignedInAccount() {
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(accountLink));
  return <AccountView user={presentUser(user)} />;
}

export default function AccountPage() {
  return (
    <div className="px-4 pt-24 pb-16 sm:px-6 md:pt-32 md:pb-24">
      <div className="mx-auto w-full max-w-md">
        <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">
          {authCopy.account.title}
        </h1>
        <Suspense fallback={<AccountViewSkeleton />}>
          <SignedInAccount />
        </Suspense>
      </div>
    </div>
  );
}
