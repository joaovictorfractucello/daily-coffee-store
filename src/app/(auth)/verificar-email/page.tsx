import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { VerifyEmailPanel } from "@/components/auth/VerifyEmailPanel";
import { authCopy } from "@/data/copy";

// O token vem na URL: `no-referrer` garante que ele não vaze para outro site pelo cabeçalho Referer.
export const metadata: Metadata = {
  title: authCopy.verifyEmail.metaTitle,
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell title={authCopy.verifyEmail.title}>
      <Suspense>
        <VerifyEmailPanel />
      </Suspense>
    </AuthShell>
  );
}
