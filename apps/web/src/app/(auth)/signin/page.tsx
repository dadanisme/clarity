import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign In | Clarity",
  description: "Sign in to your Clarity account to manage your finances",
};

export default function SignInPage() {
  return (
    <AuthGuard requireAuth={false}>
      <SignInForm />
    </AuthGuard>
  );
}
