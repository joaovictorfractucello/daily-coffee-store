import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { authCopy } from "@/data/copy";

export const metadata: Metadata = {
  title: authCopy.forgotPassword.metaTitle,
  robots: { index: false, follow: true },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title={authCopy.forgotPassword.title}
      subtitle={authCopy.forgotPassword.subtitle}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
