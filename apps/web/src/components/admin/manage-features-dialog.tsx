"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, FeatureFlag } from "@clarity/types";
import {
  useGrantFeature,
  useRevokeFeature,
  useManageUserFeatures,
} from "@/hooks/use-features";
import { FEATURE_METADATA } from "@clarity/shared/services/feature-service";
import { FeatureSelection } from "./feature-selection";

interface ManageFeaturesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageFeaturesDialog({
  user,
  open,
  onOpenChange,
}: ManageFeaturesDialogProps) {
  const [selectedFeatures, setSelectedFeatures] = useState<FeatureFlag[]>([]);
  const [notes, setNotes] = useState("");

  const queryClient = useQueryClient();
  const grantFeatureMutation = useGrantFeature();
  const revokeFeatureMutation = useRevokeFeature();

  // Get user features when dialog is opened
  const { data: currentUserFeatures = [] } = useManageUserFeatures(
    user?.id || "",
    !!user?.id && open
  );

  // Update selectedFeatures when currentUserFeatures loads
  useEffect(() => {
    if (open && user && currentUserFeatures.length > 0) {
      const activeFeatureIds = currentUserFeatures
        .filter((f) => f.status === "active")
        .map((f) => f.feature_flag as FeatureFlag);
      setSelectedFeatures(activeFeatureIds);
    }
  }, [currentUserFeatures, open, user]);

  // Controlled dialog close handler
  const handleDialogClose = useCallback(
    (openState: boolean) => {
      if (!openState) {
        // Reset all state when closing
        setSelectedFeatures([]);
        setNotes("");
      }
      onOpenChange(openState);
    },
    [onOpenChange]
  );

  const handleSaveFeatures = async () => {
    if (!user) return;

    try {
      const currentActiveFeatures = new Set(
        currentUserFeatures
          .filter((f) => f.status === "active")
          .map((f) => f.feature_flag)
      );

      const newSelectedFeatures = new Set(selectedFeatures);

      // Features to grant (selected but not currently active)
      const toGrant = selectedFeatures.filter(
        (f) => !currentActiveFeatures.has(f)
      );

      // Features to revoke (currently active but not selected)
      const toRevoke = Array.from(currentActiveFeatures).filter(
        (f) => !newSelectedFeatures.has(f as FeatureFlag)
      );

      // Grant new features
      for (const feature of toGrant) {
        const featureName = FEATURE_METADATA[feature].name;
        await new Promise((resolve, reject) => {
          grantFeatureMutation.mutate(
            {
              userId: user.id,
              feature,
              feature_name: featureName,
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
            { userId: user.id, feature: feature as FeatureFlag },
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
        toast.success(
          `Successfully ${changes.join(" and ")} feature(s) for ${
            user.display_name
          }`
        );
      } else {
        toast.info("No changes made to features");
      }

      // Invalidate all relevant queries
      await queryClient.invalidateQueries({
        queryKey: ["user-features", user.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["manage-user-features", user.id],
      });

      handleDialogClose(false);
    } catch (error) {
      toast.error(
        `Failed to update features: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Features</DialogTitle>
          <DialogDescription>
            Manage feature access for {user?.display_name} ({user?.email})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <FeatureSelection
            selectedFeatures={selectedFeatures}
            onFeatureChange={setSelectedFeatures}
          />

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
            <Button variant="outline" onClick={() => handleDialogClose(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeatures}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
