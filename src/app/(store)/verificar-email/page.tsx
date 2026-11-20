import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
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
    <AuthCard title={authCopy.verifyEmail.title}>
      <Suspense>
        <VerifyEmailPanel />
      </Suspense>
    </AuthCard>
  );
}
