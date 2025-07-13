"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { User, UserRole, FeatureFlag, FeatureSubscription } from "@/types";
import { useGrantFeature, useRevokeFeature } from "@/hooks/use-features";
import { FEATURE_METADATA } from "@/lib/firebase/feature-service";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";

interface UserWithFeatures extends User {
  activeFeatures?: FeatureSubscription[];
}

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | "">("");
  const [notes, setNotes] = useState("");

  const grantFeatureMutation = useGrantFeature();
  const revokeFeatureMutation = useRevokeFeature();

  const handleGrantFeature = () => {
    if (!selectedFeature || !selectedUser) return;
    
    const featureName = FEATURE_METADATA[selectedFeature].name;
    grantFeatureMutation.mutate(
      {
        userId: selectedUser.id,
        feature: selectedFeature,
        featureName,
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Granted ${featureName} to ${selectedUser.displayName}`);
          setIsGrantDialogOpen(false);
          setSelectedFeature("");
          setNotes("");
        },
        onError: (error) => {
          toast.error(`Failed to grant feature: ${error.message}`);
        },
      }
    );
  };

  const handleRevokeFeature = (userId: string, feature: FeatureFlag, userName: string) => {
    revokeFeatureMutation.mutate(
      { userId, feature },
      {
        onSuccess: () => {
          toast.success(`Revoked ${FEATURE_METADATA[feature].name} from ${userName}`);
        },
        onError: (error) => {
          toast.error(`Failed to revoke feature: ${error.message}`);
        },
      }
    );
  };

  const columns: ColumnDef<UserWithFeatures>[] = [
    {
      accessorKey: "displayName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            User
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profileImage} alt={user.displayName} />
              <AvatarFallback>
                {user.displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.displayName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return (
          <Badge variant={role === UserRole.ADMIN ? "default" : "secondary"} className="flex items-center gap-1 w-fit">
            {role === UserRole.ADMIN ? (
              <Shield className="h-3 w-3" />
            ) : (
              <UserIcon className="h-3 w-3" />
            )}
            {role}
          </Badge>
        );
      },
    },
    {
      id: "features",
      header: "Active Features",
      cell: ({ row }) => {
        const user = row.original;
        return <UserFeatures userId={user.id} />;
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div className="text-sm">
            {format(new Date(row.getValue("createdAt")), "MMM dd, yyyy")}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
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
              <DropdownMenuItem
                onClick={() => {
                  setSelectedUser(user);
                  setIsGrantDialogOpen(true);
                }}
              >
                Grant Feature
              </DropdownMenuItem>
              <UserFeatureActions
                userId={user.id}
                userName={user.displayName}
                onRevokeFeature={handleRevokeFeature}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={users}
        searchKey="displayName"
        searchPlaceholder="Search users..."
      />

      <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Feature Access</DialogTitle>
            <DialogDescription>
              Grant feature access to {selectedUser?.displayName} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feature">Feature</Label>
              <Select value={selectedFeature} onValueChange={(value) => setSelectedFeature(value as FeatureFlag | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a feature" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FEATURE_METADATA).map(([key, metadata]) => (
                    <SelectItem key={key} value={key}>
                      <div>
                        <div className="font-medium">{metadata.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {metadata.description}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this feature grant..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsGrantDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleGrantFeature}
                disabled={!selectedFeature}
              >
                Grant Feature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserFeatures({ userId }: { userId: string }) {
  const { data: userFeatures = [] } = useQuery({
    queryKey: ["user-features", userId],
    queryFn: async () => {
      const { FeatureService } = await import("@/lib/firebase/feature-service");
      return FeatureService.getUserFeatures(userId);
    },
  });

  const activeFeatures = userFeatures.filter(f => f.status === "active");

  if (activeFeatures.length === 0) {
    return <span className="text-sm text-muted-foreground">No features</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {activeFeatures.slice(0, 2).map((feature) => (
        <Badge key={feature.id} variant="outline" className="text-xs">
          {feature.featureName}
        </Badge>
      ))}
      {activeFeatures.length > 2 && (
        <Badge variant="outline" className="text-xs">
          +{activeFeatures.length - 2} more
        </Badge>
      )}
    </div>
  );
}

function UserFeatureActions({
  userId,
  userName,
  onRevokeFeature,
}: {
  userId: string;
  userName: string;
  onRevokeFeature: (userId: string, feature: FeatureFlag, userName: string) => void;
}) {
  const { data: userFeatures = [] } = useQuery({
    queryKey: ["user-features", userId],
    queryFn: async () => {
      const { FeatureService } = await import("@/lib/firebase/feature-service");
      return FeatureService.getUserFeatures(userId);
    },
  });

  const activeFeatures = userFeatures.filter(f => f.status === "active");

  if (activeFeatures.length === 0) {
    return null;
  }

  return (
    <>
      {activeFeatures.length > 0 && <DropdownMenuSeparator />}
      {activeFeatures.map((feature) => (
        <DropdownMenuItem
          key={feature.id}
          onClick={() => onRevokeFeature(userId, feature.id as FeatureFlag, userName)}
          className="text-destructive"
        >
          Revoke {feature.featureName}
        </DropdownMenuItem>
      ))}
    </>
  );
}