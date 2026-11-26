import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AccountPageTitle } from "@/components/account/AccountPageTitle";
import {
  AccountShell,
  accountPageClass,
} from "@/components/account/AccountShell";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { AddressList } from "@/components/account/AddressList";
import { addressesCopy as copy, authCopy } from "@/data/copy";
import {
  accountAddressesLink,
  accountLink,
  signInLinkReturningTo,
} from "@/lib/links";
import { getSignedInUser } from "@/server/lib/current-user";
import { presentAddress } from "@/server/presenters/address.presenter";
import { addressService } from "@/server/services/address.service";

export const metadata: Metadata = {
  title: copy.metaTitle,
  robots: { index: false, follow: false },
};

async function Addresses() {
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(accountAddressesLink));
  const addresses = await addressService.list(user.id);

  return (
    <AccountShell user={user} active="addresses">
      <div className="flex flex-col gap-6">
        <AccountPageTitle
          title={copy.title}
          intro={copy.intro}
          backHref={accountLink}
          backLabel={authCopy.account.backToAccount}
        />
        <AddressList addresses={addresses.map(presentAddress)} />
      </div>
    </AccountShell>
  );
}

export default function AddressesPage() {
  return (
    <div className={accountPageClass}>
      <Suspense fallback={<AccountSkeleton />}>
        <Addresses />
      </Suspense>
    </div>
  );
}
