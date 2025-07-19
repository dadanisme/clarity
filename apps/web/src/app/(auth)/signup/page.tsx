import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SignUpForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Sign Up | Clarity",
  description: "Create your Clarity account to start managing your finances",
};

export default function SignUpPage() {
  return (
    <AuthGuard requireAuth={false}>
      <SignUpForm />
    </AuthGuard>
  );
}
