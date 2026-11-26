import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountPageTitle } from "@/components/account/AccountPageTitle";
import {
  AccountShell,
  accountPageClass,
} from "@/components/account/AccountShell";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { AddressForm } from "@/components/account/AddressForm";
import { addressesCopy as copy } from "@/data/copy";
import {
  accountAddressesLink,
  newAddressLink,
  signInLinkReturningTo,
} from "@/lib/links";
import { getSignedInUser } from "@/server/lib/current-user";

export const metadata: Metadata = {
  title: copy.newTitle,
  robots: { index: false, follow: false },
};

async function NewAddress() {
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(newAddressLink));

  return (
    <AccountShell user={user} active="addresses">
      <div className="flex flex-col gap-6">
        <AccountPageTitle
          title={copy.newTitle}
          intro={copy.intro}
          backHref={accountAddressesLink}
          backLabel={copy.backToAddresses}
        />
        <AddressForm />
      </div>
    </AccountShell>
  );
}

export default function NewAddressPage() {
  return (
    <div className={accountPageClass}>
      <Suspense fallback={<AccountSkeleton />}>
        <NewAddress />
      </Suspense>
    </div>
  );
}
