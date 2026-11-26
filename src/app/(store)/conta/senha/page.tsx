import { ArrowLeft } from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  AccountShell,
  accountPageClass,
} from "@/components/account/AccountShell";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { ChangePasswordForm } from "@/components/account/ChangePasswordForm";
import { FormMessage } from "@/components/auth/FormFeedback";
import { authCopy } from "@/data/copy";
import {
  accountDataLink,
  accountPasswordLink,
  forgotPasswordLink,
  signInLinkReturningTo,
} from "@/lib/links";
import { getSignedInUser } from "@/server/lib/current-user";

const copy = authCopy.account;

export const metadata: Metadata = {
  title: copy.password.metaTitle,
  robots: { index: false, follow: false },
};

async function ChangePassword() {
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(accountPasswordLink));

  return (
    <AccountShell user={user} active="data">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={accountDataLink}
              aria-label={copy.password.backToData}
              className="-ml-2 grid size-10 place-items-center rounded-full transition-colors duration-150 hover:bg-muted lg:hidden"
            >
              <ArrowLeft aria-hidden="true" size={22} />
            </Link>
            <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">
              {copy.password.title}
            </h1>
          </div>
          <p className="mt-1 max-w-md text-sm text-ink-soft">
            {copy.password.intro}
          </p>
        </div>

        {/* Conta só do Google: não há senha atual para conferir. Criar senha é pelo link do e-mail. */}
        {user.passwordHash ? (
          <ChangePasswordForm />
        ) : (
          <div className="flex max-w-md flex-col items-start gap-4">
            <FormMessage tone="info">{copy.password.notSet}</FormMessage>
            <Link
              href={forgotPasswordLink}
              className="button button-accent rounded-[999px]"
            >
              {copy.data.createPassword}
            </Link>
          </div>
        )}
      </div>
    </AccountShell>
  );
}

export default function ChangePasswordPage() {
  return (
    <div className={accountPageClass}>
      <Suspense fallback={<AccountSkeleton />}>
        <ChangePassword />
      </Suspense>
    </div>
  );
}
