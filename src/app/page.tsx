import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";
import { HomeRedirect } from "@/components/home/home-redirect";

export const metadata: Metadata = {
  title: "Clarity - Money Management",
  description: "Simple and effective personal finance tracking",
};

export default function HomePage() {
  return (
    <AuthGuard requireAuth={false}>
      <HomeRedirect />
    </AuthGuard>
  );
}
