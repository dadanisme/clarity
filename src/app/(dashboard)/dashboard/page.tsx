import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export const metadata: Metadata = {
  title: "Dashboard | Clarity",
  description: "Your financial overview and recent transactions",
};

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </AuthGuard>
  );
}
