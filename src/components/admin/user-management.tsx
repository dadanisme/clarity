"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { User, FeatureFlag, UserRole } from "@/types";
import { useGrantFeature, useRevokeFeature, useIsAdmin } from "@/hooks/use-features";
import { FEATURE_METADATA } from "@/lib/firebase/feature-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { UserPlus, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

export function UserManagement() {
  const isAdmin = useIsAdmin();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false);

  // Fetch all users (admin only)
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
    },
    enabled: isAdmin,
  });

  const grantFeatureMutation = useGrantFeature();
  const revokeFeatureMutation = useRevokeFeature();

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
            Manage user accounts and feature access
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onGrantFeature={() => {
              setSelectedUser(user);
              setIsGrantDialogOpen(true);
            }}
            onRevokeFeature={(feature) => {
              revokeFeatureMutation.mutate(
                { userId: user.id, feature },
                {
                  onSuccess: () => {
                    toast.success(`Revoked ${FEATURE_METADATA[feature].name}`);
                  },
                  onError: (error) => {
                    toast.error(`Failed to revoke feature: ${error.message}`);
                  },
                }
              );
            }}
          />
        ))}
      </div>

      <GrantFeatureDialog
        user={selectedUser}
        open={isGrantDialogOpen}
        onOpenChange={setIsGrantDialogOpen}
        onGrant={(feature, featureName, notes) => {
          if (!selectedUser) return;
          
          grantFeatureMutation.mutate(
            {
              userId: selectedUser.id,
              feature,
              featureName,
              notes,
            },
            {
              onSuccess: () => {
                toast.success(`Granted ${featureName} to ${selectedUser.displayName}`);
                setIsGrantDialogOpen(false);
              },
              onError: (error) => {
                toast.error(`Failed to grant feature: ${error.message}`);
              },
            }
          );
        }}
      />
    </div>
  );
}

interface UserCardProps {
  user: User;
  onGrantFeature: () => void;
  onRevokeFeature: (feature: FeatureFlag) => void;
}

function UserCard({ user, onGrantFeature, onRevokeFeature }: UserCardProps) {
  const { data: userFeatures = [] } = useQuery({
    queryKey: ["user-features", user.id],
    queryFn: async () => {
      const { FeatureService } = await import("@/lib/firebase/feature-service");
      return FeatureService.getUserFeatures(user.id);
    },
  });

  const activeFeatures = userFeatures.filter(f => f.status === "active");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {user.role === UserRole.ADMIN ? (
                <Shield className="h-5 w-5" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{user.displayName}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user.role === UserRole.ADMIN ? "default" : "secondary"}>
              {user.role}
            </Badge>
            <Button onClick={onGrantFeature} size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Grant Feature
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {activeFeatures.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Active Features</Label>
            <div className="flex flex-wrap gap-2">
              {activeFeatures.map((feature) => (
                <Badge
                  key={feature.id}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {feature.featureName}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => onRevokeFeature(feature.id as FeatureFlag)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface GrantFeatureDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGrant: (feature: FeatureFlag, featureName: string, notes?: string) => void;
}

function GrantFeatureDialog({
  user,
  open,
  onOpenChange,
  onGrant,
}: GrantFeatureDialogProps) {
  const [selectedFeature, setSelectedFeature] = useState<FeatureFlag | "">("");
  const [notes, setNotes] = useState("");

  const handleGrant = () => {
    if (!selectedFeature || !user) return;
    
    const featureName = FEATURE_METADATA[selectedFeature].name;
    onGrant(selectedFeature, featureName, notes || undefined);
    
    setSelectedFeature("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Feature Access</DialogTitle>
          <DialogDescription>
            Grant feature access to {user?.displayName} ({user?.email})
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
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGrant}
              disabled={!selectedFeature}
            >
              Grant Feature
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}