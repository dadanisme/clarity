"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import { User, UserRole } from "@/types";
import { useUpdateUserRole, useAdminUsers } from "@/hooks/use-users-management";
import { ManageFeaturesDialog } from "./manage-features-dialog";
import { createUserTableColumns } from "./user-table-columns";

export function UserTable() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isManageFeaturesDialogOpen, setIsManageFeaturesDialogOpen] =
    useState(false);

  const updateUserRoleMutation = useUpdateUserRole();

  const { data: users = [], isLoading } = useAdminUsers();

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRoleMutation.mutateAsync({ userId, role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      toast.error(
        `Failed to update role: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const columns = createUserTableColumns({
    onManageFeatures: (user: User) => {
      setSelectedUser(user);
      setIsManageFeaturesDialogOpen(true);
    },
    onRoleChange: handleRoleChange,
  });

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={users}
        searchKey="displayName"
        searchPlaceholder="Search users..."
      />

      <ManageFeaturesDialog
        user={selectedUser}
        open={isManageFeaturesDialogOpen}
        onOpenChange={setIsManageFeaturesDialogOpen}
      />
    </div>
  );
}
