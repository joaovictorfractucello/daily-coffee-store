import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { authCopy } from "@/data/copy";

export const metadata: Metadata = {
  title: authCopy.signUp.metaTitle,
  robots: { index: false, follow: true },
};

export default function SignUpPage() {
  return (
    <AuthCard title={authCopy.signUp.title} subtitle={authCopy.signUp.subtitle}>
      <SignUpForm />
    </AuthCard>
  );
}
