import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthFormSkeleton } from "@/components/auth/FormFeedback";
import { SignInForm } from "@/components/auth/SignInForm";
import { authCopy } from "@/data/copy";

export const metadata: Metadata = {
  title: authCopy.signIn.metaTitle,
  robots: { index: false, follow: true },
};

export default function SignInPage() {
  return (
    <AuthShell
      title={authCopy.signIn.title}
      subtitle={authCopy.signIn.subtitle}
    >
      {/* O formulário lê o ?next= da URL (useSearchParams precisa de Suspense). */}
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
