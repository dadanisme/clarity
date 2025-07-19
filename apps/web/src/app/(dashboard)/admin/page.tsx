import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserManagement } from "@/components/admin/user-management";
import { DesktopOnly } from "@/components/admin/desktop-only";

export const metadata: Metadata = {
  title: "Admin Dashboard | Clarity",
  description: "Manage users and feature access for Clarity money management app",
};

export default function AdminPage() {
  return (
    <AuthGuard>
      <DesktopOnly>
        <DashboardLayout>
          <UserManagement />
        </DashboardLayout>
      </DesktopOnly>
    </AuthGuard>
  );
}