import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthFormSkeleton } from "@/components/auth/FormFeedback";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { authCopy } from "@/data/copy";

// O token vem na URL: `no-referrer` garante que ele não vaze para outro site pelo cabeçalho Referer.
export const metadata: Metadata = {
  title: authCopy.resetPassword.metaTitle,
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title={authCopy.resetPassword.title}
      subtitle={authCopy.resetPassword.subtitle}
    >
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
