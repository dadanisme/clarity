"use client";

import { useIsAdmin, useAdminUsers } from "@/hooks/use-features";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserTable } from "./user-table";
import { Shield } from "lucide-react";

export function UserManagement() {
  const isAdmin = useIsAdmin();

  // Fetch all users (admin only)
  const { data: users = [], isLoading } = useAdminUsers();

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            You need administrator privileges to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and feature access ({users.length} users)
          </p>
        </div>
      </div>

      <UserTable />
    </div>
  );
}
