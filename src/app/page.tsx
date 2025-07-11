import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Clarity - Money Management",
  description: "Simple and effective personal finance tracking",
};

export default function HomePage() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    </AuthGuard>
  );
}
