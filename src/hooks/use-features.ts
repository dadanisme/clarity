import { useAuth } from "@/hooks/use-auth";
import { FeatureFlag, UserRole, FeatureSubscription } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FeatureService } from "@/lib/supabase";
import { useEffect, useRef } from "react";

// React Query hook with real-time updates for feature access
export function useFeatureAccess(feature: FeatureFlag) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const query = useQuery({
    queryKey: ["feature-access", user?.id, feature],
    queryFn: async (): Promise<boolean> => {
      if (!user?.id) return false;

      // Get initial value
      const hasAccess = await FeatureService.hasFeature(user.id, feature);

      // Set up real-time listener for subsequent updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      const subscription = FeatureService.subscribeToUserFeatures(
        user.id,
        (userFeatures) => {
          // Check if this specific feature is in the updated features
          const hasFeature = userFeatures.some(f => f.feature_flag === feature && f.status === 'active');
          
          // Update React Query cache with real-time data
          queryClient.setQueryData(
            ["feature-access", user.id, feature],
            hasFeature
          );
        }
      );

      unsubscribeRef.current = () => {
        subscription.unsubscribe();
      };

      return hasAccess;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale since we update via subscription
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });

  // Cleanup listener on unmount or user change
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id, feature]);

  return query;
}

// React Query hook with real-time updates for all user features
export function useUserFeatures() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const query = useQuery({
    queryKey: ["user-features", user?.id],
    queryFn: async (): Promise<FeatureSubscription[]> => {
      if (!user?.id) return [];

      // Get initial value
      const features = await FeatureService.getUserFeatures(user.id);

      // Set up real-time listener for subsequent updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      const subscription = FeatureService.subscribeToUserFeatures(
        user.id,
        (userFeatures) => {
          // Update React Query cache with real-time data
          queryClient.setQueryData(["user-features", user.id], userFeatures);
        }
      );

      unsubscribeRef.current = () => {
        subscription.unsubscribe();
      };

      return features;
    },
    enabled: !!user?.id,
    staleTime: Infinity, // Never stale since we update via subscription
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes after unmount
  });

  // Cleanup listener on unmount or user change
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user?.id]);

  return query;
}

// React Query-based feature gate hook
export function useFeatureGate(feature: FeatureFlag) {
  const { data: hasAccess, isLoading, error } = useFeatureAccess(feature);

  return {
    hasAccess: hasAccess ?? false,
    isLoading,
    isBlocked: !isLoading && !hasAccess,
    error,
  };
}

// Admin feature management hooks using service directly
export function useGrantFeature() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      feature,
      featureName,
      notes,
    }: {
      userId: string;
      feature: FeatureFlag;
      featureName: string;
      notes?: string;
    }) => {
      if (!user?.id || user.role !== UserRole.ADMIN) {
        throw new Error("Unauthorized: Admin access required");
      }

      return FeatureService.grantFeature(
        userId,
        feature,
        user.id,
        featureName,
        notes
      );
    },
    onSuccess: () => {
      // Invalidate admin users to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

export function useRevokeFeature() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      feature,
    }: {
      userId: string;
      feature: FeatureFlag;
    }) => {
      if (!user?.id || user.role !== UserRole.ADMIN) {
        throw new Error("Unauthorized: Admin access required");
      }

      return FeatureService.revokeFeature(userId, feature, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

// For backwards compatibility - features that aren't converted yet
export function useUserFeaturesById(userId: string) {
  return useQuery({
    queryKey: ["user-features", userId],
    queryFn: async () => {
      if (!userId) return [];
      return FeatureService.getUserFeatures(userId);
    },
    enabled: !!userId,
    staleTime: 1000, // Very short cache since this is for admin viewing
  });
}

export function useManageUserFeatures(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["manage-user-features", userId],
    queryFn: async () => {
      if (!userId) return [];
      return FeatureService.getAllUserFeatures(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 1000, // Very short cache since this is for admin management
  });
}