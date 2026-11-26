import {
  ArrowLeft,
  EnvelopeSimple,
  Key,
  User,
} from "@phosphor-icons/react/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  AccountShell,
  accountPageClass,
} from "@/components/account/AccountShell";
import { AccountSkeleton } from "@/components/account/AccountSkeleton";
import { SignInMethods } from "@/components/account/SignInMethods";
import { ReadOnlyField } from "@/components/account/ReadOnlyField";
import { authCopy } from "@/data/copy";
import {
  accountDataLink,
  accountLink,
  accountPasswordLink,
  forgotPasswordLink,
  signInLinkReturningTo,
} from "@/lib/links";
import { getSignedInUser } from "@/server/lib/current-user";
import { authService } from "@/server/services/auth.service";

const copy = authCopy.account;

const sectionTitleClass = "heading-soft text-[1.125rem] md:text-[1.375rem]";
const sectionHintClass = "mt-1 text-sm text-ink-soft";

export const metadata: Metadata = {
  title: copy.data.metaTitle,
  robots: { index: false, follow: false },
};

async function PersonalData() {
  const user = await getSignedInUser();
  if (!user) redirect(signInLinkReturningTo(accountDataLink));
  const methods = await authService.signInMethods(user);

  return (
    <AccountShell user={user} active="data">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-2 lg:sr-only">
          <Link
            href={accountLink}
            aria-label={copy.backToAccount}
            className="-ml-2 grid size-10 place-items-center rounded-full transition-colors duration-150 hover:bg-muted"
          >
            <ArrowLeft aria-hidden="true" size={22} />
          </Link>
          <h1 className="heading-soft text-[1.5rem] md:text-[2rem]">
            {copy.data.title}
          </h1>
        </div>

        <section>
          <h2 className={sectionTitleClass}>{copy.data.yourData}</h2>
          <p className={sectionHintClass}>{copy.data.editSoon}</p>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5">
            <ReadOnlyField label={copy.data.name} icon={User}>
              {user.name}
            </ReadOnlyField>
            <ReadOnlyField label={copy.data.email} icon={EnvelopeSimple}>
              {user.email}
            </ReadOnlyField>
          </dl>
        </section>

        <section>
          <h2 className={sectionTitleClass}>{copy.data.signInMethods}</h2>
          <p className={sectionHintClass}>{copy.data.signInMethodsHint}</p>
          <div className="mt-4">
            <SignInMethods {...methods} />
          </div>
          <Link
            href={
              methods.hasPassword ? accountPasswordLink : forgotPasswordLink
            }
            className="mt-4 inline-flex items-center gap-2 text-[0.9375rem] font-bold text-accent transition-opacity duration-150 hover:opacity-80"
          >
            <Key aria-hidden="true" size={18} />
            {methods.hasPassword
              ? copy.data.changePassword
              : copy.data.createPassword}
          </Link>
        </section>
      </div>
    </AccountShell>
  );
}

export default function PersonalDataPage() {
  return (
    <div className={accountPageClass}>
      <Suspense fallback={<AccountSkeleton />}>
        <PersonalData />
      </Suspense>
    </div>
  );
}
