"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal } from "lucide-react";
import { UserRole, UserWithFeatures } from "@clarity/types";
import { UserFeatures } from "./user-features";
import { formatDate } from "@clarity/shared/utils/date-utils";

interface UserTableColumnsProps {
  onManageFeatures: (user: UserWithFeatures) => void;
  onRoleChange: (userId: string, newRole: UserRole) => void;
}

export function createUserTableColumns({
  onManageFeatures,
  onRoleChange,
}: UserTableColumnsProps): ColumnDef<UserWithFeatures>[] {
  return [
    {
      accessorKey: "display_name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div>
            <div className="font-medium">{user.display_name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <Select
            value={user.role}
            onValueChange={(value: UserRole) => onRoleChange(user.id, value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "features",
      header: "Active Features",
      cell: ({ row }) => {
        const user = row.original;
        return <UserFeatures userFeatures={user.feature_subscriptions} />;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="text-sm">
            {user.created_at ? formatDate(user.created_at) : "N/A"}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManageFeatures(user)}>
                Manage Features
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
