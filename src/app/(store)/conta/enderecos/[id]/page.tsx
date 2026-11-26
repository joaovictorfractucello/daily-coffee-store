import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { z } from "zod";
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
  editAddressLink,
  signInLinkReturningTo,
} from "@/lib/links";
import { AddressNotFoundError } from "@/server/errors/delivery.errors";
import { getSignedInUser } from "@/server/lib/current-user";
import { presentAddress } from "@/server/presenters/address.presenter";
import { addressService } from "@/server/services/address.service";

export const metadata: Metadata = {
  title: copy.editTitle,
  robots: { index: false, follow: false },
};

const addressIdSchema = z.cuid().max(40);

async function EditAddress({ params }: PageProps<"/conta/enderecos/[id]">) {
  const { id } = await params;
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(editAddressLink(id)));
  if (!addressIdSchema.safeParse(id).success) notFound();

  // Endereço de outra pessoa (ou apagado): 404, sem revelar que existe.
  const address = await addressService.get(user.id, id).catch((error) => {
    if (error instanceof AddressNotFoundError) notFound();
    throw error;
  });

  return (
    <AccountShell user={user} active="addresses">
      <div className="flex flex-col gap-6">
        <AccountPageTitle
          title={copy.editTitle}
          backHref={accountAddressesLink}
          backLabel={copy.backToAddresses}
        />
        <AddressForm address={presentAddress(address)} />
      </div>
    </AccountShell>
  );
}

export default function EditAddressPage(
  props: PageProps<"/conta/enderecos/[id]">,
) {
  return (
    <div className={accountPageClass}>
      <Suspense fallback={<AccountSkeleton />}>
        <EditAddress {...props} />
      </Suspense>
    </div>
  );
}
