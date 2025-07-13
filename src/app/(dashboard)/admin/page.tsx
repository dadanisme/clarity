import { Metadata } from "next";
import { UserManagement } from "@/components/admin/user-management";

export const metadata: Metadata = {
  title: "Admin Dashboard | Clarity",
  description: "Manage users and feature access for Clarity money management app",
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <UserManagement />
      </div>
    </div>
  );
}