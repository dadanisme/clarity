import type { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata: Metadata = {
  title: "Settings | Clarity",
  description: "Manage your account settings and preferences",
};

export default function SettingsPage() {
  return (
    <AuthGuard>
      <DashboardLayout>
        <SettingsContent />
      </DashboardLayout>
    </AuthGuard>
  );
}
