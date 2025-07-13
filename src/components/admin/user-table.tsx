"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Shield, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface UserWithFeatures extends User {
  activeFeatures?: FeatureSubscription[];
}

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isManageFeaturesDialogOpen, setIsManageFeaturesDialogOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureFlag[]>([]);
  const [notes, setNotes] = useState("");
  
  const queryClient = useQueryClient();
  const grantFeatureMutation = useGrantFeature();
  const revokeFeatureMutation = useRevokeFeature();

  // Get user features when dialog is opened
  const { data: currentUserFeatures = [] } = useQuery({
    queryKey: ["manage-user-features", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const { FeatureService } = await import("@/lib/firebase/feature-service");
      return FeatureService.getUserFeatures(selectedUser.id);
    },
    enabled: !!selectedUser?.id && isManageFeaturesDialogOpen,
  });

  // Update selectedFeatures when currentUserFeatures loads
  useEffect(() => {
    if (isManageFeaturesDialogOpen && selectedUser) {
      const activeFeatureIds = currentUserFeatures
        .filter(f => f.status === "active")
        .map(f => f.id as FeatureFlag);
      setSelectedFeatures(activeFeatureIds);
    }
  }, [currentUserFeatures, isManageFeaturesDialogOpen, selectedUser]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isManageFeaturesDialogOpen) {
      setSelectedFeatures([]);
      setNotes("");
      setSelectedUser(null);
    }
  }, [isManageFeaturesDialogOpen]);

  const handleSaveFeatures = async () => {
    if (!selectedUser) return;
    
    try {
      const currentActiveFeatures = new Set(
        currentUserFeatures.filter(f => f.status === "active").map(f => f.id)
      );
      
      const newSelectedFeatures = new Set(selectedFeatures);
      
      // Features to grant (selected but not currently active)
      const toGrant = selectedFeatures.filter(f => !currentActiveFeatures.has(f));
      
      // Features to revoke (currently active but not selected)
      const toRevoke = Array.from(currentActiveFeatures).filter(f => !newSelectedFeatures.has(f as FeatureFlag));
      
      // Grant new features
      for (const feature of toGrant) {
        const featureName = FEATURE_METADATA[feature].name;
        await new Promise((resolve, reject) => {
          grantFeatureMutation.mutate(
            {
              userId: selectedUser.id,
              feature,
              featureName,
              notes: notes || undefined,
            },
            {
              onSuccess: () => resolve(undefined),
              onError: (error) => reject(error),
            }
          );
        });
      }
      
      // Revoke removed features
      for (const feature of toRevoke) {
        await new Promise((resolve, reject) => {
          revokeFeatureMutation.mutate(
            { userId: selectedUser.id, feature: feature as FeatureFlag },
            {
              onSuccess: () => resolve(undefined),
              onError: (error) => reject(error),
            }
          );
        });
      }
      
      const changes = [];
      if (toGrant.length > 0) changes.push(`granted ${toGrant.length}`);
      if (toRevoke.length > 0) changes.push(`revoked ${toRevoke.length}`);
      
      if (changes.length > 0) {
        toast.success(`Successfully ${changes.join(' and ')} feature(s) for ${selectedUser.displayName}`);
      } else {
        toast.info("No changes made to features");
      }
      
      // Invalidate all relevant queries
      await queryClient.invalidateQueries({
        queryKey: ["user-features", selectedUser.id]
      });
      await queryClient.invalidateQueries({
        queryKey: ["manage-user-features", selectedUser.id]
      });
      
      setIsManageFeaturesDialogOpen(false);
      setSelectedFeatures([]);
      setNotes("");
    } catch (error) {
      toast.error(`Failed to update features: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
                  setIsManageFeaturesDialogOpen(true);
                }}
              >
                Manage Features
              </DropdownMenuItem>
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

      <Dialog open={isManageFeaturesDialogOpen} onOpenChange={setIsManageFeaturesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Features</DialogTitle>
            <DialogDescription>
              Manage feature access for {selectedUser?.displayName} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              <Label>Available Features</Label>
              {Object.entries(FEATURE_METADATA).map(([featureId, metadata]) => (
                <div key={featureId} className="flex items-start space-x-3 p-3 rounded-lg border">
                  <input
                    type="checkbox"
                    id={featureId}
                    checked={selectedFeatures.includes(featureId as FeatureFlag)}
                    onChange={(e) => {
                      const feature = featureId as FeatureFlag;
                      if (e.target.checked) {
                        setSelectedFeatures(prev => [...prev, feature]);
                      } else {
                        setSelectedFeatures(prev => prev.filter(f => f !== feature));
                      }
                    }}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <div className="flex-1">
                    <label htmlFor={featureId} className="cursor-pointer">
                      <div className="font-medium text-sm">{metadata.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {metadata.description}
                      </div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about these feature changes..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsManageFeaturesDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFeatures}>
                Save Changes
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

